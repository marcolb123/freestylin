// A timer that survives a hidden tab.
//
// Browsers throttle setInterval hard on the main thread when the page isn't
// visible — a requested 20ms measured at 525ms while testing this app. A
// worker's timer is not throttled anywhere near as aggressively, so the
// scheduler keeps getting woken while the dancer's screen is dimmed.
//
// This worker does nothing but post a tick. All audio work stays on the main
// thread; a worker has no access to AudioContext anyway.

let timer = null;

self.onmessage = (event) => {
    const { command, interval } = event.data || {};

    if (command === 'start') {
        clearInterval(timer);
        timer = setInterval(() => self.postMessage('tick'), interval || 25);
    }

    if (command === 'stop') {
        clearInterval(timer);
        timer = null;
    }
};
