// DOM elements
const setupSection = document.getElementById("setup-section");
const editSection = document.getElementById("edit-section");
const apiKeyInput = document.getElementById("apiKeyInput");
const saveApiKeyButton = document.getElementById("saveApiKeyButton");
const editApiKeyButton = document.getElementById("editApiKeyButton");
const currentApiKey = document.getElementById("currentApiKey");

// Load API key from storage
function loadApiKey() {
  chrome.storage.local.get("apiKey", (result) => {
    const apiKey = result.apiKey;
    if (apiKey) {
      // Show the current API key
      currentApiKey.textContent = apiKey;
      setupSection.style.display = "none";
      editSection.style.display = "block";
    } else {
      // No API key found, prompt user to enter it
      setupSection.style.display = "block";
      editSection.style.display = "none";
    }
  });
}

// Save the API key to storage
saveApiKeyButton.addEventListener("click", () => {
  const apiKey = apiKeyInput.value.trim();
  if (apiKey) {
    chrome.storage.local.set({ apiKey }, () => {
      alert("API key saved successfully!");
      loadApiKey(); // Reload the sections
    });
  } else {
    alert("Please enter a valid API key.");
  }
});

// Allow editing of the API key
editApiKeyButton.addEventListener("click", () => {
  chrome.storage.local.remove("apiKey", () => {
    alert("You can now enter a new API key.");
    loadApiKey(); // Reload the sections
  });
});

// Load the API key on popup open
loadApiKey();
