import { Module } from '@nestjs/common';
import { TWAPSwapController } from './TWAPSwap.controller';
import { TWAPSwapService } from './TWAPSwap.service';
import { Web3ConfigModule } from '../config/web3/web3.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TWAPSwapOrder, TWAPSwapOrderSchema } from './TWAPSwap.schema';

@Module({
  imports: [
    Web3ConfigModule,
    MongooseModule.forFeature([
      { name: TWAPSwapOrder.name, schema: TWAPSwapOrderSchema },
    ]),
  ],
  controllers: [TWAPSwapController],
  providers: [TWAPSwapService],
})
export class TWAPSwapModule {}
