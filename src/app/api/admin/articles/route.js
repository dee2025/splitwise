import { requireAdmin } from "@/lib/adminAuth";
import { buildArticlePayload, validateArticlePayload } from "@/lib/adminArticlePayload";
import { normalizeArticle } from "@/lib/articleUtils";
import { connectDB } from "@/lib/db";
import Article from "@/models/Article";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const auth = await requireAdmin(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectDB();

    const articles = await Article.find({})
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      articles: articles.map(normalizeArticle),
    });
  } catch (error) {
    console.error("Admin articles fetch error:", error);
    return NextResponse.json({ error: "Unable to load articles" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await requireAdmin(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectDB();

    const body = await req.json();
    const payload = buildArticlePayload(body, auth.user._id);
    const errors = validateArticlePayload(payload);

    if (Object.keys(errors).length) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    const existing = await Article.findOne({ slug: payload.slug }).select("_id");
    if (existing) {
      return NextResponse.json(
        { error: "Validation failed", errors: { slug: "An article with this slug already exists." } },
        { status: 400 }
      );
    }

    const article = await Article.create(payload);

    return NextResponse.json({ article: normalizeArticle(article) }, { status: 201 });
  } catch (error) {
    console.error("Admin article create error:", error);
    return NextResponse.json({ error: "Unable to save article" }, { status: 500 });
  }
}
