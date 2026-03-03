const STYLE_ID = "grayscale-toggle-style";
let observer;

function ensureStyle() {
  let style = document.getElementById(STYLE_ID);
  if (style) {
    return;
  }

  style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = "html { filter: grayscale(100%) !important; }";
  (document.head || document.documentElement).appendChild(style);
}

function removeStyle() {
  const style = document.getElementById(STYLE_ID);
  if (style) {
    style.remove();
  }
}

function startObserver() {
  if (observer) {
    return;
  }

  observer = new MutationObserver(() => {
    if (!document.getElementById(STYLE_ID)) {
      ensureStyle();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

function stopObserver() {
  if (observer) {
    observer.disconnect();
    observer = undefined;
  }
}

function applyState(enabled) {
  if (enabled) {
    ensureStyle();
    startObserver();
  } else {
    stopObserver();
    removeStyle();
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "GRAYSCALE_SET") {
    applyState(Boolean(message.enabled));
  }
});

chrome.runtime
  .sendMessage({ type: "CONTENT_READY" })
  .then((response) => applyState(Boolean(response?.enabled)))
  .catch(() => {
    // Ignore messaging errors (e.g. extension reloading).
  });
