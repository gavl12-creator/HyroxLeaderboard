import { athletes, stationDefinitions } from "./data";
import type { Athlete, RankedAthlete, StationInsight, StationKey, StationRanking } from "./types";

type ProgressionRanking = {
  station: string;
  ranks: Map<string, number>;
};

export function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatSignedPlaces(value: number) {
  if (value > 0) return `+${value}`;
  return String(value);
}

export function getTotalSeconds(athlete: Athlete) {
  return athlete.splits.reduce((sum, split) => sum + split.seconds, 0);
}

export function getEfficiencyScore(athlete: Athlete) {
  const intensity = athlete.averageHeartRate / athlete.maxHeartRate;
  const redZonePenalty = athlete.redZonePercent / 100;
  const score = 100 - intensity * 34 - redZonePenalty * 22 + athlete.completionScore * 0.16;
  return Math.max(48, Math.min(96, Math.round(score)));
}

export function getProjectedSeconds(athlete: Athlete) {
  const total = getTotalSeconds(athlete);
  const efficiency = getEfficiencyScore(athlete);
  const pressureCost = Math.max(0, athlete.redZonePercent - 24) * 0.0026;
  const controlledButSoft = athlete.redZonePercent < 18 ? 0.018 : 0;
  const upside = Math.min(0.095, pressureCost + controlledButSoft + (96 - efficiency) * 0.00065);
  return Math.round(total * (1 - upside));
}

function cumulativeRankings(): ProgressionRanking[] {
  return stationDefinitions.map((station: any, stationIndex: number) => {
    const ranking = athletes
      .map((athlete) => ({
        slug: athlete.slug,
        cumulative: athlete.splits.slice(0, stationIndex + 1).reduce((sum, split) => sum + split.seconds, 0),
      }))
      .sort((a, b) => a.cumulative - b.cumulative);

    return {
      station: station.label,
      ranks: new Map(ranking.map((entry, index) => [entry.slug, index + 1])),
    };
  });
}

const progression: ProgressionRanking[] = cumulativeRankings();

export function getPositionProgression(athlete: Athlete) {
  return progression.map((point: ProgressionRanking) => ({
    station: point.station,
    position: point.ranks.get(athlete.slug) ?? athletes.length,
  }));
}

export function getPlacesGainedLost(athlete: Athlete) {
  const points = getPositionProgression(athlete);
  let gained = 0;
  let lost = 0;

  for (let index = 1; index < points.length; index += 1) {
    const delta = points[index - 1].position - points[index].position;
    if (delta > 0) gained += delta;
    if (delta < 0) lost += Math.abs(delta);
  }

  return {
    gained,
    lost,
    net: points.length > 0 ? points[0].position - points[points.length - 1].position : 0,
  };
}

export function getStationInsights(athlete: Athlete) {
  const insights = athlete.splits.map((split) => {
    const stationTimes = athletes
      .map((entry) => entry.splits.find((candidate) => candidate.key === split.key)?.seconds ?? 0)
      .sort((a, b) => a - b);
    const rank = stationTimes.findIndex((seconds) => seconds === split.seconds) + 1;
    const average = stationTimes.reduce((sum, seconds) => sum + seconds, 0) / stationTimes.length;

    return {
      key: split.key,
      label: split.label,
      rank,
      seconds: split.seconds,
      deltaToAverage: Math.round(split.seconds - average),
    } satisfies StationInsight;
  });

  return {
    strengths: [...insights].sort((a, b) => a.rank - b.rank).slice(0, 3),
    weaknesses: [...insights].sort((a, b) => b.rank - a.rank).slice(0, 3),
  };
}

export function getRankedAthletes(): RankedAthlete[] {
  return athletes
    .map((athlete) => ({
      ...athlete,
      totalSeconds: getTotalSeconds(athlete),
      projectedSeconds: getProjectedSeconds(athlete),
      efficiencyScore: getEfficiencyScore(athlete),
      positionProgression: getPositionProgression(athlete),
      ...getStationInsights(athlete),
      placesGained: getPlacesGainedLost(athlete).gained,
      placesLost: getPlacesGainedLost(athlete).lost,
      netPlaces: getPlacesGainedLost(athlete).net,
      rank: 0,
    }))
    .sort((a, b) => a.totalSeconds - b.totalSeconds)
    .map((athlete, index) => ({ ...athlete, rank: index + 1 }));
}

export function getAthleteBySlug(slug: string) {
  return getRankedAthletes().find((athlete) => athlete.slug === slug);
}

export function getStationRankings(limit = 5): StationRanking[] {
  return stationDefinitions.map((station: any) => {
    const leaders = athletes
      .map((athlete) => ({
        slug: athlete.slug,
        name: athlete.name,
        seconds: athlete.splits.find((split) => split.key === station.key)?.seconds ?? 0,
        rank: 0,
      }))
      .sort((a, b) => a.seconds - b.seconds)
      .map((entry, index) => ({ ...entry, rank: index + 1 }))
      .slice(0, limit);

    return {
      key: station.key as StationKey,
      label: station.label,
      leaders,
    };
  });
}

export function getRaceSummary(athlete: RankedAthlete) {
  const best = athlete.strengths[0];
  const limiter = athlete.weaknesses[0];
  const pacing = athlete.netPlaces >= 4
    ? "built the race like a negative split, moving forward as fatigue hit the field"
    : athlete.netPlaces <= -4
      ? "paid for an aggressive opening phase and leaked places late"
      : "held station-to-station position with a stable pacing signature";

  if (!best || !limiter) {
    return `${athlete.name} finished P${athlete.rank} in ${formatDuration(athlete.totalSeconds)}. Add station split data to unlock a deeper performance story.`;
  }

  return `${athlete.name} finished P${athlete.rank} in ${formatDuration(athlete.totalSeconds)} and ${pacing}. The clearest weapon was ${best.label}, ranked P${best.rank} and ${Math.abs(best.deltaToAverage)} seconds ${best.deltaToAverage <= 0 ? "faster" : "slower"} than field average. The biggest limiter was ${limiter.label}, where the split ranked P${limiter.rank}. With cleaner energy distribution, the model projects ${formatDuration(athlete.projectedSeconds)} as a realistic next target.`;
}
