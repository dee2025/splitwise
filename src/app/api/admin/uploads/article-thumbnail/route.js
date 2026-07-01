import { requireAdmin } from "@/lib/adminAuth";
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

export async function POST(req) {
  try {
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
