"use client";
import { useEffect, useState } from "react";

export default function PlayPage({ searchParams }: any) {
  const uuid = searchParams?.u;
  const [media, setMedia] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/daily${uuid ? `?u=${uuid}` : ""}`)
      .then((r) => r.json())
      .then(setMedia);
  }, [uuid]);

  if (!media) return <div className="p-6">Chargement...</div>;
  if (media.error) return <div className="p-6">{media.error}</div>;

  return (
    <main className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{media.title ?? "Message du jour"}</h1>

      {media.image_url && (
        <img src={media.image_url} className="rounded-xl w-full" />
      )}

      {media.video_url && (
        <div className="aspect-video">
          <iframe
            className="w-full h-full rounded-xl"
            src={media.video_url}
            allow="autoplay; encrypted-media"
          />
        </div>
      )}

      <audio controls autoPlay className="w-full">
        <source src={media.audio_url} />
      </audio>

      <a href={media.audio_url} download className="underline text-sm">
        Télécharger l'audio
      </a>
    </main>
  );
}
