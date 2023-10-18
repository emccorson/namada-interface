/* eslint-disable @typescript-eslint/no-unused-vars */
import BigNumber from "bignumber.js";
import { field, option } from "@dao-xyz/borsh";
import { BigNumberSerializer } from "./utils";
import { TxProps } from "../types";

export class TxMsgValue {
  @field({ type: "string" })
  token!: string;

  @field({ type: option(BigNumberSerializer) })
  feeAmount?: BigNumber;

  @field(BigNumberSerializer)
  gasLimit!: BigNumber;

  @field({ type: "string" })
  chainId!: string;

  @field({ type: option("string") })
  publicKey?: string;

  @field({ type: option("string") })
  signer?: string;

  constructor(data: TxProps) {
    Object.assign(this, data);
  }
}
