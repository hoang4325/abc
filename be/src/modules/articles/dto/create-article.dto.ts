import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
  MinLength,
  ArrayMaxSize,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ArticleStatus } from "@prisma/client";

export class CreateArticleDto {
  @ApiProperty({
    example: "Review kem chống nắng Anessa",
    description: "Tiêu đề bài viết",
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    example: "<p>Nội dung bài viết review...</p>",
    description: "Nội dung bài viết định dạng HTML",
  })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({
    example: "https://cdn.example.com/anessa.jpg",
    description: "URL ảnh bìa bài viết",
  })
  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @ApiPropertyOptional({
    enum: ArticleStatus,
    default: ArticleStatus.DRAFT,
    description: "Trạng thái bài viết",
  })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @ApiPropertyOptional({
    format: "uuid",
    description: "ID danh mục của bài viết",
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ["anessa", "review", "kem chống nắng"],
    description: "Danh sách thẻ gắn với bài viết",
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  tags?: string[];

  @ApiPropertyOptional({
    example: "2026-09-12T08:00:00.000Z",
    description: "Thời điểm xuất bản bài viết",
  })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
