import React, {
  useCallback,
  useContext,
  useState,
  ///: BEGIN:ONLY_INCLUDE_IF(multichain)
  useEffect,
  ///: END:ONLY_INCLUDE_IF
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
///: BEGIN:ONLY_INCLUDE_IF(build-beta)
import { toHex } from '@metamask/controller-utils';
///: END:ONLY_INCLUDE_IF
import {
  ///: BEGIN:ONLY_INCLUDE_IF(build-beta)
  isCaipChainId,
  ///: END:ONLY_INCLUDE_IF
  CaipChainId,
} from '@metamask/utils';

///: BEGIN:ONLY_INCLUDE_IF(multichain)
import { isEvmAccountType } from '@metamask/keyring-api';
import { InternalAccount } from '@metamask/keyring-internal-api';
import { SnapId } from '@metamask/snaps-sdk';
///: END:ONLY_INCLUDE_IF
///: BEGIN:ONLY_INCLUDE_IF(build-beta)
import { ChainId } from '../../../../shared/constants/network';
///: END:ONLY_INCLUDE_IF

import { I18nContext } from '../../../contexts/i18n';
import {
  ///: BEGIN:ONLY_INCLUDE_IF(multichain)
  CONFIRMATION_V_NEXT_ROUTE,
  ///: END:ONLY_INCLUDE_IF
  SEND_ROUTE,
} from '../../../helpers/constants/routes';
import {
  ///: BEGIN:ONLY_INCLUDE_IF(multichain)
  getMemoizedUnapprovedTemplatedConfirmations,
  ///: END:ONLY_INCLUDE_IF
  getNetworkConfigurationIdByChainId,
} from '../../../selectors';
import Tooltip from '../../ui/tooltip';
import { AssetType } from '../../../../shared/constants/transaction';
import { startNewDraftTransaction } from '../../../ducks/send';
import {
  Display,
  IconColor,
  JustifyContent,
} from '../../../helpers/constants/design-system';
import { Box, Icon, IconName, IconSize } from '../../component-library';
import IconButton from '../../ui/icon-button';
///: BEGIN:ONLY_INCLUDE_IF(build-beta)
import useRamps from '../../../hooks/ramps/useRamps/useRamps';
///: END:ONLY_INCLUDE_IF
import { ReceiveModal } from '../../multichain/receive-modal';
import {
  setSwitchedNetworkDetails,
  setActiveNetworkWithError,
  ///: BEGIN:ONLY_INCLUDE_IF(multichain)
  sendMultichainTransaction,
  setDefaultHomeActiveTabName,
  ///: END:ONLY_INCLUDE_IF
} from '../../../store/actions';
///: BEGIN:ONLY_INCLUDE_IF(multichain)
import { isMultichainWalletSnap } from '../../../../shared/lib/accounts/snaps';
///: END:ONLY_INCLUDE_IF
import { getMultichainNetwork } from '../../../selectors/multichain';
import { useMultichainSelector } from '../../../hooks/useMultichainSelector';
import { getCurrentChainId } from '../../../../shared/modules/selectors/networks';

type CoinButtonsProps = {
  account: InternalAccount;
  chainId: `0x${string}` | CaipChainId | number;
  isSigningEnabled: boolean;
  ///: BEGIN:ONLY_INCLUDE_IF(build-beta)
  isBridgeChain: boolean;
  ///: END:ONLY_INCLUDE_IF
  ///: BEGIN:ONLY_INCLUDE_IF(build-beta)
  isBuyableChain: boolean;
  ///: END:ONLY_INCLUDE_IF
  classPrefix?: string;
  iconButtonClassName?: string;
};

const CoinButtons = ({
  account,
  chainId,
  isSigningEnabled,
  ///: BEGIN:ONLY_INCLUDE_IF(build-beta)
  isBridgeChain,
  ///: END:ONLY_INCLUDE_IF
  ///: BEGIN:ONLY_INCLUDE_IF(build-beta)
  isBuyableChain,
  ///: END:ONLY_INCLUDE_IF
  classPrefix = 'coin',
  iconButtonClassName = '',
}: CoinButtonsProps) => {
  const t = useContext(I18nContext);
  const dispatch = useDispatch();

  const [showReceiveModal, setShowReceiveModal] = useState(false);

  const { address: selectedAddress } = account;
  const history = useHistory();
  const networks = useSelector(getNetworkConfigurationIdByChainId) as Record<
    string,
    string
  >;
  const currentChainId = useSelector(getCurrentChainId);
  ///: BEGIN:ONLY_INCLUDE_IF(multichain)
  const currentActivityTabName = useSelector(
    // @ts-expect-error TODO: fix state type
    (state) => state.metamask.defaultHomeActiveTabName,
  );
  ///: END:ONLY_INCLUDE_IF

  const { chainId: multichainChainId } = useMultichainSelector(
    getMultichainNetwork,
    account,
  );
  const buttonTooltips = {
    buyButton: [
      ///: BEGIN:ONLY_INCLUDE_IF(build-beta)
      { condition: !isBuyableChain, message: '' },
      ///: END:ONLY_INCLUDE_IF
    ],
    sendButton: [
      { condition: !isSigningEnabled, message: 'methodNotSupported' },
    ],
    bridgeButton: [
      ///: BEGIN:ONLY_INCLUDE_IF(build-beta)
      { condition: !isBridgeChain, message: 'currentlyUnavailable' },
      ///: END:ONLY_INCLUDE_IF
      { condition: !isSigningEnabled, message: 'methodNotSupported' },
    ],
  };

  const generateTooltip = (
    buttonKey: keyof typeof buttonTooltips,
    contents: React.ReactElement,
  ) => {
    const conditions = buttonTooltips[buttonKey];
    const tooltipInfo = conditions.find(({ condition }) => condition);
    if (tooltipInfo?.message) {
      return (
        <Tooltip title={t(tooltipInfo.message)} position="bottom">
          {contents}
        </Tooltip>
      );
    }
    return contents;
  };

  ///: BEGIN:ONLY_INCLUDE_IF(build-beta)
  const getChainId = (): CaipChainId | ChainId => {
    if (isCaipChainId(chainId)) {
      return chainId as CaipChainId;
    }
    // Otherwise we assume that's an EVM chain ID, so use the usual 0x prefix
    return toHex(chainId) as ChainId;
  };
  ///: END:ONLY_INCLUDE_IF

  ///: BEGIN:ONLY_INCLUDE_IF(build-beta)
  const { openBuyCryptoInPdapp } = useRamps();
  ///: END:ONLY_INCLUDE_IF

  ///: BEGIN:ONLY_INCLUDE_IF(multichain)
  const unapprovedTemplatedConfirmations = useSelector(
    getMemoizedUnapprovedTemplatedConfirmations,
  );

  useEffect(() => {
    const templatedSnapApproval = unapprovedTemplatedConfirmations.find(
      (approval) => {
        return (
          approval.type === 'snap_dialog' &&
          account.metadata.snap &&
          account.metadata.snap.id === approval.origin &&
          isMultichainWalletSnap(account.metadata.snap.id as SnapId)
        );
      },
    );

    if (templatedSnapApproval) {
      history.push(`${CONFIRMATION_V_NEXT_ROUTE}/${templatedSnapApproval.id}`);
    }
  }, [unapprovedTemplatedConfirmations, history, account]);
  ///: END:ONLY_INCLUDE_IF

  const setCorrectChain = useCallback(async () => {
    if (currentChainId !== chainId && multichainChainId !== chainId) {
      try {
        const networkConfigurationId = networks[chainId];
        await dispatch(setActiveNetworkWithError(networkConfigurationId));
        await dispatch(
          setSwitchedNetworkDetails({
            networkClientId: networkConfigurationId,
          }),
        );
      } catch (err) {
        console.error(`Failed to switch chains.
        Target chainId: ${chainId}, Current chainId: ${currentChainId}.
        ${err}`);
        throw err;
      }
    }
  }, [currentChainId, chainId, networks, dispatch]);

  const handleSendOnClick = useCallback(async () => {
    ///: BEGIN:ONLY_INCLUDE_IF(multichain)
    if (!isEvmAccountType(account.type)) {
      // Non-EVM (Snap) Send flow
      if (!account.metadata.snap) {
        throw new Error('Non-EVM needs to be Snap accounts');
      }

      // TODO: Remove this once we want to enable all non-EVM Snaps
      if (!isMultichainWalletSnap(account.metadata.snap.id as SnapId)) {
        throw new Error(
          `Non-EVM Snap is not whitelisted: ${account.metadata.snap.id}`,
        );
      }

      try {
        // FIXME: We switch the tab before starting the send flow (we
        // faced some inconsistencies when changing it after).
        await dispatch(setDefaultHomeActiveTabName('activity'));
        await sendMultichainTransaction(account.metadata.snap.id, {
          account: account.id,
          scope: chainId as CaipChainId,
        });
      } catch {
        // Restore the previous tab in case of any error (see FIXME comment above).
        await dispatch(setDefaultHomeActiveTabName(currentActivityTabName));
      }

      // Early return, not to let the non-EVM flow slip into the native send flow.
      return;
    }
    ///: END:ONLY_INCLUDE_IF

    // Native Send flow
    await setCorrectChain();
    await dispatch(startNewDraftTransaction({ type: AssetType.native }));
    history.push(SEND_ROUTE);
  }, [chainId, account, setCorrectChain]);

  ///: BEGIN:ONLY_INCLUDE_IF(build-beta)
  const handleBuyAndSellOnClick = useCallback(() => {
    openBuyCryptoInPdapp(getChainId());
    // TODO: memozie chainId?
    // openBuyCryptoInPdapp(chainId);
    // }, [chainId]);
  }, []);
  ///: END:ONLY_INCLUDE_IF

  return (
    <Box display={Display.Flex} justifyContent={JustifyContent.spaceEvenly}>
      {
        ///: BEGIN:ONLY_INCLUDE_IF(build-beta)
        <IconButton
          className={`${classPrefix}-overview__button`}
          iconButtonClassName={iconButtonClassName}
          Icon={
            <Icon
              name={IconName.PlusMinus}
              color={IconColor.primaryInverse}
              size={IconSize.Sm}
            />
          }
          disabled={!isBuyableChain}
          data-testid={`${classPrefix}-overview-buy`}
          label={t('buyAndSell')}
          onClick={handleBuyAndSellOnClick}
          tooltipRender={(contents: React.ReactElement) =>
            generateTooltip('buyButton', contents)
          }
        />
        ///: END:ONLY_INCLUDE_IF
      }
      <IconButton
        className={`${classPrefix}-overview__button`}
        iconButtonClassName={iconButtonClassName}
        data-testid={`${classPrefix}-overview-send`}
        Icon={
          <Icon
            name={IconName.Arrow2UpRight}
            color={IconColor.primaryInverse}
            size={IconSize.Sm}
          />
        }
        disabled={!isSigningEnabled}
        label={t('send')}
        onClick={handleSendOnClick}
        tooltipRender={(contents: React.ReactElement) =>
          generateTooltip('sendButton', contents)
        }
      />
      {
        <>
          {showReceiveModal && (
            <ReceiveModal
              address={selectedAddress}
              onClose={() => setShowReceiveModal(false)}
            />
          )}
          <IconButton
            className={`${classPrefix}-overview__button`}
            iconButtonClassName={iconButtonClassName}
            data-testid={`${classPrefix}-overview-receive`}
            Icon={
              <Icon
                name={IconName.ScanBarcode}
                color={IconColor.primaryInverse}
                size={IconSize.Sm}
              />
            }
            label={t('receive')}
            onClick={() => {
              setShowReceiveModal(true);
            }}
          />
        </>
      }
    </Box>
  );
};

export default CoinButtons;
