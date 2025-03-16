import { http, createWalletClient, publicActions } from 'viem'; // Main library used to interface with the blockchain
import { privateKeyToAccount } from 'viem/accounts';
import { berachain, berachainTestnetbArtio } from 'viem/chains';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Web3ConfigService {
  constructor(private configService: ConfigService) {}

  blockchainNetwork = {
    mainnet: 'https://mainnet.api.oogabooga.io',
    testnet: 'https://bartio.api.oogabooga.io',
  };

  client = createWalletClient({
    chain:
      this.configService.get('DEVELOPMENT') == 'true'
        ? berachainTestnetbArtio
        : berachain,
    transport: http(),
    account: privateKeyToAccount(
      `0x${this.configService.get<string>('WEB3_PRIVATE_KEY')}`
    ),
  }).extend(publicActions as any);
}

export namespace Web3ConfigService {
  export enum SupportedNetworks {
    polygon = 'polygon',
    treasure = 'treasure',
  }
}
