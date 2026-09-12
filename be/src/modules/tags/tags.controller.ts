import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { TagsService } from "./tags.service.js";
import { TagQueryDto } from "./dto/tag-query.dto.js";

@ApiTags("Tags")
@Controller("tags")
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: "Get tags for autocomplete or list" })
  @ApiResponse({ status: 200, description: "List of tags" })
  async findAll(@Query() query: TagQueryDto) {
    return this.tagsService.findAll(query);
  }
}
