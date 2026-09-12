import {
  IsString,
  IsOptional,
  MaxLength,
  IsEnum,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { NoteColor } from "@prisma/client";

export class UpdateNoteDto {
  @ApiPropertyOptional({
    example: "Tiêu đề đã chỉnh sửa",
    description: "Tiêu đề ghi chú",
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    example: "Nội dung ghi chú đã được cập nhật...",
    description: "Nội dung ghi chú",
    maxLength: 50000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50000)
  content?: string;

  @ApiPropertyOptional({
    enum: NoteColor,
    description: "Màu sắc ghi chú mới",
  })
  @IsEnum(NoteColor)
  @IsOptional()
  color?: NoteColor;
}
