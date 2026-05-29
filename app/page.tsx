import { DashboardClient } from "@/components/DashboardClient";
import { getRankedAthletes, getStationRankings } from "@/lib/analytics";

export default function HomePage() {
  return <DashboardClient athletes={getRankedAthletes()} stationRankings={getStationRankings(5)} />;
}
