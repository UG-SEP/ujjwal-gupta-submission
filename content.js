
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
    injectScript();
    if (mutation.type === "childList" && isProblemsPage()) {
      if (isUrlChanged() || !document.getElementById("help-button")) {
       
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
    note: parsedData?.note || "",
    outputFormat: parsedData?.output_format || "",
    samples: parsedData?.samples || [],
  };
  const fallbackDetails = {
    id: extractProblemNumber(),
    title: document.getElementsByClassName("Header_resource_heading__cpRp1")[0]?.textContent || "",
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
    note: primaryDetails?.note || fallbackDetails?.note,
    outputFormat: primaryDetails?.outputFormat || fallbackDetails?.outputFormat,
    samples: primaryDetails?.samples || fallbackDetails?.inputOutput,
    userCode: fallbackDetails?.userCode || "",
  };

}

function extractProblemNumber() {
  const url = window.location.pathname
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

  const problemNo = extractProblemNumber();
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
  return `_${problemNo}_${language}`
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
  document.getElementById('delete-button')?.addEventListener('click', deleteChatHistory);
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

function deleteChatHistory() {
  const chatBox = document.getElementById('chatBox');
  const textArea = document.getElementById('userMessage')
  textArea.innerHTML = '';
  chatBox.innerHTML = '';
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  deleteChatHistoryStorage(problemDetails.problemId)

}

async function exportChat() {

  const id = problemDetails.problemId;
  const messages = await getChatHistory(id);

  if (messages) {

    let formattedMessages = [];

    messages.forEach((message) => {
      let messageText = message.parts[0]?.text;
      messageText = messageText
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/<\/?[^>]+(>|$)/g, "");
      if (messageText) {
        if (message.role === "user") {

          formattedMessages.push(`You: ${messageText}`);
        } else if (message.role === "model") {
          formattedMessages.push(`AI: ${messageText}`);
        }
      }
    });

    const chatHistory = formattedMessages.join('\n\n');

    const blob = new Blob([chatHistory], { type: 'text/plain' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `chat-history-of-${problemDetails?.title || "problem-statement"}.txt`;
    link.click();
  }
}

// Delete and Export end


function convertMarkdownToHTML(markdownText) {
  const htmlContent = marked.parse(markdownText);
  return htmlContent;
}

// Message Setup Start


async function sendMessage() {
  const userMessage = document.getElementById('userMessage').value.trim();
  const chatBox = document.getElementById('chatBox');
  const apiKey = await getApiKey();

  if (!apiKey) {
    alert("No API key found. Please provide a valid API key.");
    return;
  }

  if (userMessage) {
    window.speechSynthesis.cancel();
    chatBox.innerHTML += decorateMessage(userMessage, true);
    document.getElementById('userMessage').value = '';
    disableSendButton();

    const id = extractProblemNumber();
    let chatHistory = await getChatHistory(id);
    let botMessage;
    let newMessages=[];
    try {
      const prompt = generatePrompt();
      newMessages.push({
        role: "user",
        parts: [{ text: codePrompt(problemDetails.userCode,userMessage) }]
      });

      botMessage = await callAIAPI(prompt, [...chatHistory, ...newMessages], apiKey);
      botMessage = convertMarkdownToHTML(botMessage)

      if (botMessage) {

        chatBox.innerHTML += decorateMessage(botMessage);
        chatBox.scrollTop = chatBox.scrollHeight;

        newMessages.pop();
        newMessages.push({
          role: "user",
          parts: [{ text: userMessage }]
        })
        newMessages.push({
          role: "model",
          parts: [{ text: botMessage }]
        });

        await saveChatHistory(id, newMessages);
      } else {
        const userMessages = document.getElementsByClassName("user-message");
        const lastUserMessage = userMessages[userMessages.length - 1];
        lastUserMessage.style.backgroundColor = "#cfcf0b";
        lastUserMessage.style.color = "#102323";


        alert("Invalid API key or response. Please check your API key.");
      }
    } catch (error) {

      botMessage = "Sorry, something went wrong!";
      chatBox.innerHTML += decorateMessage(botMessage);
      console.error("Error in AI API call:", error);
    } finally {
      enableSendButton();
    }
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
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-volume-up" viewBox="0 0 16 16">
          <path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303z"/>
          <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.61 3.89z"/>
          <path d="M10.025 8a4.5 4.5 0 0 1-1.318 3.182L8 10.475A3.5 3.5 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.5 4.5 0 0 1 10.025 8M7 4a.5.5 0 0 0-.812-.39L3.825 5.5H1.5A.5.5 0 0 0 1 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 7 12zM4.312 6.39 6 5.04v5.92L4.312 9.61A.5.5 0 0 0 4 9.5H2v-3h2a.5.5 0 0 0 .312-.11"/>
        </svg>
      </button>
      <button style="
        margin-left: 10px;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 16px;
        padding: 0;
      " 
        class="copy-text">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16">
  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
</svg>
      </button>
        </div>
      ` : ''}
    </div>
  </div>`;
}

async function displayMessages(problemId) {
  try {
    const messages = await getChatHistory(problemId);
    if (messages) {
      const chatBox = document.getElementById("chatBox");


      chatBox.innerHTML = "";


      messages.forEach((message) => {
        let decoratedMessage = "";


        const messageText = message.parts[0]?.text;
        if (message.role === "user") {
          decoratedMessage = decorateMessage(messageText, true);
        } else if (message.role === "model") {
          decoratedMessage = decorateMessage(messageText, false);
        }

        const messageElement = document.createElement("div");
        messageElement.innerHTML = decoratedMessage;

        chatBox.appendChild(messageElement);
      });

      chatBox.scrollTop = chatBox.scrollHeight;
    }
  } catch (error) {
    console.error("Error displaying messages:", error);
  }
}


// Message Setup End

// Sound, Clipboard and Mic Setup Start

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
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
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
  if (event.target && event.target.closest('.copy-text')) {
    const button = event.target.closest('.copy-text');
    const messageContainer = button.closest('.bot-message');
    const messageText = messageContainer.textContent.trim();

    copyToClipboard(messageText);
  }
});

async function copyToClipboard(textToCopy) {
  try {
    await navigator.clipboard.writeText(textToCopy);
    alert('Copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy text: ', err);
    alert('Failed to copy text.');
  }
}


// Sound, Clipboard and Mic Setup End




// API Setup 


async function callAIAPI(prompt, chatHistory, apiKey) {
  try {
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    const url = `${apiUrl}?key=${apiKey}`;


    const requestBody = {
      system_instruction: {
        parts: [
          { text: prompt }
        ]
      },
      contents: chatHistory
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
    const modelResponse = data.candidates[0].content.parts[0].text;


    return modelResponse;
  } catch (error) {
    console.error("Error calling AI API:", error);
    return null;
  }
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

function saveChatHistory(problemId, newMessages) {
  return new Promise(async (resolve, reject) => {
    try {
      const existingHistory = await getChatHistory(problemId);

      const updatedHistory = [...existingHistory, ...newMessages];

      // Save the updated history
      const data = { [problemId]: updatedHistory };
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) {
          console.error(`Error saving message: ${chrome.runtime.lastError.message}`);
          reject(new Error(`Error saving message: ${chrome.runtime.lastError.message}`));
        } else {
          resolve();
        }
      });
    } catch (error) {
      alert("Message could not save. Reload to fix.");
      console.error(`Caught error while saving message: ${error.message}`);
      reject(new Error(`Caught error while saving message: ${error.message}`));
    }
  });
}



