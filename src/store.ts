import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { AgentReputation, TaskRecord } from "./types";

export class DataStore {
  private baseDir: string;
  private agentsFile: string;
  private tasksFile: string;

  constructor(baseDir: string = "data") {
    this.baseDir = join(process.cwd(), baseDir);
    this.agentsFile = join(this.baseDir, "agents.json");
    this.tasksFile = join(this.baseDir, "tasks.json");
    this.init();
  }

  private init() {
    if (!existsSync(this.baseDir)) {
      mkdirSync(this.baseDir, { recursive: true });
    }
    if (!existsSync(this.agentsFile)) {
      writeFileSync(this.agentsFile, JSON.stringify([], null, 2));
    }
    if (!existsSync(this.tasksFile)) {
      writeFileSync(this.tasksFile, JSON.stringify([], null, 2));
    }
  }

  public getAgents(): AgentReputation[] {
    const data = readFileSync(this.agentsFile, "utf-8");
    return JSON.parse(data);
  }

  public saveAgents(agents: AgentReputation[]) {
    writeFileSync(this.agentsFile, JSON.stringify(agents, null, 2));
  }

  public getTasks(): TaskRecord[] {
    const data = readFileSync(this.tasksFile, "utf-8");
    return JSON.parse(data);
  }

  public saveTasks(tasks: TaskRecord[]) {
    writeFileSync(this.tasksFile, JSON.stringify(tasks, null, 2));
  }

  public getAgent(id: string): AgentReputation | undefined {
    return this.getAgents().find((a) => a.id === id);
  }

  public upsertAgent(agent: AgentReputation) {
    const agents = this.getAgents();
    const index = agents.findIndex((a) => a.id === agent.id);
    if (index >= 0) {
      agents[index] = agent;
    } else {
      agents.push(agent);
    }
    this.saveAgents(agents);
  }

  public addTask(task: TaskRecord) {
    const tasks = this.getTasks();
    tasks.push(task);
    this.saveTasks(tasks);
  }
}
