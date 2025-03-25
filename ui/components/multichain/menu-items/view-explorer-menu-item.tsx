import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { InternalAccount } from '@metamask/keyring-internal-api';
import {
  getMultichainAccountUrl,
  getMultichainBlockExplorerUrl,
} from '../../../helpers/utils/multichain/blockExplorer';

import { MenuItem } from '../../ui/menu';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { IconName, Text } from '../../component-library';
import { getBlockExplorerLinkText } from '../../../selectors';
import { getURLHostName } from '../../../helpers/utils/util';
import { NETWORKS_ROUTE } from '../../../helpers/constants/routes';
import { getMultichainNetwork } from '../../../selectors/multichain';
import { useMultichainSelector } from '../../../hooks/useMultichainSelector';

export type ViewExplorerMenuItemProps = {
  /**
   * Represents the "location" property of the metrics event
   */
  metricsLocation?: string;
  /**
   * Closes the menu
   */
  closeMenu?: () => void;
  /**
   * Custom properties for the menu item text
   */
  textProps?: object;
  /**
   * Account to show account details for
   */
  account: InternalAccount;
};

export const openBlockExplorer = (
  addressLink: string,
  closeMenu?: () => void,
) => {
  global.platform.openTab({
    url: addressLink,
  });
  closeMenu?.();
};

export const ViewExplorerMenuItem = ({
  closeMenu,
  textProps,
  account,
}: ViewExplorerMenuItemProps) => {
  const t = useI18nContext();
  const history = useHistory();

  const multichainNetwork = useMultichainSelector(
    getMultichainNetwork,
    account,
  );
  const addressLink = getMultichainAccountUrl(
    account.address,
    multichainNetwork,
  );
  const blockExplorerUrl = getMultichainBlockExplorerUrl(multichainNetwork);
  const blockExplorerUrlSubTitle = getURLHostName(blockExplorerUrl);
  const blockExplorerLinkText = useSelector(getBlockExplorerLinkText);

  const routeToAddBlockExplorerUrl = () => {
    history.push(`${NETWORKS_ROUTE}#blockExplorerUrl`);
  };

  const LABEL = t('viewOnExplorer');

  return (
    // @ts-expect-error - TODO: Fix MenuItem props types
    <MenuItem
      onClick={() => {
        blockExplorerLinkText.firstPart === 'addBlockExplorer'
          ? routeToAddBlockExplorerUrl()
          : openBlockExplorer(addressLink, closeMenu);

        closeMenu?.();
      }}
      subtitle={blockExplorerUrlSubTitle || null}
      iconName={IconName.Export}
      data-testid="account-list-menu-open-explorer"
    >
      {textProps ? <Text {...textProps}>{LABEL}</Text> : LABEL}
    </MenuItem>
  );
};
