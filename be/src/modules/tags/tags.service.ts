import { Injectable } from "@nestjs/common";
import { Tag } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service.js";
import { TagQueryDto } from "./dto/tag-query.dto.js";

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: TagQueryDto): Promise<Tag[]> {
    const search = query.search?.trim();

    return this.prisma.tag.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { slug: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: {
        name: "asc",
      },
      take: 50,
    });
  }
}
