import { Module } from '@nestjs/common';
import { TWAPSwapController } from './TWAPSwap.controller';
import { TWAPSwapService } from './TWAPSwap.service';
import { Web3ConfigModule } from '../config/web3/web3.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [Web3ConfigModule, ConfigModule],
  controllers: [TWAPSwapController],
  providers: [TWAPSwapService],
})
export class TWAPSwapModule {}
