// @ts-check
import { Agent } from './agent.js';
import { AgentFactory } from './agent-factory.js';
import { Directory } from './directory.js';
import { Hats } from './hats.js';


/**
* Creates the chat UI elements and returns the main container.
* @param {Agent} agent The agent instance to interact with.
* @returns {HTMLDivElement} The main chat container element.
*/
function createChatUI(agent) {
  // The constructor already starts loading the API key.
  // We can proceed with creating the UI.

  const chatContainer = document.createElement('div');
  chatContainer.id = 'chat-container';

  const inputContainer = document.createElement('div');
  inputContainer.id = 'input-container';

  const inputDiv = document.createElement('div');
  inputDiv.contentEditable = 'true';
  inputDiv.id = 'input-div';
  inputContainer.appendChild(inputDiv);

  const sendButton = document.createElement('button');
  sendButton.textContent = 'Send';
  sendButton.id = 'send-button';
  inputContainer.appendChild(sendButton);

  const sendMessage = async () => {
    const message = inputDiv.textContent?.trim();
    if (!message) return;

    inputDiv.textContent = ''; // Clear input

    try {
      const responseText = await agent.postMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  sendButton.addEventListener('click', sendMessage);
  inputDiv.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // The parent element will contain both the chat and input areas.
  const parentDiv = document.createElement('div');
  parentDiv.appendChild(chatContainer);
  parentDiv.appendChild(inputContainer);
  return parentDiv;
}

/**
 * Shows the chat window for a specific agent and hides all others.
 * @param {string | undefined} agentName The name of the agent whose chat to show.
 */
function showAgentChat(agentName) {
  if (!agentName) return;
  const allChats = document.querySelectorAll('.chat');
  for (const chat of allChats) {
    const chatElement = /** @type {HTMLElement} */ (chat);
    if (chatElement.dataset.agentName === agentName) {
      chatElement.classList.remove('hidden');
    } else {
      chatElement.classList.add('hidden');
    }
  }
}

/**
 * Main initialization function.
 */
async function main() {
  const contentWrapper = document.createElement('div');
  contentWrapper.id = 'content-wrapper';
  document.body.appendChild(contentWrapper);

  // Create main layout containers
  const employeeListDiv = document.createElement('div');
  employeeListDiv.id = 'employee-list';
  contentWrapper.appendChild(employeeListDiv);
  Directory.setEmployeeListContainer(employeeListDiv);

  employeeListDiv.addEventListener('click', (event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    if (target.classList.contains('employee-chit')) {
      const agentName = target.dataset.agentName;
      showAgentChat(agentName);
    }
  });

  const mainContentDiv = document.createElement('div');
  mainContentDiv.id = 'main-content';
  contentWrapper.appendChild(mainContentDiv);

  const chats = document.createElement('div');
  chats.id = 'chats';
  mainContentDiv.appendChild(chats);
  if (!chats) {
    throw new Error('Chats container not found.');
  }
  // const color = Hats.randomColor();
  // White is really anoying for a CEO.
  const color = 'red';  // Red is by far the most fun Ceo
  const ceo = await AgentFactory.createAgent('Ceo', color, chats);
  const chatUI = createChatUI(ceo);
  showAgentChat(ceo.name);
  mainContentDiv.appendChild(chatUI);
}

window.addEventListener('DOMContentLoaded', main);