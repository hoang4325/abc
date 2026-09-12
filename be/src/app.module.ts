import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./database/prisma.module.js";
import { MediaModule } from "./modules/media/media.module.js";
import { CategoriesModule } from "./modules/categories/categories.module.js";
import { TagsModule } from "./modules/tags/tags.module.js";
import { ArticlesModule } from "./modules/articles/articles.module.js";
import { CommentsModule } from "./modules/comments/comments.module.js";
import { NotesModule } from "./modules/notes/notes.module.js";
import { UsersModule } from "./modules/users/users.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    UsersModule,
    AuthModule,
    MediaModule,
    CategoriesModule,
    TagsModule,
    ArticlesModule,
    CommentsModule,
    NotesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
