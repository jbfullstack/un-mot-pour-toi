import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const jsonResponse = await handleUpload({
    body,
    request: req,

    onBeforeGenerateToken: async () => ({
      allowedContentTypes: ["video/*", "audio/*", "image/*"],
      tokenPayload: "{}",
    }),

    onUploadCompleted: async () => {
      // rien à faire
    },
  });

  // ✅ App Router attend un Response
  return NextResponse.json(jsonResponse);
}
