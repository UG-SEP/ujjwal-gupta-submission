

let lastUrl = ""
let problemDetails = {}
let XhrRequestData = ""

function areRequiredElementsLoaded() {
  const problemTitle = document.getElementsByClassName("Header_resource_heading__cpRp1")[0]?.textContent.trim();
  const problemDescription = document.getElementsByClassName("coding_desc__pltWY")[0]?.textContent.trim();

  // Return true if all the required elements are found and their content is non-empty
  return (
    problemTitle && 
    problemDescription
  );
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
      if (mutation.type === "childList" && isProblemsPage()) {
          if (isUrlChanged() || !document.getElementById("help-button")) {
              // Wait until all required content is loaded
              injectScript();
              if (areRequiredElementsLoaded()) {
                  cleanElements();
                  
                  addHelpButton(); 
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
    // Parse the `response` field from `xhrRequestData` (assuming it's a JSON string)
    let parsedData;
    try {
        parsedData = JSON.parse(XhrRequestData.response)?.data || {};
    } catch (error) {
        console.error("Failed to parse xhrRequestData.response:", error);
        parsedData = {};
    }
    // Extract data from `xhrRequestData` (primary source)
    const primaryDetails = {
        title: parsedData.title || "",
        description: parsedData.body || "",
        constraints: parsedData.constraints || "",
        editorialCode: parsedData.editorial_code || [],
        hints: parsedData.hints || {},
        id: (parsedData.id).toString() || "",
        inputFormat: parsedData.input_format || "",
        memoryLimit: parsedData.memory_limit_mb || "",
        note: parsedData.note || "",
        outputFormat: parsedData.output_format || "",
        samples: parsedData.samples || [],
        timeLimit: parsedData.time_limit_sec || ""
    };
    // Extract data from fallback DOM-based approach if primary details are missing
    const fallbackDetails = {
        id :extractProblemNumber(window.location.pathname),
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
    // Combine primary and fallback details (fallback only used for missing fields)
    problemDetails = {
        title: primaryDetails.title || fallbackDetails.title,
        description: primaryDetails.description || fallbackDetails.description,
        constraints: primaryDetails.constraints || fallbackDetails.constraints,
        editorialCode: primaryDetails.editorialCode || [],
        hints: primaryDetails.hints || {},
        problemId: primaryDetails.id || fallbackDetails.id,
        inputFormat: primaryDetails.inputFormat || fallbackDetails.inputFormat,
        memoryLimit: primaryDetails.memoryLimit || fallbackDetails.memoryLimit,
        note: primaryDetails.note || fallbackDetails.note,
        outputFormat: primaryDetails.outputFormat || fallbackDetails.outputFormat,
        samples: primaryDetails.samples || fallbackDetails.inputOutput,
        timeLimit: primaryDetails.timeLimit || fallbackDetails.timeLimit,
        userCode: fallbackDetails.userCode || "",
        score : fallbackDetails.score || "",
        difficulty: fallbackDetails.difficulty || "",
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

const jsonString = JSON.stringify(inputOutputPairs);
return jsonString.replace(/\\\\n/g, "\\n"); 

}
function extractId(url){
    const start = url.indexOf("problems/") + "problems/".length;
    const end = url.indexOf("?",start);
    return end === -1 ? url.substring(start): url.substring(start,end);
}

function openChatBox() {
    let aiModal = document.getElementById("modalContainer");
    if (!aiModal) {
      extractProblemDetails();
        aiModal = createModal();
        displayMessages(problemDetails.problemId)
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
          <div id="chatBox" class="bg-body-secondary p-3 rounded overflow-auto mb-3 m-2" style="height: 500px;">
            <!-- Chat messages will appear here -->
            
          </div>

          <!-- User Input Section -->
          <div class="d-flex align-items-center m-2 flex-wrap bg-body-secondary" style="gap: 10px; border-radius:5px">
            <textarea id="userMessage" class="form-control bg-body-secondary" placeholder="Ask your doubt" rows="2" style="flex: 1;resize:none;"></textarea>
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
    document.getElementById('feedback-button')?.addEventListener('click', handleFeedback);
}

function closeModal() {
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
    deleteChat(problemDetails.problemId)
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

async function sendMessage() {
console.log("yes data is saved", XhrRequestData)
    const userMessage = document.getElementById('userMessage').value;
    const chatBox = document.getElementById('chatBox');
    if (userMessage && chatBox) {
        // Append user's message to chatbox
        chatBox.innerHTML += decorateMessage(userMessage,true);

        // Clear the input field
        document.getElementById('userMessage').value = '';

        // Declare botMessage outside to use it later
        let botMessage="";

        try {
            // Simulate AI response after a short delay or API call
            const prompt = generatePrompt(userMessage)
            //console.log(prompt)
            botMessage = await callAIAPI(prompt);

            // Append AI's response
            chatBox.innerHTML += decorateMessage(botMessage);
            chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the latest message
        } catch (error) {
            botMessage = "Sorry, something went wrong!";
            chatBox.innerHTML += decorateMessage(botMessage);
        }

        // Save the user message and AI response
        if(botMessage!==null){
        saveMessage(problemDetails.problemId, userMessage, () => {
          // After user message is saved, save bot message
          saveMessage(problemDetails.problemId, botMessage);
        });
    }
  }
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
    ">
      ${message}
      <div style="
        font-size: 12px; 
        color: #888888; 
        margin-top: 5px; 
        text-align: right;
      ">
        ${new Date().toLocaleTimeString()}
      </div>
    </div>
  </div>`;
}




function handleFeedback() {
    alert('Feedback button clicked');
}

async function callAIAPI(prompt) {
  try {
    const apiKey = await getApiKey(); // Now it waits for the API key asynchronously
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
    let text = data.candidates[0].content.parts[0].text; // Extracts the text part from the response
    text = text.replace(/^```.*\n|\n```$/g, '').trim();
    text = text.replace(/```/g, '').trim();
    return text;
  } catch (error) {
    console.error("Error calling AI API:", error);
    return null;
  }
}

// Modified getApiKey function that returns a promise
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

// Save a message for a specific chat (problemId)
function saveMessage(problemId, message, callback) {
  try {
    // Get existing messages for the given problemId
    chrome.storage.local.get(problemId, (result) => {
      let messages = result[problemId] || []; // If no messages exist, initialize as an empty array

      // Add the new message to the array
      messages.push(message);

      // Save the updated messages array
      const data = { [problemId]: messages }; 
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) {
          console.error(`Error saving message: ${chrome.runtime.lastError.message}`);
        } else {
          console.log(`Message saved successfully for problemId: ${problemId}`);
        }
        // Call the callback function to indicate the save is complete
        if (callback) callback();
      });
    });
  } catch (error) {
    console.error(`Caught error while saving message: ${error.message}`);
  }
}

// Retrieve messages for a specific chat (problemId)
function getMessages(problemId, callback) {
  try {
    chrome.storage.local.get(problemId, (result) => {
      if (chrome.runtime.lastError) {
        console.error(`Error retrieving message: ${chrome.runtime.lastError.message}`);
        callback(null); // Pass null to indicate failure
      } else {
        const messages = result[problemId] || []; // Retrieve the messages or return an empty array if not found
        console.log(`Retrieved messages for problemId: ${problemId}`, messages);
        callback(messages); // Pass the array of messages to the callback
      }
    });
  } catch (error) {
    console.error(`Caught error while retrieving message: ${error.message}`);
    callback(null); // Pass null in case of an error
  }
}

// Delete all messages for a specific chat (problemId)
function deleteChat(problemId) {
  try {
    chrome.storage.local.remove(problemId, () => {
      if (chrome.runtime.lastError) {
        console.error(`Error deleting message: ${chrome.runtime.lastError.message}`);
      } else {
        console.log(`Messages for problemId: ${problemId} deleted successfully.`);
      }
    });
  } catch (error) {
    console.error(`Caught error while deleting message: ${error.message}`);
  }
}

function generatePrompt(userMessage) {
  return `
    You are an assistant helping users with programming problems. Use the following context to answer the user's query accurately and concisely. 
    Your response must stay within the scope of the provided problem unless the user is engaging in common pleasantries (e.g., saying "hello" or "thank you"). 
    Respond warmly to pleasantries, but for unrelated questions, politely inform the user that the query is out of scope.

    Context:
       Problem Title: ${problemDetails.title}
      Difficulty: ${problemDetails.difficulty}
      Time Limit: ${problemDetails.timeLimit}
      Memory Limit: ${problemDetails.memoryLimit}
      Score: ${problemDetails.score}
      Description: ${problemDetails.description}
      Input Format: ${problemDetails.inputFormat}
      Output Format: ${problemDetails.outputFormat}
      Constraints: ${problemDetails.constraints}
      Notes: ${problemDetails.note}
      Example Input/Output: ${JSON.stringify(problemDetails.samples)}
      User Code : ${problemDetails.userCode}
      "Hints" : ${JSON.stringify(problemDetails.hints)}
      "Editorial Code" : ${JSON.stringify(problemDetails.editorialCode)}

    User Message: ${userMessage}

    Instructions for your response:
    - If the user's message is a general greeting (e.g., "hello", "hi") or a polite expression (e.g., "thank you"), respond warmly without repeating problem details.
    - For problem-related questions, answer using only the relevant details from the context provided.
    - Avoid repeating the entire problem details unless explicitly requested by the user.
    - If the user's question is unrelated to the problem and not a pleasantry, politely inform them that the query is out of scope.
    - Format your response as structured HTML (with paragraphs, and lists as needed).
    - Stay professional, concise, and friendly.
  `;
}

window.addEventListener("xhrDataFetched", (event) => {
  XhrRequestData = event.detail;
  console.log("Received data in content.js:", XhrRequestData);
  // Process or send this data to your extension background script
});

function injectScript() {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("inject.js");
  document.documentElement.insertAdjacentElement("afterbegin", script);
  script.remove(); // Clean up after injecting
}

function displayMessages(problemId) {
  // Fetch messages based on the problemId
  getMessages(problemId, (messages) => {
    const chatBox = document.getElementById("chatBox");
    
    if (!chatBox) {
      console.error("Chatbox element not found");
      return;
    }

    // Clear the chatbox before appending new messages
    chatBox.innerHTML = "";

    // Iterate over the messages and decorate each one
    messages.forEach((message, index) => {
      let decoratedMessage = ""
      if(index%2===0)
        decoratedMessage = decorateMessage(message,true);
    else 
    decoratedMessage = decorateMessage(message,false);
      // Add the message to the chatbox. Assuming message is either from the user or the bot
      const messageElement = document.createElement("div");
      messageElement.innerHTML = decoratedMessage;

      // Add specific classes or identifiers to differentiate user and bot messages
      if (index % 2 === 0) {
        messageElement.classList.add("user-message"); // User messages at even indices
      } else {
        messageElement.classList.add("bot-message"); // Bot messages at odd indices
      }

      chatBox.appendChild(messageElement);
    });

    // Optionally scroll to the bottom of the chatbox after adding new messages
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}
