import { ArticleStatus } from "@prisma/client";

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
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArticleDetailItem extends ArticleListItem {
  content: string;
}

export interface ArticleCategoryRelation {
  id: string;
  name: string;
  slug: string;
}

export interface ArticleTagRelation {
  tag: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ArticleWithRelations {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImageUrl: string | null;
  status: ArticleStatus;
  categoryId: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  category: ArticleCategoryRelation | null;
  articleTags: ArticleTagRelation[];
}

export interface ArticleListWithRelations {
  id: string;
  title: string;
  slug: string;
  coverImageUrl: string | null;
  status: ArticleStatus;
  categoryId: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  category: ArticleCategoryRelation | null;
  articleTags: ArticleTagRelation[];
}
