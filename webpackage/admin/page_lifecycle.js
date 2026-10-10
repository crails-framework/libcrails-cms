const loadCallbacks = [];
const teardownCallbacks = [];
let initializedBody = null;

function isPreview() {
  return document.documentElement.hasAttribute("data-turbo-preview");
}

function runLoadCallbacks() {
  if (document.body === initializedBody || isPreview())
    return;
  initializedBody = document.body;
  loadCallbacks.forEach(callback => callback());
}

function runTeardownCallbacks() {
  initializedBody = null;
  for (const entry of teardownCallbacks.slice()) {
    if (entry.once)
      teardownCallbacks.splice(teardownCallbacks.indexOf(entry), 1);
    try {
      entry.callback();
    } catch (error) {
      console.error("page teardown callback failed", error);
    }
  }
}

export function onPageLoad(callback) {
  loadCallbacks.push(callback);
}

export function onPageTeardown(callback, { once = false } = {}) {
  teardownCallbacks.push({ callback, once });
}

document.addEventListener("DOMContentLoaded", runLoadCallbacks);
document.addEventListener("turbo:load", runLoadCallbacks);
document.addEventListener("turbo:render", runLoadCallbacks);
document.addEventListener("turbo:before-render", runTeardownCallbacks);
