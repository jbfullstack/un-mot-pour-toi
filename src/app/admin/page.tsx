import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: any) {
  // Next 15 peut donner searchParams comme Promise
  const sp = await searchParams;
  const token = sp?.t ?? null;

  return <AdminClient token={token} />;
}
