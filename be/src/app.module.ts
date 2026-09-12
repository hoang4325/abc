import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./database/prisma.module.js";
import { MediaModule } from "./modules/media/media.module.js";
import { CategoriesModule } from "./modules/categories/categories.module.js";
import { TagsModule } from "./modules/tags/tags.module.js";
import { ArticlesModule } from "./modules/articles/articles.module.js";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    MediaModule,
    CategoriesModule,
    TagsModule,
    ArticlesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
