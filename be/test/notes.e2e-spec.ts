import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { describe, beforeAll, afterAll, it, expect } from "vitest";
import { AppModule } from "../src/app.module.js";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter.js";
import { TransformInterceptor } from "../src/common/interceptors/transform.interceptor.js";
import { NoteColor } from "@prisma/client";
import { ERROR_CODES } from "../src/common/constants/error-codes.constant.js";

interface NoteResponseData {
  id: string;
  title: string;
  content: string;
  contentPreview?: string;
  color: NoteColor;
  createdAt: string;
  updatedAt: string;
}

describe("Notes Flow (e2e)", () => {
  let app: INestApplication;
  let noteId: string;
  const testKeyword = "KiemThuE2ETocDoNhanh";

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create note with auto-generated title and default color YELLOW", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/notes")
      .send({
        content: `Nội dung ghi chú e2e tự sinh tiêu đề ${testKeyword}`,
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.color).toBe(NoteColor.YELLOW);
    expect(res.body.data.title).toContain(testKeyword);
    noteId = res.body.data.id;
  });

  it("should reject note creation when content is empty or whitespace only", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/notes")
      .send({
        content: "   ",
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(ERROR_CODES.NOTE_CONTENT_REQUIRED);
  });

  it("should reject note creation when color is not in whitelist enum", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/notes")
      .send({
        content: "Nội dung hợp lệ",
        color: "PURPLE",
      })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it("should list notes and contain the created note with preview", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/v1/notes")
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    const found = res.body.data.some((item: NoteResponseData) => item.id === noteId);
    expect(found).toBe(true);
  });

  it("should search notes by unique keyword", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/notes?search=${testKeyword}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].id).toBe(noteId);
  });

  it("should get note detail by id", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/notes/${noteId}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(noteId);
    expect(res.body.data.content).toContain(testKeyword);
  });

  it("should update note content", async () => {
    const newContent = `Nội dung mới đã cập nhật ${testKeyword}`;
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/notes/${noteId}`)
      .send({
        content: newContent,
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toBe(newContent);
  });

  it("should change note color via PATCH", async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/notes/${noteId}`)
      .send({
        color: NoteColor.RED,
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.color).toBe(NoteColor.RED);
  });

  it("should soft delete note", async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/v1/notes/${noteId}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(noteId);
  });

  it("should verify deleted note returns 404 on get detail", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/notes/${noteId}`)
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(ERROR_CODES.NOTE_NOT_FOUND);
  });

  it("should verify deleted note does not appear in list or search", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/notes?search=${testKeyword}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    const found = res.body.data.some((item: NoteResponseData) => item.id === noteId);
    expect(found).toBe(false);
  });
});
