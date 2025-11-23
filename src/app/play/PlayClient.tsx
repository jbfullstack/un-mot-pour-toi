"use client";

import { useEffect, useState } from "react";

export default function PlayClient({ uuid }: { uuid: string | null }) {
  const [media, setMedia] = useState<any>(null);

  useEffect(() => {
    const url = `/api/daily${uuid ? `?u=${uuid}` : ""}`;
    fetch(url)
      .then((r) => r.json())
      .then(setMedia)
      .catch((e) => setMedia({ error: String(e) }));
  }, [uuid]);

  if (!media) return <div style={{ padding: 16 }}>Chargement...</div>;
  if (media.error) return <div style={{ padding: 16 }}>{media.error}</div>;

  return (
    <main
      style={{ padding: 16, maxWidth: 560, margin: "0 auto", color: "#fff" }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
        {media.title ?? "Message du jour"}
      </h1>

      {media.image_url && (
        <img
          src={media.image_url}
          style={{ width: "100%", borderRadius: 12, marginBottom: 12 }}
          alt=""
        />
      )}

      {media.video_url && (
        <div style={{ aspectRatio: "16/9", marginBottom: 12 }}>
          <iframe
            src={media.video_url}
            style={{ width: "100%", height: "100%", borderRadius: 12 }}
            allow="autoplay; encrypted-media"
          />
        </div>
      )}

      {media.audio_url ? (
        <>
          <audio controls autoPlay style={{ width: "100%" }}>
            <source src={media.audio_url} />
          </audio>

          <a
            href={media.audio_url}
            download
            style={{ display: "inline-block", marginTop: 8, color: "#9ecbff" }}
          >
            Télécharger l’audio
          </a>
        </>
      ) : (
        <div>Aucun audio pour aujourd’hui.</div>
      )}
    </main>
  );
}
