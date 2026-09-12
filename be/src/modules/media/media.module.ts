import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MediaController } from "./media.controller.js";
import { MediaService } from "./media.service.js";
import { STORAGE_SERVICE } from "./storage/storage.interface.js";
import { LocalStorageService } from "./storage/local-storage.service.js";

@Module({
  imports: [ConfigModule],
  controllers: [MediaController],
  providers: [
    MediaService,
    {
      provide: STORAGE_SERVICE,
      useClass: LocalStorageService,
    },
  ],
  exports: [MediaService],
})
export class MediaModule {}
