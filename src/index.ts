#!/usr/bin/env bun
import { Command } from "commander";
import { DataStore } from "./store";
import { ReputationEngine } from "./reputation";
import { AgentReputation } from "./types";

const store = new DataStore();
const engine = new ReputationEngine();

const program = new Command();

program
  .name("agent-reputation-oracle")
  .description("Decentralized reputation tracking for agents")
  .version("1.0.0");

program
  .command("register")
  .description("Register a new agent")
  .argument("<name>", "Name of the agent")
  .action((name) => {
    const id = `agent_${Math.random().toString(36).substring(2, 9)}`;
    const newAgent: AgentReputation = {
      id,
      name,
      score: 0.5,
      totalTasks: 0,
      successfulTasks: 0,
      reviews: [],
      metadata: {},
      lastUpdated: new Date().toISOString(),
    };
    store.upsertAgent(newAgent);
    console.log(`✅ Registered agent: ${name} (ID: ${id})`);
  });

program
  .command("record-task")
  .description("Record a task performance")
  .requiredOption("-a, --agent <id>", "Agent ID")
  .requiredOption("-s, --status <status>", "success or failure")
  .option("-q, --quality <n>", "Quality score (0-1)", "1.0")
  .option("-d, --duration <ms>", "Duration in ms", "100")
  .action((opts) => {
    const agent = store.getAgent(opts.agent);
    if (!agent) {
      console.error(`❌ Agent not found: ${opts.agent}`);
      return;
    }

    const task = engine.createTaskRecord(
      opts.agent,
      opts.status as "success" | "failure",
      parseFloat(opts.quality),
      parseInt(opts.duration)
    );

    store.addTask(task);

    // Update agent stats
    agent.totalTasks += 1;
    if (task.status === "success") agent.successfulTasks += 1;
    
    // Recalculate reputation
    const agentTasks = store.getTasks().filter(t => t.agentId === agent.id);
    agent.score = engine.calculateScore(agent, agentTasks);
    agent.lastUpdated = new Date().toISOString();

    store.upsertAgent(agent);
    console.log(`📊 Recorded task for ${agent.name}. New Score: ${agent.score}`);
  });

program
  .command("review")
  .description("Submit a peer review")
  .requiredOption("-a, --agent <id>", "Agent ID being reviewed")
  .requiredOption("-r, --reviewer <id>", "Reviewer Agent ID")
  .requiredOption("-g, --rating <n>", "Rating (1-5)")
  .option("-m, --message <text>", "Review comment", "")
  .action((opts) => {
    const agent = store.getAgent(opts.agent);
    if (!agent) {
      console.error(`❌ Agent not found: ${opts.agent}`);
      return;
    }

    const review = engine.createPeerReview(
      opts.reviewer,
      parseInt(opts.rating),
      opts.message
    );

    agent.reviews.push(review);
    
    // Recalculate reputation
    const agentTasks = store.getTasks().filter(t => t.agentId === agent.id);
    agent.score = engine.calculateScore(agent, agentTasks);
    agent.lastUpdated = new Date().toISOString();

    store.upsertAgent(agent);
    console.log(`⭐ Added review for ${agent.name}. New Score: ${agent.score}`);
  });

program
  .command("list")
  .description("List all agents and their reputation")
  .action(() => {
    const agents = store.getAgents();
    if (agents.length === 0) {
      console.log("No agents registered.");
      return;
    }

    console.log("\n--- Agent Reputation Ledger ---");
    agents.sort((a, b) => b.score - a.score).forEach(a => {
      console.log(`${a.score.toFixed(4)} | ${a.name.padEnd(20)} | ${a.id} | Tasks: ${a.successfulTasks}/${a.totalTasks}`);
    });
    console.log("--------------------------------\n");
  });

program
  .command("info")
  .description("Get detailed info for an agent")
  .argument("<id>", "Agent ID")
  .action((id) => {
    const agent = store.getAgent(id);
    if (!agent) {
      console.error(`❌ Agent not found: ${id}`);
      return;
    }

    console.log(JSON.stringify(agent, null, 2));
  });

program.parse(process.argv);
