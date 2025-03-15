import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>("MONGODB_CONNECTION_STRING"),
        dbName: configService.get<string>("MONGODB_DATABASE_NAME"),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
