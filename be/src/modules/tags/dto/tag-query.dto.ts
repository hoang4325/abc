import { IsOptional, IsString, MaxLength } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class TagQueryDto {
  @ApiPropertyOptional({
    description: "Search keyword for tag name or slug",
    example: "review",
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  search?: string;
}
