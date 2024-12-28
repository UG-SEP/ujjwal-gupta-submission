
// Global Variable Declaration

let lastUrl = ""
let problemDetails = {}
let XhrRequestData = ""
const recognition = new webkitSpeechRecognition() || new SpeechRecognition();
recognition.lang = 'en-IN';
recognition.continuous = false;
recognition.interimResults = false;


// Mutation observe and function to detect page change , and problem page

function areRequiredElementsLoaded() {
  const problemTitle = document.getElementsByClassName("Header_resource_heading__cpRp1")[0]?.textContent.trim();
  const problemDescription = document.getElementsByClassName("coding_desc__pltWY")[0]?.textContent.trim();

  return (
    problemTitle &&
    problemDescription
  );
}

function isUrlChanged() {
  const currentUrl = window.location.pathname;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    return true;
  }
  return false;
}

function isProblemsPage() {
  const pathParts = window.location.pathname.split("/");
  return pathParts.length >= 3 && pathParts[1] === "problems" && pathParts[2];
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "childList" && isProblemsPage()) {
      if (isUrlChanged() || !document.getElementById("help-button")) {
        injectScript();
        if (areRequiredElementsLoaded()) {
          cleanElements();
          createElement();
        }
      }
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Mutation Observer Done

// Elements related functions

function createElement() {
  const doubtButton = document.getElementsByClassName("coding_ask_doubt_button__FjwXJ")[0];

  const buttonContainer = createButtonContainer()
  doubtButton.parentNode.insertBefore(buttonContainer, doubtButton);
  buttonContainer.appendChild(doubtButton);

  const helpButton = createHelpButton()
  buttonContainer.appendChild(helpButton);

  helpButton.addEventListener("click", openChatBox);
}

function createButtonContainer() {
  const buttonContainer = document.createElement("div");
  buttonContainer.id = "button-container";
  buttonContainer.style.display = "flex";
  buttonContainer.style.justifyContent = "flex-end";
  buttonContainer.style.gap = "10px";
  return buttonContainer
}

function createHelpButton() {
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
  return helpButton
}
function cleanElements() {
  const buttonContainer = document.getElementById("help-button");
  if (buttonContainer) buttonContainer.remove();

  const modalContainer = document.getElementById("modal-container");
  if (modalContainer) modalContainer.remove();
  problemDetails = {}

}
// Elements related function done



// Extracting Problem Details

function extractProblemDetails() {
  let parsedData;
  try {
    parsedData = JSON.parse(XhrRequestData.response)?.data || {};
  } catch (error) {
    alert("Something information are not loaded. Refresh for smooth performance.")
    console.error("Failed to parse xhrRequestData.response:", error);
    parsedData = {};
  }
  const primaryDetails = {
    title: parsedData?.title || "",
    description: parsedData?.body || "",
    constraints: parsedData?.constraints || "",
    editorialCode: parsedData?.editorial_code || [],
    hints: parsedData?.hints || {},
    id: (parsedData?.id).toString() || "",
    inputFormat: parsedData?.input_format || "",
    memoryLimit: parsedData?.memory_limit_mb || "",
    note: parsedData?.note || "",
    outputFormat: parsedData?.output_format || "",
    samples: parsedData?.samples || [],
    timeLimit: parsedData?.time_limit_sec || ""
  };
  const fallbackDetails = {
    id: extractProblemNumber(window.location.pathname),
    title: document.getElementsByClassName("Header_resource_heading__cpRp1")[0]?.textContent || "",
    difficulty: document.getElementsByClassName("m-0 fs-6 problem_paragraph fw-bold")[0]?.textContent || "",
    timeLimit: document.getElementsByClassName("m-0 fs-6 problem_paragraph fw-bold")[1]?.textContent || "",
    memoryLimit: document.getElementsByClassName("m-0 fs-6 problem_paragraph fw-bold")[2]?.textContent || "",
    score: document.getElementsByClassName("m-0 fs-6 problem_paragraph fw-bold")[3]?.textContent || "",
    description: document.getElementsByClassName("coding_desc__pltWY")[0]?.textContent || "",
    inputFormat: document.getElementsByClassName("coding_input_format__pv9fS problem_paragraph")[0]?.textContent || "",
    outputFormat: document.getElementsByClassName("coding_input_format__pv9fS problem_paragraph")[1]?.textContent || "",
    constraints: document.getElementsByClassName("coding_input_format__pv9fS problem_paragraph")[2]?.textContent || "",
    note: document.getElementsByClassName("coding_input_format__pv9fS problem_paragraph")[3]?.textContent || "",
    inputOutput: extractInputOutput() || [],
    userCode: extractUserCode() || "",
  };
  problemDetails = {
    title: primaryDetails?.title || fallbackDetails?.title,
    description: primaryDetails?.description || fallbackDetails?.description,
    constraints: primaryDetails?.constraints || fallbackDetails?.constraints,
    editorialCode: primaryDetails?.editorialCode || [],
    hints: primaryDetails?.hints || {},
    problemId: primaryDetails?.id || fallbackDetails?.id,
    inputFormat: primaryDetails?.inputFormat || fallbackDetails?.inputFormat,
    memoryLimit: primaryDetails?.memoryLimit || fallbackDetails?.memoryLimit,
    note: primaryDetails?.note || fallbackDetails?.note,
    outputFormat: primaryDetails?.outputFormat || fallbackDetails?.outputFormat,
    samples: primaryDetails?.samples || fallbackDetails?.inputOutput,
    timeLimit: primaryDetails?.timeLimit || fallbackDetails?.timeLimit,
    userCode: fallbackDetails?.userCode || "",
    score: fallbackDetails?.score || "",
    difficulty: fallbackDetails?.difficulty || "",
  };

}

function extractProblemNumber(url) {
  const parts = url.split('/');
  let lastPart = parts[parts.length - 1];

  let number = '';
  for (let i = lastPart.length - 1; i >= 0; i--) {
    if (isNaN(lastPart[i])) {
      break;
    }
    number = lastPart[i] + number;
  }

  return number;
}

function extractUserCode() {

  let localStorageData = extractLocalStorage();

  const problemNo = extractProblemNumber(window.location.pathname);
  let language = localStorageData['editor-language'] || "C++14";
  if (language.startsWith('"') && language.endsWith('"')) {
    language = language.slice(1, -1);
  }

  const expression = createExpression(problemNo, language);
  for (let key in localStorageData) {
    if (
      localStorageData.hasOwnProperty(key) &&
      key.includes(expression) &&
      key.endsWith(expression)
    ) {
      return localStorageData[key];
    }
  }
  return '';
}

function createExpression(problemNo, language) {
  return `${problemNo}_${language}`
}


function extractLocalStorage() {
  const localStorageData = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    localStorageData[key] = localStorage.getItem(key);
  }
  return localStorageData;
}

