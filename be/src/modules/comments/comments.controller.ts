import {
  Controller,
  Get,
  Post,
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
import { CommentsService } from "./comments.service.js";
import { CreateCommentDto } from "./dto/create-comment.dto.js";
import { CommentQueryDto } from "./dto/comment-query.dto.js";

@ApiTags("Comments")
@Controller("articles/:articleId/comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Thêm bình luận mới vào bài viết" })
  @ApiParam({ name: "articleId", format: "uuid", description: "ID bài viết" })
  @ApiResponse({ status: 201, description: "Bình luận đã được tạo" })
  @ApiResponse({ status: 400, description: "Lỗi dữ liệu đầu vào hoặc parentId không hợp lệ" })
  @ApiResponse({ status: 404, description: "Không tìm thấy bài viết" })
  async create(
    @Param("articleId", ParseUUIDPipe) articleId: string,
    @Body() dto: CreateCommentDto
  ) {
    return this.commentsService.create(articleId, dto);
  }

  @Get()
  @ApiOperation({ summary: "Lấy danh sách bình luận theo bài viết" })
  @ApiParam({ name: "articleId", format: "uuid", description: "ID bài viết" })
  @ApiResponse({ status: 200, description: "Danh sách bình luận" })
  @ApiResponse({ status: 404, description: "Không tìm thấy bài viết" })
  async findAll(
    @Param("articleId", ParseUUIDPipe) articleId: string,
    @Query() query: CommentQueryDto
  ) {
    return this.commentsService.findAllByArticle(articleId, query);
  }

  @Delete(":commentId")
  @ApiOperation({ summary: "Xóa bình luận" })
  @ApiParam({ name: "articleId", format: "uuid", description: "ID bài viết" })
  @ApiParam({ name: "commentId", format: "uuid", description: "ID bình luận" })
  @ApiResponse({ status: 200, description: "Bình luận đã được xóa" })
  @ApiResponse({ status: 404, description: "Không tìm thấy bình luận" })
  async delete(
    @Param("articleId", ParseUUIDPipe) articleId: string,
    @Param("commentId", ParseUUIDPipe) commentId: string
  ) {
    return this.commentsService.delete(articleId, commentId);
  }
}
