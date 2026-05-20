import { expect, test, describe, beforeEach } from "bun:test";
import { ReputationEngine } from "../src/reputation";
import { DataStore } from "../src/store";
import { AgentReputation, TaskRecord } from "../src/types";
import { rmSync, existsSync } from "node:fs";

describe("ReputationEngine", () => {
  const engine = new ReputationEngine();

  test("calculateScore should return baseline with penalty for new agent", () => {
    const agent: AgentReputation = {
      id: "test",
      name: "Test",
      score: 0,
      totalTasks: 0,
      successfulTasks: 0,
      reviews: [],
      metadata: {},
      lastUpdated: ""
    };
    const score = engine.calculateScore(agent, []);
    // Baseline is 0.5, with 0 reviews penalty is 0.8x -> 0.4
    expect(score).toBe(0.4);
  });

  test("calculateScore should increase with success", () => {
    const agent: AgentReputation = {
      id: "test",
      name: "Test",
      score: 0.5,
      totalTasks: 1,
      successfulTasks: 1,
      reviews: [],
      metadata: {},
      lastUpdated: ""
    };
    const task: TaskRecord = {
      id: "1",
      agentId: "test",
      status: "success",
      quality: 1.0,
      duration: 100,
      timestamp: new Date().toISOString()
    };
    const score = engine.calculateScore(agent, [task]);
    expect(score).toBeGreaterThan(0.4); // Success should be better than 0.4
  });

  test("calculateScore should decrease with failure", () => {
    const agent: AgentReputation = {
      id: "test",
      name: "Test",
      score: 0.5,
      totalTasks: 1,
      successfulTasks: 0,
      reviews: [],
      metadata: {},
      lastUpdated: ""
    };
    const task: TaskRecord = {
      id: "1",
      agentId: "test",
      status: "failure",
      quality: 0,
      duration: 100,
      timestamp: new Date().toISOString()
    };
    const score = engine.calculateScore(agent, [task]);
    expect(score).toBeLessThan(0.4);
  });
});

describe("DataStore", () => {
  const testDir = "test-data";
  
  beforeEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true });
    }
  });

  test("DataStore should initialize files", () => {
    const store = new DataStore(testDir);
    expect(existsSync(testDir)).toBe(true);
    expect(store.getAgents()).toEqual([]);
  });

  test("upsertAgent and getAgent should work", () => {
    const store = new DataStore(testDir);
    const agent: AgentReputation = {
      id: "a1",
      name: "Agent 1",
      score: 0.8,
      totalTasks: 0,
      successfulTasks: 0,
      reviews: [],
      metadata: {},
      lastUpdated: new Date().toISOString()
    };
    store.upsertAgent(agent);
    expect(store.getAgent("a1")?.name).toBe("Agent 1");
  });
});
