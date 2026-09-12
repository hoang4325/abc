import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { describe, beforeAll, afterAll, it, expect } from "vitest";
import { AppModule } from "../src/app.module.js";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter.js";
import { TransformInterceptor } from "../src/common/interceptors/transform.interceptor.js";

describe("Articles Flow (e2e)", () => {
  let app: INestApplication;
  let categoryId: string;
  let articleId: string;
  let articleSlug: string;

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

  it("should create a category", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/categories")
      .send({
        name: "Danh mục E2E",
        description: "Dành cho e2e testing",
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    categoryId = res.body.data.id;
  });

  it("should create an article with category and tags", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/articles")
      .send({
        title: "Bài viết E2E Test Chất Lượng",
        content: "<p>Nội dung kiểm thử E2E <script>alert(1)</script></p>",
        categoryId,
        tags: ["e2etag1", "e2etag2"],
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.content).not.toContain("<script>");
    expect(res.body.data.tags).toHaveLength(2);

    articleId = res.body.data.id;
    articleSlug = res.body.data.slug;
  });

  it("should get article by id", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/articles/${articleId}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(articleId);
    expect(res.body.data.category.id).toBe(categoryId);
  });

  it("should get article by slug", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/articles/slug/${articleSlug}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe(articleSlug);
  });

  it("should update article and sync tags", async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/articles/${articleId}`)
      .send({
        title: "Bài viết E2E Cập Nhật",
        tags: ["e2etag2", "e2etag3"],
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Bài viết E2E Cập Nhật");
    const tagSlugs = res.body.data.tags.map((t: { slug: string }) => t.slug);
    expect(tagSlugs).toContain("e2etag2");
    expect(tagSlugs).toContain("e2etag3");
    expect(tagSlugs).not.toContain("e2etag1");
  });

  it("should publish article", async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/articles/${articleId}/publish`)
      .send({})
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("PUBLISHED");
    expect(res.body.data.publishedAt).toBeDefined();
  });

  it("should list published articles containing the published article", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/v1/articles?status=PUBLISHED")
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const found = res.body.data.some((a: { id: string }) => a.id === articleId);
    expect(found).toBe(true);
  });

  it("should archive article", async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/articles/${articleId}/archive`)
      .send({})
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ARCHIVED");
  });

  it("should verify archived article behavior", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/articles/${articleId}`)
      .expect(200);

    expect(res.body.data.status).toBe("ARCHIVED");

    await request(app.getHttpServer())
      .post(`/api/v1/articles/${articleId}/publish`)
      .send({})
      .expect(400);
  });

  it("should soft delete article and exclude it from detail and list", async () => {
    await request(app.getHttpServer())
      .delete(`/api/v1/articles/${articleId}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/v1/articles/${articleId}`)
      .expect(404);

    await request(app.getHttpServer())
      .get(`/api/v1/articles/slug/${articleSlug}`)
      .expect(404);
  });
});