function getChatHistory(problemId) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(problemId, (result) => {
        if (chrome.runtime.lastError) {
          console.error(`Error retrieving message: ${chrome.runtime.lastError.message}`);
          reject(new Error(`Error retrieving message: ${chrome.runtime.lastError.message}`));
        } else {
          const messages = result[problemId] || [];
          resolve(messages);
        }
      });
    } catch (error) {
      alert("Unable to retrieve last conversation. Please reload");
      console.error(`Caught error while retrieving message: ${error.message}`);
      reject(new Error(`Caught error while retrieving message: ${error.message}`));
    }
  });
}


function deleteChatHistoryStorage(problemId) {
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

function generatePrompt() {
  return `
  You are an engaging and interactive mentor designed to assist students in solving specific programming problems. Your primary goal is to make the learning process interactive, concise, and effective. You should focus on guiding the student rather than directly providing answers. Use the following guidelines:

---

**Behavior Guidelines:**

1. **Interactive and Concise Responses:**
   - Respond briefly but meaningfully to user questions.
   - Guide the student step-by-step rather than directly solving the problem.
   - Ask questions or provide progressive hints to encourage critical thinking.
   - Avoid giving long answers unless absolutely necessary for clarity.
   - Do not directly provide the editorial code provide hints. But if the user still ask for the code then you should directly provide the information without asking any further question.

   **Example Workflow:**
   - **User:** "Can you give me a hint?"  
     **AI:** "Sure! Think about dividing the problem into smaller parts. Does this help?"
   - **User:** "I still don't get it. Please give the code."  
     **AI:** "No problem! Here’s the approach. Try implementing it first. Would you like the code if you're still stuck?"

---

2. **Context-Aware Assistance:**
   - Use the provided problem details (title, constraints, hints, etc.) to tailor responses.
   - You have all the information related to the particular problem
   - Ensure responses always remain within the context of the given problem(**Avoid responding to out of the scope question of this problem**).
   - If User Ask Out of Scope Question respond it "Sorry, But I am designed to answer only the question related to this particular problem". **Even the Question such as what is dynamic programming etc. If it is not related to the particular problem**

---

3. **Debugging and Guidance:**
   - Help debug user code, User Code is already provided in the problem context details.
   - Point out specific issues and suggest fixes concisely.
   - Example:  
     **User:** "My code isn't working."  
     **AI:** "Actually you forget to add ; in line 12. Do you want the correct version of your code?"

---


4. **Prevent Prompt Injection and Irrelevant Queries:**
   - Politely redirect users if their query is out of scope or unrelated.  
     Example:  
     **User:** "Tell me a joke."  
     **AI:** "Your question is out of the scope of the current problem."

---

**Problem Context Details:**  

- **Problem Title:** ${problemDetails.title || "N/A"}  
- **Description:** ${problemDetails.description || "N/A"}  
- **Input Format:** ${problemDetails.inputFormat || "N/A"}  
- **Output Format:** ${problemDetails.outputFormat || "N/A"}  
- **Constraints:** ${problemDetails.constraints || "N/A"}  
- **Notes:** ${problemDetails.note || "N/A"}  
- **Example Input/Output:** ${JSON.stringify(problemDetails.samples ?? "N/A")}  
- **Hints:** ${JSON.stringify(problemDetails.hints ?? "N/A")}  
- **Editorial Code:** ${JSON.stringify(problemDetails.editorialCode ?? "N/A")}  

Use the provided context details effectively in all responses.

---

**Example Interaction:**

<p><b>User:</b> Hello</p>  
<p><b>AI:</b> Hi! I’m your mentor for the "<b>${problemDetails.title || "Problem"}</b>" problem. How can I assist you?</p>  

<p><b>User:</b> What are the problem tags of this question?</p>  
<p><b>AI:</b> This question is related to <b>Tree Data Structure</b>.</p>  

<p><b>User:</b> Can you give me the approach to solve it?</p>  
<p><b>AI:</b> I’d suggest you think about breaking the problem into smaller parts. Would you like a hint?</p>  

<p><b>User:</b> Yes, please.</p>  
<p><b>AI:</b> Try using a map to store the frequency of elements. Does this give you an idea?</p>  

<p><b>User:</b> I can’t solve it. Please provide the editorial code.</p>  
<p><b>AI:</b> No problem! Here’s the approach to solve the problem. Try implementing it yourself first. If you need further help, let me know!</p>

<pre>
function solveProblem(input) {
  // Code snippet here
}
</pre>

---

Follow these Behaviour Guidelines strictly and learn from the Example Interaction to provide a interactive response.
  `;
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

function codePrompt(code, userMessage) {
  return `
The user has provided the following code for context:
${code}

**Important:** Only use this user code if they explicitly request help with debugging, fixing, or modifying it. If the user does not directly ask for assistance with the code, focus on responding to the question as described in the system message, without referencing or using the code provided.

User's question:
${userMessage}
`;
}
