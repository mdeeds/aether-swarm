// @ts-check

import { Agent } from './agent.js';

/**
 * @typedef {import('./tool.js').Tool} ITool
 */

/**
 * @implements {ITool}
 */
export class MessageTool {
  /** @type {import('./tool.js').FunctionDeclaration} */
  declaration = {
    name: 'message',
    description: "Sends a message to a named agent and returns that agent's response.",
    parameters: {
      type: 'OBJECT',
      properties: {
        name: {
          type: 'STRING',
          description: 'The name of the agent to send the message to.'
        },
        text: {
          type: 'STRING',
          description: 'The content of the message.'
        },
        fromName: {
          type: 'STRING',
          description: 'The name and role of the sender of the message.'
        }
      },
      required: ['name', 'text', 'fromName']
    }
  }

  constructor() {
    // Map from agent name to an instance of the Agent object.
    /** @type {Map<string, import('./agent.js').Agent>} */
    this.agents = new Map();
  }

  /**
   * @param {string} name
   * @param {import('./agent.js').Agent} agent
   */
  addAgent(name, agent) {
    this.agents.set(name, agent);
  }

  /**
   * Executes the message tool, sending a message to a specified agent.
   * @param {{ name: string; text: string; fromName: string}} args The arguments for the tool call.
   * @returns {Promise<string>} The response from the called agent.
   */
  async run({ name, text, fromName }) {
    if (!fromName) {
      throw new Error('fromName is required.');
    }
    const agent = this.agents.get(name);
    if (!agent) {
      return `Error: Agent with name '${name}' not found.`;
    }
    console.log(`Routing message to ${name}: "${text}"`);
    const response = await agent.postMessage(text);
    return response;
  }
}

/**
 * @implements {ITool}
 */
export class PrefixMessageTool {
  /** @type {import('./tool.js').FunctionDeclaration} */
  declaration = {
    name: 'message',
    description: "Sends a message to a named agent and returns that agent's response.",
    parameters: {
      type: 'OBJECT',
      properties: {
        name: {
          type: 'STRING',
          description: 'The name of the agent to send the message to.'
        },
        text: {
          type: 'STRING',
          description: 'The content of the message.'
        },
        fromName: {
          type: 'STRING',
          description: 'The name and role of the sender of the message.'
        }
      },
      required: ['name', 'text', 'fromName']
    }
  }

  #messageTool;
  #prefix;
  #fromAgent;

  /**
   * @param {MessageTool} messageTool
   * @param {Agent} fromAgent
   */
  constructor(messageTool, fromAgent) {
    this.#messageTool = messageTool;
    this.#fromAgent = fromAgent;
    this.#prefix = `${fromAgent.name}, ${fromAgent.role}: \n`;
  }

  /**
 * Executes the message tool, sending a message to a specified agent.
 * @param {{ name: string; text: string; fromName: string}} args The arguments for the tool call.
 * @returns {Promise<string>} The response from the called agent.
 */
  async run({ name, text }) {
    if (!text) {
      throw new Error('text is required.');
    }
    if (!this.#messageTool) {
      throw new Error('MessageTool instance is required.');
    }
    if (!this.#prefix) {
      throw new Error('Prefix is required.');
    }
    const agent = this.#messageTool.agents.get(name);
    if (!agent) {
      return `Error: Agent with name '${name}' not found.`;
    }
    if (agent.name == this.#fromAgent.name) {
      return `Not sending message to self.  To and from are both ${this.#fromAgent.name}.}`;
    }
    console.log(`Routing message to ${name}: "${text}"`);
    const response = await agent.postMessage(this.#prefix + "\n" + text);
    return response;
  }

}