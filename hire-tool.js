// @ts-check

import { AgentFactory } from './agent-factory.js';
import { Hats } from './hats.js';

/** @typedef {import('./tool.js').Tool} Tool */

/**
 * A tool for hiring a new agent with a specific role and hat.
 * @implements {Tool}
 */
export class HireTool {
  /** @type {import('./tool.js').FunctionDeclaration} */
  declaration = {
    name: 'hire',
    description: 'Hires a new agent with a specified role and personality hat.',
    parameters: {
      type: 'OBJECT',
      properties: {
        role: {
          type: 'STRING',
          description: 'The role of the new agent to hire.',
        },
        hat: {
          type: 'STRING',
          description: 'The personality hat color for the new agent.',
          enum: Hats.listColors(),
        },
      },
      required: ['role', 'hat'],
    },
  };

  /**
   * Executes the hiring process.
   * @param {{ role: string, hat: string }} args - The role and hat for the new agent.
   * @returns {Promise<string>} A message confirming the hiring.
   */
  async run(args) {
    const { role, hat } = args;

    const chats = document.getElementById('chats');
    if (!chats) {
      throw new Error('Chats container not found.');
    }
    const chatHistoryDiv = document.createElement('div');
    chats.appendChild(chatHistoryDiv);
    let newAgent;
    try {
      newAgent = await AgentFactory.createAgent(role, hat, chatHistoryDiv);
    } catch (error) {
      return `Error: ${error.message}`;
    }
    return `You have successfully hired ${newAgent.name} as a new ${newAgent.role}.`;
  }
}