/* eslint-disable camelcase */
/* eslint-disable no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { TransactionControllerTransactionFailedEvent } from '@metamask/transaction-controller';
// eslint-disable-next-line import/no-restricted-paths
import { ActionType } from '../../../../ui/hooks/bridge/events/types';
// eslint-disable-next-line import/no-restricted-paths
import {
  BridgeStatusControllerBridgeTransactionCompleteEvent,
  BridgeStatusControllerBridgeTransactionFailedEvent,
} from '../../controllers/bridge-status/types';
import { decimalToPrefixedHex } from '../../../../shared/modules/conversion.utils';
import { calcTokenAmount } from '../../../../shared/lib/transactions-controller-utils';
// eslint-disable-next-line import/no-restricted-paths
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
  MetaMetricsEventOptions,
  MetaMetricsEventPayload,
} from '../../../../shared/constants/metametrics';
// eslint-disable-next-line import/no-restricted-paths
import {
  StatusTypes,
  MetricsBackgroundState,
} from '../../../../shared/types/bridge-status';
import { isEthUsdt } from '../../../../shared/modules/bridge-utils/bridge.util';
import { formatChainIdToHex } from '../../../../shared/modules/bridge-utils/caip-formatters';
import { getTokenUsdValue } from './metrics-utils';

type TrackEvent = (
  payload: MetaMetricsEventPayload,
  options?: MetaMetricsEventOptions,
) => void;

export const handleBridgeTransactionComplete = async (
  payload: BridgeStatusControllerBridgeTransactionCompleteEvent['payload'][0],
  {
    backgroundState,
  }: {
    backgroundState: MetricsBackgroundState;
    trackEvent: TrackEvent;
  },
) => {};

/**
 * This handles the BridgeStatusController:bridgeTransactionFailed event.
 * This is to capture bridge txs that fail on the source or destination chain.
 * We directly receive the bridgeHistoryItem as a payload here.
 *
 * @param payload
 * @param options0
 * @param options0.backgroundState
 * @param options0.trackEvent
 */
export const handleBridgeTransactionFailed = async (
  payload: BridgeStatusControllerBridgeTransactionFailedEvent['payload'][0],
  {
    backgroundState,
    trackEvent,
  }: {
    backgroundState: MetricsBackgroundState;
    trackEvent: TrackEvent;
  },
) => {};

/**
 * This handles the TransactionController:transactionFailed event.
 * This is mostly to capture bridge txs that fail on the source chain before getting to the bridge.
 * We do not receive the bridgeHistoryItem as a payload here, so we need to look it up using the txMeta.id.
 *
 * @param payload
 * @param options0
 * @param options0.backgroundState
 * @param options0.trackEvent
 */
export const handleTransactionFailedTypeBridge = async (
  payload: TransactionControllerTransactionFailedEvent['payload'][0],
  {
    backgroundState,
    trackEvent,
  }: {
    backgroundState: MetricsBackgroundState;
    trackEvent: TrackEvent;
  },
) => {};
