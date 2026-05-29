"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RankedAthlete, StationRanking } from "@/lib/types";
import { formatDuration, formatSignedPlaces } from "@/lib/analytics";

type DashboardClientProps = {
  athletes: RankedAthlete[];
  stationRankings: StationRanking[];
};

export function DashboardClient({ athletes, stationRankings }: DashboardClientProps) {
  const leader = athletes[0];
  const averageSeconds = Math.round(athletes.reduce((sum, athlete) => sum + athlete.totalSeconds, 0) / athletes.length);
  const topTen = athletes.slice(0, 10);
  const progressionAthletes = athletes.slice(0, 5);
  const progressionData = leader.positionProgression.map((point, index) => ({
    station: point.station.replace("Burpee Broad Jumps", "Burpees").replace("Farmers Carry", "Carry"),
    ...Object.fromEntries(progressionAthletes.map((athlete) => [athlete.name, athlete.positionProgression[index].position])),
  }));

  const stationChartData = stationRankings.slice(1, 16).filter((_, index) => index % 2 === 0).map((station) => ({
    station: station.label.replace("Burpee Broad Jumps", "Burpees").replace("Farmers Carry", "Carry"),
    seconds: station.leaders[0].seconds,
    leader: station.leaders[0].name,
  }));

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="dashboard-panel overflow-hidden p-6 lg:p-8">
          <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.22em] text-energy">
            <span>HYROX Race Control</span>
            <span className="h-1.5 w-1.5 rounded-full bg-hyrox" />
            <span>Live MVP</span>
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-5xl font-black leading-[0.92] tracking-normal text-white sm:text-7xl">
                Gym leaderboard with race intelligence.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                A Formula 1 inspired timing wall for HYROX: total ranking, station pace, position movement, strengths, weaknesses, and AI-style race summaries.
              </p>
            </div>
            <div className="grid gap-3 rounded-xl border border-white/10 bg-black/30 p-4">
              <Metric label="Fastest" value={formatDuration(leader.totalSeconds)} detail={leader.name} />
              <Metric label="Field average" value={formatDuration(averageSeconds)} detail={`${athletes.length} athletes`} />
              <Metric label="Best mover" value={formatSignedPlaces(Math.max(...athletes.map((athlete) => athlete.netPlaces)))} detail="net places" />
            </div>
          </div>
        </div>

        <div className="dashboard-panel p-5">
          <p className="stat-label">AI race summary</p>
          <h2 className="mt-3 text-2xl font-black text-white">{leader.name}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            P{leader.rank} overall. Best split: {leader.strengths[0].label} at P{leader.strengths[0].rank}. Biggest limiter: {leader.weaknesses[0].label}. Projected best is {formatDuration(leader.projectedSeconds)} if pacing and station transitions sharpen.
          </p>
          <Link className="mt-5 inline-flex rounded-lg bg-hyrox px-4 py-2 text-sm font-black text-white shadow-glow" href={`/athletes/${leader.slug}`}>
            Open leader profile
          </Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="dashboard-panel p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="stat-label">Leaderboard</p>
              <h2 className="mt-2 text-2xl font-black text-white">Overall classification</h2>
            </div>
            <span className="rounded-full border border-energy/30 bg-energy/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-energy">
              Final
            </span>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[920px] border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                  <th className="pb-3">Pos</th>
                  <th className="pb-3">Athlete</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Delta</th>
                  <th className="pb-3">HR</th>
                  <th className="pb-3">Net</th>
                  <th className="pb-3">Strength</th>
                  <th className="pb-3">Weakness</th>
                </tr>
              </thead>
              <tbody>
                {athletes.map((athlete) => (
                  <tr key={athlete.slug} className="border-t border-white/10 hover:bg-white/[0.035]">
                    <td className="border-t border-white/10 py-3 font-mono text-lg font-black text-white">{athlete.rank}</td>
                    <td className="border-t border-white/10 py-3">
                      <Link href={`/athletes/${athlete.slug}`} className="font-bold text-white hover:text-energy">
                        {athlete.name}
                      </Link>
                      <div className="text-xs text-slate-500">#{athlete.bib} - {athlete.division} - {athlete.ageGroup}</div>
                    </td>
                    <td className="border-t border-white/10 py-3 timing-cell">{formatDuration(athlete.totalSeconds)}</td>
                    <td className="border-t border-white/10 py-3 timing-cell">+{formatDuration(athlete.totalSeconds - leader.totalSeconds)}</td>
                    <td className="border-t border-white/10 py-3 text-slate-300">{athlete.averageHeartRate} bpm <span className="text-slate-500">/ {athlete.redZonePercent}% red</span></td>
                    <td className={`border-t border-white/10 py-3 font-mono font-black ${athlete.netPlaces >= 0 ? "text-energy" : "text-hyrox"}`}>{formatSignedPlaces(athlete.netPlaces)}</td>
                    <td className="border-t border-white/10 py-3 text-slate-300">{athlete.strengths[0].label}</td>
                    <td className="border-t border-white/10 py-3 text-slate-300">{athlete.weaknesses[0].label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="dashboard-panel p-5">
            <p className="stat-label">Top 10 timing trace</p>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topTen.map((athlete) => ({ name: athlete.name.split(" ")[0], seconds: athlete.totalSeconds }))}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={["dataMin - 30", "dataMax + 30"]} />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} contentStyle={{ background: "#0b1018", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }} />
                  <Bar dataKey="seconds" fill="#fc4c02" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dashboard-panel p-5">
            <p className="stat-label">Places gained/lost</p>
            <div className="mt-4 grid gap-3">
              {[...athletes].sort((a, b) => b.netPlaces - a.netPlaces).slice(0, 6).map((athlete) => (
                <Link href={`/athletes/${athlete.slug}`} key={athlete.slug} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2">
                  <span className="font-bold text-white">{athlete.name}</span>
                  <span className={`font-mono text-lg font-black ${athlete.netPlaces >= 0 ? "text-energy" : "text-hyrox"}`}>{formatSignedPlaces(athlete.netPlaces)}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="dashboard-panel p-5">
          <p className="stat-label">Position progression</p>
          <h2 className="mt-2 text-2xl font-black text-white">Top five race order</h2>
          <div className="mt-5 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressionData} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="station" stroke="#94a3b8" fontSize={10} interval={1} angle={-35} textAnchor="end" height={80} />
                <YAxis reversed domain={[1, athletes.length]} stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0b1018", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }} />
                {progressionAthletes.map((athlete, index) => (
                  <Line key={athlete.slug} type="monotone" dataKey={athlete.name} stroke={["#b8ff3d", "#fc4c02", "#38bdf8", "#facc15", "#c084fc"][index]} strokeWidth={3} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-panel p-5">
          <p className="stat-label">Station-by-station rankings</p>
          <h2 className="mt-2 text-2xl font-black text-white">Fastest station leaders</h2>
          <div className="mt-5 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stationChartData} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis type="category" dataKey="station" stroke="#94a3b8" width={120} fontSize={11} />
                <Tooltip contentStyle={{ background: "#0b1018", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }} />
                <Bar dataKey="seconds" fill="#b8ff3d" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="dashboard-panel p-5">
        <p className="stat-label">Station boards</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stationRankings.map((station) => (
            <div key={station.key} className="rounded-lg border border-white/10 bg-black/25 p-4">
              <h3 className="font-black text-white">{station.label}</h3>
              <div className="mt-3 grid gap-2">
                {station.leaders.slice(0, 3).map((leader) => (
                  <Link href={`/athletes/${leader.slug}`} key={leader.slug} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">P{leader.rank} {leader.name}</span>
                    <span className="font-mono text-slate-100">{formatDuration(leader.seconds)}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <p className="stat-label">{label}</p>
      <p className="mt-2 font-mono text-3xl font-black tabular-nums text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{detail}</p>
    </div>
  );
}