function extractInputOutput() {

  const elements = document.querySelectorAll(".coding_input_format__pv9fS");
  const inputOutputPairs = [];

  for (let i = 3; i < elements.length; i += 2) {
    if (i + 1 < elements.length) {
      const input = elements[i]?.textContent?.trim() || "";
      const output = elements[i + 1]?.textContent?.trim() || "";
      inputOutputPairs.push({ input, output });
    }
  }

  let jsonString = formatToJson(inputOutputPairs)
  return jsonString.replace(/\\\\n/g, "\\n");

}

function formatToJson(obj) {
  return JSON.stringify(obj)
}
// Problem Details Extraction Done

// Chat Box Setup Start

function openChatBox() {
  let aiModal = document.getElementById("modalContainer");
  extractProblemDetails();
  aiModal = createModal();
  displayMessages(problemDetails.problemId)

  const closeAIBtn = aiModal.querySelector("#closeAIBtn");
  closeAIBtn.addEventListener("click", closeModal);

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
          <div id="chatBox" class="bg-body-secondary p-3 rounded overflow-auto mb-3 m-2" style="height: 500px;">
            <!-- Chat messages will appear here -->
            
          </div>

          <!-- User Input Section -->
          <div class="d-flex align-items-center m-2 flex-wrap bg-body-secondary" style="gap: 10px; border-radius:5px">
            <textarea id="userMessage" class="form-control bg-body-secondary" placeholder="Ask your doubt" rows="2" style="flex: 1;resize:none;" required></textarea>
            <button type="button" class="ant-btn css-e6z5vk ant-btn-submit" id="voiceType" style="padding:0px; border:0px;"> 
    <span>
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true" height="28" width="28">
  <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0z"/>
  <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5"/>
</svg>
    </span>
</button>


            <button type="button" class="ant-btn css-e6z5vk ant-btn-submit" id="sendMsg" style="margin-right:5px; border:0px;"><span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true" height="24" width="24">
  <path stroke-linecap="round" stroke-linejoin="round" d="M21 2L11 12M21 2L15 21l-4-9-9-4 12-4L21 2z"></path>
</svg>

            </span></button>
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
  document.getElementById('voiceType')?.addEventListener('click', startListening);
}



