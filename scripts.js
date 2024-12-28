const setupSection = document.getElementById("setup-section");
const editSection = document.getElementById("edit-section");
const apiKeyInput = document.getElementById("apiKeyInput");
const saveApiKeyButton = document.getElementById("saveApiKeyButton");
const editApiKeyInput = document.getElementById("editApiKeyInput");
const editApiKeyButton = document.getElementById("editApiKeyButton");
const saveEditApiKeyButton = document.getElementById("saveEditApiKeyButton");


function loadApiKey() {
  chrome.storage.local.get("apiKey", (result) => {
    const apiKey = result.apiKey;
    if (apiKey) {

      editApiKeyInput.value = apiKey;
      setupSection.style.display = "none";
      editSection.style.display = "block";
    } else {

      setupSection.style.display = "block";
      editSection.style.display = "none";
    }
  });
}


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


editApiKeyButton.addEventListener("click", () => {
  editApiKeyInput.readOnly = false;
  saveEditApiKeyButton.style.display = "block";
  editApiKeyButton.style.display = "none";
});


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

loadApiKey();
