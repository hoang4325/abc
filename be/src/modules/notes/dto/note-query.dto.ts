import {
  IsOptional,
  IsString,
  IsEnum,
  IsIn,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { NoteColor } from "@prisma/client";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto.js";
import type { NoteSortField } from "../types/note.types.js";

export const NOTE_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "title",
] as const;

export class NoteQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: "Từ khóa tìm kiếm theo tiêu đề hoặc nội dung" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: NoteColor, description: "Lọc theo màu ghi chú" })
  @IsOptional()
  @IsEnum(NoteColor)
  color?: NoteColor;

  @ApiPropertyOptional({
    enum: NOTE_SORT_FIELDS,
    default: "updatedAt",
    description: "Trường sắp xếp",
  })
  @IsOptional()
  @IsIn(NOTE_SORT_FIELDS)
  sort?: NoteSortField = "updatedAt";
}
