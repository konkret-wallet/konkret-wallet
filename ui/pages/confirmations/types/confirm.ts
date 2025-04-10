import { ApprovalControllerState } from '@metamask/approval-controller';
import { DecodingData } from '@metamask/signature-controller';
import { SIWEMessage } from '@metamask/controller-utils';
import {
  TransactionMeta,
  TransactionType,
} from '@metamask/transaction-controller';

export type TypedSignDataV1Type = {
  name: string;
  value: string;
  type: string;
}[];

export type SignatureRequestType = {
  chainId?: string;
  id: string;
  msgParams?: {
    from: string;
    origin: string;
    data: string | TypedSignDataV1Type;
    version?: string;
    requestId?: number;
    signatureMethod?: string;
    siwe?: SIWEMessage;
  };
  type: TransactionType;
  securityAlertResponse?: object;
  decodingLoading?: boolean;
  decodingData?: DecodingData;
};

export type Confirmation = SignatureRequestType | TransactionMeta;

export type ConfirmMetamaskState = {
  metamask: {
    pendingApprovals: ApprovalControllerState['pendingApprovals'];
    approvalFlows: ApprovalControllerState['approvalFlows'];
  };
};
