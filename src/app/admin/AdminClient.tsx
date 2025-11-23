"use client";

import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import { upload } from "@vercel/blob/client";

type UserRow = { id: number; display_name: string; uuid: string };

export default function AdminClient({ token }: { token: string | null }) {
  const [auth, setAuth] = useState<"checking" | "ok" | "no">("checking");

  const [users, setUsers] = useState<UserRow[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserUuid, setSelectedUserUuid] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [uploadOk, setUploadOk] = useState<null | boolean>(null);

  const [audioName, setAudioName] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);

  // calendrier multi-dates
  const [dates, setDates] = useState<Date[]>([]);

  function formatParisDate(date: Date) {
    const fmt = new Intl.DateTimeFormat("fr-CA", {
      timeZone: "Europe/Paris",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return fmt.format(date); // YYYY-MM-DD
  }

  async function loadUsers() {
    if (!token) return setAuth("no");

    const r = await fetch(`/api/admin/user?t=${token}`, { cache: "no-store" });
    if (!r.ok) return setAuth("no");
    setAuth("ok");

    const list = (await r.json()) as UserRow[];
    setUsers(list);
    if (list[0] && selectedUserId === null) {
      setSelectedUserId(list[0].id);
      setSelectedUserUuid(list[0].uuid);
    }
  }

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function addUser(e: any) {
    e.preventDefault();
    if (!token) return setMsg("Token admin absent.");

    const display_name = e.currentTarget.display_name.value;

    const r = await fetch(`/api/admin/user?t=${token}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ display_name }),
    });
    const u = await r.json();
    if (u.error) return setMsg(u.error);

    setMsg(`User ajouté: ${u.display_name} / UUID=${u.uuid}`);
    e.currentTarget.reset();
    await loadUsers();
    setSelectedUserId(u.id);
    setSelectedUserUuid(u.uuid);
  }

  async function uploadMedia(e: any) {
    e.preventDefault();
    if (isUploading) return; // garde anti double-clic

    if (!token) return setMsg("Token admin absent.");
    if (!selectedUserId) return setMsg("Choisis un user d'abord.");

    const formEl = e.currentTarget as HTMLFormElement;
    const fd = new FormData(formEl);

    const isRandom = fd.get("is_random") ? true : false;

    // ✅ règle métier: au moins une date OU random
    if (!isRandom && dates.length === 0) {
      return setMsg(
        "Il faut soit sélectionner au moins une date, soit cocher Random."
      );
    }

    setMsg("");
    setUploadOk(null);
    setIsUploading(true);

    try {
      fd.set("user_id", String(selectedUserId));
      fd.set("is_random", isRandom ? "true" : "false");
      fd.set("dates", dates.map(formatParisDate).join(","));

      // === SI VIDEO GROSSE : upload direct blob ===
      const videoFile = fd.get("video") as File | null;

      if (videoFile && videoFile.size > 4.5 * 1024 * 1024) {
        const blob = await upload(videoFile.name, videoFile, {
          access: "public",
          handleUploadUrl: "/api/blob-upload",
        });

        fd.delete("video"); // on évite de repasser le fichier à la function
        fd.set("video_url", blob.url); // on envoie juste l’URL
      }

      const r = await fetch(`/api/admin/media?t=${token}`, {
        method: "POST",
        body: fd,
      });

      if (!r.ok) {
        const txt = await r.text();
        setUploadOk(false);
        setMsg(`Upload refusé (${r.status}) : ${txt.slice(0, 200)}`);
        return;
      }

      const m = await r.json();
      if (m.error) {
        setUploadOk(false);
        setMsg(m.error);
        return;
      }

      const rawDates = dates.map(formatParisDate).join(",").trim();
      if (rawDates) {
        const arr = rawDates.split(",").map((s) => s.trim());
        await fetch(`/api/admin/media-dates?t=${token}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ media_id: m.id, dates: arr }),
        });
      }

      setUploadOk(true);
      setMsg(`✅ Media créé id=${m.id}`);

      formEl.reset();
      setDates([]);
      setAudioName(null);
      setImageName(null);
      setVideoName(null);
    } catch (err: any) {
      setUploadOk(false);
      setMsg(`Erreur upload: ${String(err)}`);
    } finally {
      setIsUploading(false);
    }
  }

  if (auth !== "ok") return null;

  return (
    <main className="page">
      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #0b0b0c;
          color: #f7f7f7;
          padding: 16px;
        }
        .wrap {
          max-width: 560px;
          margin: 0 auto;
          display: grid;
          gap: 16px;
        }
        .card {
          background: #151518;
          border: 1px solid #22222a;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
          display: grid;
          gap: 12px;
        }
        h1 {
          font-size: 28px;
          margin: 0;
        }
        h2 {
          font-size: 18px;
          margin: 0;
        }
        .sub {
          color: #b9b9c5;
          font-size: 13px;
        }
        input,
        select {
          width: 100%;
          background: #0f0f12;
          color: #fff;
          border: 1px solid #2a2a33;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 15px;
          outline: none;
        }
        input[type="file"] {
          padding: 8px;
        }
        label {
          font-size: 13px;
          color: #d7d7df;
        }
        .btn {
          background: #fff;
          color: #000;
          border: none;
          border-radius: 12px;
          padding: 10px 14px;
          font-weight: 700;
          cursor: pointer;
        }
        .btn.dark {
          background: #2b7cff;
          color: #fff;
        }
        .btn.full {
          width: 100%;
          padding: 12px 14px;
        }
        .notice {
          background: #0f0f12;
          border: 1px solid #2a2a33;
          border-radius: 12px;
          padding: 10px 12px;
          font-size: 14px;
        }
        code {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        .rdp-months {
          color: white;
        }

        .rdp-caption {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .rdp-caption_label {
          font-weight: 600;
        }

        .rdp-nav_button {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #2a2a33;
          background: #151518;
          color: white;
          cursor: pointer;
        }
        .rdp-nav_button:hover {
          background: #1f1f24;
        }

        .rdp-head_cell {
          font-size: 12px;
          color: #b9b9c5;
          font-weight: 600;
          text-transform: none;
        }

        .rdp-day {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          margin: 2px;
          font-size: 14px;
          color: white;
          background: transparent;
        }
        .rdp-day:hover {
          background: #202028;
        }

        .rdp-day_selected {
          background: #2b7cff !important;
          color: white !important;
          font-weight: 700;
          outline: 2px solid rgba(43, 124, 255, 0.45);
        }

        .rdp-day_today {
          border: 1px solid #2b7cff;
        }

        .rdp-day_outside {
          color: #6b6b75;
          opacity: 0.6;
        }

        :global(.rdp-dark .rdp-nav_button) {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid #3a3a45;
          background: #1b1b20;
          color: white;
          opacity: 1 !important;
          display: grid;
          place-items: center;
        }

        :global(.rdp-dark .rdp-nav_button svg) {
          width: 18px;
          height: 18px;
          stroke: currentColor !important;
          fill: currentColor !important;
          opacity: 1 !important;
        }

        /* ✅ FORCE la sélection visible, même si DayPicker change de classes */
        :global(.rdp-dark .rdp-day[aria-selected="true"]) {
          background: #2b7cff !important;
          color: white !important;
          font-weight: 700;
          outline: 2px solid rgba(43, 124, 255, 0.45);
        }

        /* optionnel: hover plus clair */
        :global(.rdp-dark .rdp-day:hover) {
          background: #202028;
        }
      `}</style>

      <div className="wrap">
        <header className="card">
          <h1>Admin</h1>
          <div className="sub">Choisis un user, puis uploade tes médias.</div>
        </header>

        {msg && <div className="notice">{msg}</div>}

        <section className="card">
          <h2>Users</h2>
          <label>User sélectionné</label>
          <select
            value={selectedUserId ?? ""}
            onChange={(e) => {
              const id = Number(e.target.value);
              const u = users.find((x) => x.id === id);
              setSelectedUserId(id);
              setSelectedUserUuid(u?.uuid ?? null);
            }}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.display_name}
              </option>
            ))}
          </select>

          {selectedUserUuid && (
            <div className="notice">
              UUID : <code>{selectedUserUuid}</code>
              <div className="sub" style={{ marginTop: 6 }}>
                URL NFC : /play?u={selectedUserUuid}
              </div>
            </div>
          )}

          <form onSubmit={addUser} style={{ display: "grid", gap: 8 }}>
            <input
              name="display_name"
              type="text"
              placeholder="Ajouter un user (ex: Copine)"
              required
            />
            <button className="btn">Ajouter</button>
          </form>
        </section>

        <section className="card">
          <h2>Uploader un média</h2>

          <form onSubmit={uploadMedia} style={{ display: "grid", gap: 10 }}>
            <input name="title" type="text" placeholder="Titre (optionnel)" />

            {/* AUDIO */}
            <div style={{ display: "grid", gap: 6 }}>
              <label>Audio (optionnel)</label>
              <input
                type="file"
                name="audio"
                accept="audio/*"
                capture
                onChange={(e) =>
                  setAudioName(e.currentTarget.files?.[0]?.name ?? null)
                }
              />
              {audioName && <div className="sub">🎧 {audioName}</div>}
              <div className="sub">
                Sur téléphone : tu peux enregistrer un son OU choisir un fichier
                existant.
              </div>
            </div>

            {/* IMAGE */}
            <div style={{ display: "grid", gap: 6 }}>
              <label>Image (optionnel)</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                capture="environment"
                onChange={(e) =>
                  setImageName(e.currentTarget.files?.[0]?.name ?? null)
                }
              />
              {imageName && <div className="sub">🖼️ {imageName}</div>}
              <div className="sub">
                Sur téléphone : tu peux prendre une photo OU choisir une image
                existante.
              </div>
            </div>

            {/* VIDEO fichier */}
            <div style={{ display: "grid", gap: 6 }}>
              <label>Vidéo fichier (optionnel)</label>
              <input
                type="file"
                name="video"
                accept="video/*"
                capture="environment"
                onChange={(e) =>
                  setVideoName(e.currentTarget.files?.[0]?.name ?? null)
                }
              />
              {videoName && <div className="sub">🎬 {videoName}</div>}
              <div className="sub">
                Sur téléphone : tu peux filmer OU choisir une vidéo existante.
              </div>
            </div>

            {/* VIDEO url youtube */}
            <input
              name="video_url"
              type="text"
              placeholder="URL embed YouTube (optionnel)"
            />

            {/* CALENDRIER */}
            <label>Dates (optionnel)</label>
            <div
              style={{
                background: "#0f0f12",
                borderRadius: 12,
                padding: 10,
                border: "1px solid #2a2a33",
                overflowX: "auto",
              }}
            >
              <DayPicker
                className="rdp-dark"
                mode="multiple"
                selected={dates}
                onSelect={(arr) => setDates(arr ?? [])}
                weekStartsOn={1}
                showOutsideDays
                captionLayout="dropdown"
                fromYear={2020}
                toYear={2035}
              />
            </div>

            {dates.length > 0 && (
              <div className="sub">
                Sélectionnées : {dates.map(formatParisDate).join(", ")}
              </div>
            )}

            <input
              type="hidden"
              name="dates"
              value={dates.map(formatParisDate).join(",")}
            />

            {/* RANDOM */}
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" name="is_random" />
              Random ?
            </label>

            {/* GUARD UX */}
            {dates.length === 0 && (
              <div className="sub">
                ⚠️ Si aucune date n’est sélectionnée, pense à cocher Random.
              </div>
            )}

            {/* SUBMIT */}
            <button className="btn dark full" disabled={isUploading}>
              {isUploading ? "Upload en cours..." : "Upload"}
            </button>

            {uploadOk === true && (
              <div className="sub" style={{ color: "#7CFF9E" }}>
                ✅ Upload terminé
              </div>
            )}
            {uploadOk === false && (
              <div className="sub" style={{ color: "#FF7C7C" }}>
                ❌ Upload échoué
              </div>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}
