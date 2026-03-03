const toggleInput = document.getElementById("enabled");

async function init() {
  const response = await chrome.runtime.sendMessage({ type: "GRAYSCALE_GET" });
  toggleInput.checked = Boolean(response?.enabled);
}

toggleInput.addEventListener("change", async () => {
  const enabled = toggleInput.checked;
  await chrome.runtime.sendMessage({
    type: "GRAYSCALE_SET",
    enabled,
  });
});

void init();
