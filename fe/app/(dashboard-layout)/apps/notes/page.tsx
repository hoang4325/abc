import NotesApp from "@/app/components/apps/notes";
import type { Metadata } from "next";
import BreadcrumbComp from "../../layout/shared/breadcrumb/breadcrumb-comp";
import StyleAwareWrapper from "@/app/components/shared/StyleAwareWrapper";
import StyleDivider from "@/app/components/shared/StyleDivider";

export const metadata: Metadata = {
  title: "Ghi chú",
};

const BCrumb = [
  { to: "/", title: "Trang chủ" },
  { title: "Ghi chú" },
];

const Notes = () => {
  return (
    <StyleAwareWrapper
      lyraClassName="flex flex-col p-px gap-px bg-border"
    >
      <BreadcrumbComp title="Ghi chú" items={BCrumb} />
      <StyleDivider />
      <NotesApp />
    </StyleAwareWrapper>
  );
};

export default Notes;
