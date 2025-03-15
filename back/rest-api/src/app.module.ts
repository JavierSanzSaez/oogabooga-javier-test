import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ConfigModule } from "@nestjs/config";
import { AppService } from "./app.service";
import { TWAPSwapModule } from "./modules/TWAPSwap/TWAPSwap.module";
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TWAPSwapModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
