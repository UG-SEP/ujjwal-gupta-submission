let lastUrl = ""
let problemDetails = {}

function areRequiredElementsLoaded() {
  const problemTitle = document.getElementsByClassName("Header_resource_heading__cpRp1")[0]?.textContent.trim();
  const problemDescription = document.getElementsByClassName("coding_desc__pltWY")[0]?.textContent.trim();
  const problemInputFormat = document.getElementsByClassName("coding_input_format__pv9fS problem_paragraph")[0]?.textContent.trim();
  const problemOutputFormat = document.getElementsByClassName("coding_input_format__pv9fS problem_paragraph")[1]?.textContent.trim();

  // Return true if all the required elements are found and their content is non-empty
  return (
    problemTitle && 
    problemDescription && 
    problemInputFormat && 
    problemOutputFormat
  );
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
      if (mutation.type === "childList" && isProblemsPage()) {
          if (isUrlChanged() || !document.getElementById("help-button")) {
              console.log("Checking content loading...");
              
              // Wait until all required content is loaded
              if (areRequiredElementsLoaded()) {
                  console.log("Content fully loaded, adding help button");
                  cleanElements();
                  addHelpButton(); // Show the help button
                  extractProblemDetails(); // Extract the problem details
              } else {
                  console.log("Waiting for content to load...");
              }
          }
      }
  });
});


function cleanElements() {
  const buttonContainer = document.getElementById("help-button");
  if (buttonContainer) buttonContainer.remove();

  const modalContainer = document.getElementById("modal-container");
  if (modalContainer) modalContainer.remove();
  problemDetails = {}
}

// Initialize MutationObserver

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

function isUrlChanged() {
  const currentUrl = window.location.pathname;
  if (currentUrl !== lastUrl) {
      lastUrl = currentUrl; // Update lastUrl
      return true; // URL has changed
  }
  return false; // URL has not changed
}

function isProblemsPage() {
  const pathParts = window.location.pathname.split("/"); // Split the URL path by "/"
  return pathParts.length >= 3 && pathParts[1] === "problems" && pathParts[2]; // Ensure "/problems/some-id"
}

  // Function to add the Help Button
  function addHelpButton() {
    const doubtButton = document.getElementsByClassName("coding_ask_doubt_button__FjwXJ")[0]
      const buttonContainer = document.createElement("div");
      buttonContainer.id = "button-container";
      buttonContainer.style.display = "flex";
      buttonContainer.style.justifyContent = "flex-end";
      buttonContainer.style.gap = "10px";

      doubtButton.parentNode.insertBefore(buttonContainer, doubtButton);
      buttonContainer.appendChild(doubtButton);

      const helpButton = document.createElement("button");
      helpButton.id = "help-button";
      helpButton.className = "ant-btn css-19gw05y ant-btn-default Button_gradient_light_button__ZDAR_ coding_ask_doubt_button__FjwXJ gap-1 py-2 px-3 overflow-hidden";
      helpButton.style.height = "fit-content";
      helpButton.innerHTML = `
          <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h8M8 14h4m5 5l-3-3H6a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-3l-3 3z"></path>
          </svg>
          <span class="coding_ask_doubt_gradient_text__FX_hZ">AI Help</span>
      `;

      buttonContainer.appendChild(helpButton);

      helpButton.addEventListener("click", openChatBox);
  }

  // Function to extract problem details
  function extractProblemDetails() {
      const problemUrl = window.location.href;
      const problemId = extractId(problemUrl);
      const problemTitle = document.getElementsByClassName("Header_resource_heading__cpRp1")[0].textContent;
      const problemDifficulty = document.getElementsByClassName("m-0 fs-6 problem_paragraph fw-bold")[0].textContent;
      const problemTimeLimit = document.getElementsByClassName("m-0 fs-6 problem_paragraph fw-bold")[1].textContent;
      const problemMemoryLimit = document.getElementsByClassName("m-0 fs-6 problem_paragraph fw-bold")[2].textContent;
      const problemScore = document.getElementsByClassName("m-0 fs-6 problem_paragraph fw-bold")[3].textContent;
      const problemDescription = document.getElementsByClassName("coding_desc__pltWY")[0].textContent;
      const problemInputFormat = document.getElementsByClassName("coding_input_format__pv9fS problem_paragraph")[0].textContent;
      const problemOutputFormat = document.getElementsByClassName("coding_input_format__pv9fS problem_paragraph")[1].textContent;
      const problemConstraints = document.getElementsByClassName("coding_input_format__pv9fS problem_paragraph")[2].textContent;
      const problemNoteElement = document.getElementsByClassName("coding_input_format__pv9fS problem_paragraph")[3];
      const problemNote = problemNoteElement ? problemNoteElement.textContent || "" : "";
            const problemInputOutput = extractInputOutput();
      const userCode = extractUserCode();

      problemDetails = {
          problemUrl,
          problemId,
          problemTitle,
          problemDifficulty,
          problemTimeLimit,
          problemMemoryLimit,
          problemScore,
          problemDescription,
          problemInputFormat,
          problemOutputFormat,
          problemConstraints,
          problemNote,
          problemInputOutput,
          userCode,
      };

      console.log(problemDetails);
  }

  function extractProblemNumber(url) {
    const parts = url.split('/'); // Split the URL by '/'
    let lastPart = parts[parts.length - 1]; // Get the last part
    
    // Keep reading from the end of the last part until you find an integer
    let number = '';
    for (let i = lastPart.length - 1; i >= 0; i--) {
        if (isNaN(lastPart[i])) {
            break; // Stop if we encounter a non-numeric character
        }
        number = lastPart[i] + number; // Build the number in reverse
    }

    return number; // Return the extracted number
}
function extractUserCode() {
  // Assuming `extractLocalStorage` is a function that extracts data from localStorage
  let localStorageData = extractLocalStorage();
  
  // Extract the problem number from the current URL
  const problemNo = extractProblemNumber(window.location.pathname); // Use `window.location.pathname` to get the current URL
  let language = localStorageData['editor-language']; // Assuming the language is stored with the key 'editor-language'
  if (language.startsWith('"') && language.endsWith('"')) {
    language = language.slice(1, -1); // Remove the first and last character (quotes)
}
  // Construct the expression to search for
  const expression = `${problemNo}_${language}`;
  console.log(expression)
  
  // Check if any key in localStorageData contains the expression
  for (let key in localStorageData) {
      if (localStorageData.hasOwnProperty(key) && key.includes(expression)) {
          return localStorageData[key]; // Return the value of the first key that matches
      }
  }
  
  return ''; // If no match is found, return an empty string
}


