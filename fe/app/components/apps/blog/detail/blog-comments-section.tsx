"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast-simple";
import { commentsService } from "@/lib/services/comments.service";
import { CommentItem } from "@/lib/types/comment";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale/vi";
import {
  MessageSquare,
  Send,
  CornerDownRight,
  User,
  Trash2,
  Loader2,
  X,
} from "lucide-react";

interface BlogCommentsSectionProps {
  articleId: string;
}

export default function BlogCommentsSection({
  articleId,
}: BlogCommentsSectionProps) {
  const { showToast } = useToast();

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [authorName, setAuthorName] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyAuthorName, setReplyAuthorName] = useState<string>("");
  const [replyContent, setReplyContent] = useState<string>("");
  const [isSubmittingReply, setIsSubmittingReply] = useState<boolean>(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!articleId) return;
    setIsLoading(true);
    try {
      const res = await commentsService.getComments(articleId);
      setComments(res.data);
      setTotalCount(res.meta.total);
    } catch {
      showToast("Không thể tải danh sách bình luận", "error");
    } finally {
      setIsLoading(false);
    }
  }, [articleId, showToast]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmitMainComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = authorName.trim();
    const cleanText = content.trim();

    if (!cleanName) {
      showToast("Vui lòng nhập tên của bạn", "error");
      return;
    }
    if (!cleanText) {
      showToast("Vui lòng nhập nội dung bình luận", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await commentsService.createComment(articleId, {
        authorName: cleanName,
        content: cleanText,
      });

      setComments((prev) => [res.data, ...prev]);
      setTotalCount((prev) => prev + 1);
      setContent("");
      showToast("Bình luận của bạn đã được đăng thành công!", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gửi bình luận thất bại",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    const cleanName = replyAuthorName.trim();
    const cleanText = replyContent.trim();

    if (!cleanName) {
      showToast("Vui lòng nhập tên của bạn", "error");
      return;
    }
    if (!cleanText) {
      showToast("Vui lòng nhập nội dung phản hồi", "error");
      return;
    }

    setIsSubmittingReply(true);
    try {
      const res = await commentsService.createComment(articleId, {
        authorName: cleanName,
        content: cleanText,
        parentId,
      });

      setComments((prev) =>
        prev.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), res.data],
            };
          }
          return c;
        })
      );
      setTotalCount((prev) => prev + 1);
      setReplyingToId(null);
      setReplyContent("");
      showToast("Đã gửi câu trả lời thành công!", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gửi phản hồi thất bại",
        "error"
      );
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDelete = async (commentId: string, isReply: boolean = false, parentId?: string) => {
    setDeletingId(commentId);
    try {
      await commentsService.deleteComment(articleId, commentId);
      if (isReply && parentId) {
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: (c.replies || []).filter((r) => r.id !== commentId),
              };
            }
            return c;
          })
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
      setTotalCount((prev) => Math.max(0, prev - 1));
      showToast("Bình luận đã được xóa", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Không thể xóa bình luận",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="mt-8 border-border bg-card">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <CardTitle className="text-xl font-bold">Bình luận bài viết</CardTitle>
          </div>
          <Badge variant="secondary" className="px-3 py-1 font-semibold">
            {totalCount} bình luận
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-8">
        <form onSubmit={handleSubmitMainComment} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tên của bạn *"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="pl-9"
                maxLength={100}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Viết cảm nghĩ hoặc đặt câu hỏi về bài viết này..."
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
              className="resize-none"
              required
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {content.length}/2000 ký tự
              </span>
              <Button
                type="submit"
                disabled={isSubmitting || !content.trim() || !authorName.trim()}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Gửi bình luận
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        <div className="pt-6 border-t border-border space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto stroke-1 text-muted-foreground/60" />
              <p className="text-sm font-medium">Chưa có bình luận nào</p>
              <p className="text-xs">Hãy là người đầu tiên để lại ý kiến về bài viết này!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-3">
                  <div className="flex items-start gap-3 group">
                    <Avatar className="w-9 h-9 shrink-0 border border-border">
                      {comment.authorAvatar && (
                        <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />
                      )}
                      <AvatarFallback className="font-semibold text-sm bg-primary/10 text-primary">
                        {comment.authorName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 bg-muted/40 rounded-lg p-3.5 border border-border/60">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-sm text-foreground">
                          {comment.authorName}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(comment.createdAt)}
                          </span>
                          <button
                            onClick={() => handleDelete(comment.id)}
                            disabled={deletingId === comment.id}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1 opacity-0 group-hover:opacity-100"
                            title="Xóa bình luận"
                          >
                            {deletingId === comment.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words leading-relaxed">
                        {comment.content}
                      </p>

                      <div className="mt-2 flex items-center gap-4">
                        <button
                          onClick={() => {
                            if (replyingToId === comment.id) {
                              setReplyingToId(null);
                            } else {
                              setReplyingToId(comment.id);
                              if (!replyAuthorName && authorName) {
                                setReplyAuthorName(authorName);
                              }
                            }
                          }}
                          className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
                        >
                          <CornerDownRight className="w-3 h-3" />
                          {replyingToId === comment.id ? "Hủy trả lời" : "Trả lời"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {replyingToId === comment.id && (
                    <div className="ml-12 pl-3 border-l-2 border-primary/40 space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          Trả lời @{comment.authorName}
                        </span>
                        <button
                          onClick={() => setReplyingToId(null)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <Input
                        placeholder="Tên của bạn *"
                        value={replyAuthorName}
                        onChange={(e) => setReplyAuthorName(e.target.value)}
                        className="h-8 text-xs max-w-xs"
                        maxLength={100}
                        required
                      />
                      <Textarea
                        placeholder={`Viết câu trả lời cho @${comment.authorName}...`}
                        rows={2}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="text-xs resize-none"
                        maxLength={2000}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setReplyingToId(null)}
                          className="h-7 text-xs px-2.5"
                        >
                          Hủy
                        </Button>
                        <Button
                          size="sm"
                          disabled={
                            isSubmittingReply ||
                            !replyContent.trim() ||
                            !replyAuthorName.trim()
                          }
                          onClick={() => handleSubmitReply(comment.id)}
                          className="h-7 text-xs px-3 gap-1.5"
                        >
                          {isSubmittingReply ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" /> Đang gửi...
                            </>
                          ) : (
                            <>
                              <Send className="w-3 h-3" /> Gửi
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-8 sm:ml-12 pl-4 border-l-2 border-border/80 space-y-3 pt-1">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-2.5 group/reply">
                          <Avatar className="w-7 h-7 shrink-0 border border-border">
                            {reply.authorAvatar && (
                              <AvatarImage src={reply.authorAvatar} alt={reply.authorName} />
                            )}
                            <AvatarFallback className="font-semibold text-xs bg-muted text-muted-foreground">
                              {reply.authorName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0 bg-muted/20 rounded-md p-2.5 border border-border/40">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span className="font-semibold text-xs text-foreground">
                                {reply.authorName}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-muted-foreground">
                                  {formatTime(reply.createdAt)}
                                </span>
                                <button
                                  onClick={() => handleDelete(reply.id, true, comment.id)}
                                  disabled={deletingId === reply.id}
                                  className="text-muted-foreground hover:text-destructive transition-colors p-0.5 opacity-0 group-hover/reply:opacity-100"
                                  title="Xóa câu trả lời"
                                >
                                  {deletingId === reply.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>

                            <p className="text-xs text-foreground/90 whitespace-pre-wrap break-words leading-relaxed">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
