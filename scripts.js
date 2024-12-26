// DOM elements
const setupSection = document.getElementById("setup-section");
const editSection = document.getElementById("edit-section");
const apiKeyInput = document.getElementById("apiKeyInput");
const saveApiKeyButton = document.getElementById("saveApiKeyButton");
const editApiKeyInput = document.getElementById("editApiKeyInput");
const editApiKeyButton = document.getElementById("editApiKeyButton");
const saveEditApiKeyButton = document.getElementById("saveEditApiKeyButton");

// Load API key from storage
function loadApiKey() {
  chrome.storage.local.get("apiKey", (result) => {
    const apiKey = result.apiKey;
    if (apiKey) {
      // Display the current API key
      editApiKeyInput.value = apiKey;
      setupSection.style.display = "none";
      editSection.style.display = "block";
    } else {
      // Prompt user to enter an API key
      setupSection.style.display = "block";
      editSection.style.display = "none";
    }
  });
}

// Save the API key to storage
saveApiKeyButton.addEventListener("click", () => {
  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    alert("Please enter a valid API key.");
    return;
  }

  chrome.storage.local.set({ apiKey }, () => {
    alert("API key saved successfully!");
    loadApiKey();
  });
});

// Enable editing of the API key
editApiKeyButton.addEventListener("click", () => {
  editApiKeyInput.readOnly = false;
  saveEditApiKeyButton.style.display = "block";
  editApiKeyButton.style.display = "none";
});

// Save the edited API key
saveEditApiKeyButton.addEventListener("click", () => {
  const newApiKey = editApiKeyInput.value.trim();
  if (!newApiKey) {
    alert("Please enter a valid API key.");
    return;
  }

  chrome.storage.local.set({ apiKey: newApiKey }, () => {
    alert("API key updated successfully!");
    editApiKeyInput.readOnly = true;
    saveEditApiKeyButton.style.display = "none";
    editApiKeyButton.style.display = "block";
  });
});

// Load the API key on page load
loadApiKey();
