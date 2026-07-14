import { requireAdmin } from "@/lib/adminAuth";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

function cleanName(value = "thumbnail") {
  return value
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "thumbnail";
}

function detectImageType(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }

  if (
    bytes.length >= 12 &&
    bytes.slice(0, 4).toString("ascii") === "RIFF" &&
    bytes.slice(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  if (
    bytes.length >= 6 &&
    (bytes.slice(0, 6).toString("ascii") === "GIF87a" ||
      bytes.slice(0, 6).toString("ascii") === "GIF89a")
  ) {
    return "image/gif";
  }

  return "";
}

export async function POST(req) {
  try {
    const limit = rateLimit(req, {
      keyPrefix: "admin-upload",
      limit: 20,
      windowMs: 60 * 60 * 1000,
    });
    if (limit.limited) {
      return rateLimitResponse("Too many uploads. Please wait and try again.", limit);
    }

    const auth = await requireAdmin(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    const extension = ALLOWED_TYPES.get(file.type);
    if (!extension) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WebP, and GIF images are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image must be smaller than 5MB" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    if (detectImageType(bytes) !== file.type) {
      return NextResponse.json({ error: "Uploaded file content does not match the image type" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "articles");
    await mkdir(uploadDir, { recursive: true });

    const baseName = cleanName(file.name);
    const filename = `${baseName}-${Date.now()}-${randomUUID().slice(0, 8)}.${extension}`;
    const absolutePath = path.join(uploadDir, filename);

    await writeFile(absolutePath, bytes);

    return NextResponse.json({
      path: `/uploads/articles/${filename}`,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Article thumbnail upload error:", error);
    return NextResponse.json({ error: "Unable to upload thumbnail" }, { status: 500 });
  }
}
