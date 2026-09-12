export type ArticleStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "PUBLISHED"
  | "ARCHIVED";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug?: string;
}

export interface TagSummary {
  id: string;
  name: string;
  slug?: string;
}

export interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  coverImageUrl: string | null;
  status: ArticleStatus;
  category: CategorySummary | null;
  tags: TagSummary[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Article extends ArticleListItem {
  content: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export interface ArticleQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: ArticleStatus;
  categoryId?: string;
  tag?: string;
  sort?: "createdAt" | "updatedAt" | "publishedAt" | "title";
  order?: "asc" | "desc";
}

export interface CreateArticleInput {
  title: string;
  content: string;
  coverImageUrl?: string;
  status?: ArticleStatus;
  categoryId?: string;
  tags?: string[];
  publishedAt?: string;
}

export interface UpdateArticleInput {
  title?: string;
  content?: string;
  coverImageUrl?: string;
  status?: ArticleStatus;
  categoryId?: string;
  tags?: string[];
  publishedAt?: string;
}

export interface PublishArticleInput {
  publishedAt?: string;
}
