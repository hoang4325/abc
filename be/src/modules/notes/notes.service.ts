import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Prisma, NoteColor } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service.js";
import { CreateNoteDto } from "./dto/create-note.dto.js";
import { UpdateNoteDto } from "./dto/update-note.dto.js";
import { NoteQueryDto } from "./dto/note-query.dto.js";
import { ERROR_CODES } from "../../common/constants/error-codes.constant.js";
import sanitizeHtml from "sanitize-html";

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  private stripHtml(input: string): string {
    return sanitizeHtml(input, {
      allowedTags: [],
      allowedAttributes: {},
    }).trim();
  }

  private generateTitleFromContent(content: string): string {
    const plainText = this.stripHtml(content).replace(/\s+/g, " ");
    const chars = Array.from(plainText);
    if (chars.length <= 80) {
      return plainText;
    }
    return chars.slice(0, 80).join("") + "...";
  }

  private generateContentPreview(content: string): string {
    const plainText = this.stripHtml(content).replace(/\s+/g, " ");
    const chars = Array.from(plainText);
    if (chars.length <= 120) {
      return plainText;
    }
    return chars.slice(0, 120).join("") + "...";
  }

  async create(dto: CreateNoteDto) {
    const trimmedContent = dto.content ? dto.content.trim() : "";
    if (!trimmedContent) {
      throw new BadRequestException({
        code: ERROR_CODES.NOTE_CONTENT_REQUIRED,
        message: "Nội dung ghi chú không được để trống",
      });
    }

    let resolvedTitle = dto.title ? dto.title.trim() : "";
    if (!resolvedTitle) {
      resolvedTitle = this.generateTitleFromContent(trimmedContent);
    }

    return this.prisma.note.create({
      data: {
        title: resolvedTitle || null,
        content: dto.content,
        color: dto.color || NoteColor.YELLOW,
      },
    });
  }

  async findAll(query: NoteQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.NoteWhereInput = {
      deletedAt: null,
    };

    if (query.color) {
      where.color = query.color;
    }

    if (query.search && query.search.trim()) {
      const keyword = query.search.trim();
      where.OR = [
        {
          title: {
            contains: keyword,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: keyword,
            mode: "insensitive",
          },
        },
      ];
    }

    const sortField = query.sort || "updatedAt";
    const orderDirection = query.order || "desc";

    const [total, notes] = await Promise.all([
      this.prisma.note.count({ where }),
      this.prisma.note.findMany({
        where,
        orderBy: {
          [sortField]: orderDirection,
        },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    const formattedNotes = notes.map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      contentPreview: this.generateContentPreview(note.content),
      color: note.color,
      userId: note.userId,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }));

    return {
      data: formattedNotes,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findOne(id: string) {
    const note = await this.prisma.note.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!note) {
      throw new NotFoundException({
        code: ERROR_CODES.NOTE_NOT_FOUND,
        message: `Ghi chú với id ${id} không tồn tại`,
      });
    }

    return note;
  }

  async update(id: string, dto: UpdateNoteDto) {
    const existingNote = await this.prisma.note.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingNote) {
      throw new NotFoundException({
        code: ERROR_CODES.NOTE_NOT_FOUND,
        message: `Ghi chú với id ${id} không tồn tại`,
      });
    }

    const dataToUpdate: Prisma.NoteUpdateInput = {};

    if (dto.color !== undefined) {
      dataToUpdate.color = dto.color;
    }

    if (dto.content !== undefined) {
      const trimmed = dto.content.trim();
      if (!trimmed) {
        throw new BadRequestException({
          code: ERROR_CODES.NOTE_CONTENT_REQUIRED,
          message: "Nội dung ghi chú không được để trống",
        });
      }
      dataToUpdate.content = dto.content;
    }

    if (dto.title !== undefined) {
      dataToUpdate.title = dto.title.trim() || null;
    } else if (dto.content !== undefined && !existingNote.title) {
      dataToUpdate.title = this.generateTitleFromContent(dto.content);
    }

    return this.prisma.note.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async delete(id: string) {
    const existingNote = await this.prisma.note.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!existingNote) {
      throw new NotFoundException({
        code: ERROR_CODES.NOTE_NOT_FOUND,
        message: `Ghi chú với id ${id} không tồn tại`,
      });
    }

    await this.prisma.note.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      id,
    };
  }
}
