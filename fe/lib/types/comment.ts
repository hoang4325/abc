export interface CommentReplyItem {
  id: string;
  articleId: string;
  authorName: string;
  authorAvatar?: string | null;
  content: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommentItem {
  id: string;
  articleId: string;
  authorName: string;
  authorAvatar?: string | null;
  content: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  replies?: CommentReplyItem[];
}

export interface CreateCommentInput {
  authorName: string;
  authorAvatar?: string;
  content: string;
  parentId?: string;
}

export interface CommentsResponse {
  success: boolean;
  data: CommentItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
