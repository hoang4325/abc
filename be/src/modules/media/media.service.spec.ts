import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MediaService } from "./media.service.js";
import type { StorageService, UploadedFileDto } from "./storage/storage.interface.js";
import { ERROR_CODES } from "../../common/constants/error-codes.constant.js";

describe("MediaService", () => {
  let service: MediaService;
  let mockStorageService: StorageService;
  let mockConfigService: ConfigService;

  beforeEach(() => {
    mockStorageService = {
      save: vi.fn().mockResolvedValue({
        filename: "safe-uuid.webp",
        url: "http://localhost:3001/uploads/images/safe-uuid.webp",
        size: 1024,
        mimetype: "image/webp",
      }),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    mockConfigService = {
      get: vi.fn((key: string, defaultValue: unknown) => {
        if (key === "MAX_FILE_SIZE_BYTES") {
          return 5242880;
        }
        return defaultValue;
      }),
    } as unknown as ConfigService;

    service = new MediaService(mockStorageService, mockConfigService);
  });

  it("should throw BadRequestException if no file is provided", async () => {
    await expect(service.uploadImage(undefined)).rejects.toThrow(
      BadRequestException
    );
  });

  it("should throw IMAGE_TYPE_NOT_SUPPORTED for non-image or unsupported formats", async () => {
    const invalidFile: UploadedFileDto = {
      buffer: Buffer.from("test"),
      originalname: "test.pdf",
      mimetype: "application/pdf",
      size: 100,
    };

    await expect(service.uploadImage(invalidFile)).rejects.toMatchObject({
      response: {
        code: ERROR_CODES.IMAGE_TYPE_NOT_SUPPORTED,
      },
    });
  });

  it("should throw IMAGE_TOO_LARGE when file size exceeds limit", async () => {
    const largeFile: UploadedFileDto = {
      buffer: Buffer.alloc(6000000),
      originalname: "large.jpg",
      mimetype: "image/jpeg",
      size: 6000000,
    };

    await expect(service.uploadImage(largeFile)).rejects.toMatchObject({
      response: {
        code: ERROR_CODES.IMAGE_TOO_LARGE,
      },
    });
  });

  it("should successfully upload valid image and return url", async () => {
    const validFile: UploadedFileDto = {
      buffer: Buffer.from("image content"),
      originalname: "banner.webp",
      mimetype: "image/webp",
      size: 1024,
    };

    const result = await service.uploadImage(validFile);
    expect(result.url).toBe("http://localhost:3001/uploads/images/safe-uuid.webp");
    expect(mockStorageService.save).toHaveBeenCalledWith(validFile);
  });
});
