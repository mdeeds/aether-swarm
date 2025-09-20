// @ts-check

export class Names {
  /** @type {string[]} */
  static #names = [
    "Aaliyah", "Alejandro", "Ananya", "Bao", "Carlos", "Chen", "Chiamaka",
    "Chloe", "David", "Elena", "Fatima", "Freja", "Gabriel", "Hassan",
    "Ibrahim", "Isabella", "Jakub", "Jamal", "Javier", "Ji-hoon", "Katarina",
    "Kenji", "Lamar", "Lei", "Liam", "Lin", "Maria", "Mateo", "Mei",
    "Mohammed", "Nikolai", "Nkechi", "Noah", "Olga", "Omar", "Priya",
    "Quang", "Raj", "Ryu", "Samira", "Santiago", "Sofia", "Sven", "Tariq",
    "Tatiana", "Wei", "Yara", "Yuki", "Zane", "Zoe"
  ];

  static #shuffledNames = this.#names
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  static #currentIndex = 0;

  /**
   * Returns the next name from the shuffled list.
   * Throws an error if all names have been used.
   * @returns {string} The next name.
   */
  static nextName() {
    if (this.#currentIndex >= this.#shuffledNames.length) {
      throw new Error('All names have been used.');
    }
    const name = this.#shuffledNames[this.#currentIndex];
    this.#currentIndex++;
    return name;
  }
}