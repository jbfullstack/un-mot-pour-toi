import PlayClient from "./PlayClient";

export const dynamic = "force-dynamic";

export default async function PlayPage({ searchParams }: any) {
  const sp = await searchParams; // Next 15 => Promise possible
  const uuid = sp?.u ?? null;

  return <PlayClient uuid={uuid} />;
}
