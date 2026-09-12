import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Category } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service.js";
import { CreateCategoryDto } from "./dto/create-category.dto.js";
import { UpdateCategoryDto } from "./dto/update-category.dto.js";
import { resolveUniqueSlug } from "../../common/utils/slug.util.js";
import { ERROR_CODES } from "../../common/constants/error-codes.constant.js";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException({
        code: ERROR_CODES.CATEGORY_NOT_FOUND,
        message: "Category not found",
      });
    }

    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const slug = await resolveUniqueSlug(dto.name, async (candidate) => {
      const existing = await this.prisma.category.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      return Boolean(existing);
    });

    return this.prisma.category.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim(),
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const existing = await this.findById(id);

    let slug = existing.slug;
    if (dto.name && dto.name.trim() !== existing.name) {
      slug = await resolveUniqueSlug(dto.name, async (candidate) => {
        const found = await this.prisma.category.findFirst({
          where: {
            slug: candidate,
            id: { not: id },
          },
          select: { id: true },
        });
        return Boolean(found);
      });
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        slug,
        ...(dto.description !== undefined
          ? { description: dto.description?.trim() ?? null }
          : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async remove(id: string): Promise<{ deleted: boolean; deactivated: boolean }> {
    await this.findById(id);

    const articleCount = await this.prisma.article.count({
      where: {
        categoryId: id,
        deletedAt: null,
      },
    });

    if (articleCount > 0) {
      await this.prisma.category.update({
        where: { id },
        data: { isActive: false },
      });
      return { deleted: false, deactivated: true };
    }

    await this.prisma.category.delete({
      where: { id },
    });
    return { deleted: true, deactivated: false };
  }
}
