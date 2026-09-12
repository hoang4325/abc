import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { CommentsService } from "./comments.service.js";
import { PrismaService } from "../../database/prisma.service.js";

describe("CommentsService", () => {
  let service: CommentsService;
  let mockPrisma: {
    article: {
      findFirst: ReturnType<typeof vi.fn>;
    };
    comment: {
      findFirst: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    mockPrisma = {
      article: {
        findFirst: vi.fn(),
      },
      comment: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };

    service = new CommentsService(mockPrisma as unknown as PrismaService);
  });

  describe("create", () => {
    it("should throw NotFoundException if article does not exist", async () => {
      mockPrisma.article.findFirst.mockResolvedValue(null);

      await expect(
        service.create("article-uuid", {
          authorName: "John Doe",
          content: "Great post!",
        })
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if parent comment is not found", async () => {
      mockPrisma.article.findFirst.mockResolvedValue({ id: "article-uuid" });
      mockPrisma.comment.findFirst.mockResolvedValue(null);

      await expect(
        service.create("article-uuid", {
          authorName: "John Doe",
          content: "Reply text",
          parentId: "invalid-parent-uuid",
        })
      ).rejects.toThrow(BadRequestException);
    });

    it("should create comment successfully with valid data", async () => {
      mockPrisma.article.findFirst.mockResolvedValue({ id: "article-uuid" });
      mockPrisma.comment.create.mockResolvedValue({
        id: "comment-uuid",
        articleId: "article-uuid",
        authorName: "John Doe",
        authorAvatar: null,
        content: "Great post!",
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        replies: [],
      });

      const result = await service.create("article-uuid", {
        authorName: "John Doe",
        content: "Great post!",
      });

      expect(result.id).toBe("comment-uuid");
      expect(result.authorName).toBe("John Doe");
      expect(mockPrisma.comment.create).toHaveBeenCalled();
    });
  });

  describe("findAllByArticle", () => {
    it("should return paginated comments for article", async () => {
      mockPrisma.article.findFirst.mockResolvedValue({ id: "article-uuid" });
      mockPrisma.comment.count.mockResolvedValue(1);
      mockPrisma.comment.findMany.mockResolvedValue([
        {
          id: "comment-uuid",
          articleId: "article-uuid",
          authorName: "John Doe",
          content: "Great post!",
          parentId: null,
          replies: [],
        },
      ]);

      const result = await service.findAllByArticle("article-uuid", {
        page: 1,
        limit: 20,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe("delete", () => {
    it("should soft delete comment", async () => {
      mockPrisma.comment.findFirst.mockResolvedValue({ id: "comment-uuid" });
      mockPrisma.comment.update.mockResolvedValue({
        id: "comment-uuid",
        deletedAt: new Date(),
      });

      const result = await service.delete("article-uuid", "comment-uuid");
      expect(result.success).toBe(true);
      expect(mockPrisma.comment.update).toHaveBeenCalled();
    });
  });
});
