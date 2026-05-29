export type StationKey =
  | "run1"
  | "ski"
  | "run2"
  | "sledPush"
  | "run3"
  | "sledPull"
  | "run4"
  | "burpees"
  | "run5"
  | "row"
  | "run6"
  | "farmersCarry"
  | "run7"
  | "lunges"
  | "run8"
  | "wallBalls";

export type StationSplit = {
  key: StationKey;
  label: string;
  seconds: number;
};

export type Athlete = {
  id: number;
  slug: string;
  name: string;
  bib: number;
  ageGroup: string;
  division: "Open" | "Pro" | "Doubles";
  gym: string;
  avatarHue: number;
  averageHeartRate: number;
  maxHeartRate: number;
  redZonePercent: number;
  completionScore: number;
  splits: StationSplit[];
};

export type RankedAthlete = Athlete & {
  totalSeconds: number;
  rank: number;
  projectedSeconds: number;
  efficiencyScore: number;
  placesGained: number;
  placesLost: number;
  netPlaces: number;
  positionProgression: PositionPoint[];
  strengths: StationInsight[];
  weaknesses: StationInsight[];
};

export type StationInsight = {
  key: StationKey;
  label: string;
  rank: number;
  seconds: number;
  deltaToAverage: number;
};

export type PositionPoint = {
  station: string;
  position: number;
};

export type StationRanking = {
  key: StationKey;
  label: string;
  leaders: Array<{
    slug: string;
    name: string;
    seconds: number;
    rank: number;
  }>;
};
