
let nextId = 1000;

export class WorkItem {
  /** @type {number} */
  id;
  /** @type {string} */
  title;
  /** @type {string} */
  description;
  /** @type {'unassigned' | 'pending' | 'completed'} */
  status = 'unassigned';
  /** @type {string | null} */
  assignee = null;
  /** @type {string[]} */
  comments = [];
}


export class WorkQueue {
  static #queue = [];

  static create(item) {
    if (!item.title) {
      throw new Error('Item must have a title.');
    }
    if (!item.description) {
      throw new Error('Item must have a description.');
    }
    if (item.id) {
      throw new Error('Item must not have an id.');
    }

    if (!item.status) { item.status = 'unassigned'; }
    switch (item.status) {
      case 'unassigned':
        if (item.assignee) throw new Error('Unassigned items must not have an assignee.');
        break;
      case 'pending':
        if (!item.assignee) throw new Error('Pending items must have an assignee.');
        break;
      case 'completed':
        throw new Error('You cannot create a completed item.');
      default:
        throw new Error(`Unknown status: ${item.status}`);
    }

    item.id = nextId++;
    this.#queue.push(item);
    return item;
  }

  static assign(id, assignee) {
    const item = this.#queue.find(item => item.id === id);
    item.assignee = assignee;
    item.status = 'pending';
  }

  static complete(id) {
    const item = this.#queue.find(item => item.id === id);
    item.status = 'completed';
  }


  static listByStatus(status) {
    return this.#queue.filter(item => item.status === status);
  }

  static getDetail(id) {
    return this.#queue.find(item => item.id === id);
  }

}