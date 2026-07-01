import KeywordLandingPage, { keywordPageMetadata } from "@/components/seo/KeywordLandingPage";
import { seoPageList, seoPages } from "@/data/seoPages";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return seoPageList.map((page) => ({
    seoSlug: page.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { seoSlug } = await params;
  const page = seoPages[seoSlug];

  if (!page) return {};

  return keywordPageMetadata(page);
}

export default async function SeoLandingPage({ params }) {
  const { seoSlug } = await params;
  const page = seoPages[seoSlug];

  if (!page) notFound();

  return <KeywordLandingPage page={page} />;
}
