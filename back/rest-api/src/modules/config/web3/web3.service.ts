import { ethers } from "ethers";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class Web3ConfigService {
  constructor(private configService: ConfigService) {}

  blockchainNetwork = {
    mainnet: "https://mainnet.api.oogabooga.io",
    testnet: "https://bartio.api.oogabooga.io",
  };

  client = new ethers.Wallet(
    this.configService.get<string>("WEB3_PRIVATE_KEY") || "",
    new ethers.JsonRpcProvider(
      this.configService.get("DEVELOPMENT") == "true"
        ? this.blockchainNetwork["testnet"]
        : this.blockchainNetwork["mainnet"]
    )
  );
}

export namespace Web3ConfigService {
  export enum SupportedNetworks {
    polygon = "polygon",
    treasure = "treasure",
  }
}
