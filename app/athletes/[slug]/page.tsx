import { notFound } from "next/navigation";
import { AthleteProfileClient } from "@/components/AthleteProfileClient";
import { getAthleteBySlug, getRankedAthletes } from "@/lib/analytics";

type AthletePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getRankedAthletes().map((athlete) => ({ slug: athlete.slug }));
}

export async function generateMetadata({ params }: AthletePageProps) {
  const { slug } = await params;
  const athlete = getAthleteBySlug(slug);

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

export default async function AthletePage({ params }: AthletePageProps) {
  const { slug } = await params;
  const athlete = getAthleteBySlug(slug);

  if (!athlete) notFound();

  return <AthleteProfileClient athlete={athlete} />;
}
