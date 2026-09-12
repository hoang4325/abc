import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import cookieParser from "cookie-parser";
import { describe, beforeAll, afterAll, it, expect } from "vitest";
import { AppModule } from "../src/app.module.js";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter.js";
import { TransformInterceptor } from "../src/common/interceptors/transform.interceptor.js";
import { PrismaService } from "../src/database/prisma.service.js";

describe("Auth Flow (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testEmail = `e2e_test_${Date.now()}@sharedeal.vn`;
  const testPassword = "StrongPassword123!";
  let accessToken: string;
  let refreshTokenCookie: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
    await app.close();
  });

  it("should register a new user successfully", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({
        name: "Test E2E User",
        email: testEmail,
        password: testPassword,
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.accessToken).toBeDefined();

    const cookies = res.headers["set-cookie"] as unknown as string[];
    expect(cookies).toBeDefined();
    const hasAccessCookie = cookies.some((c) => c.includes("access_token="));
    const hasRefreshCookie = cookies.some((c) => c.includes("refresh_token="));
    expect(hasAccessCookie).toBe(true);
    expect(hasRefreshCookie).toBe(true);

    accessToken = res.body.data.accessToken;
    const refreshCookie = cookies.find((c) => c.includes("refresh_token="));
    refreshTokenCookie = refreshCookie?.split(";")[0] || "";
  });

  it("should not allow duplicate email registration", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({
        name: "Duplicate User",
        email: testEmail,
        password: testPassword,
      })
      .expect(409);

    expect(res.body.success).toBe(false);
  });

  it("should login with registered credentials", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({
        email: testEmail,
        password: testPassword,
        rememberMe: true,
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.accessToken).toBeDefined();

    accessToken = res.body.data.accessToken;
    const cookies = res.headers["set-cookie"] as unknown as string[];
    const refreshCookie = cookies.find((c) => c.includes("refresh_token="));
    refreshTokenCookie = refreshCookie?.split(";")[0] || "";
  });

  it("should get current user profile with Bearer token", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testEmail);
    expect(res.body.data.name).toBe("Test E2E User");
  });

  it("should refresh access token using cookie", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/refresh")
      .set("Cookie", [refreshTokenCookie])
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    accessToken = res.body.data.accessToken;
  });

  it("should logout successfully", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
  });

  it("should request forgot password without error", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/forgot-password")
      .send({ email: testEmail })
      .expect(200);

    expect(res.body.success).toBe(true);
  });

  it("should fail to access protected me route without token", async () => {
    await request(app.getHttpServer())
      .get("/api/v1/auth/me")
      .expect(401);
  });
});
