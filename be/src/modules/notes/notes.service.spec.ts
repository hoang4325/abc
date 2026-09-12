import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotesService } from "./notes.service.js";
import { PrismaService } from "../../database/prisma.service.js";
import { NoteColor, Note } from "@prisma/client";
import { ERROR_CODES } from "../../common/constants/error-codes.constant.js";
import { BadRequestException } from "@nestjs/common";

type MockPrisma = {
  note: {
    findMany: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
  };
};

describe("NotesService", () => {
  let service: NotesService;
  let mockPrisma: MockPrisma;

  beforeEach(() => {
    mockPrisma = {
      note: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
    };

    service = new NotesService(mockPrisma as unknown as PrismaService);
  });

  it("should create a note with explicit title and default color YELLOW", async () => {
    const createdNote: Note = {
      id: "note-1",
      title: "Tiêu đề ghi chú",
      content: "Nội dung ghi chú mẫu",
      color: NoteColor.YELLOW,
      userId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    mockPrisma.note.create.mockResolvedValue(createdNote);

    const result = await service.create({
      title: "Tiêu đề ghi chú",
      content: "Nội dung ghi chú mẫu",
    });

    expect(result).toEqual(createdNote);
    expect(mockPrisma.note.create).toHaveBeenCalledWith({
      data: {
        title: "Tiêu đề ghi chú",
        content: "Nội dung ghi chú mẫu",
        color: NoteColor.YELLOW,
      },
    });
  });

  it("should create a note with selected color", async () => {
    const createdNote: Note = {
      id: "note-2",
      title: "Ghi chú màu đỏ",
      content: "Nội dung quan trọng",
      color: NoteColor.RED,
      userId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    mockPrisma.note.create.mockResolvedValue(createdNote);

    const result = await service.create({
      content: "Nội dung quan trọng",
      color: NoteColor.RED,
    });

    expect(result.color).toBe(NoteColor.RED);
    expect(mockPrisma.note.create).toHaveBeenCalledWith({
      data: {
        title: "Nội dung quan trọng",
        content: "Nội dung quan trọng",
        color: NoteColor.RED,
      },
    });
  });

  it("should reject empty content on create with NOTE_CONTENT_REQUIRED", async () => {
    await expect(
      service.create({
        content: "   \n\t  ",
      })
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.create({
        content: "",
      })
    ).rejects.toMatchObject({
      response: {
        code: ERROR_CODES.NOTE_CONTENT_REQUIRED,
      },
    });
  });

  it("should auto generate title preview up to 80 chars stripping html", async () => {
    const longHtmlContent =
      "<p>Họp với team marketing lúc 3 giờ chiều để thống nhất nội dung campaign kem chống nắng cho toàn bộ hệ thống đại lý miền Bắc và miền Trung</p>";

    mockPrisma.note.create.mockImplementation((args: { data: Record<string, unknown> }) =>
      Promise.resolve({
        id: "note-3",
        userId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        ...args.data,
      } as Note)
    );

    const result = await service.create({
      content: longHtmlContent,
    });

    expect(result.title).toBeDefined();
    expect(result.title!.endsWith("...")).toBe(true);
    expect(result.title!.length).toBeLessThanOrEqual(83);
    expect(result.title).not.toContain("<p>");
  });

  it("should return paginated notes with default sort updatedAt desc", async () => {
    const mockNotes: Note[] = [
      {
        id: "n-1",
        title: "Note 1",
        content: "Content 1",
        color: NoteColor.TEAL,
        userId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ];

    mockPrisma.note.count.mockResolvedValue(1);
    mockPrisma.note.findMany.mockResolvedValue(mockNotes);

    const result = await service.findAll({});

    expect(result.data).toHaveLength(1);
    expect(result.data[0].contentPreview).toBe("Content 1");
    expect(result.meta).toEqual({
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    });
    expect(mockPrisma.note.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
      skip: 0,
      take: 20,
    });
  });

  it("should filter notes by color and search keyword across title and content", async () => {
    mockPrisma.note.count.mockResolvedValue(0);
    mockPrisma.note.findMany.mockResolvedValue([]);

    await service.findAll({
      color: NoteColor.BLUE,
      search: "campaign",
      page: 2,
      limit: 10,
      sort: "createdAt",
      order: "asc",
    });

    expect(mockPrisma.note.findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        color: NoteColor.BLUE,
        OR: [
          {
            title: {
              contains: "campaign",
              mode: "insensitive",
            },
          },
          {
            content: {
              contains: "campaign",
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: { createdAt: "asc" },
      skip: 10,
      take: 10,
    });
  });

  it("should get note detail when found", async () => {
    const note: Note = {
      id: "n-detail",
      title: "Chi tiết",
      content: "Nội dung chi tiết",
      color: NoteColor.BLACK,
      userId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    mockPrisma.note.findFirst.mockResolvedValue(note);

    const result = await service.findOne("n-detail");

    expect(result).toEqual(note);
    expect(mockPrisma.note.findFirst).toHaveBeenCalledWith({
      where: {
        id: "n-detail",
        deletedAt: null,
      },
    });
  });

  it("should throw NotFoundException with NOTE_NOT_FOUND when note does not exist", async () => {
    mockPrisma.note.findFirst.mockResolvedValue(null);

    await expect(service.findOne("non-existent")).rejects.toMatchObject({
      response: {
        code: ERROR_CODES.NOTE_NOT_FOUND,
      },
    });
  });

  it("should update content and color successfully", async () => {
    const existing: Note = {
      id: "n-update",
      title: "Tiêu đề cũ",
      content: "Nội dung cũ",
      color: NoteColor.YELLOW,
      userId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    mockPrisma.note.findFirst.mockResolvedValue(existing);
    mockPrisma.note.update.mockResolvedValue({
      ...existing,
      content: "Nội dung mới",
      color: NoteColor.TEAL,
    });

    const result = await service.update("n-update", {
      content: "Nội dung mới",
      color: NoteColor.TEAL,
    });

    expect(result.color).toBe(NoteColor.TEAL);
    expect(mockPrisma.note.update).toHaveBeenCalledWith({
      where: { id: "n-update" },
      data: {
        content: "Nội dung mới",
        color: NoteColor.TEAL,
      },
    });
  });

  it("should reject empty content on update with NOTE_CONTENT_REQUIRED", async () => {
    const existing: Note = {
      id: "n-update-empty",
      title: "Gốc",
      content: "Nội dung gốc",
      color: NoteColor.YELLOW,
      userId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    mockPrisma.note.findFirst.mockResolvedValue(existing);

    await expect(
      service.update("n-update-empty", {
        content: "   ",
      })
    ).rejects.toMatchObject({
      response: {
        code: ERROR_CODES.NOTE_CONTENT_REQUIRED,
      },
    });
  });

  it("should throw NotFoundException on update if note not found", async () => {
    mockPrisma.note.findFirst.mockResolvedValue(null);

    await expect(
      service.update("n-unknown", { content: "Test" })
    ).rejects.toMatchObject({
      response: {
        code: ERROR_CODES.NOTE_NOT_FOUND,
      },
    });
  });

  it("should soft delete note and return id", async () => {
    mockPrisma.note.findFirst.mockResolvedValue({ id: "n-del" });
    mockPrisma.note.update.mockResolvedValue({ id: "n-del" });

    const result = await service.delete("n-del");

    expect(result).toEqual({ id: "n-del" });
    expect(mockPrisma.note.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "n-del" },
      })
    );
  });

  it("should throw NotFoundException on delete if note not found", async () => {
    mockPrisma.note.findFirst.mockResolvedValue(null);

    await expect(service.delete("n-unknown")).rejects.toMatchObject({
      response: {
        code: ERROR_CODES.NOTE_NOT_FOUND,
      },
    });
  });
});
