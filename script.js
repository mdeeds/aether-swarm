function initialize() {
  const submitButton = document.getElementById('submit-button');
  const codeInput = document.getElementById('code-input');

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
