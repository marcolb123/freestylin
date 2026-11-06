import { useCallback, useRef, useState } from "react";
export function readStored(storage, key, fallback, validate = () => true) {
  try {
    const raw = storage.getItem(key);
    if (raw === null) return fallback;
    const data = JSON.parse(raw);
    return validate(data) ? data : fallback;
  } catch {
    return fallback;
  }
}
export function useStored(key, fallback, validate) {
  const [value, setValue] = useState(() =>
    readStored(localStorage, key, fallback, validate),
  );
  const current = useRef(value);
  const [error, setError] = useState("");
  const update = useCallback(
    (next) => {
      const resolved =
        typeof next === "function" ? next(current.current) : next;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
        current.current = resolved;
        setValue(resolved);
        setError("");
        return true;
      } catch {
        setError(
          "Your browser could not save this change. Free some storage or enable site storage, then try again.",
        );
        return false;
      }
    },
    [key],
  );
  return [value, update, error];
}
export const validIds = (data) =>
  Array.isArray(data) && data.every((id) => typeof id === "string");
export const validPlaylists = (data) =>
  Array.isArray(data) &&
  data.every(
    (item) =>
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      validIds(item.trackIds),
  );
export const validEntries = (data) =>
  Array.isArray(data) &&
  data.every(
    (item) =>
      typeof item.date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(item.date) &&
      typeof item.notes === "string" &&
      Number.isFinite(item.durationMinutes) &&
      item.durationMinutes >= 0 &&
      item.durationMinutes <= 1440 &&
      validIds(item.moves || []),
  );
