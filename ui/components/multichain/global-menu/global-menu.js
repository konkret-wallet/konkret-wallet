/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  SETTINGS_ROUTE,
  DEFAULT_ROUTE,
  NOTIFICATIONS_ROUTE,
  SNAPS_ROUTE,
  PERMISSIONS,
} from '../../../helpers/constants/routes';
import { lockMetamask } from '../../../store/actions';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  Box,
  IconName,
  Popover,
  PopoverPosition,
} from '../../component-library';

import { MenuItem } from '../../ui/menu';
// TODO: Remove restricted import
// eslint-disable-next-line import/no-restricted-paths
import { getEnvironmentType } from '../../../../app/scripts/lib/util';
import { ENVIRONMENT_TYPE_FULLSCREEN } from '../../../../shared/constants/app';

import {
  getSelectedInternalAccount,
  getUnapprovedTransactions,
  getUseExternalServices,
} from '../../../selectors';
import {
  AlignItems,
  BlockSize,
  BorderColor,
  BorderStyle,
  Display,
  FlexDirection,
  JustifyContent,
} from '../../../helpers/constants/design-system';
import { AccountDetailsMenuItem, ViewExplorerMenuItem } from '..';

const METRICS_LOCATION = 'Global Menu';

export const GlobalMenu = ({ closeMenu, anchorElement, isOpen }) => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const basicFunctionality = useSelector(getUseExternalServices);

  const history = useHistory();

  const account = useSelector(getSelectedInternalAccount);

  const unapprovedTransactions = useSelector(getUnapprovedTransactions);

  const hasUnapprovedTransactions =
    Object.keys(unapprovedTransactions).length > 0;

  // Accessibility improvement for popover
  const lastItemRef = React.useRef(null);

  React.useEffect(() => {
    const lastItem = lastItemRef.current;
    const handleKeyDown = (event) => {
      if (event.key === 'Tab' && !event.shiftKey) {
        event.preventDefault();
        closeMenu();
      }
    };

    if (lastItem) {
      lastItem.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (lastItem) {
        lastItem.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [closeMenu]);

  return (
    <Popover
      data-testid="global-menu"
      referenceElement={anchorElement}
      isOpen={isOpen}
      padding={0}
      onClickOutside={closeMenu}
      onPressEscKey={closeMenu}
      style={{
        overflow: 'hidden',
        minWidth: 225,
      }}
      borderStyle={BorderStyle.none}
      position={PopoverPosition.BottomEnd}
    >
      {account && (
        <>
          <AccountDetailsMenuItem
            metricsLocation={METRICS_LOCATION}
            closeMenu={closeMenu}
            address={account.address}
          />
          <ViewExplorerMenuItem
            metricsLocation={METRICS_LOCATION}
            closeMenu={closeMenu}
            account={account}
          />
        </>
      )}
      <Box
        borderColor={BorderColor.borderMuted}
        width={BlockSize.Full}
        style={{ height: '1px', borderBottomWidth: 0 }}
      ></Box>
      <MenuItem
        iconName={IconName.SecurityTick}
        onClick={() => {
          history.push(PERMISSIONS);
          closeMenu();
        }}
        data-testid="global-menu-connected-sites"
        disabled={hasUnapprovedTransactions}
      >
        {t('allPermissions')}
      </MenuItem>

      {getEnvironmentType() === ENVIRONMENT_TYPE_FULLSCREEN ? null : (
        <MenuItem
          iconName={IconName.Expand}
          onClick={() => {
            global.platform.openExtensionInBrowser();
            closeMenu();
          }}
          data-testid="global-menu-expand"
        >
          {t('expandView')}
        </MenuItem>
      )}
      <MenuItem
        iconName={IconName.Setting}
        disabled={hasUnapprovedTransactions}
        onClick={() => {
          history.push(SETTINGS_ROUTE);
          closeMenu();
        }}
        data-testid="global-menu-settings"
      >
        {t('settings')}
      </MenuItem>
      <MenuItem
        ref={lastItemRef} // ref for last item in GlobalMenu
        iconName={IconName.Lock}
        onClick={() => {
          dispatch(lockMetamask());
          history.push(DEFAULT_ROUTE);
          closeMenu();
        }}
        data-testid="global-menu-lock"
      >
        {t('lockMetaMask')}
      </MenuItem>
    </Popover>
  );
};

GlobalMenu.propTypes = {
  /**
   * The element that the menu should display next to
   */
  anchorElement: PropTypes.instanceOf(window.Element),
  /**
   * Function that closes this menu
   */
  closeMenu: PropTypes.func.isRequired,
  /**
   * Whether or not the menu is open
   */
  isOpen: PropTypes.bool.isRequired,
};
