import type { Metadata } from "next";
import BreadcrumbComp from "@/app/(dashboard-layout)/layout/shared/breadcrumb/breadcrumb-comp";
import StyleAwareWrapper from "@/app/components/shared/StyleAwareWrapper";
import StyleDivider from "@/app/components/shared/StyleDivider";
import BlogForm from "@/app/components/apps/blog/blog-form";

export const metadata: Metadata = {
  title: "Tạo bài viết",
};

const BCrumb = [
  { to: "/", title: "Trang chủ" },
  { to: "/blogs", title: "Danh sách bài viết" },
  { title: "Tạo bài viết" },
];

export default function BlogCreatePage() {
  return (
    <StyleAwareWrapper
      lyraClassName="flex flex-col p-px gap-px bg-border"
    >
      <BreadcrumbComp title="Tạo bài viết" items={BCrumb} />
      <StyleDivider />
      <BlogForm mode="create" />
    </StyleAwareWrapper>
  );
}
