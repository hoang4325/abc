"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar, Tag as TagIcon } from "lucide-react";
import { ArticleListItem, ArticleStatus } from "@/lib/types/article";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface BlogCardProps {
  article: ArticleListItem;
}

const statusBadgeConfig: Record<
  ArticleStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }
> = {
  PUBLISHED: { label: "Đã xuất bản", variant: "default", className: "bg-emerald-600 hover:bg-emerald-700 text-white" },
  SCHEDULED: { label: "Đã lên lịch", variant: "secondary", className: "bg-amber-500 hover:bg-amber-600 text-white" },
  DRAFT: { label: "Bản nháp", variant: "outline", className: "border-muted-foreground text-muted-foreground" },
  ARCHIVED: { label: "Đã lưu trữ", variant: "destructive", className: "bg-zinc-600 hover:bg-zinc-700 text-white" },
};

const BlogCard = ({ article }: BlogCardProps) => {
  const { id, title, coverImageUrl, status, category, tags, publishedAt, createdAt } = article;
  const linkHref = `/blogs/${id}`;
  const editHref = `/blogs/${id}/edit`;
  const statusConfig = statusBadgeConfig[status] || statusBadgeConfig.DRAFT;

  const displayDate = publishedAt ? new Date(publishedAt) : new Date(createdAt);

  return (
    <div className="lg:col-span-4 md:col-span-6 col-span-12">
      <Card className="py-0! group card-hover h-full gap-2! flex flex-col justify-between overflow-hidden border border-border">
        <div>
          <Link href={linkHref} className="block">
            <div className="relative overflow-hidden h-[220px] bg-muted">
              {coverImageUrl ? (
                <Image
                  src={coverImageUrl}
                  alt={title}
                  fill
                  className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted/60 text-muted-foreground text-sm font-medium">
                  Chưa có ảnh bìa
                </div>
              )}
              <div className="absolute top-3 right-3">
                <Badge className={statusConfig.className} variant={statusConfig.variant}>
                  {statusConfig.label}
                </Badge>
              </div>
            </div>
          </Link>

          <div className="p-5 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {category && (
                <Badge variant="secondary" className="rounded-md font-medium">
                  {category.name}
                </Badge>
              )}
              {tags && tags.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TagIcon className="w-3 h-3" />
                  <span>{tags.slice(0, 2).map((t) => `#${t.name}`).join(" ")}</span>
                  {tags.length > 2 && <span>+{tags.length - 2}</span>}
                </div>
              )}
            </div>

            <h5 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              <Link href={linkHref}>{title}</Link>
            </h5>

            <div className="flex items-center text-xs text-muted-foreground gap-1.5 mt-auto">
              <Calendar className="w-3.5 h-3.5" />
              <span>{format(displayDate, "dd/MM/yyyy", { locale: vi })}</span>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 pt-3 border-t border-border flex items-center justify-between">
          <Link
            href={linkHref}
            className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            Xem bài viết &rarr;
          </Link>
          <Link
            href={editHref}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Chỉnh sửa
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default BlogCard;
