import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from "@nestjs/swagger";
import { MediaService } from "./media.service.js";
import type { UploadedFileDto } from "./storage/storage.interface.js";

@ApiTags("Media")
@Controller("media")
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post("images")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Upload an image" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
      required: ["file"],
    },
  })
  @ApiResponse({
    status: 201,
    description: "Image uploaded successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        data: {
          type: "object",
          properties: {
            url: { type: "string", example: "http://localhost:3001/uploads/images/abc.webp" },
          },
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor("file"))
  async uploadImage(
    @UploadedFile() file: UploadedFileDto | undefined
  ): Promise<{ url: string }> {
    return this.mediaService.uploadImage(file);
  }
}
