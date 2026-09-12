import { Suspense } from "react";
import type { Metadata } from "next";
import BreadcrumbComp from "@/app/(dashboard-layout)/layout/shared/breadcrumb/breadcrumb-comp";
import StyleAwareWrapper from "@/app/components/shared/StyleAwareWrapper";
import StyleDivider from "@/app/components/shared/StyleDivider";
import { Skeleton } from "@/components/ui/skeleton";
import BlogForm from "@/app/components/apps/blog/blog-form";

export const metadata: Metadata = {
  title: "Chỉnh sửa bài viết",
};

const BCrumb = [
  { to: "/", title: "Trang chủ" },
  { to: "/blogs", title: "Danh sách bài viết" },
  { title: "Chỉnh sửa bài viết" },
];

function BlogEditFallback() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

async function BlogEditContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BlogForm mode="edit" articleId={id} />;
}

export default function BlogEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <StyleAwareWrapper
      lyraClassName="flex flex-col p-px gap-px bg-border"
    >
      <BreadcrumbComp title="Chỉnh sửa bài viết" items={BCrumb} />
      <StyleDivider />
      <Suspense fallback={<BlogEditFallback />}>
        <BlogEditContent params={params} />
      </Suspense>
    </StyleAwareWrapper>
  );
}
