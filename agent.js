// @ts-check
import { MessageTool } from './message-tool.js';
/** @typedef {import('./tool.js').Tool} ITool */

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
  /** @type {string | null} */
  #systemInstructions = null;
  /** @type {Map<string, ITool>} */
  tools;

  /** @param {string} [systemInstructions] */
  constructor(systemInstructions) {
    if (!systemInstructions) {
      throw new Error('System instructions are required.');
    }
    this.loadApiKey();
    this.tools = new Map();
    this.#systemInstructions = systemInstructions;
  }

  /** @param {ITool} tool */
  addTool(tool) {
    this.tools.set(tool.declaration.name, tool);
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
    if (!this.#systemInstructions) {
      throw new Error('System instructions not set.');
    }

    // Documentation: https://aistudio.google.com/welcome
    // https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.#apiKey}`;

    const toolDeclarations = Array.from(this.tools.values()).map(tool => tool.declaration);
    const body = {
      contents: this.chatHistory,
      system_instruction: { parts: [{ text: this.#systemInstructions }] },
      tools: [{ function_declarations: toolDeclarations }],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.statusText}`);
    }
    return response.json();
  }

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

    let data = await this.#callGemini();

    let modelResponse = data.candidates[0].content;
    this.chatHistory.push(modelResponse);

    // Handle function calls if the model requests them
    while (modelResponse.parts.some(part => 'functionCall' in part)) {
      const functionCallPart = modelResponse.parts.find(part => 'functionCall' in part);
      if (!functionCallPart || !functionCallPart.functionCall) continue;

      const { name, args } = functionCallPart.functionCall;
      const tool = this.tools.get(name);
      if (tool) {
        const toolResult = await tool.run(args);
        this.chatHistory.push({
          role: 'tool',
          parts: [{ functionResponse: { name, response: { content: toolResult } } }]
        });

        // Call Gemini again with the tool's response
        data = await this.#callGemini();
        modelResponse = data.candidates[0].content;
        this.chatHistory.push(modelResponse);
      }
    }

    // Return the final text response
    const finalResponsePart = modelResponse.parts.find(part => 'text' in part);
    return finalResponsePart?.text ?? "No text response received.";
  }
}