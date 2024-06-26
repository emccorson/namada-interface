import {
  BatchTxResultMsgValue,
  BondMsgValue,
  EthBridgeTransferMsgValue,
  IbcTransferMsgValue,
  RedelegateMsgValue,
  SignatureMsgValue,
  TransparentTransferMsgValue,
  TxResponseMsgValue,
  UnbondMsgValue,
  VoteProposalMsgValue,
  WithdrawMsgValue,
  WrapperTxMsgValue,
} from "./schema";

export type BatchTxResultProps = BatchTxResultMsgValue;
export type WrapperTxProps = WrapperTxMsgValue;
export type BondProps = BondMsgValue;
export type UnbondProps = UnbondMsgValue;
export type WithdrawProps = WithdrawMsgValue;
export type RedelegateProps = RedelegateMsgValue;
export type TransparentTransferProps = TransparentTransferMsgValue;
export type TxResponseProps = TxResponseMsgValue;
export type EthBridgeTransferProps = EthBridgeTransferMsgValue;
export type SignatureProps = SignatureMsgValue;
export type VoteProposalProps = VoteProposalMsgValue;
export type IbcTransferProps = IbcTransferMsgValue;
