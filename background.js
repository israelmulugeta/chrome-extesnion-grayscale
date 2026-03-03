const STORAGE_KEY = "grayscaleEnabled";

async function getStoredState() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return Boolean(result[STORAGE_KEY]);
}

async function setStoredState(enabled) {
  await chrome.storage.local.set({ [STORAGE_KEY]: enabled });
  await broadcastState(enabled);
  return enabled;
}

async function toggleState() {
  const current = await getStoredState();
  return setStoredState(!current);
}

async function broadcastState(enabled) {
  const tabs = await chrome.tabs.query({});
  await Promise.all(
    tabs
      .filter((tab) => tab.id)
      .map(async (tab) => {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: "GRAYSCALE_SET",
            enabled,
          });
        } catch {
          // Ignore tabs where content scripts are unavailable (e.g., chrome://).
        }
      })
  );
}

chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  if (typeof result[STORAGE_KEY] === "undefined") {
    await chrome.storage.local.set({ [STORAGE_KEY]: false });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message.type !== "string") {
    return;
  }

  (async () => {
    if (message.type === "GRAYSCALE_GET") {
      sendResponse({ enabled: await getStoredState() });
      return;
    }

    if (message.type === "GRAYSCALE_SET") {
      const enabled = Boolean(message.enabled);
      await setStoredState(enabled);
      sendResponse({ enabled });
      return;
    }

    if (message.type === "GRAYSCALE_TOGGLE") {
      const enabled = await toggleState();
      sendResponse({ enabled });
      return;
    }

    if (message.type === "CONTENT_READY") {
      sendResponse({ enabled: await getStoredState() });
    }
  })();

  return true;
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-grayscale") {
    void toggleState();
  }
});
