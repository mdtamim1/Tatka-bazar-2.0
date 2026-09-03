import { use } from "react";
import { CategoryListing } from "@/components/category/CategoryListing";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params);
  return <CategoryListing initialSlug={resolvedParams.slug} />;
}
