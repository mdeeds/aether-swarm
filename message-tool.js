// @ts-check

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
        }
      },
      required: ['name', 'text']
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
   * @param {{ name: string; text: string; }} args The arguments for the tool call.
   * @returns {Promise<string>} The response from the called agent.
   */
  async run({ name, text }) {
    const agent = this.agents.get(name);
    if (!agent) {
      return `Error: Agent with name '${name}' not found.`;
    }
    console.log(`Routing message to ${name}: "${text}"`);
    const response = await agent.postMessage(text);
    return response;
  }
}