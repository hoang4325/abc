import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { ArticleStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service.js";
import { CreateArticleDto } from "./dto/create-article.dto.js";
import { UpdateArticleDto } from "./dto/update-article.dto.js";
import { ArticleQueryDto } from "./dto/article-query.dto.js";
import { PublishArticleDto } from "./dto/publish-article.dto.js";
import {
  ArticleDetailItem,
  ArticleListItem,
  ArticleListWithRelations,
  ArticleWithRelations,
} from "./types/article.types.js";
import { resolveUniqueSlug, normalizeTags } from "../../common/utils/slug.util.js";
import { sanitizeArticleHtml } from "../../common/utils/html-sanitizer.util.js";
import { ERROR_CODES } from "../../common/constants/error-codes.constant.js";

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateArticleDto): Promise<ArticleDetailItem> {
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException({
          code: ERROR_CODES.CATEGORY_NOT_FOUND,
          message: "Category not found",
        });
      }
      if (!category.isActive) {
        throw new BadRequestException({
          code: ERROR_CODES.CATEGORY_INACTIVE,
          message: "Category is inactive",
        });
      }
    }

    const { status, publishedAt } = this.resolvePublishingState(
      dto.status,
      dto.publishedAt
    );

    const slug = await resolveUniqueSlug(dto.title, async (candidate) => {
      const existing = await this.prisma.article.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      return Boolean(existing);
    });

    const sanitizedContent = sanitizeArticleHtml(dto.content);
    const normalizedTags = normalizeTags(dto.tags ?? []);

    return this.prisma.$transaction(async (tx) => {
      const tagIds: string[] = [];
      for (const item of normalizedTags) {
        const tag = await tx.tag.upsert({
          where: { slug: item.slug },
          update: { name: item.name },
          create: { name: item.name, slug: item.slug },
          select: { id: true },
        });
        tagIds.push(tag.id);
      }

      const article = await tx.article.create({
        data: {
          title: dto.title.trim(),
          slug,
          content: sanitizedContent,
          coverImageUrl: dto.coverImageUrl,
          status,
          categoryId: dto.categoryId,
          publishedAt,
          articleTags: {
            create: tagIds.map((tagId) => ({ tagId })),
          },
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          articleTags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      return this.formatArticleDetail(article);
    });
  }

  async findAll(query: ArticleQueryDto): Promise<{
    data: ArticleListItem[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ArticleWhereInput = {
      deletedAt: null,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.tag) {
      const tagFilter = query.tag.trim();
      where.articleTags = {
        some: {
          tag: {
            OR: [
              { slug: tagFilter },
              { name: { contains: tagFilter, mode: "insensitive" } },
            ],
          },
        },
      };
    }

    if (query.search) {
      const keyword = query.search.trim();
      where.OR = [
        { title: { contains: keyword, mode: "insensitive" } },
        { content: { contains: keyword, mode: "insensitive" } },
        {
          category: {
            name: { contains: keyword, mode: "insensitive" },
          },
        },
        {
          articleTags: {
            some: {
              tag: {
                name: { contains: keyword, mode: "insensitive" },
              },
            },
          },
        },
      ];
    }

    const sortField = query.sort ?? "createdAt";
    const orderDirection = query.order ?? "desc";

    const [total, articles] = await Promise.all([
      this.prisma.article.count({ where }),
      this.prisma.article.findMany({
        where,
        orderBy: {
          [sortField]: orderDirection,
        },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          coverImageUrl: true,
          status: true,
          categoryId: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          articleTags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: articles.map((article) => this.formatArticleListItem(article)),
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findById(id: string): Promise<ArticleDetailItem> {
    const article = await this.prisma.article.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        articleTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException({
        code: ERROR_CODES.ARTICLE_NOT_FOUND,
        message: "Article not found",
      });
    }

    return this.formatArticleDetail(article);
  }

  async findBySlug(slug: string): Promise<ArticleDetailItem> {
    const article = await this.prisma.article.findFirst({
      where: {
        slug,
        deletedAt: null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        articleTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException({
        code: ERROR_CODES.ARTICLE_NOT_FOUND,
        message: "Article not found",
      });
    }

    return this.formatArticleDetail(article);
  }

  async update(id: string, dto: UpdateArticleDto): Promise<ArticleDetailItem> {
    const existing = await this.prisma.article.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException({
        code: ERROR_CODES.ARTICLE_NOT_FOUND,
        message: "Article not found",
      });
    }

    if (
      existing.status === ArticleStatus.ARCHIVED &&
      dto.status &&
      dto.status !== ArticleStatus.ARCHIVED
    ) {
      throw new BadRequestException({
        code: ERROR_CODES.ARTICLE_ALREADY_ARCHIVED,
        message: "Archived article cannot be reopened directly",
      });
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException({
          code: ERROR_CODES.CATEGORY_NOT_FOUND,
          message: "Category not found",
        });
      }
      if (!category.isActive) {
        throw new BadRequestException({
          code: ERROR_CODES.CATEGORY_INACTIVE,
          message: "Category is inactive",
        });
      }
    }

    let slug = existing.slug;
    if (
      dto.title &&
      dto.title.trim() !== existing.title &&
      existing.status === ArticleStatus.DRAFT
    ) {
      slug = await resolveUniqueSlug(dto.title, async (candidate) => {
        const found = await this.prisma.article.findFirst({
          where: {
            slug: candidate,
            id: { not: id },
          },
          select: { id: true },
        });
        return Boolean(found);
      });
    }

    let contentToUpdate = existing.content;
    if (dto.content !== undefined) {
      contentToUpdate = sanitizeArticleHtml(dto.content);
    }

    let statusToUpdate = existing.status;
    let publishedAtToUpdate = existing.publishedAt;

    if (dto.status !== undefined || dto.publishedAt !== undefined) {
      const resolved = this.resolvePublishingState(
        dto.status ?? existing.status,
        dto.publishedAt ?? existing.publishedAt?.toISOString()
      );
      statusToUpdate = resolved.status;
      publishedAtToUpdate = resolved.publishedAt;
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.tags !== undefined) {
        const normalized = normalizeTags(dto.tags);
        const tagIds: string[] = [];
        for (const item of normalized) {
          const tag = await tx.tag.upsert({
            where: { slug: item.slug },
            update: { name: item.name },
            create: { name: item.name, slug: item.slug },
            select: { id: true },
          });
          tagIds.push(tag.id);
        }

        await tx.articleTag.deleteMany({
          where: { articleId: id },
        });

        if (tagIds.length > 0) {
          await tx.articleTag.createMany({
            data: tagIds.map((tagId) => ({ articleId: id, tagId })),
          });
        }
      }

      const updated = await tx.article.update({
        where: { id },
        data: {
          ...(dto.title ? { title: dto.title.trim() } : {}),
          slug,
          content: contentToUpdate,
          ...(dto.coverImageUrl !== undefined
            ? { coverImageUrl: dto.coverImageUrl }
            : {}),
          status: statusToUpdate,
          ...(dto.categoryId !== undefined
            ? { categoryId: dto.categoryId }
            : {}),
          publishedAt: publishedAtToUpdate,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          articleTags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      return this.formatArticleDetail(updated);
    });
  }

  async publish(
    id: string,
    dto?: PublishArticleDto
  ): Promise<ArticleDetailItem> {
    const existing = await this.prisma.article.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException({
        code: ERROR_CODES.ARTICLE_NOT_FOUND,
        message: "Article not found",
      });
    }

    if (existing.status === ArticleStatus.ARCHIVED) {
      throw new BadRequestException({
        code: ERROR_CODES.ARTICLE_ALREADY_ARCHIVED,
        message: "Archived article cannot be published",
      });
    }

    const targetDate = dto?.publishedAt ? new Date(dto.publishedAt) : new Date();
    let status: ArticleStatus;
    let publishedAt: Date;

    if (targetDate.getTime() > Date.now()) {
      status = ArticleStatus.SCHEDULED;
      publishedAt = targetDate;
    } else {
      status = ArticleStatus.PUBLISHED;
      publishedAt = targetDate;
    }

    const updated = await this.prisma.article.update({
      where: { id },
      data: {
        status,
        publishedAt,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        articleTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return this.formatArticleDetail(updated);
  }

  async archive(id: string): Promise<ArticleDetailItem> {
    const existing = await this.prisma.article.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException({
        code: ERROR_CODES.ARTICLE_NOT_FOUND,
        message: "Article not found",
      });
    }

    const updated = await this.prisma.article.update({
      where: { id },
      data: {
        status: ArticleStatus.ARCHIVED,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        articleTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return this.formatArticleDetail(updated);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const existing = await this.prisma.article.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException({
        code: ERROR_CODES.ARTICLE_NOT_FOUND,
        message: "Article not found",
      });
    }

    await this.prisma.article.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { deleted: true };
  }

  private resolvePublishingState(
    statusInput?: ArticleStatus,
    publishedAtInput?: string
  ): { status: ArticleStatus; publishedAt: Date | null } {
    const currentStatus = statusInput ?? ArticleStatus.DRAFT;

    if (currentStatus === ArticleStatus.PUBLISHED) {
      if (!publishedAtInput) {
        return {
          status: ArticleStatus.PUBLISHED,
          publishedAt: new Date(),
        };
      }
      const date = new Date(publishedAtInput);
      if (date.getTime() > Date.now()) {
        return {
          status: ArticleStatus.SCHEDULED,
          publishedAt: date,
        };
      }
      return {
        status: ArticleStatus.PUBLISHED,
        publishedAt: date,
      };
    }

    if (currentStatus === ArticleStatus.SCHEDULED) {
      if (!publishedAtInput) {
        throw new BadRequestException({
          code: ERROR_CODES.INVALID_PUBLISH_DATE,
          message: "Scheduled status requires a publishedAt date in the future",
        });
      }
      const date = new Date(publishedAtInput);
      if (date.getTime() <= Date.now()) {
        throw new BadRequestException({
          code: ERROR_CODES.INVALID_PUBLISH_DATE,
          message: "Scheduled date must be in the future",
        });
      }
      return {
        status: ArticleStatus.SCHEDULED,
        publishedAt: date,
      };
    }

    return {
      status: currentStatus,
      publishedAt: publishedAtInput ? new Date(publishedAtInput) : null,
    };
  }

  private formatArticleListItem(article: ArticleListWithRelations): ArticleListItem {
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      coverImageUrl: article.coverImageUrl,
      status: article.status,
      category: article.category
        ? {
            id: article.category.id,
            name: article.category.name,
            slug: article.category.slug,
          }
        : null,
      tags: article.articleTags.map((at) => ({
        id: at.tag.id,
        name: at.tag.name,
        slug: at.tag.slug,
      })),
      publishedAt: article.publishedAt,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };
  }

  private formatArticleDetail(article: ArticleWithRelations): ArticleDetailItem {
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      coverImageUrl: article.coverImageUrl,
      status: article.status,
      category: article.category
        ? {
            id: article.category.id,
            name: article.category.name,
            slug: article.category.slug,
          }
        : null,
      tags: article.articleTags.map((at) => ({
        id: at.tag.id,
        name: at.tag.name,
        slug: at.tag.slug,
      })),
      publishedAt: article.publishedAt,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };
  }
}
