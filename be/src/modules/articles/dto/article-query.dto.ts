import {
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { ArticleStatus } from "@prisma/client";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto.js";

export const ARTICLE_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "publishedAt",
  "title",
] as const;

export type ArticleSortField = (typeof ARTICLE_SORT_FIELDS)[number];

export class ArticleQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: "Search in title, content, category name, or tag name",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    enum: ArticleStatus,
    description: "Filter by article status",
  })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @ApiPropertyOptional({
    format: "uuid",
    description: "Filter by category ID",
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description: "Filter by tag name or slug",
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tag?: string;

  @ApiPropertyOptional({
    enum: ARTICLE_SORT_FIELDS,
    default: "createdAt",
    description: "Field to sort by",
  })
  @IsOptional()
  @IsIn(ARTICLE_SORT_FIELDS)
  sort?: ArticleSortField = "createdAt";
}
