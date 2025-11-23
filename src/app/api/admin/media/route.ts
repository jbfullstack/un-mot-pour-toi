import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { sql } from "@/lib/db";
import { assertAdmin } from "@/lib/auth-admin";

export async function POST(req: NextRequest) {
  if (!assertAdmin(req)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const formData = await req.formData();

  const userId = Number(formData.get("user_id"));
  if (!userId) {
    return NextResponse.json({ error: "user_id requis" }, { status: 400 });
  }

  const title = (formData.get("title") as string) || null;
  const rawRandom = formData.get("is_random");
  const isRandom = rawRandom === "true" || rawRandom === "on";

  const audioFile = formData.get("audio") as File | null;
  const imageFile = formData.get("image") as File | null;

  let audioUrl: string | null = null;
  let imageUrl: string | null = null;

  if (audioFile && audioFile.size > 0) {
    const audioBlob = await put(audioFile.name, audioFile, {
      access: "public",
      addRandomSuffix: true,
    });
    audioUrl = audioBlob.url;
  }

  if (imageFile && imageFile.size > 0) {
    const imgBlob = await put(imageFile.name, imageFile, {
      access: "public",
      addRandomSuffix: true,
    });
    imageUrl = imgBlob.url;
  }

  const videoFile = formData.get("video") as File | null;
  let videoUrl: string | null = null;

  // si fichier vidéo => upload blob
  if (videoFile && videoFile.size > 0) {
    const vidBlob = await put(videoFile.name, videoFile, {
      access: "public",
      addRandomSuffix: true,
    });
    videoUrl = vidBlob.url;
  }

  // sinon fallback sur video_url youtube
  const videoUrlInput = (formData.get("video_url") as string) || null;
  if (!videoUrl && videoUrlInput) {
    videoUrl = videoUrlInput;
  }

  // ta contrainte CHECK garantit qu'il y a au moins un contenu
  const r = await sql<{ id: number }>(
    `
    INSERT INTO media(user_id, audio_url, image_url, video_url, is_random, title)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING id
    `,
    [userId, audioUrl, imageUrl, videoUrl, isRandom, title]
  );

  return NextResponse.json({ id: r.rows[0].id });
}
