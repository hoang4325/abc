import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
  IsUUID,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCommentDto {
  @ApiProperty({ example: "Nguyễn Văn A", description: "Tên người bình luận" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  authorName!: string;

  @ApiPropertyOptional({
    example: "https://example.com/avatar.jpg",
    description: "Avatar URL",
  })
  @IsString()
  @IsOptional()
  authorAvatar?: string;

  @ApiProperty({
    example: "Bài viết chia sẻ rất chi tiết và bổ ích!",
    description: "Nội dung bình luận",
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;

  @ApiPropertyOptional({
    example: "c79fb4c4-7221-4f11-9a79-22a30bbdf424",
    description: "ID bình luận cha nếu là câu trả lời",
  })
  @IsUUID("4")
  @IsOptional()
  parentId?: string;
}
