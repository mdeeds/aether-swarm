# Aether Swarm

Aether Swarm is a project designed to explore and implement **collaborative multi-agent systems**. It models a software development team where specialized AI agents, powered by the Gemini API, work together to complete complex tasks. The project's core principle is a decentralized architecture where agents have **disjoint sets of tools** and operate within isolated, verifiable environments. 

---

## Core Concepts

### 1. The Silo: The JS Worker

The core of the system is the use of JavaScript Web Workers as isolated environments for code execution. These workers act as secure, isolated sandboxes, or "silos." The main application can inspect a worker's global scope before and after code execution to determine precisely what was added or removed. This allows an agent's work to be objectively verified, preventing unwanted side effects. Agents are provided with tools that can create, manage, and interact with these workers to perform their tasks.

### 2. Disjoint Tools for Specialized Roles

Aether Swarm's agents are not general-purpose. They are given a specific role and a limited set of tools to perform their function. This design choice prevents agents from overstepping their authority and enforces a clean separation of concerns.

* **The Orchestrator:** This agent manages the project workflow. Its tools are limited to communication (`chat`, `broadcast`) and task management (`request report`). It cannot directly write or execute code.
* **The Coder Agent:** This agent's purpose is to create and modify code. Its tools include file system access (`list files`, `set file contents`).
* **The Tester Agent:** This agent's role is to verify the code's functionality. It has access to execution tools (`new instance`, `eval`) but cannot modify the source code files.

---

### 3. The Management Hierarchy & Agent Reporting Chains

Aether Swarm's project management is inspired by **Edward de Bono's Six Thinking Hats** model. Instead of a single manager, the system uses a hierarchy of specialized "manager" agents, each with a specific perspective. This ensures that every problem is analyzed from multiple angles.

The agents operate within a **reporting chain**. The Orchestrator agent, which acts as the "Blue Hat," is at the top of the chain. It delegates tasks to the Coder and Tester agents. The Tester, in turn, reports its findings back up the chain to the Orchestrator. This structured communication flow ensures that progress is transparent and verifiable at every stage of the project.

For example, when a Coder agent claims a task is complete, the Orchestrator doesn't just take its word for it. It delegates a sub-task to the Tester agent to run the code and provide a verifiable report, creating a chain of accountability.

---
