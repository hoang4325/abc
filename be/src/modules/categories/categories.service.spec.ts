import { describe, it, expect, beforeEach, vi } from "vitest";
import { CategoriesService } from "./categories.service.js";
import { PrismaService } from "../../database/prisma.service.js";
import { ERROR_CODES } from "../../common/constants/error-codes.constant.js";

describe("CategoriesService", () => {
  let service: CategoriesService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      category: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      article: {
        count: vi.fn(),
      },
    };

    service = new CategoriesService(mockPrisma as unknown as PrismaService);
  });

  it("should return all categories", async () => {
    const list = [{ id: "c1", name: "Làm đẹp", slug: "lam-dep", isActive: true }];
    mockPrisma.category.findMany.mockResolvedValue(list);

    const result = await service.findAll();
    expect(result).toEqual(list);
    expect(mockPrisma.category.findMany).toHaveBeenCalled();
  });

  it("should return category when found by id", async () => {
    const cat = { id: "c1", name: "Làm đẹp", slug: "lam-dep", isActive: true };
    mockPrisma.category.findUnique.mockResolvedValue(cat);

    const result = await service.findById("c1");
    expect(result).toEqual(cat);
  });

  it("should throw NotFoundException if category not found", async () => {
    mockPrisma.category.findUnique.mockResolvedValue(null);

    await expect(service.findById("non-existent")).rejects.toMatchObject({
      response: {
        code: ERROR_CODES.CATEGORY_NOT_FOUND,
      },
    });
  });

  it("should create a category with generated slug", async () => {
    mockPrisma.category.findUnique.mockResolvedValue(null);
    mockPrisma.category.create.mockImplementation(({ data }: any) =>
      Promise.resolve({ id: "c-new", ...data })
    );

    const result = await service.create({
      name: "Thời trang nam",
      description: "Quần áo nam",
    });

    expect(result.slug).toBe("thoi-trang-nam");
    expect(mockPrisma.category.create).toHaveBeenCalledWith({
      data: {
        name: "Thời trang nam",
        slug: "thoi-trang-nam",
        description: "Quần áo nam",
        isActive: true,
      },
    });
  });

  it("should deactivate category if articles are using it", async () => {
    const cat = { id: "c1", name: "Làm đẹp", slug: "lam-dep", isActive: true };
    mockPrisma.category.findUnique.mockResolvedValue(cat);
    mockPrisma.article.count.mockResolvedValue(5);
    mockPrisma.category.update.mockResolvedValue({ ...cat, isActive: false });

    const result = await service.remove("c1");
    expect(result).toEqual({ deleted: false, deactivated: true });
    expect(mockPrisma.category.update).toHaveBeenCalledWith({
      where: { id: "c1" },
      data: { isActive: false },
    });
    expect(mockPrisma.category.delete).not.toHaveBeenCalled();
  });

  it("should delete category if no articles are using it", async () => {
    const cat = { id: "c1", name: "Làm đẹp", slug: "lam-dep", isActive: true };
    mockPrisma.category.findUnique.mockResolvedValue(cat);
    mockPrisma.article.count.mockResolvedValue(0);
    mockPrisma.category.delete.mockResolvedValue(cat);

    const result = await service.remove("c1");
    expect(result).toEqual({ deleted: true, deactivated: false });
    expect(mockPrisma.category.delete).toHaveBeenCalledWith({
      where: { id: "c1" },
    });
  });
});
