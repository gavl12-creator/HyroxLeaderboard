import type { Athlete, StationKey, StationSplit } from "./types";

export const stationDefinitions: Array<{ key: StationKey; label: string; baseSeconds: number }> = [
  { key: "run1", label: "Run 1", baseSeconds: 292 },
  { key: "ski", label: "1k SkiErg", baseSeconds: 245 },
  { key: "run2", label: "Run 2", baseSeconds: 305 },
  { key: "sledPush", label: "Sled Push", baseSeconds: 214 },
  { key: "run3", label: "Run 3", baseSeconds: 318 },
  { key: "sledPull", label: "Sled Pull", baseSeconds: 226 },
  { key: "run4", label: "Run 4", baseSeconds: 326 },
  { key: "burpees", label: "Burpee Broad Jumps", baseSeconds: 305 },
  { key: "run5", label: "Run 5", baseSeconds: 334 },
  { key: "row", label: "1k Row", baseSeconds: 252 },
  { key: "run6", label: "Run 6", baseSeconds: 343 },
  { key: "farmersCarry", label: "Farmers Carry", baseSeconds: 176 },
  { key: "run7", label: "Run 7", baseSeconds: 352 },
  { key: "lunges", label: "Sandbag Lunges", baseSeconds: 286 },
  { key: "run8", label: "Run 8", baseSeconds: 348 },
  { key: "wallBalls", label: "Wall Balls", baseSeconds: 332 },
];

const firstNames = [
  "Ava", "Noah", "Mia", "Leo", "Grace", "Oscar", "Freya", "Ethan", "Ruby", "Theo",
  "Sofia", "Lucas", "Ella", "Max", "Isla", "Finn", "Amelia", "Jack", "Chloe", "Mason",
  "Lily", "Harry", "Nora", "Adam", "Evie", "Ben", "Zara", "Sam", "Maisie", "Josh",
  "Hannah", "Ryan", "Ivy", "Caleb", "Poppy", "Owen", "Florence", "Alex", "Emma", "Dylan",
  "Olivia", "Jude", "Millie", "Kai", "Alice", "Tom", "Harper", "Rory", "Lola", "Nathan",
];

const lastNames = [
  "Morgan", "Reid", "Carter", "Hughes", "Patel", "Walker", "Morris", "Bennett", "Turner", "Collins",
  "Foster", "Price", "Hayes", "Cooper", "Ward", "Brooks", "Bailey", "Parker", "Russell", "Kelly",
  "Wright", "Gray", "Murray", "Powell", "Knight", "Webb", "Fisher", "Stone", "Dixon", "Wells",
  "Grant", "Palmer", "Fox", "Harrison", "Gibson", "Cole", "Hudson", "West", "Porter", "Shaw",
  "Hunter", "Mills", "Rose", "Wood", "Barnes", "Lane", "Marsh", "Atkinson", "Lawson", "Hardy",
];

const ageGroups = ["18-24", "25-29", "30-34", "35-39", "40-44", "45-49"];
const divisions: Athlete["division"][] = ["Open", "Open", "Open", "Pro", "Doubles"];
const gyms = ["Foundry Performance", "North Dock Fitness", "Engine Room", "Rep Yard", "Metro Endurance"];
const stationBias: StationKey[] = ["ski", "sledPush", "sledPull", "burpees", "row", "farmersCarry", "lunges", "wallBalls"];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function wave(index: number, stationIndex: number) {
  return Math.sin(index * 1.71 + stationIndex * 0.83) + Math.cos(index * 0.49 - stationIndex * 1.17);
}

function buildSplits(index: number): StationSplit[] {
  const fitnessFactor = 0.86 + (index % 10) * 0.023 + Math.floor(index / 10) * 0.014;
  const strengthEdge = stationBias[index % stationBias.length];
  const weakness = stationBias[(index * 3 + 5) % stationBias.length];
  const fade = index % 4 === 0 ? 1.045 : index % 7 === 0 ? 1.065 : 1.0;

  return stationDefinitions.map((station, stationIndex) => {
    const isRun = station.key.startsWith("run");
    const lateRace = stationIndex > 10 ? fade : 1;
    const runDiscipline = isRun ? 0.97 + (index % 6) * 0.012 : 1;
    const stationModifier = station.key === strengthEdge ? 0.88 : station.key === weakness ? 1.14 : 1;
    const noise = 1 + wave(index, stationIndex) * 0.035;
    const seconds = Math.round(station.baseSeconds * fitnessFactor * runDiscipline * stationModifier * lateRace * noise);

    return {
      key: station.key,
      label: station.label,
      seconds,
    };
  });
}

export const athletes: Athlete[] = Array.from({ length: 50 }, (_, index) => {
  const name = `${firstNames[index]} ${lastNames[(index * 7) % lastNames.length]}`;
  const splits = buildSplits(index);
  const total = splits.reduce((sum, split) => sum + split.seconds, 0);
  const redZonePercent = Math.max(12, Math.min(58, Math.round(18 + (total - 4400) / 95 + (index % 9) * 2.1)));
  const maxHeartRate = 181 + (index % 13);
  const averageHeartRate = Math.round(maxHeartRate * (0.78 + redZonePercent / 360));

  return {
    id: index + 1,
    slug: slugify(name),
    name,
    bib: 1200 + index + 1,
    ageGroup: ageGroups[index % ageGroups.length],
    division: divisions[index % divisions.length],
    gym: gyms[index % gyms.length],
    avatarHue: (index * 39) % 360,
    averageHeartRate,
    maxHeartRate,
    redZonePercent,
    completionScore: Math.max(72, Math.min(99, Math.round(101 - (total - 4100) / 85))),
    splits,
  };
});
