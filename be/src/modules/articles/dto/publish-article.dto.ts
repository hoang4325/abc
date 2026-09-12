import { IsDateString, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class PublishArticleDto {
  @ApiPropertyOptional({
    example: "2026-09-12T08:00:00.000Z",
    description: "Publish date. If in future, status becomes SCHEDULED. If omitted or now/past, status becomes PUBLISHED",
  })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
