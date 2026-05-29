import { notFound } from "next/navigation";
import { AthleteProfileClient } from "@/components/AthleteProfileClient";
import { getAthleteBySlug, getRankedAthletes } from "@/lib/analytics";

type AthletePageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return getRankedAthletes().map((athlete) => ({ slug: athlete.slug }));
}

export function generateMetadata({ params }: AthletePageProps) {
  const athlete = getAthleteBySlug(params.slug);

  if (!athlete) {
    return {
      title: "Athlete not found | HYROX Analytics",
    };
  }

  return {
    title: `${athlete.name} | HYROX Analytics`,
    description: `Race analytics profile for ${athlete.name}.`,
  };
}

export default function AthletePage({ params }: AthletePageProps) {
  const athlete = getAthleteBySlug(params.slug);

  if (!athlete) notFound();

  return <AthleteProfileClient athlete={athlete} />;
}
