// Aether Swarm Agent Worker

self.onmessage = function (event) {
  if (event.data.command === 'execute') {
    let code = event.data.code.trim();
    console.log('Received code:', code);

    // Step 1: Enumerate all existing global properties
    const beforeKeys = new Set(Object.getOwnPropertyNames(self));

    // Step 2: Execute the provided code
    let isClass = false;
    let className = '';
    const m = code.match(/class\s+(\w+)/);
    if (m) {
      isClass = true;
      className = m[1];
    }
    if (isClass) {
      code = code + `
        let result = [];
        let allProperties = Object.getOwnPropertyNames(${className}.prototype);
        for (const prop of allProperties) {
          result.push(${className}.prototype[prop].toString())
        }
        result;
`;
      console.log('Updated code:', code);
    }

    let result = null;
    try {
      result = eval(code);
      console.log('Evaluation result:', result);
    } catch (error) {
      // Send back an error message if evaluation fails
      self.postMessage({
        status: 'error',
        error: error.message
      });
      return;
    }

    // Step 3: Enumerate all global properties after execution
    const afterKeys = new Set(Object.getOwnPropertyNames(self));

    // Step 4: Find added and deleted keys
    const addedKeys = Array.from(afterKeys).filter(key => !beforeKeys.has(key));
    const deletedKeys = Array.from(beforeKeys).filter(key => !afterKeys.has(key));

    // Step 5: Respond with the changes
    const response = {
      status: 'success',
      added: addedKeys,
      deleted: deletedKeys
    };
    if (isClass) {
      response.className = className;
      response.members = result;
    }


    self.postMessage(response);
  }
};