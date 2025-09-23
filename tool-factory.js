// @ts-check

import { MessageTool, PrefixMessageTool } from './message-tool.js';
import { BroadcastTool } from './broadcast-tool.js';
import { HireTool } from './hire-tool.js';
import { Agent } from './agent.js';
import { CompleteWorkItemTool, CreateWorkItemTool, AssignWorkItemTool, GetWorkItemDetailTool } from './work-tools.js';

/**
 * @typedef {import('./tool.js').Tool} Tool
 */


export class ToolFactory {
  /** @type {Map<string, import('./tool.js').Tool>} */
  static #allTools = new Map();
  /** @type {Set<string>} */
  static #knownAgents = new Set();
  static #messageTool = new MessageTool();
  static #broadcastTool = new BroadcastTool(this.#messageTool);
  static #hireTool = new HireTool();
  static #createWorkItemTool = new CreateWorkItemTool();
  static #assignWorkItemTool = new AssignWorkItemTool();
  static #getWorkItemDetailTool = new GetWorkItemDetailTool();
  static #completeWorkItemTool = new CompleteWorkItemTool();


  static {
    this.#registerTool(this.#messageTool);
    this.#registerTool(this.#broadcastTool);
    this.#registerTool(this.#hireTool);
  };

  /**
   * @param {Tool} tool
   */
  static #registerTool(tool) {
    this.#allTools.set(tool.declaration.name, tool);
  }


  /**
   * @param {Agent} agent
   * @returns {void}
   */
  static addToolsToNewAgent(agent) {
    if (this.#knownAgents.has(agent.name)) {
      return;
    }
    const messageTool = new PrefixMessageTool(this.#messageTool, agent);
    this.#messageTool.addAgent(agent.name, agent);
    this.#knownAgents.add(agent.name);
    switch (agent.role) {
      case 'Ceo':
        agent.addTool(messageTool);
        agent.addTool(this.#broadcastTool);
        agent.addTool(this.#hireTool);
        break;
      case 'Project Manager':
        agent.addTool(messageTool);
        agent.addTool(this.#createWorkItemTool);
        agent.addTool(this.#assignWorkItemTool);
        agent.addTool(this.#getWorkItemDetailTool);
        agent.addTool(this.#completeWorkItemTool);
        break;
      case 'Coder':
        agent.addTool(messageTool);
        agent.addTool(this.#completeWorkItemTool);
        agent.addTool(this.#assignWorkItemTool);
        agent.addTool(this.#getWorkItemDetailTool);
        break;
      case 'Tester':
        agent.addTool(messageTool);
        agent.addTool(this.#completeWorkItemTool);
        agent.addTool(this.#assignWorkItemTool);
        agent.addTool(this.#getWorkItemDetailTool);
        break;
      default:
        throw new Error(`Unknown role: ${agent.role}`);
        break;
    }
  }

}