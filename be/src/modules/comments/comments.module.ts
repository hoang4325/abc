import { Module } from "@nestjs/common";
import { PrismaModule } from "../../database/prisma.module.js";
import { CommentsController } from "./comments.controller.js";
import { CommentsService } from "./comments.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
