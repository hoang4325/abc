import BreadcrumbComp from "@/app/(dashboard-layout)/layout/shared/breadcrumb/breadcrumb-comp";
import BlogPost from "@/app/components/apps/blog/blog-post";
import { Metadata } from "next";
import StyleAwareWrapper from "@/app/components/shared/StyleAwareWrapper";
import StyleDivider from "@/app/components/shared/StyleDivider";

const BCrumb = [
  { to: "/", title: "Trang chủ" },
  { title: "Danh sách bài viết" },
];

export const metadata: Metadata = {
  title: "Danh sách bài viết",
};

const BlogPage = () => {
  return (
    <StyleAwareWrapper
      lyraClassName="flex flex-col p-px gap-px bg-border"
    >
      <BreadcrumbComp title="Danh sách bài viết" items={BCrumb} />
      <StyleDivider />
      <BlogPost />
    </StyleAwareWrapper>
  );
};

export default BlogPage;
