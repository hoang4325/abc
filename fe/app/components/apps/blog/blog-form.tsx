"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, X, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { ArticleStatus, Category } from "@/lib/types/article";
import { articlesService } from "@/lib/services/articles.service";
import { categoriesService } from "@/lib/services/categories.service";
import { tagsService } from "@/lib/services/tags.service";
import { mediaService } from "@/lib/services/media.service";
import { useToast } from "@/components/ui/toast-simple";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import TiptapEdit from "@/app/components/shared/editor/tiptap-edit";
import FileUploadMotion from "@/app/components/animated-components/file-uploadmotion";

interface BlogFormProps {
  mode: "create" | "edit";
  articleId?: string;
}

const statusOptions: { value: ArticleStatus; label: string }[] = [
  { value: "PUBLISHED", label: "Đã xuất bản" },
  { value: "DRAFT", label: "Bản nháp" },
  { value: "SCHEDULED", label: "Đã lên lịch" },
  { value: "ARCHIVED", label: "Đã lưu trữ" },
];

export default function BlogForm({ mode, articleId }: BlogFormProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(mode === "edit");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [status, setStatus] = useState<ArticleStatus>("DRAFT");
  const [categoryId, setCategoryId] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>("");
  const [publishDate, setPublishDate] = useState<Date | undefined>(undefined);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, tagsList] = await Promise.all([
          categoriesService.getCategories(),
          tagsService.getTags(),
        ]);
        setCategories(cats);
        setTagSuggestions(tagsList.map((t) => t.name));

        if (mode === "edit" && articleId) {
          const article = await articlesService.getArticleById(articleId);
          setTitle(article.title);
          setContent(article.content);
          setStatus(article.status);
          setCategoryId(article.category?.id || "");
          setTags(article.tags.map((t) => t.name));
          setExistingCoverUrl(article.coverImageUrl);
          if (article.publishedAt) {
            setPublishDate(new Date(article.publishedAt));
          }
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Không thể tải thông tin biểu mẫu."
        );
      } finally {
        setIsInitialLoading(false);
      }
    }

    loadData();
  }, [mode, articleId]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setErrorMessage("Vui lòng nhập tiêu đề bài viết.");
      return;
    }

    if (cleanTitle.length < 3) {
      setErrorMessage("Tiêu đề bài viết phải có ít nhất 3 ký tự.");
      return;
    }

    if (cleanTitle.length > 255) {
      setErrorMessage("Tiêu đề bài viết không được vượt quá 255 ký tự.");
      return;
    }

    const cleanContent = content.trim();
    if (!cleanContent || cleanContent === "<p></p>") {
      setErrorMessage("Vui lòng nhập nội dung cho bài viết.");
      return;
    }

    setIsSubmitting(true);

    try {
      let finalCoverUrl: string | undefined = existingCoverUrl || undefined;

      if (coverFile) {
        const uploadResult = await mediaService.uploadImage(coverFile);
        finalCoverUrl = uploadResult.url;
      }

      const publishedAtIso = publishDate ? publishDate.toISOString() : undefined;

      if (mode === "create") {
        const newArticle = await articlesService.createArticle({
          title: cleanTitle,
          content: cleanContent,
          coverImageUrl: finalCoverUrl,
          status,
          categoryId: categoryId || undefined,
          tags: tags.length > 0 ? tags : undefined,
          publishedAt: publishedAtIso,
        });

        showToast("Tạo bài viết thành công!", "success");
        router.push(`/blogs/${newArticle.id}`);
      } else if (mode === "edit" && articleId) {
        await articlesService.updateArticle(articleId, {
          title: cleanTitle,
          content: cleanContent,
          coverImageUrl: finalCoverUrl,
          status,
          categoryId: categoryId || undefined,
          tags,
          publishedAt: publishedAtIso,
        });

        showToast("Cập nhật bài viết thành công!", "success");
        router.push(`/blogs/${articleId}`);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi khi lưu bài viết. Vui lòng thử lại."
      );
      setIsSubmitting(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {errorMessage && (
        <div className="m-4 md:m-6 p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive text-sm font-medium flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:opacity-80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-12 gap-px bg-border">
        <div className="lg:col-span-8 col-span-12 bg-background">
          <div className="flex flex-col gap-px">
            <Card className="rounded-none border-0 shadow-none">
              <CardHeader className="p-6 border-b border-border">
                <CardTitle className="text-lg font-bold">
                  Thông tin bài viết
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label htmlFor="article-title" className="font-semibold text-sm">
                    Tiêu đề bài viết <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="article-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tiêu đề bài viết (từ 3 đến 255 ký tự)..."
                    className="mt-2"
                    required
                  />
                  <small className="text-xs text-muted-foreground mt-1.5 block">
                    Tiêu đề bài viết là bắt buộc và sẽ được dùng để tạo đường dẫn tự động (slug).
                  </small>
                </div>

                <div>
                  <Label className="font-semibold text-sm">
                    Nội dung bài viết <span className="text-destructive">*</span>
                  </Label>
                  <div className="mt-2">
                    <TiptapEdit value={content} onChange={setContent} />
                  </div>
                  <small className="text-xs text-muted-foreground mt-1.5 block">
                    Nội dung chi tiết được lưu dưới dạng HTML chuẩn và được lọc mã độc bảo mật.
                  </small>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-none border-0 shadow-none border-t border-border">
              <CardHeader className="p-6 border-b border-border">
                <CardTitle className="text-lg font-bold">Ảnh bìa bài viết</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <FileUploadMotion
                  initialPreviewUrl={existingCoverUrl}
                  onChange={(files) => setCoverFile(files[0] || null)}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-4 col-span-12 bg-background">
          <div className="flex flex-col gap-px h-full">
            <Card className="rounded-none border-0 shadow-none">
              <CardHeader className="p-6 border-b border-border">
                <CardTitle className="text-base font-bold flex justify-between items-center">
                  <span>Trạng thái bài viết</span>
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      status === "PUBLISHED"
                        ? "bg-emerald-500"
                        : status === "SCHEDULED"
                        ? "bg-amber-500"
                        : status === "DRAFT"
                        ? "bg-zinc-400"
                        : "bg-zinc-600"
                    )}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Select
                  value={status}
                  onValueChange={(val) => {
                    if (val) setStatus(val as ArticleStatus);
                  }}
                >
                  <SelectTrigger className="w-full" id="article-status">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Trạng thái</SelectLabel>
                      {statusOptions.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <small className="text-xs text-muted-foreground mt-2 block">
                  Thiết lập trạng thái xuất bản hoặc lưu trữ cho bài viết.
                </small>
              </CardContent>
            </Card>

            <Card className="rounded-none border-0 shadow-none border-t border-border">
              <CardHeader className="p-6 border-b border-border">
                <CardTitle className="text-base font-bold">Chuyên mục & Thẻ</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div>
                  <Label htmlFor="article-category" className="text-sm font-semibold">
                    Chuyên mục
                  </Label>
                  <Select
                    value={categoryId}
                    onValueChange={(val) => setCategoryId(val || "")}
                  >
                    <SelectTrigger className="w-full mt-2" id="article-category">
                      <SelectValue placeholder="Chọn chuyên mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-- Không có chuyên mục --</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="article-tags" className="text-sm font-semibold">
                    Thẻ (Tags)
                  </Label>
                  <div className="flex flex-wrap items-center gap-1.5 min-h-[42px] w-full rounded-md border border-input bg-background p-2 mt-2">
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-destructive transition-colors ml-0.5"
                          aria-label="Xóa thẻ"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}

                    <input
                      id="article-tags"
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder={
                        tags.length === 0 ? "Nhập thẻ và nhấn Enter..." : ""
                      }
                      className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                    />
                  </div>
                  <small className="text-xs text-muted-foreground mt-1.5 block">
                    Nhập tên thẻ rồi nhấn phím Enter để thêm.
                  </small>

                  {tagSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-xs text-muted-foreground mr-1">
                        Gợi ý:
                      </span>
                      {tagSuggestions.slice(0, 6).map((suggest, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (!tags.includes(suggest)) {
                              setTags([...tags, suggest]);
                            }
                          }}
                          className="text-xs text-muted-foreground hover:text-primary underline cursor-pointer"
                        >
                          #{suggest}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-none border-0 shadow-none border-t border-border flex-1">
              <CardHeader className="p-6 border-b border-border">
                <CardTitle className="text-base font-bold">Ngày xuất bản</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div>
                  <Label className="text-sm font-semibold block mb-2">
                    Thời điểm xuất bản
                  </Label>
                  <Popover>
                    <PopoverTrigger
                      type="button"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full justify-start text-left font-normal",
                        !publishDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {publishDate ? (
                        format(publishDate, "PPP", { locale: vi })
                      ) : (
                        <span>Chọn ngày xuất bản</span>
                      )}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={publishDate}
                        onSelect={setPublishDate}
                      />
                    </PopoverContent>
                  </Popover>
                  <small className="text-xs text-muted-foreground mt-2 block">
                    Nếu để trống khi chọn &quot;Đã xuất bản&quot;, hệ thống sẽ lấy thời gian hiện tại.
                  </small>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="col-span-12 bg-background p-6 border-t border-border">
          <div className="flex flex-wrap gap-3 items-center">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{mode === "create" ? "Đang tạo..." : "Đang lưu..."}</span>
                </>
              ) : (
                <span>{mode === "create" ? "Tạo bài viết" : "Lưu thay đổi"}</span>
              )}
            </Button>

            <Link href={mode === "edit" && articleId ? `/blogs/${articleId}` : "/blogs"}>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Hủy
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
