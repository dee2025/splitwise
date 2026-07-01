import mongoose from "mongoose";

const SourceSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "" },
    url: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const FaqSchema = new mongoose.Schema(
  {
    question: { type: String, trim: true, default: "" },
    answer: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 12,
      maxlength: 140,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
      minlength: 80,
      maxlength: 260,
    },
    content: {
      type: String,
      required: true,
      minlength: 650,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      default: "Expense Guides",
    },
    tags: {
      type: [String],
      default: [],
    },
    keywords: {
      type: String,
      trim: true,
      default: "",
    },
    thumbnail: {
      type: String,
      trim: true,
      default: "/images/articles/friends-expenses.png",
    },
    authorName: {
      type: String,
      trim: true,
      default: "Money Split Editorial Team",
    },
    reviewerName: {
      type: String,
      trim: true,
      default: "",
    },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: 70,
      default: "",
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: 170,
      default: "",
    },
    sources: {
      type: [SourceSchema],
      default: [],
    },
    faqs: {
      type: [FaqSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

ArticleSchema.index({ title: "text", excerpt: "text", content: "text" });
ArticleSchema.index({ status: 1, publishedAt: -1 });

export default mongoose.models.Article || mongoose.model("Article", ArticleSchema);
