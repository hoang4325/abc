import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { randomUUID } from "node:crypto";
import {
  StorageService,
  UploadedFileDto,
  StoredFileResult,
} from "./storage.interface.js";

@Injectable()
export class LocalStorageService implements StorageService {
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const baseDir = this.configService.get<string>("UPLOAD_DIR", "./uploads");
    this.uploadDir = path.resolve(baseDir, "images");
    this.baseUrl = this.configService.get<string>(
      "APP_BASE_URL",
      "http://localhost:3001"
    );
  }

  async save(file: UploadedFileDto): Promise<StoredFileResult> {
    await fs.mkdir(this.uploadDir, { recursive: true });

    const ext = this.getExtension(file.mimetype, file.originalname);
    const uniqueFilename = `${randomUUID()}${ext}`;
    const filePath = path.join(this.uploadDir, uniqueFilename);

    await fs.writeFile(filePath, file.buffer);

    const fileUrl = `${this.baseUrl}/uploads/images/${uniqueFilename}`;

    return {
      filename: uniqueFilename,
      url: fileUrl,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  async delete(filename: string): Promise<void> {
    const filePath = path.join(this.uploadDir, filename);
    try {
      await fs.unlink(filePath);
    } catch {
      return;
    }
  }

  private getExtension(mimetype: string, originalname: string): string {
    if (mimetype === "image/jpeg") return ".jpg";
    if (mimetype === "image/png") return ".png";
    if (mimetype === "image/webp") return ".webp";

    const parsedExt = path.extname(originalname).toLowerCase();
    return parsedExt || ".bin";
  }
}
