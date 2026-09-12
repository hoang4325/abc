import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module.js";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter.js";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api/v1");

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  app.enableCors({
    origin: [frontendUrl],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const uploadsDir = path.resolve(process.cwd(), "uploads");
  app.use("/uploads", express.static(uploadsDir));

  const swaggerConfig = new DocumentBuilder()
    .setTitle("ShareDeal API")
    .setDescription(
      "Backend API for ShareDeal Content Management System"
    )
    .setVersion("1.0.0")
    .addTag("Auth")
    .addTag("Articles")
    .addTag("Categories")
    .addTag("Tags")
    .addTag("Media")
    .addTag("Notes")
    .addCookieAuth("access_token")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document);

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port, "0.0.0.0");
}

await bootstrap();