function extractLocalStorage() {
  const localStorageData = {};
  for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      localStorageData[key] = localStorage.getItem(key);
  }
  return localStorageData;
}






function extractInputOutput(){

const elements = document.querySelectorAll(".coding_input_format__pv9fS");
const inputOutputPairs = [];

for (let i = 3; i < elements.length; i += 2) {
  if(i+1<elements.length){
  const input = elements[i]?.textContent?.trim() || "";  
  const output = elements[i + 1]?.textContent?.trim() || "";  
  inputOutputPairs.push({ input, output });
  }  
}
return inputOutputPairs

}
function extractId(url){
    const start = url.indexOf("problems/") + "problems/".length;
    const end = url.indexOf("?",start);
    return end === -1 ? url.substring(start): url.substring(start,end);
}

function openChatBox() {
    let aiModal = document.getElementById("modalContainer");
    if (!aiModal) {
      console.log("creating modal and extracting details")
      extractProblemDetails();
        aiModal = createModal();
    }

    // Attach the close button listener here to make sure it works
    const closeAIBtn = aiModal.querySelector("#closeAIBtn");
    if (closeAIBtn) {
        closeAIBtn.addEventListener("click", closeModal);
    }

    attachEventListeners();
}

function createModal() {
    const modalHtml = `
    <div id="modalContainer" class="w-100 h-100 position-fixed d-flex align-items-start justify-content-center hide-scrollbar" style="z-index: 100; top: 0px; left: 0px; background-color: rgba(23, 43, 77, 0.8); backdrop-filter: blur(8px); overflow-y: auto;">
      <section class="overflow-hidden p-4 w-100 h-100">
        <div class="DoubtForum_new_post_modal_container__hJcF2 border_primary border_radius_12 d-flex flex-column" style="height: 100%;">
          <!-- Header -->
          <div class="mb-4 text-center">
            <h1 class="DoubtForum_text_color__ndqRv ruibk fs-3 fw-bold mt-4">Chat with AI</h1>
            <div class="d-flex justify-content-end position-absolute" style="right: 2.5rem; top: 3rem;">
              <button type="button" class="ant-btn css-19gw05y ant-btn-text ant-btn-icon-only undefined DoubtForum_text_color__ndqRv  d-flex align-items-center justify-content-center" id="closeAIBtn">
                <span class="ant-btn-icon">
                  <span role="img" aria-label="close" class="anticon anticon-close">
                    <svg fill-rule="evenodd" viewBox="64 64 896 896" focusable="false" data-icon="close" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                      <path d="M799.86 166.31c.02 0 .04.02.08.06l57.69 57.7c.04.03.05.05.06.08a.12.12 0 010 .06c0 .03-.02.05-.06.09L569.93 512l287.7 287.7c.04.04.05.06.06.09a.12.12 0 010 .07c0 .02-.02.04-.06.08l-57.7 57.69c-.03.04-.05.05-.07.06a.12.12 0 01-.07 0c-.03 0-.05-.02-.09-.06L512 569.93l-287.7 287.7c-.04.04-.06.05-.09.06a.12.12 0 01-.07 0c-.02 0-.04-.02-.08-.06l-57.69-57.7c-.04-.03-.05-.05-.06-.07a.12.12 0 010-.07c0-.03.02-.05.06-.09L454.07 512l-287.7-287.7c-.04-.04-.05-.06-.06-.09a.12.12 0 010-.07c0-.02.02-.04.06-.08l57.7-57.69c.03-.04.05-.05.07-.06a.12.12 0 01.07 0c.03 0 .05.02.09.06L512 454.07l287.7-287.7c.04-.04.06-.05.09-.06a.12.12 0 01.07 0z"></path>
                    </svg>
                  </span>
                </span>
              </button>
            </div>
          </div>

          <!-- Button Container -->
          <div id="button-container" style="display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 15px;" class="mx-2">
            <button type="button" id="delete-button" class="ant-btn css-19gw05y ant-btn-default Button_gradient_light_button__ZDAR_ coding_ask_doubt_button__FjwXJ gap-1 py-2 px-3 overflow-hidden" style="height: fit-content;">
              <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7H5m4-3h6a1 1 0 0 1 1 1v1M9 4h6m4 3v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7h14zM10 11v6m4-6v6" />
              </svg>
              <span class="coding_ask_doubt_gradient_text__FX_hZ">Delete History</span>
            </button>
            <button id="feedback-button" class="ant-btn css-19gw05y ant-btn-default Button_gradient_light_button__ZDAR_ coding_ask_doubt_button__FjwXJ gap-1 py-2 px-3 overflow-hidden" style="height: fit-content;">
              <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 14h4M12 10h0m-5 9l-3-3H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3l-3 3H7z" />
              </svg>
              <span class="coding_ask_doubt_gradient_text__FX_hZ">Feedback</span>
            </button>
            <button id="export-chat-button" class="ant-btn css-19gw05y ant-btn-default Button_gradient_light_button__ZDAR_ coding_ask_doubt_button__FjwXJ gap-1 py-2 px-3 overflow-hidden" style="height: fit-content;">
              <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 5v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 2v6m-3 4h6" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 16h6" />
              </svg>
              <span class="coding_ask_doubt_gradient_text__FX_hZ">Export Chat</span>
            </button>
          </div>

          <!-- Chat Display -->
          <div id="chatBox" class="bg-body-secondary p-3 rounded overflow-auto mb-3 m-2" style="height: 300px;">
            <!-- Chat messages will appear here -->
          </div>

          <!-- User Input Section -->
          <div class="d-flex align-items-center m-2 flex-wrap" style="gap: 10px;">
            <textarea id="userMessage" class="form-control bg-body-secondary" placeholder="Enter your message..." rows="2" style="flex: 1;"></textarea>
            <button type="button" class="ant-btn css-e6z5vk ant-btn-submit Button_gradient_light_button__ZDAR_" id="sendMsg"><span>Send</span></button>
          </div>
        </div>
      </section>
    </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHtml);
    return document.getElementById('modalContainer');
}

function attachEventListeners() {
    document.getElementById('delete-button')?.addEventListener('click', deleteHistory);
    document.getElementById('export-chat-button')?.addEventListener('click', exportChat);
    document.getElementById('sendMsg')?.addEventListener('click', sendMessage);
    document.getElementById('feedback-button')?.addEventListener('click', handleFeedback);
}

function closeModal() {
    console.log("Modal Closed");
    const modal = document.getElementById('modalContainer');
    if (modal) {
        modal.remove();
    }
}

function deleteHistory() {
    const chatBox = document.getElementById('chatBox');
    if (chatBox) {
        chatBox.innerHTML = ''; // Clear the chat history
    }
}

function exportChat() {
    const chatBox = document.getElementById('chatBox');
    const chatMessages = chatBox.innerText;

    // Create a Blob object containing the chat history
    const blob = new Blob([chatMessages], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'chat-history.txt';
    link.click(); // Trigger the download
}

function sendMessage() {
    const userMessage = document.getElementById('userMessage').value;
    const chatBox = document.getElementById('chatBox');
    if (userMessage && chatBox) {
        // Append user's message
        chatBox.innerHTML += `<div><b>User:</b> ${userMessage}</div>`;

        // Clear the input field
        document.getElementById('userMessage').value = '';

        // Simulate AI response after a short delay
        setTimeout(() => {
            chatBox.innerHTML += `<div><b>AI:</b> This is a response.</div>`;
            chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
        }, 500);
    }
}

function handleFeedback() {
    alert('Feedback button clicked');
}