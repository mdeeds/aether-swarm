// @ts-check

/** @typedef {import('./tool.js').Tool} Tool */
/** @typedef {import('./message-tool.js').MessageTool} MessageTool */

/**
 * A tool for broadcasting a message to all agents.
 * @implements {Tool}
 */
export class BroadcastTool {
  /** @type {MessageTool} */
  #messageTool;

  /** @type {import('./tool.js').FunctionDeclaration} */
  declaration = {
    name: 'broadcast',
    description: 'Sends a message to all other agents and returns their concatenated responses.',
    parameters: {
      type: 'OBJECT',
      properties: {
        text: {
          type: 'STRING',
          description: 'The content of the message to broadcast.',
        },
        fromName: {
          type: 'STRING',
          description: 'The name of the agent broadcasting the message.',
        },
      },
      required: ['text', 'fromName'],
    },
  };

  /**
   * @param {MessageTool} messageTool An instance of MessageTool to use for sending messages.
   */
  constructor(messageTool) {
    if (!messageTool) {
      throw new Error('MessageTool instance is required.');
    }
    this.#messageTool = messageTool;
  }

  /**
   * Executes the broadcast.
   * @param {{ text: string, fromName: string }} args - The message text to broadcast.
   * @returns {Promise<string>} A string containing the concatenated responses from all agents.
   */
  async run(args) {
    const { text, fromName } = args;
    if (!fromName) {
      throw new Error('fromName is required.');
    }
    const agentNames = Array.from(this.#messageTool.agents.keys()).filter(
      name => !fromName.startsWith(name)
    );
    const promises = agentNames.map(name => this.#messageTool.run({ name, text, fromName }));
    const responses = await Promise.all(promises);
    return agentNames.map((name, i) => `${name}: ${responses[i]}\n`).join('\n');
  }
}