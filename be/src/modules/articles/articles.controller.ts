import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from "@nestjs/swagger";
import { ArticlesService } from "./articles.service.js";
import { CreateArticleDto } from "./dto/create-article.dto.js";
import { UpdateArticleDto } from "./dto/update-article.dto.js";
import { ArticleQueryDto } from "./dto/article-query.dto.js";
import { PublishArticleDto } from "./dto/publish-article.dto.js";

@ApiTags("Articles")
@Controller("articles")
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new article" })
  @ApiResponse({ status: 201, description: "Article created successfully" })
  @ApiResponse({ status: 400, description: "Validation error or invalid category" })
  @ApiResponse({ status: 404, description: "Category not found" })
  async create(@Body() dto: CreateArticleDto) {
    return this.articlesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Get paginated list of articles" })
  @ApiResponse({ status: 200, description: "Paginated list of articles" })
  async findAll(@Query() query: ArticleQueryDto) {
    return this.articlesService.findAll(query);
  }

  @Get("slug/:slug")
  @ApiOperation({ summary: "Get article by slug" })
  @ApiParam({ name: "slug", description: "Article slug" })
  @ApiResponse({ status: 200, description: "Article details" })
  @ApiResponse({ status: 404, description: "Article not found" })
  async findBySlug(@Param("slug") slug: string) {
    return this.articlesService.findBySlug(slug);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get article by id" })
  @ApiParam({ name: "id", format: "uuid", description: "Article UUID" })
  @ApiResponse({ status: 200, description: "Article details" })
  @ApiResponse({ status: 404, description: "Article not found" })
  async findById(@Param("id", ParseUUIDPipe) id: string) {
    return this.articlesService.findById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update article" })
  @ApiParam({ name: "id", format: "uuid", description: "Article UUID" })
  @ApiResponse({ status: 200, description: "Article updated successfully" })
  @ApiResponse({ status: 400, description: "Validation error or invalid state transition" })
  @ApiResponse({ status: 404, description: "Article not found" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateArticleDto
  ) {
    return this.articlesService.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft delete article" })
  @ApiParam({ name: "id", format: "uuid", description: "Article UUID" })
  @ApiResponse({ status: 200, description: "Article deleted successfully" })
  @ApiResponse({ status: 404, description: "Article not found" })
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.articlesService.remove(id);
  }

  @Post(":id/publish")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Publish or schedule article" })
  @ApiParam({ name: "id", format: "uuid", description: "Article UUID" })
  @ApiResponse({ status: 200, description: "Article published or scheduled" })
  @ApiResponse({ status: 400, description: "Cannot publish archived article" })
  @ApiResponse({ status: 404, description: "Article not found" })
  async publish(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: PublishArticleDto
  ) {
    return this.articlesService.publish(id, dto);
  }

  @Post(":id/archive")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Archive article" })
  @ApiParam({ name: "id", format: "uuid", description: "Article UUID" })
  @ApiResponse({ status: 200, description: "Article archived" })
  @ApiResponse({ status: 404, description: "Article not found" })
  async archive(@Param("id", ParseUUIDPipe) id: string) {
    return this.articlesService.archive(id);
  }
}
