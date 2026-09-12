import { Suspense } from "react";
import BreadcrumbComp from "@/app/(dashboard-layout)/layout/shared/breadcrumb/breadcrumb-comp";
import BlogDetailData from "@/app/components/apps/blog/detail";
import type { Metadata } from "next";
import StyleAwareWrapper from "@/app/components/shared/StyleAwareWrapper";
import StyleDivider from "@/app/components/shared/StyleDivider";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Chi tiết bài viết",
};

const BCrumb = [
  { to: "/", title: "Trang chủ" },
  { to: "/blogs", title: "Danh sách bài viết" },
  { title: "Chi tiết bài viết" },
];

function BlogDetailFallback() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

async function BlogDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BlogDetailData articleId={id} />;
}

export default function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <StyleAwareWrapper
      lyraClassName="flex flex-col p-px gap-px bg-border"
    >
      <BreadcrumbComp title="Chi tiết bài viết" items={BCrumb} />
      <StyleDivider />
      <Suspense fallback={<BlogDetailFallback />}>
        <BlogDetailContent params={params} />
      </Suspense>
    </StyleAwareWrapper>
  );
}
