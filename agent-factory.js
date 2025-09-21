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
   * @param {string} role
   * @param {string} hat
   * @returns {Promise<Agent>}
   */
  static async createAgent(role, hat) {
    if (!this.#toolsMd) {
      this.#toolsMd = await (await fetch('tools.md')).text();
    }

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

    const agent = new Agent(name, role, systemInstructions);
    ToolFactory.addToolsToNewAgent(agent);
    Directory.addAgent(agent);

    return agent;
  }
}