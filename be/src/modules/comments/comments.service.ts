import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service.js";
import { CreateCommentDto } from "./dto/create-comment.dto.js";
import { CommentQueryDto } from "./dto/comment-query.dto.js";
import sanitizeHtml from "sanitize-html";

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  private sanitizeText(input: string): string {
    return sanitizeHtml(input, {
      allowedTags: ["b", "i", "em", "strong", "br", "p"],
      allowedAttributes: {},
      disallowedTagsMode: "discard",
    }).trim();
  }

  async create(articleId: string, dto: CreateCommentDto) {
    const article = await this.prisma.article.findFirst({
      where: { id: articleId, deletedAt: null },
      select: { id: true },
    });

    if (!article) {
      throw new NotFoundException(`Bài viết với id ${articleId} không tồn tại`);
    }

    if (dto.parentId) {
      const parentComment = await this.prisma.comment.findFirst({
        where: { id: dto.parentId, articleId, deletedAt: null },
        select: { id: true },
      });

      if (!parentComment) {
        throw new BadRequestException(
          "Bình luận cha không tồn tại hoặc không thuộc bài viết này"
        );
      }
    }

    const cleanContent = this.sanitizeText(dto.content);
    if (!cleanContent) {
      throw new BadRequestException("Nội dung bình luận không được để trống");
    }

    const cleanAuthorName = sanitizeHtml(dto.authorName, {
      allowedTags: [],
      allowedAttributes: {},
    }).trim();

    return this.prisma.comment.create({
      data: {
        articleId,
        authorName: cleanAuthorName || "Ẩn danh",
        authorAvatar: dto.authorAvatar?.trim() || null,
        content: cleanContent,
        parentId: dto.parentId || null,
      },
      include: {
        replies: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  async findAllByArticle(articleId: string, query: CommentQueryDto) {
    const article = await this.prisma.article.findFirst({
      where: { id: articleId, deletedAt: null },
      select: { id: true },
    });

    if (!article) {
      throw new NotFoundException(`Bài viết với id ${articleId} không tồn tại`);
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
    const skip = (page - 1) * limit;

    const [total, comments] = await Promise.all([
      this.prisma.comment.count({
        where: { articleId, deletedAt: null },
      }),
      this.prisma.comment.findMany({
        where: {
          articleId,
          parentId: null,
          deletedAt: null,
        },
        include: {
          replies: {
            where: { deletedAt: null },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      success: true,
      data: comments,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async delete(articleId: string, commentId: string) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, articleId, deletedAt: null },
      select: { id: true },
    });

    if (!comment) {
      throw new NotFoundException("Bình luận không tồn tại");
    }

    await this.prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    return { success: true, message: "Bình luận đã được xóa thành công" };
  }
}
