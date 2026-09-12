import { describe, it, expect, beforeEach, vi } from "vitest";
import { TagsService } from "./tags.service.js";
import { PrismaService } from "../../database/prisma.service.js";

describe("TagsService", () => {
  let service: TagsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      tag: {
        findMany: vi.fn(),
      },
    };

    service = new TagsService(mockPrisma as unknown as PrismaService);
  });

  it("should return list of tags", async () => {
    const tags = [
      { id: "t1", name: "review", slug: "review", createdAt: new Date() },
      { id: "t2", name: "sale", slug: "sale", createdAt: new Date() },
    ];
    mockPrisma.tag.findMany.mockResolvedValue(tags);

    const result = await service.findAll({});
    expect(result).toEqual(tags);
    expect(mockPrisma.tag.findMany).toHaveBeenCalledWith({
      where: undefined,
      orderBy: { name: "asc" },
      take: 50,
    });
  });

  it("should search tags by keyword", async () => {
    mockPrisma.tag.findMany.mockResolvedValue([]);

    await service.findAll({ search: "rev" });
    expect(mockPrisma.tag.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { name: { contains: "rev", mode: "insensitive" } },
          { slug: { contains: "rev", mode: "insensitive" } },
        ],
      },
      orderBy: { name: "asc" },
      take: 50,
    });
  });
});
