// @ts-check

import { Directory } from './directory.js';
import { WorkQueue } from './work-queue.js'

/**
 * @typedef {import('./tool.js').Tool} ITool
 */

/**
 * @implements {ITool}
 */
export class CreateWorkItemTool {
  /** @type {import('./tool.js').FunctionDeclaration} */
  declaration = {
    name: 'createWorkItem',
    description: "Creates a new, unassigned work item, and returns the item with its ID number.",
    parameters: {
      type: 'OBJECT',
      properties: {
        title: {
          type: 'STRING',
          description: 'A one line summary (title) of the work item.'
        },
        description: {
          type: 'STRING',
          description: 'A description of the work item with enough information to implement and verify it.'
        },
      },
      required: ['title', 'description']
    }
  }

  /**
 * Executes the message tool, sending a message to a specified agent.
 * @param {{ title: string; description: string}} args The arguments for the tool call.
 * @returns {Promise<string>} The response from the called agent.
 */
  async run({ title, description }) {
    try {
      return JSON.stringify(WorkQueue.create({ title, description }));
    } catch (error) {
      return error.message;
    }
  }
}

/**
 * @implements {ITool}
 */
export class AssignWorkItemTool {
  /** @type {import('./tool.js').FunctionDeclaration} */
  declaration = {
    name: 'assignWorkItem',
    description: `Assigns the work item to a specific agent.  The agent will recieve a message letting them know the work item has been assigned to them.`,
    parameters: {
      type: 'OBJECT',
      properties: {
        id: {
          type: 'NUMBER',
          description: 'The id number for the work item to assign.'
        },
        assignee: {
          type: 'STRING',
          description: 'The name of the agent to assign the work item to.'
        },
      },
      required: ['id', 'assignee']
    }
  }

  /**
 * Executes the message tool, sending a message to a specified agent.
 * @param {{ id: string; assignee: string}} args The arguments for the tool call.
 * @returns {Promise<string>} The response from the called agent.
 */
  async run({ id, assignee }) {
    try {
      WorkQueue.assign(id, assignee);
      Directory.getAgent(assignee).postMessage(
        `You have been assigned work item ${id}: ${WorkQueue.getDetail(id).title}.}`);
      return `Assigned work item ${id} to ${assignee}.`;
    } catch (error) {
      return error.message;
    }
  }
}


/**
 * @implements {ITool}
 */
export class GetWorkItemDetailTool {
  /** @type {import('./tool.js').FunctionDeclaration} */
  declaration = {
    name: 'getWorkItemDetail',
    description: 'Returns the complete title, description, and comment history (if available) of a work item.',
    parameters: {
      type: 'OBJECT',
      properties: {
        id: {
          type: 'NUMBER',
          description: 'The id number for the work item to return.'
        },
      },
      required: ['id']
    }
  }

  /**
 * Executes the message tool, sending a message to a specified agent.
 * @param {{ id: string}} args The arguments for the tool call.
 * @returns {Promise<string>} The response from the called agent.
 */
  async run({ id }) {
    try {
      const item = WorkQueue.getDetail(id);
      return JSON.stringify(item);
    } catch (error) {
      return error.message;
    }
  }
}

/**
 * @implements {ITool}
 */
export class CompleteWorkItemTool {
  /** @type {import('./tool.js').FunctionDeclaration} */
  declaration = {
    name: 'completeWorkItem',
    description: 'Marks a work item as complete.',
    parameters: {
      type: 'OBJECT',
      properties: {
        id: {
          type: 'NUMBER',
          description: 'The id number for the work item to return.'
        },
      },
      required: ['id']
    }
  }

  /**
 * Executes the message tool, sending a message to a specified agent.
 * @param {{ id: string;}} args The arguments for the tool call.
 * @returns {Promise<string>} The response from the called agent.
 */
  async run({ id }) {
    try {
      WorkQueue.complete(id);
      return `Completed work item ${id}.`;
    } catch (error) {
      return error.message;
    }
  }
}
