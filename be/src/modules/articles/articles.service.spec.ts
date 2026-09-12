import { describe, it, expect, beforeEach, vi } from "vitest";
import { ArticleStatus } from "@prisma/client";
import { ArticlesService } from "./articles.service.js";
import { PrismaService } from "../../database/prisma.service.js";
import { ERROR_CODES } from "../../common/constants/error-codes.constant.js";

describe("ArticlesService", () => {
  let service: ArticlesService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      category: {
        findUnique: vi.fn(),
      },
      article: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      tag: {
        upsert: vi.fn(),
      },
      articleTag: {
        deleteMany: vi.fn(),
        createMany: vi.fn(),
      },
      $transaction: vi.fn(async (callback: (tx: any) => Promise<unknown>) => {
        return callback(mockPrisma);
      }),
    };

    service = new ArticlesService(mockPrisma as unknown as PrismaService);
  });

  describe("create", () => {
    it("should create draft article with valid inputs", async () => {
      mockPrisma.article.findUnique.mockResolvedValue(null);
      mockPrisma.article.create.mockResolvedValue({
        id: "a1",
        title: "Bài viết mới",
        slug: "bai-viet-moi",
        content: "<p>Nội dung</p>",
        coverImageUrl: null,
        status: ArticleStatus.DRAFT,
        categoryId: null,
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: null,
        articleTags: [],
      });

      const result = await service.create({
        title: "Bài viết mới",
        content: "<p>Nội dung</p>",
      });

      expect(result.id).toBe("a1");
      expect(result.status).toBe(ArticleStatus.DRAFT);
      expect(result.slug).toBe("bai-viet-moi");
    });

    it("should create article with normalized tags", async () => {
      mockPrisma.article.findUnique.mockResolvedValue(null);
      mockPrisma.tag.upsert.mockResolvedValue({
        id: "t1",
        name: "review",
        slug: "review",
      });
      mockPrisma.article.create.mockResolvedValue({
        id: "a1",
        title: "Bài viết có tag",
        slug: "bai-viet-co-tag",
        content: "<p>Nội dung</p>",
        coverImageUrl: null,
        status: ArticleStatus.DRAFT,
        categoryId: null,
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: null,
        articleTags: [
          { tag: { id: "t1", name: "review", slug: "review" } },
        ],
      });

      const result = await service.create({
        title: "Bài viết có tag",
        content: "<p>Nội dung</p>",
        tags: ["#Review", "review", " "],
      });

      expect(result.tags).toHaveLength(1);
      expect(mockPrisma.tag.upsert).toHaveBeenCalledWith({
        where: { slug: "review" },
        update: { name: "Review" },
        create: { name: "Review", slug: "review" },
        select: { id: true },
      });
    });

    it("should throw NotFoundException if category does not exist", async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          title: "Bài viết",
          content: "<p>Test</p>",
          categoryId: "99999999-9999-9999-9999-999999999999",
        })
      ).rejects.toMatchObject({
        response: {
          code: ERROR_CODES.CATEGORY_NOT_FOUND,
        },
      });
    });

    it("should throw BadRequestException if category is inactive", async () => {
      mockPrisma.category.findUnique.mockResolvedValue({
        id: "c-inactive",
        name: "Inactive Category",
        isActive: false,
      });

      await expect(
        service.create({
          title: "Bài viết",
          content: "<p>Test</p>",
          categoryId: "c-inactive",
        })
      ).rejects.toMatchObject({
        response: {
          code: ERROR_CODES.CATEGORY_INACTIVE,
        },
      });
    });

    it("should set status to SCHEDULED if publishedAt is in the future", async () => {
      mockPrisma.article.findUnique.mockResolvedValue(null);
      const futureDate = new Date(Date.now() + 86400000).toISOString();

      mockPrisma.article.create.mockImplementation(({ data }: any) =>
        Promise.resolve({
          id: "a-scheduled",
          ...data,
          category: null,
          articleTags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      );

      const result = await service.create({
        title: "Bài viết hẹn giờ",
        content: "<p>Test</p>",
        status: ArticleStatus.PUBLISHED,
        publishedAt: futureDate,
      });

      expect(result.status).toBe(ArticleStatus.SCHEDULED);
    });

    it("should throw BadRequestException if SCHEDULED is requested with past date", async () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString();

      await expect(
        service.create({
          title: "Bài viết sai hẹn giờ",
          content: "<p>Test</p>",
          status: ArticleStatus.SCHEDULED,
          publishedAt: pastDate,
        })
      ).rejects.toMatchObject({
        response: {
          code: ERROR_CODES.INVALID_PUBLISH_DATE,
        },
      });
    });
  });

  describe("findAll", () => {
    it("should return paginated list of articles excluding soft deleted", async () => {
      mockPrisma.article.count.mockResolvedValue(1);
      mockPrisma.article.findMany.mockResolvedValue([
        {
          id: "a1",
          title: "Bài viết 1",
          slug: "bai-viet-1",
          coverImageUrl: null,
          status: ArticleStatus.PUBLISHED,
          categoryId: null,
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          category: null,
          articleTags: [],
        },
      ]);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        sort: "createdAt",
        order: "desc",
      });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
      expect(mockPrisma.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
          take: 10,
          skip: 0,
        })
      );
    });
  });

  describe("findById & findBySlug", () => {
    it("should return article details if found by id", async () => {
      mockPrisma.article.findFirst.mockResolvedValue({
        id: "a1",
        title: "Chi tiết bài viết",
        slug: "chi-tiet-bai-viet",
        content: "<p>Nội dung</p>",
        coverImageUrl: null,
        status: ArticleStatus.PUBLISHED,
        categoryId: null,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        category: null,
        articleTags: [],
      });

      const result = await service.findById("a1");
      expect(result.id).toBe("a1");
      expect(result.content).toBe("<p>Nội dung</p>");
    });

    it("should throw NotFoundException if article not found by id", async () => {
      mockPrisma.article.findFirst.mockResolvedValue(null);

      await expect(service.findById("non-existent")).rejects.toMatchObject({
        response: {
          code: ERROR_CODES.ARTICLE_NOT_FOUND,
        },
      });
    });

    it("should return article details if found by slug", async () => {
      mockPrisma.article.findFirst.mockResolvedValue({
        id: "a1",
        title: "Chi tiết bài viết",
        slug: "chi-tiet-bai-viet",
        content: "<p>Nội dung</p>",
        coverImageUrl: null,
        status: ArticleStatus.PUBLISHED,
        categoryId: null,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        category: null,
        articleTags: [],
      });

      const result = await service.findBySlug("chi-tiet-bai-viet");
      expect(result.slug).toBe("chi-tiet-bai-viet");
    });
  });

  describe("update", () => {
    it("should update article and synchronize tags atomically", async () => {
      mockPrisma.article.findFirst.mockImplementation((args: any) => {
        if (args?.where?.id === "a1") {
          return Promise.resolve({
            id: "a1",
            title: "Bài cũ",
            slug: "bai-cu",
            content: "<p>Cũ</p>",
            status: ArticleStatus.DRAFT,
            categoryId: null,
            publishedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        return Promise.resolve(null);
      });

      mockPrisma.article.update.mockResolvedValue({
        id: "a1",
        title: "Bài mới",
        slug: "bai-moi",
        content: "<p>Mới</p>",
        coverImageUrl: null,
        status: ArticleStatus.DRAFT,
        categoryId: null,
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: null,
        articleTags: [
          { tag: { id: "t2", name: "sale", slug: "sale" } },
        ],
      });

      mockPrisma.tag.upsert.mockResolvedValue({
        id: "t2",
        name: "sale",
        slug: "sale",
      });

      const result = await service.update("a1", {
        title: "Bài mới",
        content: "<p>Mới</p>",
        tags: ["sale"],
      });

      expect(result.title).toBe("Bài mới");
      expect(mockPrisma.articleTag.deleteMany).toHaveBeenCalledWith({
        where: { articleId: "a1" },
      });
      expect(mockPrisma.articleTag.createMany).toHaveBeenCalledWith({
        data: [{ articleId: "a1", tagId: "t2" }],
      });
    });

    it("should not allow updating archived article directly", async () => {
      mockPrisma.article.findFirst.mockResolvedValue({
        id: "a-archived",
        status: ArticleStatus.ARCHIVED,
      });

      await expect(
        service.update("a-archived", {
          status: ArticleStatus.PUBLISHED,
        })
      ).rejects.toMatchObject({
        response: {
          code: ERROR_CODES.ARTICLE_ALREADY_ARCHIVED,
        },
      });
    });
  });

  describe("publish & archive & soft delete", () => {
    it("should publish article immediately if no future date given", async () => {
      mockPrisma.article.findFirst.mockResolvedValue({
        id: "a1",
        status: ArticleStatus.DRAFT,
      });
      mockPrisma.article.update.mockResolvedValue({
        id: "a1",
        title: "Bài viết",
        slug: "bai-viet",
        content: "Nội dung",
        coverImageUrl: null,
        status: ArticleStatus.PUBLISHED,
        categoryId: null,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        category: null,
        articleTags: [],
      });

      const result = await service.publish("a1");
      expect(result.status).toBe(ArticleStatus.PUBLISHED);
      expect(mockPrisma.article.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: ArticleStatus.PUBLISHED,
          }),
        })
      );
    });

    it("should archive article successfully", async () => {
      mockPrisma.article.findFirst.mockResolvedValue({
        id: "a1",
        status: ArticleStatus.PUBLISHED,
      });
      mockPrisma.article.update.mockResolvedValue({
        id: "a1",
        title: "Bài viết",
        slug: "bai-viet",
        content: "Nội dung",
        coverImageUrl: null,
        status: ArticleStatus.ARCHIVED,
        categoryId: null,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        category: null,
        articleTags: [],
      });

      const result = await service.archive("a1");
      expect(result.status).toBe(ArticleStatus.ARCHIVED);
    });

    it("should soft delete article setting deletedAt timestamp", async () => {
      mockPrisma.article.findFirst.mockResolvedValue({
        id: "a1",
      });
      mockPrisma.article.update.mockResolvedValue({
        id: "a1",
        deletedAt: new Date(),
      });

      const result = await service.remove("a1");
      expect(result).toEqual({ deleted: true });
      expect(mockPrisma.article.update).toHaveBeenCalledWith({
        where: { id: "a1" },
        data: expect.objectContaining({
          deletedAt: expect.any(Date),
        }),
      });
    });
  });
});
