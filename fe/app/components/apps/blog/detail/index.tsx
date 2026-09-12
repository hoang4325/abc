"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar,
  Edit,
  Trash2,
  Send,
  Archive,
  Tag as TagIcon,
  Clock,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { articlesService } from "@/lib/services/articles.service";
import { Article, ArticleStatus } from "@/lib/types/article";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast-simple";

interface BlogDetailDataProps {
  articleId?: string;
}

const statusBadgeConfig: Record<
  ArticleStatus,
  { label: string; className: string }
> = {
  PUBLISHED: { label: "Đã xuất bản", className: "bg-emerald-600 text-white" },
  SCHEDULED: { label: "Đã lên lịch", className: "bg-amber-500 text-white" },
  DRAFT: { label: "Bản nháp", className: "bg-zinc-500 text-white" },
  ARCHIVED: { label: "Đã lưu trữ", className: "bg-zinc-700 text-white" },
};

export default function BlogDetailData({ articleId }: BlogDetailDataProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  const resolvedId =
    articleId ||
    pathname.split("/").filter(Boolean).pop() ||
    "";

  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  const fetchArticle = useCallback(async () => {
    if (!resolvedId || resolvedId === "detail") return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await articlesService.getArticleById(resolvedId);
      setArticle(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không tìm thấy bài viết hoặc đã xảy ra lỗi."
      );
    } finally {
      setIsLoading(false);
    }
  }, [resolvedId]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const handlePublish = async () => {
    if (!article) return;
    setIsActionLoading(true);
    try {
      const updated = await articlesService.publishArticle(article.id);
      setArticle(updated);
      showToast("Bài viết đã được xuất bản thành công!", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Xuất bản bài viết thất bại",
        "error"
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!article) return;
    setIsActionLoading(true);
    try {
      const updated = await articlesService.archiveArticle(article.id);
      setArticle(updated);
      showToast("Bài viết đã được chuyển vào lưu trữ", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Lưu trữ bài viết thất bại",
        "error"
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!article) return;
    setIsActionLoading(true);
    try {
      await articlesService.deleteArticle(article.id);
      showToast("Xóa bài viết thành công", "success");
      setIsDeleteDialogOpen(false);
      router.push("/blogs");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Không thể xóa bài viết",
        "error"
      );
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-80 w-full rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 text-center bg-card border border-border rounded-xl">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
        <h3 className="text-xl font-bold mb-2">Không tìm thấy bài viết</h3>
        <p className="text-sm text-muted-foreground mb-6">
          {error || `Bài viết với ID "${resolvedId}" không tồn tại hoặc đã bị xóa.`}
        </p>
        <Link href="/blogs">
          <Button variant="outline" className="inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách bài viết</span>
          </Button>
        </Link>
      </div>
    );
  }

  const statusConfig =
    statusBadgeConfig[article.status] || statusBadgeConfig.DRAFT;
  const displayDate = article.publishedAt
    ? new Date(article.publishedAt)
    : new Date(article.createdAt);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/blogs">
          <Button variant="ghost" size="sm" className="inline-flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách</span>
          </Button>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/blogs/${article.id}/edit`}>
            <Button variant="outline" size="sm" className="inline-flex items-center gap-1.5">
              <Edit className="w-4 h-4" />
              <span>Chỉnh sửa</span>
            </Button>
          </Link>

          {article.status !== "PUBLISHED" && (
            <Button
              variant="default"
              size="sm"
              disabled={isActionLoading}
              onClick={handlePublish}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="w-4 h-4" />
              <span>Xuất bản ngay</span>
            </Button>
          )}

          {article.status !== "ARCHIVED" && (
            <Button
              variant="secondary"
              size="sm"
              disabled={isActionLoading}
              onClick={handleArchive}
              className="inline-flex items-center gap-1.5"
            >
              <Archive className="w-4 h-4" />
              <span>Lưu trữ</span>
            </Button>
          )}

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger
              className={cn(
                buttonVariants({ variant: "destructive", size: "sm" }),
                "inline-flex items-center gap-1.5 cursor-pointer"
              )}
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa bài viết</span>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Bạn có chắc muốn xóa bài viết này?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bài viết sẽ bị xóa khỏi danh sách. Bạn có thể khôi phục sau nếu hệ thống hỗ trợ.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Xóa bài viết
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card className="overflow-hidden border border-border shadow-sm">
        {article.coverImageUrl && (
          <div className="relative w-full h-[360px] md:h-[480px] bg-muted">
            <Image
              src={article.coverImageUrl}
              alt={article.title}
              fill
              priority
              className="object-cover object-center"
            />
          </div>
        )}

        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
            {article.category && (
              <Badge variant="secondary">{article.category.name}</Badge>
            )}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
              <Calendar className="w-4 h-4" />
              <span>
                {format(displayDate, "dd 'tháng' MM, yyyy HH:mm", {
                  locale: vi,
                })}
              </span>
            </div>
          </div>

          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground">
            {article.title}
          </h1>

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                <TagIcon className="w-3.5 h-3.5" /> Thẻ:
              </span>
              {article.tags.map((tag) => (
                <Badge key={tag.id} variant="outline" className="text-xs">
                  #{tag.name}
                </Badge>
              ))}
            </div>
          )}

          <div
            className="pt-6 border-t border-border prose prose-neutral dark:prose-invert max-w-none text-foreground leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          <div className="pt-8 border-t border-border flex flex-wrap justify-between text-xs text-muted-foreground gap-4">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Cập nhật lần cuối:{" "}
                {format(new Date(article.updatedAt), "dd/MM/yyyy HH:mm", {
                  locale: vi,
                })}
              </span>
            </div>
            <div>Slug: {article.slug}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
