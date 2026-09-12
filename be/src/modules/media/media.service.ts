import {
  Injectable,
  Inject,
  BadRequestException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  StorageService,
  UploadedFileDto,
} from "./storage/storage.interface.js";
import { STORAGE_SERVICE } from "./storage/storage.interface.js";
import { ERROR_CODES } from "../../common/constants/error-codes.constant.js";

@Injectable()
export class MediaService {
  private readonly allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);
  private readonly maxFileSizeBytes: number;

  constructor(
    @Inject(STORAGE_SERVICE)
    private readonly storageService: StorageService,
    private readonly configService: ConfigService
  ) {
    this.maxFileSizeBytes = this.configService.get<number>(
      "MAX_FILE_SIZE_BYTES",
      5242880
    );
  }

  async uploadImage(file: UploadedFileDto | undefined): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "No file uploaded",
      });
    }

    if (!this.allowedMimeTypes.has(file.mimetype)) {
      throw new BadRequestException({
        code: ERROR_CODES.IMAGE_TYPE_NOT_SUPPORTED,
        message: "Only image/jpeg, image/png, and image/webp are supported",
      });
    }

    if (file.size > this.maxFileSizeBytes) {
      throw new BadRequestException({
        code: ERROR_CODES.IMAGE_TOO_LARGE,
        message: `File size exceeds the maximum limit of ${this.maxFileSizeBytes} bytes`,
      });
    }

    const stored = await this.storageService.save(file);

    return {
      url: stored.url,
    };
  }
}
