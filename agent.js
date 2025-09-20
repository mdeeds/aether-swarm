// @ts-check

/**
 * @typedef {{
 *   role: 'user' | 'model';
 *   parts: { text: string }[];
 * }} ChatMessage
 */

export class Agent {
  /** @type {string | null} */
  #apiKey = null;
  /** @type {ChatMessage[]} */
  chatHistory = [];

  constructor() {
    this.loadApiKey();
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
   * Sends a message to the Gemini API and updates the chat history.
   * @param {string} message The message to send.
   * @returns {Promise<string>} The text response from Gemini.
   */
  async postMessage(message) {
    if (!this.#apiKey) {
      throw new Error('API key not loaded.');
    }

    this.chatHistory.push({ role: 'user', parts: [{ text: message }] });

    // Documentation: https://aistudio.google.com/welcome
    // https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.#apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: this.chatHistory }),
    });

    const data = await response.json();
    const modelResponse = data.candidates[0].content;
    const responseText = modelResponse.parts[0].text;

    this.chatHistory.push(modelResponse);
    return responseText;
  }
}