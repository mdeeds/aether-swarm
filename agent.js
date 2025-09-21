// @ts-check

import { Directory } from './directory.js';

/** @typedef {import('./tool.js').Tool} Tool */

/**
 * @typedef {{
 *   role: 'user' | 'model';
 *   parts: { text: string }[];
 * } | { role: 'tool', parts: { functionResponse: { name: string, response: any }}[]}} ChatMessage
 */

export class Agent {
  /** @type {string | null} */
  #apiKey = null;
  /** @type {ChatMessage[]} */
  chatHistory = [];
  /** @type {HTMLElement} */
  #chatHistoryDiv;
  /** @type {string | null} */
  #staticSystemInstructions = null;
  /** @type {Map<string, Tool>} */
  #tools = new Map();
  /** @type {string} */
  name;
  /** @type {string} */
  role;


  /** 
   * @param {string} name 
   * @param {string} role
   * @param {string} systemInstructions
   * @param {HTMLElement} chatHistoryDiv
  */
  constructor(name, role, systemInstructions, chatHistoryDiv) {
    if (!name) {
      throw new Error('Name is required.');
    }
    if (!role) {
      throw new Error('Role is required.');
    }
    if (!systemInstructions) {
      throw new Error('System instructions are required.');
    }
    if (!chatHistoryDiv) {
      throw new Error('Chat history container is required.');
    }
    this.loadApiKey();
    this.name = name;
    this.role = role;
    this.#chatHistoryDiv = chatHistoryDiv;
    this.#staticSystemInstructions = systemInstructions;
  }

  /** @param {Tool} tool */
  addTool(tool) {
    this.#tools.set(tool.declaration.name, tool);
  }

  async loadApiKey() {
    try {
      const response = await fetch('api.key');
      if (!response.ok) {
        throw new Error(`Failed to fetch API key: ${response.statusText}`);
      }
      this.#apiKey = await response.text();
    } catch (error) {
      console.error('Error loading API key:', error);
      throw error;
    }
  }

  /**
   * Calls the Gemini API with the current chat history and tools.
   * @returns {Promise<any>} The JSON response from the API.
   */
  async #callGemini() {
    if (!this.#apiKey) {
      throw new Error('API key not loaded.');
    }
    if (!this.#staticSystemInstructions) {
      throw new Error('System instructions not set.');
    }

    // Documentation: https://aistudio.google.com/welcome
    // https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.#apiKey}`;

    const toolDeclarations = Array.from(this.#tools.values()).map(tool => tool.declaration);
    const fullSystemInstructions = `${this.#staticSystemInstructions}
    Company Directory:
    ${Directory.getListing()}
    `;

    const body = {
      contents: this.chatHistory,
      system_instruction: { parts: [{ text: fullSystemInstructions }] },
      tools: [{ function_declarations: toolDeclarations }],
    };

    let retries = 3;
    /** {Response | null } */
    let response = null;
    let delay = 3000;
    while (retries > 0) {
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        break; // Success
      } catch (error) {
        console.log(error);
        console.log(`Retrying in ${delay}ms...`);
        await this.#sleep(delay);
        delay *= 2;
        --retries;
      }
    }

    if (!response) {
      throw new Error('No response from Gemini API.');
    } else if (!response.ok) {
      throw new Error(`API call failed with status: ${response.statusText}`);
    }
    return response.json();
  }

  pushChatHistory(part) {
    this.chatHistory.push(part);
    const json = JSON.stringify(this.chatHistory, null, 2);
    const jsonWithNewlines = json.replace(/\\n/g, '\n');
    this.#chatHistoryDiv.innerText = jsonWithNewlines;
  }

  /**
   * @param {number} ms
   * @returns {Promise<void>}
   */
  #sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * Sends a message to the Gemini API and updates the chat history.
   * @param {string} message The message to send.
   * @returns {Promise<string>} The text response from Gemini.
   */
  async postMessage(message) {
    if (!this.#apiKey) {
      throw new Error('API key not loaded.');
    }

    // TODO: If we have a pending `post`, we really should wait until we finish handling that one
    // and add its response to the chat history before we process a new one.

    this.chatHistory.push({ role: 'user', parts: [{ text: message }] });

    let data;
    let retries = 3;
    while (retries > 0) {
      try {
        data = await this.#callGemini();
        break; // Success
      } catch (error) {
        if (error instanceof Response && error.status === 429) {
          const errorBody = await error.json();
          const retryInfo = errorBody.error?.details?.find(d => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
          const delayString = retryInfo?.retryDelay;
          if (delayString) {
            const delaySeconds = parseFloat(delayString.replace('s', ''));
            console.warn(`Rate limit exceeded. Retrying in ${delaySeconds} seconds...`);
            await this.#sleep(delaySeconds * 1000);
            retries--;
            continue;
          }
        }
        // For other errors or if retry info is not present, rethrow.
        throw error;
      }
    }

    let modelResponse = data.candidates[0].content;
    this.pushChatHistory(modelResponse);

    // Handle function calls if the model requests them
    while (modelResponse.parts.some(part => 'functionCall' in part)) {
      const functionCallPart = modelResponse.parts.find(part => 'functionCall' in part);
      if (!functionCallPart || !functionCallPart.functionCall) continue;

      const { name, args } = functionCallPart.functionCall;
      const tool = this.#tools.get(name);
      if (!tool) {
        console.error(`${this.name}, ${this.role} is attempting to use tool '${name}', but this is not permitted.`);
        this.pushChatHistory({
          role: 'tool',
          parts: [{
            functionResponse: {
              name, response: {
                content:
                  `Error: Tool '${name}' not available.`
              }
            }
          }]
        });
        // Call Gemini again with the tool's response
        data = await this.#callGemini();
        modelResponse = data.candidates[0].content;
        this.pushChatHistory(modelResponse);
      } else {
        const toolResult = await tool.run(args);
        this.pushChatHistory({
          role: 'tool',
          parts: [{ functionResponse: { name, response: { content: toolResult } } }]
        });

        // Call Gemini again with the tool's response
        data = await this.#callGemini();
        modelResponse = data.candidates[0].content;
        this.pushChatHistory(modelResponse);
      }
    }

    // Return the final text response
    const finalResponsePart = modelResponse.parts.find(part => 'text' in part);
    return finalResponsePart?.text ?? "No text response received.";
  }
}