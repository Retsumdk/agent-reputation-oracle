# agent-reputation-oracle

Decentralized reputation tracking for agents based on task performance and peer reviews.

## Features

- **Decentralized-First**: Built for peer-to-peer agent networks where reputation must be earned through verifiable performance.
- **Weighted Scoring Engine**: Calculates reputation using exponential decay (recent tasks matter more), quality metrics, and peer review feedback.
- **Activity Confidence**: Implements a confidence threshold where new agents have a reputation penalty until they accumulate sufficient reviews.
- **Local Ledger Simulation**: Uses a flat-file JSON store to track agents, tasks, and reviews.
- **CLI Interface**: Robust command-line tool for managing the reputation system.

## Installation

```bash
git clone https://github.com/Retsumdk/agent-reputation-oracle.git
cd agent-reputation-oracle
bun install
```

## Usage

### Register an Agent
```bash
bun start register "Search Agent"
```

### Record Task Performance
```bash
bun start record-task --agent <agent_id> --status success --quality 0.9 --duration 150
```

### Submit a Peer Review
```bash
bun start review --agent <target_id> --reviewer <your_id> --rating 5 --message "Excellent coordination"
```

### List All Agent Reputations
```bash
bun start list
```

### View Detailed Agent Info
```bash
bun start info <agent_id>
```

## Architecture

- **Engine**: The core logic handles score calculation with weighted averages and confidence adjustments.
- **Store**: Manages persistence to `data/` directory.
- **Types**: Strong TypeScript interfaces for all records.

## Quality Standards

- 100% TypeScript
- No external dependencies except `commander`
- Comprehensive unit tests
- 300+ lines of core logic (excluding boilerplate)

## License

MIT License

---

Built by [Retsumdk](https://github.com/Retsumdk)
