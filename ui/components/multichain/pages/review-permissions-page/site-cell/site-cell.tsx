import React, { useState } from 'react';
import { Hex } from '@metamask/utils';
import {
  BackgroundColor,
  BorderColor,
  BorderRadius,
} from '../../../../../helpers/constants/design-system';
import { useI18nContext } from '../../../../../hooks/useI18nContext';
import {
  AvatarAccount,
  AvatarAccountSize,
  Box,
  IconName,
} from '../../../../component-library';
import { EditAccountsModal, EditNetworksModal } from '../../..';
import { MergedInternalAccount } from '../../../../../selectors/selectors.types';
import { isEqualCaseInsensitive } from '../../../../../../shared/modules/string-utils';
import { SiteCellTooltip } from './site-cell-tooltip';
import { SiteCellConnectionListItem } from './site-cell-connection-list-item';

// Define types for networks, accounts, and other props
type Network = {
  name: string;
  chainId: string;
};

type SiteCellProps = {
  nonTestNetworks: Network[];
  testNetworks: Network[];
  accounts: MergedInternalAccount[];
  onSelectAccountAddresses: (addresses: string[]) => void;
  onSelectChainIds: (chainIds: Hex[]) => void;
  selectedAccountAddresses: string[];
  selectedChainIds: string[];
  isConnectFlow?: boolean;
  hideAllToasts?: () => void;
};

export const SiteCell: React.FC<SiteCellProps> = ({
  nonTestNetworks,
  testNetworks,
  accounts,
  onSelectAccountAddresses,
  onSelectChainIds,
  selectedAccountAddresses,
  selectedChainIds,
  isConnectFlow,
  hideAllToasts = () => undefined,
}) => {
  const t = useI18nContext();
  const allNetworks = [...nonTestNetworks, ...testNetworks];

  const [showEditAccountsModal, setShowEditAccountsModal] = useState(false);
  const [showEditNetworksModal, setShowEditNetworksModal] = useState(false);

  const selectedAccounts = accounts.filter(({ address }) =>
    selectedAccountAddresses.some((selectedAccountAddress) =>
      isEqualCaseInsensitive(selectedAccountAddress, address),
    ),
  );
  const selectedNetworks = allNetworks.filter(({ chainId }) =>
    selectedChainIds.includes(chainId),
  );

  const selectedChainIdsLength = selectedChainIds.length;

  // Determine the messages for connected and not connected states
  const accountMessageConnectedState =
    selectedAccounts.length === 1
      ? t('connectedWithAccountName', [
          selectedAccounts[0].metadata.name || selectedAccounts[0].label,
        ])
      : t('connectedWithAccount', [selectedAccounts.length]);
  const accountMessageNotConnectedState =
    selectedAccounts.length === 1
      ? t('requestingForAccount', [
          selectedAccounts[0].metadata.name || selectedAccounts[0].label,
        ])
      : t('requestingFor');

  const networkMessageConnectedState =
    selectedChainIdsLength === 1
      ? t('connectedWithNetworkName', [selectedNetworks[0].name])
      : t('connectedWithNetwork', [selectedChainIdsLength]);
  const networkMessageNotConnectedState =
    selectedChainIdsLength === 1
      ? t('requestingForNetwork', [selectedNetworks[0].name])
      : t('requestingFor');

  const handleOpenAccountsModal = () => {
    hideAllToasts?.();
    setShowEditAccountsModal(true);
  };

  const handleOpenNetworksModal = () => {
    hideAllToasts?.();
    setShowEditNetworksModal(true);
  };

  return (
    <>
      <Box
        padding={4}
        gap={4}
        backgroundColor={BackgroundColor.backgroundDefault}
        borderRadius={BorderRadius.LG}
      >
        <SiteCellConnectionListItem
          title={t('accountsPermissionsTitle')}
          iconName={IconName.Wallet}
          connectedMessage={accountMessageConnectedState}
          unconnectedMessage={accountMessageNotConnectedState}
          isConnectFlow={isConnectFlow}
          onClick={handleOpenAccountsModal}
          paddingBottomValue={2}
          paddingTopValue={0}
          content={
            // Why this difference?
            selectedAccounts.length === 1 ? (
              <AvatarAccount
                address={selectedAccounts[0].address}
                size={AvatarAccountSize.Xs}
                borderColor={BorderColor.transparent}
              />
            ) : (
              <SiteCellTooltip accounts={selectedAccounts} />
            )
          }
        />
        <SiteCellConnectionListItem
          title={t('permission_walletSwitchEthereumChain')}
          iconName={IconName.Data}
          connectedMessage={networkMessageConnectedState}
          unconnectedMessage={networkMessageNotConnectedState}
          isConnectFlow={isConnectFlow}
          onClick={handleOpenNetworksModal}
          paddingTopValue={2}
          paddingBottomValue={0}
          content={<SiteCellTooltip networks={selectedNetworks} />}
        />
      </Box>
      {showEditAccountsModal && (
        <EditAccountsModal
          accounts={accounts}
          defaultSelectedAccountAddresses={selectedAccountAddresses}
          onClose={() => setShowEditAccountsModal(false)}
          onSubmit={onSelectAccountAddresses}
        />
      )}

      {showEditNetworksModal && (
        <EditNetworksModal
          nonTestNetworks={nonTestNetworks}
          testNetworks={testNetworks}
          defaultSelectedChainIds={selectedChainIds}
          onClose={() => setShowEditNetworksModal(false)}
          onSubmit={onSelectChainIds}
        />
      )}
    </>
  );
};
