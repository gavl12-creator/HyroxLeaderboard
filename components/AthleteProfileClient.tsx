"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RankedAthlete } from "@/lib/types";
import { formatDuration, formatSignedPlaces, getRaceSummary } from "@/lib/analytics";

type AthleteProfileClientProps = {
  athlete: RankedAthlete;
};

export function AthleteProfileClient({ athlete }: AthleteProfileClientProps) {
  const stationData = athlete.splits.map((split) => ({
    station: split.label.replace("Burpee Broad Jumps", "Burpees").replace("Farmers Carry", "Carry"),
    seconds: split.seconds,
  }));
  const radarData = [
    { metric: "Engine", value: athlete.completionScore },
    { metric: "Efficiency", value: athlete.efficiencyScore },
    { metric: "Station Power", value: 100 - athlete.strengths[0].rank * 1.2 },
    { metric: "Pacing", value: Math.max(48, 90 - athlete.redZonePercent * 0.8) },
    { metric: "Racecraft", value: Math.max(45, 72 + athlete.netPlaces * 1.8) },
  ];

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/" className="w-fit rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-bold text-slate-300 hover:text-white">
        Back to leaderboard
      </Link>

      <section className="dashboard-panel grid gap-6 overflow-hidden p-6 lg:grid-cols-[1fr_360px] lg:p-8">
        <div>
          <p className="stat-label">Athlete profile</p>
          <div className="mt-5 flex flex-wrap items-center gap-5">
            <div
              className="grid h-20 w-20 place-items-center rounded-xl text-3xl font-black text-carbon"
              style={{ background: `linear-gradient(135deg, hsl(${athlete.avatarHue} 90% 62%), #b8ff3d)` }}
            >
              {athlete.name.split(" ").map((part) => part[0]).join("")}
            </div>
            <div>
              <h1 className="text-5xl font-black leading-none text-white sm:text-6xl">{athlete.name}</h1>
              <p className="mt-2 text-slate-400">Bib #{athlete.bib} · {athlete.division} · {athlete.ageGroup} · {athlete.gym}</p>
            </div>
          </div>
        </div>
        <div className="grid gap-3 rounded-xl border border-white/10 bg-black/30 p-4">
          <ProfileMetric label="Overall rank" value={`P${athlete.rank}`} detail="final classification" />
          <ProfileMetric label="Finish time" value={formatDuration(athlete.totalSeconds)} detail={`projected ${formatDuration(athlete.projectedSeconds)}`} />
          <ProfileMetric label="Net places" value={formatSignedPlaces(athlete.netPlaces)} detail={`${athlete.placesGained} gained / ${athlete.placesLost} lost`} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="dashboard-panel p-5">
          <p className="stat-label">AI race summary</p>
          <h2 className="mt-2 text-2xl font-black text-white">Race narrative</h2>
          <p className="mt-4 text-base leading-8 text-slate-300">{getRaceSummary(athlete)}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <ProfileMetric label="Avg HR" value={`${athlete.averageHeartRate}`} detail={`max ${athlete.maxHeartRate} bpm`} />
            <ProfileMetric label="Red zone" value={`${athlete.redZonePercent}%`} detail="time under pressure" />
            <ProfileMetric label="Efficiency" value={`${athlete.efficiencyScore}`} detail="race economy score" />
          </div>
        </div>

        <div className="dashboard-panel p-5">
          <p className="stat-label">Position progression</p>
          <h2 className="mt-2 text-2xl font-black text-white">How the race unfolded</h2>
          <div className="mt-5 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={athlete.positionProgression} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="station" stroke="#94a3b8" fontSize={10} interval={1} angle={-35} textAnchor="end" height={80} />
                <YAxis reversed domain={[1, 50]} stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0b1018", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="position" stroke="#b8ff3d" strokeWidth={4} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="dashboard-panel p-5">
          <p className="stat-label">Station splits</p>
          <h2 className="mt-2 text-2xl font-black text-white">Station-by-station performance</h2>
          <div className="mt-5 h-[430px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stationData} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="station" stroke="#94a3b8" fontSize={10} interval={1} angle={-35} textAnchor="end" height={90} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0b1018", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }} />
                <Bar dataKey="seconds" fill="#fc4c02" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-panel p-5">
          <p className="stat-label">Athlete profile</p>
          <h2 className="mt-2 text-2xl font-black text-white">Performance radar</h2>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="rgba(255,255,255,0.16)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <Radar dataKey="value" fill="#b8ff3d" fillOpacity={0.25} stroke="#b8ff3d" strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-5 grid gap-4">
            <InsightBlock title="Strengths" items={athlete.strengths} tone="text-energy" />
            <InsightBlock title="Weaknesses" items={athlete.weaknesses} tone="text-hyrox" />
          </div>
        </div>
      </section>

      <section className="dashboard-panel p-5">
        <p className="stat-label">Places gained and lost</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {athlete.positionProgression.map((point, index) => {
            const previous = index === 0 ? point.position : athlete.positionProgression[index - 1].position;
            const delta = previous - point.position;
            return (
              <div key={point.station} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{point.station}</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <span className="font-mono text-3xl font-black text-white">P{point.position}</span>
                  <span className={`font-mono text-xl font-black ${delta >= 0 ? "text-energy" : "text-hyrox"}`}>{formatSignedPlaces(delta)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function ProfileMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <p className="stat-label">{label}</p>
      <p className="mt-2 font-mono text-3xl font-black tabular-nums text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{detail}</p>
    </div>
  );
}

function InsightBlock({
  title,
  items,
  tone,
}: {
  title: string;
  items: RankedAthlete["strengths"];
  tone: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">{title}</h3>
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm">
            <span className="font-bold text-slate-200">{item.label}</span>
            <span className={`font-mono font-black ${tone}`}>P{item.rank}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
