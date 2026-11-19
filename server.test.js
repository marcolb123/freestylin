import { once } from 'node:events';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { app } from './server.js';
import { Prompt } from './prompt-model.js';

const { User, JournalEntry } = mongoose.models;
const userId = new mongoose.Types.ObjectId();
const promptId = new mongoose.Types.ObjectId().toString();
const secret = 'test-only-freestylin-signing-key';
let server;
let url;

beforeAll(async () => {
  vi.stubEnv('JWT_SECRET', secret);
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  url = `http://127.0.0.1:${server.address().port}`;
});

beforeEach(() => {
  vi.spyOn(User, 'findById').mockResolvedValue({ _id: userId, isAdmin: false });
});

afterEach(() => vi.restoreAllMocks());

afterAll(async () => {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  vi.unstubAllEnvs();
});

function request(path, { authenticated = true, body, method } = {}) {
  const headers = {};
  if (authenticated) headers.Authorization = `Bearer ${jwt.sign({ userId }, secret)}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  return fetch(url + path, {
    headers,
    method: method ?? (body === undefined ? 'GET' : 'POST'),
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

describe('prompt moderation', () => {
  it('sets submission metadata on the server', async () => {
    vi.spyOn(Prompt.prototype, 'save').mockImplementation(async function () {
      await this.validate();
      return this;
    });
    const response = await request('/api/prompts', {
      body: { label: 'Bounce', description: 'Practise the rhythm', status: 'approved', likes: 5, views: 9 }
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      status: 'pending', likes: 0, views: 0, submittedBy: userId.toString()
    });
  });

  it('reserves moderation changes for administrators', async () => {
    const update = vi.spyOn(Prompt, 'findByIdAndUpdate');
    const response = await request(`/api/prompts/${promptId}`, {
      method: 'PUT', body: { status: 'approved' }
    });
    expect(response.status).toBe(403);
    expect(update).not.toHaveBeenCalled();
  });

  it.each(['like', 'view'])('scopes the public %s update to approved prompts', async action => {
    const update = vi.spyOn(Prompt, 'findOneAndUpdate').mockResolvedValue(null);
    const response = await request(`/api/prompts/${promptId}/${action}`, {
      authenticated: false, method: 'POST'
    });
    expect(response.status).toBe(404);
    expect(update.mock.calls[0][0]).toEqual({ _id: promptId, status: 'approved' });
  });

  it('allows favourites only for approved prompts and adds them atomically', async () => {
    const exists = vi.spyOn(Prompt, 'exists').mockResolvedValue({ _id: promptId });
    const update = vi.spyOn(User, 'findByIdAndUpdate').mockResolvedValue({ favoritePrompts: [promptId] });
    const response = await request(`/api/users/${userId}/favorites/${promptId}`, { method: 'POST' });
    expect(response.status).toBe(200);
    expect(exists).toHaveBeenCalledWith({ _id: promptId, status: 'approved' });
    expect(update.mock.calls[0][1]).toEqual({ $addToSet: { favoritePrompts: promptId } });
  });
});

describe('journal and authentication validation', () => {
  it('rejects dates that are not calendar dates', async () => {
    const response = await request('/api/journal', { body: { date: '2026-02-30', notes: 'Practice' } });
    expect(response.status).toBe(400);
  });

  it('unsets a cleared energy rating and filters populated prompt references', async () => {
    const populate = vi.fn().mockResolvedValue({ date: '2026-11-19', prompts: [] });
    const update = vi.spyOn(JournalEntry, 'findOneAndUpdate').mockReturnValue({ populate });
    const response = await request('/api/journal', {
      body: { date: '2026-11-19', notes: 'Practice', energy: null }
    });
    expect(response.status).toBe(200);
    expect(update.mock.calls[0][1]).toHaveProperty('$unset.energy', 1);
    expect(update.mock.calls[0][2]).toHaveProperty('runValidators', true);
    expect(populate).toHaveBeenCalledWith(expect.objectContaining({ match: { status: 'approved' } }));
  });

  it('rejects registration with an empty password', async () => {
    const save = vi.spyOn(User.prototype, 'save');
    const response = await request('/api/auth/register', {
      authenticated: false,
      body: { username: 'Dancer', email: 'dancer@example.com', password: '' }
    });
    expect(response.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
  });
});
