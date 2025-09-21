// @ts-check

import { MessageTool } from './message-tool.js';
import { Agent } from './agent.js';

export class ToolFactory {
  /** @type {Map<string, import('./tool.js').Tool>} */
  static #allTools = new Map();
  /** @type {Set<string>} */
  static #knownAgents = new Set();
  static #messageTool = new MessageTool();

  constructor() {
  }

  /**
   * @param {Agent} agent
   * @returns {void}
   */
  static addToolsToNewAgent(agent) {
    if (this.#knownAgents.has(agent.name)) {
      return;
    }
    switch (agent.role) {
      case 'Ceo':
        agent.addTool(this.#messageTool);
        break;
      default:
        throw new Error(`Unknown role: ${agent.role}`);
        break;
    }
  }

}