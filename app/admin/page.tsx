"use client";

import { useState } from "react";

export default function AdminPage({ searchParams }: any) {
  const token = searchParams?.t;

  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserUuid, setSelectedUserUuid] = useState<string | null>(null);
  const [msg, setMsg] = useState<string>("");

  async function createUser(e: any) {
    e.preventDefault();
    const display_name = e.currentTarget.display_name.value;
    const r = await fetch(`/api/admin/user?t=${token}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ display_name }),
    });
    const u = await r.json();
    if (u.error) return setMsg(u.error);
    setUsers((prev) => [...prev, u]);
    setSelectedUserId(u.id);
    setSelectedUserUuid(u.uuid);
    setMsg(`User créé: ${u.display_name} / UUID=${u.uuid}`);
  }

  async function uploadMedia(e: any) {
    e.preventDefault();
    if (!selectedUserId) return setMsg("Choisis un user d'abord.");

    const fd = new FormData(e.currentTarget);
    fd.set("user_id", String(selectedUserId));
    fd.set("is_random", fd.get("is_random") ? "true" : "false");

    const r = await fetch(`/api/admin/media?t=${token}`, {
      method: "POST",
      body: fd,
    });
    const m = await r.json();
    if (m.error) return setMsg(m.error);

    const rawDates = ((fd.get("dates") as string) || "").trim();
    if (rawDates) {
      const dates = rawDates.split(",").map((s) => s.trim());

      await fetch(`/api/admin/media-dates?t=${token}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ media_id: m.id, dates }),
      });
    }

    setMsg(`Media créé id=${m.id}`);
    e.currentTarget.reset();
  }

  return (
    <main className="p-6 max-w-xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Admin</h1>

      {msg && <div className="p-3 bg-gray-100 rounded">{msg}</div>}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">1) Créer un user</h2>
        <form onSubmit={createUser} className="space-y-2">
          <input
            name="display_name"
            placeholder="Nom (ex: Copine, Maman)"
            className="border p-2 w-full rounded"
            required
          />
          <button className="px-4 py-2 rounded bg-black text-white">
            Créer
          </button>
        </form>

        {selectedUserUuid && (
          <div className="text-sm">
            UUID sélectionné :{" "}
            <code className="font-mono">{selectedUserUuid}</code>
          </div>
        )}

        {users.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm">Users créés :</div>
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  setSelectedUserId(u.id);
                  setSelectedUserUuid(u.uuid);
                }}
                className={`block w-full text-left border p-2 rounded ${
                  selectedUserId === u.id ? "bg-gray-100" : ""
                }`}
              >
                {u.display_name} — {u.uuid}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">2) Uploader un média</h2>
        <form onSubmit={uploadMedia} className="space-y-2">
          <input
            name="title"
            placeholder="Titre (optionnel)"
            className="border p-2 w-full rounded"
          />

          <label className="text-sm">Audio (obligatoire)</label>
          <input
            type="file"
            name="audio"
            accept="audio/*"
            capture
            required
            className="border p-2 w-full rounded"
          />

          <label className="text-sm">Image (optionnel)</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            capture="environment"
            className="border p-2 w-full rounded"
          />

          <input
            name="video_url"
            placeholder="Video url embed youtube (optionnel)"
            className="border p-2 w-full rounded"
          />

          <input
            name="dates"
            placeholder="Dates CSV (optionnel) ex: 2025-12-01,2025-12-24"
            className="border p-2 w-full rounded"
          />

          <label className="flex gap-2 items-center text-sm">
            <input type="checkbox" name="is_random" />
            Random ?
          </label>

          <button className="px-4 py-2 rounded bg-black text-white">
            Upload
          </button>
        </form>
      </section>
    </main>
  );
}