function closeModal() {
  const modal = document.getElementById('modalContainer');
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  modal.remove();
}

// Chat Box Setup Done


// Delete and Export start

function deleteHistory() {
  const chatBox = document.getElementById('chatBox');
  const textArea = document.getElementById('userMessage')
  textArea.innerHTML = '';
  chatBox.innerHTML = '';
  deleteChat(problemDetails.problemId)

}

function exportChat() {
  const chatBox = document.getElementById('chatBox');
  const userMessages = chatBox.getElementsByClassName('user-message');
  const botMessages = chatBox.getElementsByClassName('bot-message');

  let formattedMessages = [];
  let totalMessages = Math.max(userMessages.length, botMessages.length);

  for (let i = 0; i < totalMessages; i++) {
    if (i < userMessages.length) {
      formattedMessages.push(`You: ${userMessages[i].innerText}`);
    }
    if (i < botMessages.length) {
      formattedMessages.push(`AI: ${botMessages[i].innerText}`);
    }
  }


  const chatHistory = formattedMessages.join('\n\n');

  const blob = new Blob([chatHistory], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `chat-history-of-${problemDetails?.title || "problems statement"}.txt`;
  link.click();
}

// Delete and Export end


// Message Setup Start


async function sendMessage() {
  const userMessage = document.getElementById('userMessage').value.trim();
  const chatBox = document.getElementById('chatBox');
  const apiKey = await getApiKey();

  if (apiKey) {

    if (userMessage) {
      window.speechSynthesis.cancel();
      chatBox.innerHTML += decorateMessage(userMessage, true);


      document.getElementById('userMessage').value = '';
      disableSendButton();


      let botMessage = "";

      try {

        const prompt = generatePrompt(userMessage);
        botMessage = await callAIAPI(prompt, apiKey);


        if (botMessage) {

          chatBox.innerHTML += decorateMessage(botMessage);
          chatBox.scrollTop = chatBox.scrollHeight;


          saveMessage(problemDetails.problemId, userMessage, () => {
            saveMessage(problemDetails.problemId, botMessage);
          });
        } else {

          const userMessages = document.getElementsByClassName("user-message");
          const lastUserMessage = userMessages[userMessages.length - 1];
          lastUserMessage.classList.remove('user-message');
          alert("Invalid API key or response. Please check your API key.");
        }
      } catch (error) {
        botMessage = "Sorry, something went wrong!";
        chatBox.innerHTML += decorateMessage(botMessage);
        console.error("Error in AI API call:", error);
      }

      enableSendButton();
    }
  } else {
    alert("No API key found. Please provide a valid API key.");
  }
}

function disableSendButton() {
  let sendButton = document.getElementById("sendMsg");
  if (sendButton)
    sendButton.disabled = true
}
function enableSendButton() {
  let sendButton = document.getElementById("sendMsg");
  if (sendButton)
    sendButton.disabled = false
}

function decorateMessage(message, isUser) {
  return `<div style="
    display: flex;
    justify-content: ${isUser ? 'flex-end' : 'flex-start'};
    margin-bottom: 15px;
  ">
    <div style="
      padding: 10px;
      border-radius: 15px;
      max-width: 70%;
      font-family: 'Roboto', Arial, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      background-color: ${isUser ? '#cce8ff' : '#ffffff'};
      color: ${isUser ? '#003366' : '#333333'};
      text-align: left;
    "
      class="${isUser ? 'user-message' : 'bot-message'}"
      data-feedback='0'
    >
      ${message}
      ${!isUser ? `
        <div style="display: flex; margin-top: 10px;">
        <button class="feedback-button like-button" style="border: none; background: none; cursor: pointer; margin-right: 5px;" title="Like">
          <!-- Like SVG -->
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up" viewBox="0 0 16 16">
  <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2 2 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a10 10 0 0 0-.443.05 9.4 9.4 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a9 9 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.2 2.2 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.9.9 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/>
</svg>
        </button>
        <button class="feedback-button dislike-button" style="border: none; background: none; cursor: pointer; margin-right: 5px;" title="Dislike">
          <!-- Like SVG -->
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-down" viewBox="0 0 16 16">
  <path d="M8.864 15.674c-.956.24-1.843-.484-1.908-1.42-.072-1.05-.23-2.015-.428-2.59-.125-.36-.479-1.012-1.04-1.638-.557-.624-1.282-1.179-2.131-1.41C2.685 8.432 2 7.85 2 7V3c0-.845.682-1.464 1.448-1.546 1.07-.113 1.564-.415 2.068-.723l.048-.029c.272-.166.578-.349.97-.484C6.931.08 7.395 0 8 0h3.5c.937 0 1.599.478 1.934 1.064.164.287.254.607.254.913 0 .152-.023.312-.077.464.201.262.38.577.488.9.11.33.172.762.004 1.15.069.13.12.268.159.403.077.27.113.567.113.856s-.036.586-.113.856c-.035.12-.08.244-.138.363.394.571.418 1.2.234 1.733-.206.592-.682 1.1-1.2 1.272-.847.283-1.803.276-2.516.211a10 10 0 0 1-.443-.05 9.36 9.36 0 0 1-.062 4.51c-.138.508-.55.848-1.012.964zM11.5 1H8c-.51 0-.863.068-1.14.163-.281.097-.506.229-.776.393l-.04.025c-.555.338-1.198.73-2.49.868-.333.035-.554.29-.554.55V7c0 .255.226.543.62.65 1.095.3 1.977.997 2.614 1.709.635.71 1.064 1.475 1.238 1.977.243.7.407 1.768.482 2.85.025.362.36.595.667.518l.262-.065c.16-.04.258-.144.288-.255a8.34 8.34 0 0 0-.145-4.726.5.5 0 0 1 .595-.643h.003l.014.004.058.013a9 9 0 0 0 1.036.157c.663.06 1.457.054 2.11-.163.175-.059.45-.301.57-.651.107-.308.087-.67-.266-1.021L12.793 7l.353-.354c.043-.042.105-.14.154-.315.048-.167.075-.37.075-.581s-.027-.414-.075-.581c-.05-.174-.111-.273-.154-.315l-.353-.354.353-.354c.047-.047.109-.176.005-.488a2.2 2.2 0 0 0-.505-.804l-.353-.354.353-.354c.006-.005.041-.05.041-.17a.9.9 0 0 0-.121-.415C12.4 1.272 12.063 1 11.5 1"/>
</svg>
        </button>
        </div>
      <button style="
        margin-left: 10px;
        border: none;
        background: none;
        cursor: pointer;
        color: #007bff;
        font-size: 16px;
        padding: 0;
      " 
        class="play-sound-button">
        <!-- Speaker icon SVG -->
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-volume-up" viewBox="0 0 16 16">
          <path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303z"/>
          <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.61 3.89z"/>
          <path d="M10.025 8a4.5 4.5 0 0 1-1.318 3.182L8 10.475A3.5 3.5 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.5 4.5 0 0 1 10.025 8M7 4a.5.5 0 0 0-.812-.39L3.825 5.5H1.5A.5.5 0 0 0 1 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 7 12zM4.312 6.39 6 5.04v5.92L4.312 9.61A.5.5 0 0 0 4 9.5H2v-3h2a.5.5 0 0 0 .312-.11"/>
        </svg>
      </button>
      ` : ''}
    </div>
  </div>`;
}

function displayMessages(problemId) {
  getMessages(problemId, (messages) => {
    if(messages){
    const chatBox = document.getElementById("chatBox");

    chatBox.innerHTML = "";

    messages.forEach((message, index) => {
      let decoratedMessage = ""
      if (index % 2 === 0)
        decoratedMessage = decorateMessage(message, true);
      else
        decoratedMessage = decorateMessage(message, false);
      const messageElement = document.createElement("div");
      messageElement.innerHTML = decoratedMessage;



      chatBox.appendChild(messageElement);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
  }
  });
}

// Message Setup End

// Sound and Mic Setup Start

function playSound(message) {

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }

  const cleanMessage = message.replace(/<\/?[^>]+(>|$)/g, "");

  const speech = new SpeechSynthesisUtterance(cleanMessage);
  speech.lang = 'en-IN';

  window.speechSynthesis.speak(speech);
}

function startListening() {
  recognition.start();
}

recognition.onresult = function (event) {
  const transcript = event.results[0][0].transcript;

  let userMessage = document.getElementById('userMessage');
  if (userMessage.value)
    userMessage.value += ` ${transcript}`;
  else userMessage.value = transcript
};

recognition.onerror = function (event) {
  alert("Sorry, there is an issue in recognition. Reload the page for better performance")
  console.error('Error occurred in recognition:', event.error);
};

document.addEventListener('click', function (event) {
  if (event.target && event.target.closest('.play-sound-button')) {
    const button = event.target.closest('.play-sound-button');
    const messageContainer = button.closest('.bot-message');
    const messageText = messageContainer.textContent.trim();

    playSound(messageText);
  }
});

// Sound and Mic Setup End




// API Setup 

async function callAIAPI(prompt, apiKey) {
  try {
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
    const url = `${apiUrl}?key=${apiKey}`;
    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;
    cleanedText = cleanAIResponse(text);
    return cleanedText;
  } catch (error) {
    console.error("Error calling AI API:", error);
    return null;
  }
}

function cleanAIResponse(text) {
  text = text.replace(/^```.*\n|\n```$/g, '').trim();
  return text.replace(/```/g, '').trim();
}

function getApiKey() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("apiKey", (result) => {
      if (result.apiKey) {
        resolve(result.apiKey);
      } else {
        alert("API key not found. Please set it in the popup.")
        reject("API key not found. Please set it in the popup.");
      }
    });
  });
}

// API Setup End

// Storage Setup Start

function saveMessage(problemId, message, callback) {
  try {

    chrome.storage.local.get(problemId, (result) => {
      let messages = result[problemId] || [];

      messages.push(message);

      const data = { [problemId]: messages };
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) {
          console.error(`Error saving message: ${chrome.runtime.lastError.message}`);
        }
        if (callback) callback();
      });
    });
  } catch (error) {
    alert("Message could not save. Reload to fix.")
    console.error(`Caught error while saving message: ${error.message}`);
  }
}

function getMessages(problemId, callback) {
  try {
    chrome.storage.local.get(problemId, (result) => {
      if (chrome.runtime.lastError) {
        console.error(`Error retrieving message: ${chrome.runtime.lastError.message}`);
        callback(null);
      } else {
        const messages = result[problemId] || [];
        callback(messages);
      }
    });
  } catch (error) {
    alert("Unable to reterieve last conversation. Please reload")
    console.error(`Caught error while retrieving message: ${error.message}`);
    callback(null);
  }
}

function deleteChat(problemId) {
  try {
    chrome.storage.local.remove(problemId, () => {
      if (chrome.runtime.lastError) {
        console.error(`Error deleting message: ${chrome.runtime.lastError.message}`);
      }
    });
  } catch (error) {
    alert("Unable to delete chat history. Please reload")
    console.error(`Caught error while deleting message: ${error.message}`);
  }
}

// Storage Setup End

// Prompt Setup

function generatePrompt(userMessage) {
  return `
    You are a professional programming assistant tasked with helping users solve a specific coding problem. Your responses must stay strictly within the context of the provided problem, using the details and terminology relevant to the problem itself. Do not provide general programming explanations unless they directly relate to the problem's context.

    Context:
      - **Problem Title:** ${problemDetails.title}
      - **Difficulty:** ${problemDetails.difficulty}
      - **Time Limit:** ${problemDetails.timeLimit}
      - **Memory Limit:** ${problemDetails.memoryLimit}
      - **Score:** ${problemDetails.score}
      - **Description:** ${problemDetails.description}
      - **Input Format:** ${problemDetails.inputFormat}
      - **Output Format:** ${problemDetails.outputFormat}
      - **Constraints:** ${problemDetails.constraints}
      - **Notes:** ${problemDetails.note}
      - **Example Input/Output:** ${JSON.stringify(problemDetails.samples ?? "")}
      - **User Code:** ${problemDetails.userCode || ""}
      - **Hints:** ${JSON.stringify(problemDetails.hints ?? {})}
      - **Editorial Code:** ${JSON.stringify(problemDetails.editorialCode ?? [])}
      - **Last Conversation Context (Up to 5):** ${getLastContext(5)}

    User Message: ${userMessage}

    **Guidelines for your response:**
    1. **Focus on the Problem Context:**
       - Answer the user's question only if it directly pertains to the given problem.
       - Use relevant details from the context and avoid general programming discussions unless they directly apply.
       - Example: If the problem involves trees, provide explanations only about tree-related concepts that are relevant to solving the problem.

    2. **Incorporate User Feedback:**
       - If feedback from the previous conversation is available, use it to improve your response.
       - Example Feedback Interpretation:
         - "User liked your response" → Maintain clarity and provide further useful insights.
         - "User disliked your response" → Avoid repeating mistakes (e.g., too generic or unhelpful answers) and provide a more precise solution.

    3. **For Greetings or Polite Expressions:**
       - Respond warmly but avoid reiterating the problem details.
       - Example: "Hello! How can I assist you with this problem?" or "You're welcome! Let me know if you have further questions."

    4. **For Problem-Related Questions:**
       - Address the query using specific details from the problem.
       - Avoid generic explanations about topics (like "what is dynamic programming?") unless they directly help solve the problem in context.
       - Use examples or code snippets tailored to the problem where appropriate.

    5. **For Unrelated Questions:**
       - Politely inform the user that the query is outside the scope of the current problem.
       - Example: "I'm here to assist with programming questions specifically related to this problem. Could you clarify how your query connects to the problem?"

    6. **Formatting:**
       - Use structured HTML with tags like '<p>' for paragraphs, '<ul>' for lists, and '<pre>' for code snippets.
       - Keep your tone professional, concise, and friendly.

    7. **General Notes:**
       - Avoid introducing unrelated concepts.
       - If the user's question is ambiguous, ask for clarification politely.

    Example Output:
    <p>To solve the problem efficiently, consider using a depth-first search (DFS) approach on the tree. This will help you identify nodes meeting the criteria:</p>
    <ul>
      <li>Start from the root and traverse its children recursively.</li>
      <li>Track the visited nodes to avoid redundant computations.</li>
    </ul>
    <pre>
// Sample Code for DFS
function dfs(node) {
  if (!node) return;
  console.log(node.value);
  dfs(node.left);
  dfs(node.right);
}
    </pre>
  `;
}

function getLastContext(size) {
  const chatBox = document.getElementById('chatBox');
  const userMessages = Array.from(chatBox.getElementsByClassName('user-message'));
  const botMessages = Array.from(chatBox.getElementsByClassName('bot-message'));

  let context = [];
  const messagePairs = Math.min(size, userMessages.length, botMessages.length);

  for (let i = 0; i < messagePairs; i++) {
    const userMessage = userMessages[userMessages.length - messagePairs + i - 1]?.innerText || '';
    const botMessageElement = botMessages[botMessages.length - messagePairs + i];
    const botReply = botMessageElement?.innerText || '';

    let feedback = botMessageElement?.getAttribute('data-feedback') || "0";
    if (feedback === "1") {
      feedback = "User liked your response.";
    } else if (feedback === "-1") {
      feedback = "User disliked your response.";
    } else {
      feedback = "No feedback given.";
    }

    context.push(`User question: ${userMessage}\nAI Reply: ${botReply}\nFeedback: ${feedback}`);
  }
  return context.join('\n\n');
}

// Prompt Setup Done

// Injecting XHR Data Start
window.addEventListener("xhrDataFetched", (event) => {
  XhrRequestData = event.detail;
});

function injectScript() {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("inject.js");
  document.documentElement.insertAdjacentElement("afterbegin", script);
  script.remove();
}

// Injection XHR Data Ends


// Feedback Mechanism Logic Start

document.addEventListener('click', (event) => {
  const target = event.target.closest('.feedback-button');
  if (!target) return;

  const messageElement = target.closest('.user-message, .bot-message');
  if (!messageElement) return;

  const isLike = target.classList.contains('like-button');
  const feedbackValue = isLike ? 1 : -1;

  const likeButton = messageElement.querySelector('.like-button');
  const dislikeButton = messageElement.querySelector('.dislike-button');

  const currentFeedback = parseInt(messageElement.getAttribute('data-feedback'));

  if (currentFeedback === feedbackValue) {

    messageElement.setAttribute('data-feedback', '0');
    target.style.color = '#333';
  } else {

    messageElement.setAttribute('data-feedback', feedbackValue.toString());

    if (isLike) {
      likeButton.style.color = 'blue';
      dislikeButton.style.color = '#333';
    } else {
      dislikeButton.style.color = 'blue';
      likeButton.style.color = '#333';
    }
  }
});

// Feedback Mechanism Logic Ends