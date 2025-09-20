// @ts-check

function initialize() {
  const submitButton = document.getElementById('submit-button');
  const codeInput =
    /** @type {HTMLInputElement} */ (document.getElementById('code-input'));
  if (!submitButton || !codeInput) {
    throw new Error('Element not found');
  }

  submitButton.addEventListener('click', () => {
    const worker = new Worker('worker.js');
    const code = codeInput.value;

    worker.postMessage({
      command: 'execute',
      code: code
    });

    worker.onmessage = function (event) {
      console.log('Received from worker:', event.data);
    };
  });
}

window.addEventListener('DOMContentLoaded', initialize);
