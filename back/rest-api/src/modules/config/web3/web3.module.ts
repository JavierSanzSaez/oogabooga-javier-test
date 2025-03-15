import { Module } from '@nestjs/common';
import { Web3ConfigService } from './web3.service';

@Module({
  providers: [Web3ConfigService],
  exports: [Web3ConfigService],
})
export class Web3ConfigModule {}
