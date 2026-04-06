// Green tech journey data — skills, learning path, projects
// Replaces the university-path model as Vanyo transitions into green tech

export type Skill = {
  id: string;
  name: string;
  value: number; // 0–100
};

export type LearningNode = {
  id: string;
  label: string;
  sublabel?: string;
  status: "done" | "current" | "future";
};

export type Project = {
  id: string;
  name: string;
  status: "active" | "complete" | "paused";
  tags: string[];
  description: string;
  lastUpdated?: string;
};

// Default values — overridden at runtime by API / localStorage
export const defaultSkills: Skill[] = [
  { id: "renewable-energy", name: "Renewable Energy Fundamentals", value: 45 },
  { id: "climate-data", name: "Climate Data Analysis", value: 35 },
  { id: "solar-wind", name: "Solar & Wind Systems", value: 25 },
  { id: "carbon-accounting", name: "Carbon Accounting", value: 20 },
  { id: "systems-thinking", name: "Systems Thinking", value: 70 },
  { id: "python-env", name: "Python for Environmental Modeling", value: 60 },
];

export const learningPath: LearningNode[] = [
  { id: "foundations", label: "Foundations", sublabel: "Climate basics", status: "done" },
  { id: "energy-systems", label: "Energy Systems", sublabel: "Solar, wind, grid", status: "done" },
  { id: "climate-data", label: "Climate Data", sublabel: "Python + modeling", status: "current" },
  { id: "green-infra", label: "Green Infra", sublabel: "IoT + systems", status: "future" },
  { id: "contribution", label: "First Contribution", sublabel: "Open source / real work", status: "future" },
];

export const projects: Project[] = [
  {
    id: "grid-leaf",
    name: "Grid-Leaf",
    status: "active",
    tags: ["solar", "data", "iot"],
    description:
      "Real-time visualization of microgrid performance for rural communities using low-power IoT sensors.",
    lastUpdated: "2026-04-01",
  },
  {
    id: "carbon-trace",
    name: "CarbonTrace",
    status: "active",
    tags: ["carbon", "open source"],
    description:
      "Personal carbon footprint tracker with lifestyle optimization suggestions powered by daily activity data.",
    lastUpdated: "2026-03-28",
  },
  {
    id: "moss-net",
    name: "MossNet",
    status: "paused",
    tags: ["sensors", "ecology"],
    description:
      "Distributed humidity sensors for urban rewilding tracking, disguised as decorative moss patches.",
    lastUpdated: "2026-02-14",
  },
];
