"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, RotateCcw, Plus, AlertCircle, Inbox } from "lucide-react";
import { articlesService } from "@/lib/services/articles.service";
import { categoriesService } from "@/lib/services/categories.service";
import { ArticleListItem, ArticleStatus, Category, PaginationMeta } from "@/lib/types/article";
import BlogCard from "./blog-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  ALL: "Tất cả trạng thái",
  PUBLISHED: "Đã xuất bản",
  SCHEDULED: "Đã lên lịch",
  DRAFT: "Bản nháp",
  ARCHIVED: "Đã lưu trữ",
};

const SORT_LABELS: Record<string, string> = {
  createdAt_desc: "Mới nhất trước",
  createdAt_asc: "Cũ nhất trước",
  publishedAt_desc: "Ngày xuất bản",
  title_asc: "Tiêu đề A-Z",
  title_desc: "Tiêu đề Z-A",
};

export default function BlogListing() {
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 1,
  });

  const [page, setPage] = useState<number>(1);
  const [searchInput, setSearchInput] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await categoriesService.getCategories();
        setCategories(data);
      } catch {
      }
    }
    loadCategories();
  }, []);

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [sortField, orderDirection] =
        sortOrder && sortOrder.includes("_")
          ? (sortOrder.split("_") as [
              "createdAt" | "updatedAt" | "publishedAt" | "title",
              "asc" | "desc"
            ])
          : (["createdAt", "desc"] as const);

      const result = await articlesService.getArticles({
        page,
        limit: 9,
        search: debouncedSearch || undefined,
        status:
          status && status !== "ALL" ? (status as ArticleStatus) : undefined,
        categoryId:
          categoryId && categoryId !== "ALL" ? categoryId : undefined,
        sort: sortField,
        order: orderDirection,
      });

      setArticles(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách bài viết. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, status, categoryId, sortOrder]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleResetFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setStatus("");
    setCategoryId("");
    setSortOrder("");
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 bg-background">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm kiếm theo tiêu đề, nội dung, thẻ..."
            className="pl-10! ps-10!"
          />
        </div>

        <div className="flex flex-wrap gap-2.5 items-center">
          <Select
            value={status}
            onValueChange={(val) => {
              setStatus(val || "");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Trạng thái">
                {(val: string | null) => (val && STATUS_LABELS[val]) || "Trạng thái"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="PUBLISHED">Đã xuất bản</SelectItem>
              <SelectItem value="SCHEDULED">Đã lên lịch</SelectItem>
              <SelectItem value="DRAFT">Bản nháp</SelectItem>
              <SelectItem value="ARCHIVED">Đã lưu trữ</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={categoryId}
            onValueChange={(val) => {
              setCategoryId(val || "");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Chuyên mục">
                {(val: string | null) =>
                  val === "ALL"
                    ? "Tất cả chuyên mục"
                    : (val && categories.find((c) => c.id === val)?.name) ||
                      "Chuyên mục"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả chuyên mục</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortOrder}
            onValueChange={(val) => {
              setSortOrder(val || "");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Sắp xếp">
                {(val: string | null) => (val && SORT_LABELS[val]) || "Sắp xếp"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt_desc">Mới nhất trước</SelectItem>
              <SelectItem value="createdAt_asc">Cũ nhất trước</SelectItem>
              <SelectItem value="publishedAt_desc">Ngày xuất bản</SelectItem>
              <SelectItem value="title_asc">Tiêu đề A-Z</SelectItem>
              <SelectItem value="title_desc">Tiêu đề Z-A</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleResetFilters}
            title="Đặt lại bộ lọc"
            aria-label="Đặt lại bộ lọc"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          <Link href="/blogs/create">
            <Button className="inline-flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Tạo bài viết</span>
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-12 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="lg:col-span-4 md:col-span-6 col-span-12">
              <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                <Skeleton className="h-48 w-full rounded-md" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <div className="pt-2 border-t border-border flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 px-4 rounded-lg border border-destructive/30 bg-destructive/5">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-foreground mb-1">
            Đã xảy ra lỗi khi tải dữ liệu
          </h4>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            {error}
          </p>
          <Button onClick={fetchArticles} variant="outline">
            Thử lại
          </Button>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-lg border border-dashed border-border bg-card">
          <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-foreground mb-1">
            {debouncedSearch || status !== "ALL" || categoryId !== "ALL"
              ? "Không tìm thấy bài viết phù hợp"
              : "Chưa có bài viết nào"}
          </h4>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            {debouncedSearch || status !== "ALL" || categoryId !== "ALL"
              ? "Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh các bộ lọc để có kết quả."
              : "Bắt đầu tạo bài viết đầu tiên cho hệ thống ShareDeal ngay bây giờ."}
          </p>
          {debouncedSearch || status !== "ALL" || categoryId !== "ALL" ? (
            <Button onClick={handleResetFilters} variant="outline">
              Xóa bộ lọc
            </Button>
          ) : (
            <Link href="/blogs/create">
              <Button className="inline-flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>Tạo bài viết mới</span>
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-12 gap-6">
            {articles.map((article) => (
              <BlogCard key={article.id} article={article} />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Hiển thị bài viết {(meta.page - 1) * meta.limit + 1} -{" "}
              {Math.min(meta.page * meta.limit, meta.total)} trên tổng số{" "}
              <span className="font-semibold text-foreground">{meta.total}</span> bài viết
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Trang trước
              </Button>

              <div className="text-sm font-medium px-2">
                Trang {meta.page} / {meta.totalPages || 1}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, meta.totalPages))}
              >
                Trang sau
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
