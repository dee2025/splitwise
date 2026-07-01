import { requireAdmin } from "@/lib/adminAuth";
import { buildArticlePayload, validateArticlePayload } from "@/lib/adminArticlePayload";
import { normalizeArticle } from "@/lib/articleUtils";
import { connectDB } from "@/lib/db";
import Article from "@/models/Article";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

function getArticleId(req) {
  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  return segments[segments.length - 1];
}

export async function PATCH(req) {
  try {
    const auth = await requireAdmin(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectDB();

    const articleId = getArticleId(req);
    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      return NextResponse.json({ error: "Invalid article id" }, { status: 400 });
    }

    const article = await Article.findById(articleId);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const body = await req.json();
    const payload = buildArticlePayload(body, auth.user._id, article);
    const errors = validateArticlePayload(payload);

    if (Object.keys(errors).length) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    const slugOwner = await Article.findOne({ slug: payload.slug, _id: { $ne: article._id } }).select("_id");
    if (slugOwner) {
      return NextResponse.json(
        { error: "Validation failed", errors: { slug: "An article with this slug already exists." } },
        { status: 400 }
      );
    }

    article.set(payload);
    await article.save();

    return NextResponse.json({ article: normalizeArticle(article) });
  } catch (error) {
    console.error("Admin article update error:", error);
    return NextResponse.json({ error: "Unable to update article" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const auth = await requireAdmin(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectDB();

    const articleId = getArticleId(req);
    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      return NextResponse.json({ error: "Invalid article id" }, { status: 400 });
    }

    const deleted = await Article.findByIdAndDelete(articleId);
    if (!deleted) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin article delete error:", error);
    return NextResponse.json({ error: "Unable to delete article" }, { status: 500 });
  }
}
