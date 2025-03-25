import React, { useContext, useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import isEqual from 'lodash/isEqual';
import { getBlockExplorerLink } from '@metamask/etherscan-link';
import { I18nContext } from '../../../contexts/i18n';
import { getCurrentChainId } from '../../../../shared/modules/selectors/networks';
import {
  getRpcPrefsForCurrentProvider,
  getFullTxData,
} from '../../../selectors';

import {
  getUsedQuote,
  fetchQuotesAndSetQuoteState,
  navigateBackToPrepareSwap,
  prepareForRetryGetQuotes,
  prepareToLeaveSwaps,
  getFromTokenInputValue,
  getMaxSlippage,
} from '../../../ducks/swaps/swaps';
import {
  QUOTES_EXPIRED_ERROR,
  SWAP_FAILED_ERROR,
  ERROR_FETCHING_QUOTES,
  QUOTES_NOT_AVAILABLE_ERROR,
  CONTRACT_DATA_DISABLED_ERROR,
  OFFLINE_FOR_MAINTENANCE,
} from '../../../../shared/constants/swaps';
import { CHAINID_DEFAULT_BLOCK_EXPLORER_URL_MAP } from '../../../../shared/constants/common';
import { isSwapsDefaultTokenSymbol } from '../../../../shared/modules/swaps.utils';
import PulseLoader from '../../../components/ui/pulse-loader';
import { isFlask, isBeta } from '../../../helpers/utils/build-types';

import { DEFAULT_ROUTE } from '../../../helpers/constants/routes';
import {
  stopPollingForQuotes,
  setDefaultHomeActiveTabName,
} from '../../../store/actions';

import SwapsFooter from '../swaps-footer';

import CreateNewSwap from '../create-new-swap';
import ViewOnBlockExplorer from '../view-on-block-explorer';
import { SUPPORT_LINK } from '../../../../shared/lib/ui-utils';
import SwapFailureIcon from './swap-failure-icon';
import SwapSuccessIcon from './swap-success-icon';
import QuotesTimeoutIcon from './quotes-timeout-icon';

export default function AwaitingSwap({
  swapComplete,
  errorKey,
  txHash,
  tokensReceived,
  submittingSwap,
  txId,
}) {
  const t = useContext(I18nContext);
  const history = useHistory();
  const dispatch = useDispatch();
  const { swapMetaData } =
    useSelector((state) => getFullTxData(state, txId)) || {};
  const fromTokenInputValue = useSelector(getFromTokenInputValue);
  const maxSlippage = useSelector(getMaxSlippage);
  const usedQuote = useSelector(getUsedQuote, isEqual);
  const chainId = useSelector(getCurrentChainId);
  const rpcPrefs = useSelector(getRpcPrefsForCurrentProvider, shallowEqual);

  const destinationTokenSymbol =
    usedQuote?.destinationTokenInfo?.symbol || swapMetaData?.token_to;

  const baseNetworkUrl =
    rpcPrefs.blockExplorerUrl ??
    CHAINID_DEFAULT_BLOCK_EXPLORER_URL_MAP[chainId] ??
    null;
  const blockExplorerUrl = getBlockExplorerLink(
    { hash: txHash, chainId },
    { blockExplorerUrl: baseNetworkUrl },
  );

  let headerText;
  let statusImage;
  let descriptionText;
  let submitText;
  let content;

  if (errorKey === OFFLINE_FOR_MAINTENANCE) {
    headerText = t('offlineForMaintenance');
    descriptionText = t('metamaskSwapsOfflineDescription');
    submitText = t('close');
    statusImage = <SwapFailureIcon />;
  } else if (errorKey === SWAP_FAILED_ERROR) {
    headerText = t('swapFailedErrorTitle');
    descriptionText = t('swapFailedErrorDescriptionWithSupportLink', [
      <a
        className="awaiting-swap__support-link"
        key="awaiting-swap-support-link"
        href={SUPPORT_LINK}
        target="_blank"
        rel="noopener noreferrer"
      >
        {new URL(SUPPORT_LINK).hostname}
      </a>,
    ]);
    submitText = t('tryAgain');
    statusImage = <SwapFailureIcon />;
    content = blockExplorerUrl && (
      <ViewOnBlockExplorer blockExplorerUrl={blockExplorerUrl} />
    );
  } else if (errorKey === QUOTES_EXPIRED_ERROR) {
    headerText = t('swapQuotesExpiredErrorTitle');
    descriptionText = t('swapQuotesExpiredErrorDescription');
    submitText = t('tryAgain');
    statusImage = <QuotesTimeoutIcon />;
  } else if (errorKey === ERROR_FETCHING_QUOTES) {
    headerText = t('swapFetchingQuotesErrorTitle');
    descriptionText = t('swapFetchingQuotesErrorDescription');
    submitText = t('back');
    statusImage = <SwapFailureIcon />;
  } else if (errorKey === QUOTES_NOT_AVAILABLE_ERROR) {
    headerText = t('swapQuotesNotAvailableErrorTitle');
    descriptionText = t('swapQuotesNotAvailableErrorDescription');
    submitText = t('tryAgain');
    statusImage = <SwapFailureIcon />;
  } else if (errorKey === CONTRACT_DATA_DISABLED_ERROR) {
    headerText = t('swapContractDataDisabledErrorTitle');
    descriptionText = t('swapContractDataDisabledErrorDescription');
    submitText = t('tryAgain');
    statusImage = <SwapFailureIcon />;
  } else if (!errorKey && !swapComplete) {
    headerText = t('swapProcessing');
    statusImage = <PulseLoader />;
    submitText = t('swapsViewInActivity');
    descriptionText = t('swapOnceTransactionHasProcess', [
      <span
        key="swapOnceTransactionHasProcess-1"
        className="awaiting-swap__amount-and-symbol"
        data-testid="awaiting-swap-amount-and-symbol"
      >
        {destinationTokenSymbol}
      </span>,
    ]);
    content = blockExplorerUrl && (
      <ViewOnBlockExplorer blockExplorerUrl={blockExplorerUrl} />
    );
  } else if (!errorKey && swapComplete) {
    headerText = t('swapTransactionComplete');
    statusImage = <SwapSuccessIcon />;
    submitText = t('close');
    descriptionText = t('swapTokenAvailable', [
      <span
        key="swapTokenAvailable-2"
        className="awaiting-swap__amount-and-symbol"
      >
        {`${tokensReceived || ''} ${destinationTokenSymbol}`}
      </span>,
    ]);
    content = blockExplorerUrl && (
      <ViewOnBlockExplorer blockExplorerUrl={blockExplorerUrl} />
    );
  }

  useEffect(() => {
    if (errorKey) {
      // If there was an error, stop polling for quotes.
      dispatch(stopPollingForQuotes());
    }
  }, [dispatch, errorKey]);

  const renderMascot = () => {
    if (isFlask()) {
      return (
        <div className="awaiting-swap__mascot">
          <img src="./images/logo/metamask-fox.svg" width="90" height="90" />
        </div>
      );
    }
    if (isBeta()) {
      return (
        <div className="awaiting-swap__mascot">
          <img src="./images/logo/metamask-fox.svg" width="90" height="90" />
        </div>
      );
    }
    return <img src="./images/logo/metamask-fox.svg" width="90" height="90" />;
  };

  return (
    <div className="awaiting-swap">
      <div className="awaiting-swap__content">
        {!(swapComplete || errorKey) && renderMascot()}
        <div className="awaiting-swap__status-image">{statusImage}</div>
        <div
          className="awaiting-swap__header"
          data-testid="awaiting-swap-header"
        >
          {headerText}
        </div>
        <div
          className="awaiting-swap__main-description"
          data-testid="awaiting-swap-main-description"
        >
          {descriptionText}
        </div>
        {content}
      </div>
      {!errorKey && swapComplete ? <CreateNewSwap /> : null}
      <SwapsFooter
        onSubmit={async () => {
          /* istanbul ignore next */
          if (errorKey === OFFLINE_FOR_MAINTENANCE) {
            await dispatch(prepareToLeaveSwaps());
            history.push(DEFAULT_ROUTE);
          } else if (errorKey === QUOTES_EXPIRED_ERROR) {
            dispatch(prepareForRetryGetQuotes());
            await dispatch(
              fetchQuotesAndSetQuoteState(
                history,
                fromTokenInputValue,
                maxSlippage,
              ),
            );
          } else if (errorKey) {
            await dispatch(navigateBackToPrepareSwap(history));
          } else if (
            isSwapsDefaultTokenSymbol(destinationTokenSymbol, chainId) ||
            swapComplete
          ) {
            history.push(DEFAULT_ROUTE);
          } else {
            await dispatch(setDefaultHomeActiveTabName('activity'));
            history.push(DEFAULT_ROUTE);
          }
        }}
        onCancel={async () =>
          await dispatch(navigateBackToPrepareSwap(history))
        }
        submitText={submitText}
        disabled={submittingSwap}
        hideCancel={errorKey !== QUOTES_EXPIRED_ERROR}
      />
    </div>
  );
}

AwaitingSwap.propTypes = {
  swapComplete: PropTypes.bool,
  txHash: PropTypes.string,
  tokensReceived: PropTypes.string,
  errorKey: PropTypes.oneOf([
    QUOTES_EXPIRED_ERROR,
    SWAP_FAILED_ERROR,
    ERROR_FETCHING_QUOTES,
    QUOTES_NOT_AVAILABLE_ERROR,
    OFFLINE_FOR_MAINTENANCE,
    CONTRACT_DATA_DISABLED_ERROR,
  ]),
  submittingSwap: PropTypes.bool,
  txId: PropTypes.string,
};
