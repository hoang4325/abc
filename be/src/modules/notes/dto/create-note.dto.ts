import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsEnum,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { NoteColor } from "@prisma/client";

export class CreateNoteDto {
  @ApiPropertyOptional({
    example: "Ý tưởng content Anessa",
    description: "Tiêu đề ghi chú (tùy chọn)",
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiProperty({
    example: "Viết bài review kem chống nắng Anessa kiềm dầu cho mùa hè",
    description: "Nội dung ghi chú",
    maxLength: 50000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50000)
  content!: string;

  @ApiPropertyOptional({
    enum: NoteColor,
    default: NoteColor.YELLOW,
    description: "Màu sắc ghi chú",
  })
  @IsEnum(NoteColor)
  @IsOptional()
  color?: NoteColor;
}
