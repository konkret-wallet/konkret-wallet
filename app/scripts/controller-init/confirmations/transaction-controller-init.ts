/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-empty-function */
import {
  CHAIN_IDS,
  TransactionController,
  TransactionControllerMessenger,
} from '@metamask/transaction-controller';
import { Hex } from '@metamask/utils';
import { trace } from '../../../../shared/lib/trace';
import {
  ControllerInitFunction,
  ControllerInitRequest,
  ControllerInitResult,
} from '../types';
import { TransactionControllerInitMessenger } from '../messengers/transaction-controller-messenger';

export const TransactionControllerInit: ControllerInitFunction<
  TransactionController,
  TransactionControllerMessenger,
  TransactionControllerInitMessenger
> = (request) => {
  const {
    controllerMessenger,
    initMessenger,
    getGlobalChainId,
    getPermittedAccounts,
    persistedState,
  } = request;

  const {
    gasFeeController,
    keyringController,
    networkController,
    onboardingController,
    preferencesController,
  } = getControllers(request);

  const controller: TransactionController = new TransactionController({
    getCurrentNetworkEIP1559Compatibility: () =>
      // @ts-expect-error Controller type does not support undefined return value
      initMessenger.call('NetworkController:getEIP1559Compatibility'),
    getCurrentAccountEIP1559Compatibility: async () => true,
    getExternalPendingTransactions: (_address) => [],
    getGasFeeEstimates: (...args) =>
      gasFeeController().fetchGasFeeEstimates(...args),
    getNetworkClientRegistry: (...args) =>
      networkController().getNetworkClientRegistry(...args),
    getNetworkState: () => networkController().state,
    // @ts-expect-error Controller type does not support undefined return value
    getPermittedAccounts,
    // @ts-expect-error Preferences controller uses Record rather than specific type
    getSavedGasFees: () => {
      const globalChainId = getGlobalChainId();
      return preferencesController().state.advancedGasFee[globalChainId];
    },
    incomingTransactions: {
      etherscanApiKeysByChainId: {
        // @ts-expect-error Controller does not support undefined values
        [CHAIN_IDS.MAINNET]: process.env.ETHERSCAN_API_KEY,
        // @ts-expect-error Controller does not support undefined values
        [CHAIN_IDS.SEPOLIA]: process.env.ETHERSCAN_API_KEY,
      },
      includeTokenTransfers: false,
      isEnabled: () =>
        preferencesController().state.incomingTransactionsPreferences?.[
          // @ts-expect-error PreferencesController incorrectly expects number index
          getGlobalChainId()
        ] && onboardingController().state.completedOnboarding,
      queryEntireHistory: false,
      updateTransactions: false,
    },
    isSimulationEnabled: () => false,
    messenger: controllerMessenger,
    pendingTransactions: {
      isResubmitEnabled: () => true,
    },
    testGasFeeFlows: Boolean(process.env.TEST_GAS_FEE_FLOWS === 'true'),
    // @ts-expect-error Controller uses string for names rather than enum
    trace,
    hooks: {
      // @ts-expect-error used to be handled by smart-transactions-controller
      publish: (_transactionMeta, _rawTx: Hex) => {},
    },
    // @ts-expect-error Keyring controller expects TxData returned but TransactionController expects TypedTransaction
    sign: (...args) => keyringController().signTransaction(...args),
    state: persistedState.TransactionController,
  });

  const api = getApi(controller);

  return { controller, api, memStateKey: 'TxController' };
};

function getApi(
  controller: TransactionController,
): ControllerInitResult<TransactionController>['api'] {
  return {
    abortTransactionSigning:
      controller.abortTransactionSigning.bind(controller),
    getLayer1GasFee: controller.getLayer1GasFee.bind(controller),
    getTransactions: controller.getTransactions.bind(controller),
    updateEditableParams: controller.updateEditableParams.bind(controller),
    updatePreviousGasParams:
      controller.updatePreviousGasParams.bind(controller),
    updateTransactionGasFees:
      controller.updateTransactionGasFees.bind(controller),
    updateTransactionSendFlowHistory:
      controller.updateTransactionSendFlowHistory.bind(controller),
  };
}

function getControllers(
  request: ControllerInitRequest<
    TransactionControllerMessenger,
    TransactionControllerInitMessenger
  >,
) {
  return {
    gasFeeController: () => request.getController('GasFeeController'),
    keyringController: () => request.getController('KeyringController'),
    networkController: () => request.getController('NetworkController'),
    onboardingController: () => request.getController('OnboardingController'),
    preferencesController: () => request.getController('PreferencesController'),
  };
}
