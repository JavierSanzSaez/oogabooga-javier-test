import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ConfigModule } from "@nestjs/config";
import { AppService } from "./app.service";
import { TWAPSwapModule } from "./modules/TWAPSwap/TWAPSwap.module";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TWAPSwapModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
