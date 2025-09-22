// @ts-check

/** @typedef {import('./agent.js').Agent} Agent */

export class Directory {
  /** @type {Agent[]} */
  static #agents = [];
  /** @type {Map<string, Agent>} */
  static #agentMap = new Map();
  /** @type {HTMLElement | null} */
  static #employeeListDiv = null;

  /**
   * Sets the HTMLElement to be used for displaying the employee list.
   * @param {HTMLElement} element The div element for the employee list.
   */
  static setEmployeeListContainer(element) {
    this.#employeeListDiv = element;
    this.updateEmployeeListUI();
  }

  /**
   * Adds an agent to the directory.
   * @param {Agent} agent The agent to add.
   */
  static addAgent(agent) {
    this.#agents.push(agent);
    this.#agentMap.set(agent.name, agent);
    this.updateEmployeeListUI();
  }

  /**
   * 
   * @param {string} name 
   * @returns {Agent}
   */
  static getAgent(name) {
    const agent = this.#agentMap.get(name);
    if (!agent) {
      throw new Error(`No agent named ${name}.`);
    }
    return agent;
  }

  /**
   * Updates the employee list UI.
   */
  static updateEmployeeListUI() {
    if (!this.#employeeListDiv) return;

    this.#employeeListDiv.innerHTML = ''; // Clear existing chits
    for (const agent of this.#agents) {
      const chit = document.createElement('div');
      chit.className = 'employee-chit';
      chit.dataset.agentName = agent.name;
      chit.textContent = `${agent.name} (${agent.role})`;
      this.#employeeListDiv.appendChild(chit);
    };
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