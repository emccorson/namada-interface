import { TxType } from "@namada/shared";

import {
  TxMsgValue,
  SubmitBondMsgValue,
  SubmitUnbondMsgValue,
  SubmitWithdrawMsgValue,
  TransferMsgValue,
  IbcTransferMsgValue,
  EthBridgeTransferMsgValue,
  SignatureMsgValue,
} from "./schema";

export type SupportedTx = Extract<
  TxType,
  | TxType.Bond
  | TxType.Unbond
  | TxType.Transfer
  | TxType.IBCTransfer
  | TxType.EthBridgeTransfer
  | TxType.Withdraw
>;

// TODO: These could probably be removed altogether, but maybe they're useful to
// distinguish between values created as plain object literals and values
// created using a class constructor.
export type TxProps = TxMsgValue;
export type SubmitBondProps = SubmitBondMsgValue;
export type SubmitUnbondProps = SubmitUnbondMsgValue;
export type SubmitWithdrawProps = SubmitWithdrawMsgValue;
export type TransferProps = TransferMsgValue;
export type IbcTransferProps = IbcTransferMsgValue;
export type BridgeTransferProps = EthBridgeTransferMsgValue;
export type SignatureProps = SignatureMsgValue;
