export interface UploadedFileDto {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface StoredFileResult {
  filename: string;
  url: string;
  size: number;
  mimetype: string;
}

export interface StorageService {
  save(file: UploadedFileDto): Promise<StoredFileResult>;
  delete(filename: string): Promise<void>;
}

export const STORAGE_SERVICE = Symbol("STORAGE_SERVICE");
