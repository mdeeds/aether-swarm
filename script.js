// @ts-check
import { Agent } from './agent.js';
import { Names } from './names.js';
import { MessageTool } from './message-tool.js';


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

    addMessageToChat('user', message);
    inputDiv.textContent = ''; // Clear input

    try {
      const responseText = await agent.postMessage(message);
      addMessageToChat('model', responseText);
    } catch (error) {
      console.error('Error sending message:', error);
      addMessageToChat('error', `Error: ${error.message}`);
    }
  };

  sendButton.addEventListener('click', sendMessage);
  inputDiv.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  /**
   * @param {'user' | 'model' | 'error'} role
   * @param {string} text
   */
  function addMessageToChat(role, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.textContent = text;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to bottom
  }

  // The parent element will contain both the chat and input areas.
  const parentDiv = document.createElement('div');
  parentDiv.appendChild(chatContainer);
  parentDiv.appendChild(inputContainer);
  return parentDiv;
}

/**
 * Main initialization function.
 */
async function main() {
  const agents = [];
  const messageTool = new MessageTool();
  for (let i = 0; i < 2; ++i) {
    const name = Names.nextName();
    const systemInstructions = `Your name is ${name}.}`;
    const agent = new Agent(systemInstructions);
    agents.push(agent);
    messageTool.addAgent(name, agent);
    agent.addTool(messageTool);
  }

  for (const agent of agents) {
    const chatUI = createChatUI(agent);
    document.body.appendChild(chatUI);
  }
}

window.addEventListener('DOMContentLoaded', main);