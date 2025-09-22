// @ts-check

import { Agent } from './agent.js';
import { Directory } from './directory.js';
import { Hats } from './hats.js';
import { Names } from './names.js';
import { Roles } from './roles.js';
import { ToolFactory } from './tool-factory.js';

export class AgentFactory {

  /** @type {string | undefined} */
  static #toolsMd = undefined;


  /**
   * 
   * @param {string} name The agent's name
   * @param {HTMLElement} chatContent The chat content for this user.
   * @returns 
   */
  static #makeNamedChatDiv(name, chatContent) {
    const chatDiv = document.createElement('div');
    chatDiv.dataset.agentName = name;
    chatDiv.classList.add('chat');
    const chatHeader = document.createElement('div');
    chatHeader.classList.add('chat-header');
    chatHeader.textContent = name;
    chatDiv.appendChild(chatHeader);
    chatDiv.appendChild(chatContent);
    return chatDiv;
  }

  /**
   * @param {string} role
   * @param {string} hat
   * @param {HTMLElement} chatContainer
   * @returns {Promise<Agent>}
   */
  static async createAgent(role, hat, chatContainer) {
    if (!this.#toolsMd) {
      this.#toolsMd = await (await fetch('tools.md')).text();
    }
    if (!chatContainer) {
      throw new Error('Chat history container is required.');
    }
    const chatContent = document.createElement('div');
    chatContent.classList.add('chat-content');

    const name = Names.nextName();
    const roleInstructions = Roles.getInstructions(role);
    const hatInstructions = Hats.getInstructions(hat);
    const systemInstructions = `You are ${name}.
    ${roleInstructions}

    A little about your personality:
    ${hatInstructions}
    
    Depending on your role, you will have various tools at your disposal.

    ${this.#toolsMd}
    `;

    const agent = new Agent(name, role, systemInstructions, chatContent);
    ToolFactory.addToolsToNewAgent(agent);
    Directory.addAgent(agent);

    chatContainer.appendChild(this.#makeNamedChatDiv(name, chatContent));


    return agent;
  }
}