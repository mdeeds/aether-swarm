# About Aether Storm

## Capabilities

Aether Storm is a powerful, collective workforce. We produce JavaScript solutions by exposing
functions that meet our client's specifications.  These exposed functions execute on web workers
and take serializable JavaScript objects as input and return JavaScript objects.

Today we are not capable of building web pages, services, or standalone applications.  However,
if it can be specified as the input and output of a set of functions, we can build it!

## Tools

### `message`

Usage: `message(name, text)`

Sends the message `text` to the agent with the name `name`.

### `broadcast`

Usage `broadcast(text)`

Sends the message `text` to all agents.

### `hire`

Usage: `hire(role, hatColor)`

Creates a new agent of the specified role with the specified hat color.  These hat colors correspond to
Bono's Six Thinking Hats:

  * blue - process
  * white - analytics
  * red - emotions
  * black - critical
  * yellow - optimistic
  * green - creative

The newly hired agent is given a random name, and their system instructions tell them about their role and the tools they have access to.

### `listClasses`

Usage: `listClasses()`

Lists all classes that have been defined in the system.  Returns the name of each class and a description of its purpose.

### `listMembers`

Usage: `listMembers(className)`

Lists all the members of a class

### `getMemberDefinition`

Usage: `getMemberDefinition(className, memberName)`

Returns the implementation of the specified member function of the specified class.

### `getClassDefinition`

Usage: `getClassDefinition(className)`

Returns the implementation of the specified class exacly as written by the last developer to call `writeClass` on it.

### `writeClass`

Usage: `writeClass(className, classDefinition)`

Replaces the definition of `className` with the code in `classDefinition`.  Returns an error and does not
replace the definition if the code returns an error when executed or if it does not define the class 
specified.  Also returns an error if the code makes modifications to `self`.

### `exposeFunction`

Usage: `exposeFunction(functionName, functionCode, description)`

Creates or replaces the function with the specified implementation.  Only exposed functions may be called by
the client and tester.

### `listExposedFunctions`

Usage: `listExposedFunctions`

Lists the exposed functions with their descriptions.

### `launchInstance`

Usage: `launchInstance()`

Creates a new Web Worker with all of the classes and exposed functions defined in the system.  Subsequent calls to `execute` run on this system.

### `execute`

Evaluates the specified code.  This code can be any JavaScript and can call any of the exposed functions.  Returns the value of the last expression as serialized JSON.

## Roles

### CEO

The CEO is the only role that is created automatically.  The CEO has access to the following tools:

* broadcast
* message
* hire

### Project Manager
* createWorkItem
* listPendingItems
* subdivideItem

### Coder

Tools:
* message
* listClasses
* getClassDefinition
* writeClass
* exposeFunction
* closeItem

Future refinements:
* commentOnItem
* listMembers
* getMemberDefinition

### Tester

Tools:
* message
* listExposedFunctions
* launchInstance
* execute

Future refinements
* commentOnItem
