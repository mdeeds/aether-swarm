// @ts-check

/** @typedef {import('./agent.js').Agent} Agent */

export class Directory {
  /** @type {Agent[]} */
  static #agents = [];

  /**
   * Adds an agent to the directory.
   * @param {Agent} agent The agent to add.
   */
  static addAgent(agent) {
    this.#agents.push(agent);
  }

  /**
   * Returns a string listing of all agents in the directory, with their name and role.
   * The listing is ordered by the time of agent creation.
   * @returns {string}
   */
  static getListing() {
    return this.#agents
      .map(agent => `${agent.name}: ${agent.role}`)
      .join('\n');
  }
}