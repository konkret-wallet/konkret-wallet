import { EthAccountType } from '@metamask/keyring-api';
import { InternalAccount } from '@metamask/keyring-internal-api';
import {
  TransactionController,
  TransactionMeta,
  TransactionParams,
} from '@metamask/transaction-controller';
import {
  AddUserOperationOptions,
  UserOperationController,
} from '@metamask/user-operation-controller';
import type { Hex } from '@metamask/utils';
import { addHexPrefix } from '@ethereumjs/util';

import { endTrace, TraceName } from '../../../../shared/lib/trace';

export type AddTransactionOptions = NonNullable<
  Parameters<TransactionController['addTransaction']>[1]
>;

type BaseAddTransactionRequest = {
  chainId: Hex;
  networkClientId: string;
  securityAlertsEnabled: boolean;
  selectedAccount: InternalAccount;
  transactionParams: TransactionParams;
  transactionController: TransactionController;
  userOperationController: UserOperationController;
  internalAccounts: InternalAccount[];
};

type FinalAddTransactionRequest = BaseAddTransactionRequest & {
  transactionOptions: Partial<AddTransactionOptions>;
};

export type AddTransactionRequest = FinalAddTransactionRequest & {
  waitForSubmit: boolean;
};

export type AddDappTransactionRequest = BaseAddTransactionRequest & {
  // TODO: Replace `any` with type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dappRequest: Record<string, any>;
};

export async function addDappTransaction(
  request: AddDappTransactionRequest,
): Promise<string> {
  const { dappRequest } = request;
  const { id: actionId, method, origin } = dappRequest;
  const { securityAlertResponse, traceContext } = dappRequest;

  const transactionOptions: Partial<AddTransactionOptions> = {
    actionId,
    method,
    origin,
    // This is the default behaviour but specified here for clarity
    requireApproval: true,
    securityAlertResponse,
  };

  endTrace({ name: TraceName.Middleware, id: actionId });

  const { waitForHash } = await addTransactionOrUserOperation({
    ...request,
    transactionOptions: {
      ...transactionOptions,
      traceContext,
    },
  });

  const hash = (await waitForHash()) as string;

  endTrace({ name: TraceName.Transaction, id: actionId });

  return hash;
}

export async function addTransaction(
  request: AddTransactionRequest,
): Promise<TransactionMeta> {
  const { transactionMeta, waitForHash } = await addTransactionOrUserOperation(
    request,
  );

  if (!request.waitForSubmit) {
    waitForHash().catch(() => {
      // Not concerned with result.
    });

    return transactionMeta as TransactionMeta;
  }

  const transactionHash = await waitForHash();

  const finalTransactionMeta = getTransactionByHash(
    transactionHash as string,
    request.transactionController,
  );

  return finalTransactionMeta as TransactionMeta;
}

async function addTransactionOrUserOperation(
  request: FinalAddTransactionRequest,
) {
  const { selectedAccount } = request;

  const isSmartContractAccount =
    selectedAccount.type === EthAccountType.Erc4337;

  if (isSmartContractAccount) {
    return addUserOperationWithController(request);
  }

  return addTransactionWithController(request);
}

async function addTransactionWithController(
  request: FinalAddTransactionRequest,
) {
  const {
    transactionController,
    transactionOptions,
    transactionParams,
    networkClientId,
  } = request;

  const { result, transactionMeta } =
    await transactionController.addTransaction(transactionParams, {
      ...transactionOptions,
      networkClientId,
    });

  return {
    transactionMeta,
    waitForHash: () => result,
  };
}

async function addUserOperationWithController(
  request: FinalAddTransactionRequest,
) {
  const {
    networkClientId,
    transactionController,
    transactionOptions,
    transactionParams,
    userOperationController,
  } = request;

  const { maxFeePerGas, maxPriorityFeePerGas } = transactionParams;
  // TODO: Replace `any` with type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { origin, requireApproval, type } = transactionOptions as any;

  const normalisedTransaction: TransactionParams = {
    ...transactionParams,
    maxFeePerGas: addHexPrefix(maxFeePerGas as string),
    maxPriorityFeePerGas: addHexPrefix(maxPriorityFeePerGas as string),
  };

  const swaps = transactionOptions?.swaps?.meta;

  if (swaps?.type) {
    delete swaps.type;
  }

  const options: AddUserOperationOptions = {
    networkClientId,
    origin,
    requireApproval,
    swaps,
    type,
  };

  const result = await userOperationController.addUserOperationFromTransaction(
    normalisedTransaction,
    options,
  );

  userOperationController.startPollingByNetworkClientId(networkClientId);

  const transactionMeta = getTransactionById(result.id, transactionController);

  return {
    transactionMeta,
    waitForHash: result.transactionHash,
  };
}

function getTransactionById(
  transactionId: string,
  transactionController: TransactionController,
) {
  return transactionController.state.transactions.find(
    (tx) => tx.id === transactionId,
  );
}

function getTransactionByHash(
  transactionHash: string,
  transactionController: TransactionController,
) {
  return transactionController.state.transactions.find(
    (tx) => tx.hash === transactionHash,
  );
}
