import React, {
  useContext,
  useState,
  ///: BEGIN:ONLY_INCLUDE_IF(build-beta)
  useCallback,
  ///: END:ONLY_INCLUDE_IF
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classnames from 'classnames';
import { CaipChainId } from '@metamask/utils';
import type { Hex } from '@metamask/utils';

import { InternalAccount } from '@metamask/keyring-internal-api';
import { getNativeTokenAddress } from '@metamask/assets-controllers';
import {
  Box,
  ButtonIcon,
  ButtonIconSize,
  ButtonLink,
  ButtonLinkSize,
  IconName,
  Popover,
  PopoverPosition,
  Text,
} from '../../component-library';
import {
  AlignItems,
  Display,
  JustifyContent,
  TextAlign,
  TextVariant,
  IconColor,
} from '../../../helpers/constants/design-system';
///: BEGIN:ONLY_INCLUDE_IF(build-beta)
import { getPortfolioUrl } from '../../../helpers/utils/portfolio';
///: END:ONLY_INCLUDE_IF

import { I18nContext } from '../../../contexts/i18n';
import Tooltip from '../../ui/tooltip';
import UserPreferencedCurrencyDisplay from '../user-preferenced-currency-display';
import { PRIMARY } from '../../../helpers/constants/common';
import {
  getPreferences,
  getShouldHideZeroBalanceTokens,
  getTokensMarketData,
  getIsTestnet,
  getShouldShowAggregatedBalancePopover,
  getIsTokenNetworkFilterEqualCurrentNetwork,
  getChainIdsToPoll,
  ///: BEGIN:ONLY_INCLUDE_IF(build-beta)
  SwapsEthToken,
  ///: END:ONLY_INCLUDE_IF
} from '../../../selectors';
import Spinner from '../../ui/spinner';

import { PercentageAndAmountChange } from '../../multichain/token-list-item/price/percentage-and-amount-change/percentage-and-amount-change';
import {
  getMultichainIsEvm,
  getMultichainShouldShowFiat,
} from '../../../selectors/multichain';
import {
  setAggregatedBalancePopoverShown,
  setPrivacyMode,
} from '../../../store/actions';
import { useTheme } from '../../../hooks/useTheme';
import { getSpecificSettingsRoute } from '../../../helpers/utils/settings-search';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { useAccountTotalCrossChainFiatBalance } from '../../../hooks/useAccountTotalCrossChainFiatBalance';

import { useGetFormattedTokensPerChain } from '../../../hooks/useGetFormattedTokensPerChain';
import { useMultichainSelector } from '../../../hooks/useMultichainSelector';
import { AggregatedBalance } from '../../ui/aggregated-balance/aggregated-balance';
import WalletOverview from './wallet-overview';
import CoinButtons from './coin-buttons';
import { AggregatedPercentageOverview } from './aggregated-percentage-overview';
import { AggregatedPercentageOverviewCrossChains } from './aggregated-percentage-overview-cross-chains';

export type CoinOverviewProps = {
  account: InternalAccount;
  balance: string;
  balanceIsCached: boolean;
  className?: string;
  classPrefix?: string;
  chainId: CaipChainId | Hex;
  ///: BEGIN:ONLY_INCLUDE_IF(build-beta)
  // FIXME: This seems to be for Ethereum only
  defaultSwapsToken?: SwapsEthToken;
  isBridgeChain: boolean;
  ///: END:ONLY_INCLUDE_IF
  isSwapsChain: boolean;
  isSigningEnabled: boolean;
};

export const LegacyAggregatedBalance = ({
  classPrefix,
  account,
  balance,
  balanceIsCached,
  handleSensitiveToggle,
}: {
  classPrefix: string;
  account: InternalAccount;
  balance: string;
  balanceIsCached: boolean;
  handleSensitiveToggle: () => void;
}) => {
  const isTokenNetworkFilterEqualCurrentNetwork = useSelector(
    getIsTokenNetworkFilterEqualCurrentNetwork,
  );
  const shouldHideZeroBalanceTokens = useSelector(
    getShouldHideZeroBalanceTokens,
  );
  const allChainIDs = useSelector(getChainIdsToPoll) as string[];
  const shouldShowFiat = useMultichainSelector(
    getMultichainShouldShowFiat,
    account,
  );
  const { privacyMode, showNativeTokenAsMainBalance } =
    useSelector(getPreferences);
  const isTestnet = useSelector(getIsTestnet);

  const { formattedTokensWithBalancesPerChain } = useGetFormattedTokensPerChain(
    account,
    shouldHideZeroBalanceTokens,
    isTokenNetworkFilterEqualCurrentNetwork,
    allChainIDs,
  );

  const { totalFiatBalance } = useAccountTotalCrossChainFiatBalance(
    account,
    formattedTokensWithBalancesPerChain,
  );

  const isNotAggregatedFiatBalance =
    !shouldShowFiat || showNativeTokenAsMainBalance || isTestnet;

  let balanceToDisplay;
  if (isNotAggregatedFiatBalance) {
    balanceToDisplay = balance;
  } else {
    balanceToDisplay = totalFiatBalance;
  }

  if (!balanceToDisplay) {
    return <Spinner className="loading-overlay__spinner" />;
  }
  return (
    <>
      <UserPreferencedCurrencyDisplay
        style={{ display: 'contents' }}
        account={account}
        className={classnames(`${classPrefix}-overview__primary-balance`, {
          [`${classPrefix}-overview__cached-balance`]: balanceIsCached,
        })}
        data-testid={`${classPrefix}-overview__primary-currency`}
        value={balanceToDisplay}
        type={PRIMARY}
        ethNumberOfDecimals={4}
        hideTitle
        shouldCheckShowNativeToken
        isAggregatedFiatOverviewBalance={
          !showNativeTokenAsMainBalance && !isTestnet && shouldShowFiat
        }
        privacyMode={privacyMode}
      />
      <ButtonIcon
        color={IconColor.iconAlternative}
        marginLeft={2}
        size={ButtonIconSize.Md}
        onClick={handleSensitiveToggle}
        iconName={privacyMode ? IconName.EyeSlash : IconName.Eye}
        justifyContent={JustifyContent.center}
        ariaLabel="Sensitive toggle"
        data-testid="sensitive-toggle"
      />
    </>
  );
};

export const CoinOverview = ({
  account,
  balance,
  balanceIsCached,
  className,
  classPrefix = 'coin',
  chainId,
  ///: BEGIN:ONLY_INCLUDE_IF(build-beta)
  defaultSwapsToken,
  isBridgeChain,
  ///: END:ONLY_INCLUDE_IF
  isSwapsChain,
  isSigningEnabled,
}: CoinOverviewProps) => {
  ///: BEGIN:ONLY_INCLUDE_IF(build-beta)
  // Pre-conditions
  if (isSwapsChain && defaultSwapsToken === undefined) {
    throw new Error('defaultSwapsToken is required');
  }
  ///: END:ONLY_INCLUDE_IF

  const t: ReturnType<typeof useI18nContext> = useContext(I18nContext);

  const showNativeTokenAsMainBalanceRoute = getSpecificSettingsRoute(
    t,
    t('general'),
    t('showNativeTokenAsMainBalance'),
  );
  const theme = useTheme();
  const dispatch = useDispatch();

  const shouldShowPopover = useSelector(getShouldShowAggregatedBalancePopover);
  const isTestnet = useSelector(getIsTestnet);
  const { showFiatInTestnets, privacyMode, showNativeTokenAsMainBalance } =
    useSelector(getPreferences);

  const isTokenNetworkFilterEqualCurrentNetwork = useSelector(
    getIsTokenNetworkFilterEqualCurrentNetwork,
  );

  const isEvm = useSelector(getMultichainIsEvm);

  const tokensMarketData = useSelector(getTokensMarketData);
  const [isOpen, setIsOpen] = useState(true);

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleClick = () => {
    setIsOpen(!isOpen);
    dispatch(setAggregatedBalancePopoverShown());
  };

  const handleSensitiveToggle = () => {
    dispatch(setPrivacyMode(!privacyMode));
  };

  const [referenceElement, setReferenceElement] =
    useState<HTMLSpanElement | null>(null);
  const setBoxRef = (ref: HTMLSpanElement | null) => {
    if (ref) {
      setReferenceElement(ref);
    }
  };

  ///: BEGIN:ONLY_INCLUDE_IF(build-beta)
  const handlePortfolioOnClick = useCallback(() => {
    const url = getPortfolioUrl('');
    global.platform.openTab({ url });
  }, []);
  ///: END:ONLY_INCLUDE_IF

  const renderPercentageAndAmountChange = () => {
    const renderPortfolioButton = () => {
      ///: BEGIN:ONLY_INCLUDE_IF(build-beta)
      return (
        <ButtonLink
          endIconName={IconName.Export}
          onClick={handlePortfolioOnClick}
          as="a"
          data-testid="portfolio-link"
          textProps={{ variant: TextVariant.bodyMdMedium }}
        >
          {t('portfolio')}
        </ButtonLink>
      );
      ///: END:ONLY_INCLUDE_IF
      return null;
    };

    const renderNativeTokenView = () => (
      <Box className="wallet-overview__currency-wrapper">
        <PercentageAndAmountChange
          value={
            tokensMarketData?.[getNativeTokenAddress(chainId as Hex)]
              ?.pricePercentChange1d
          }
        />
        {renderPortfolioButton()}
      </Box>
    );

    const renderAggregatedView = () => (
      <Box className="wallet-overview__currency-wrapper">
        {isTokenNetworkFilterEqualCurrentNetwork ||
        !process.env.PORTFOLIO_VIEW ? (
          <AggregatedPercentageOverview />
        ) : (
          <AggregatedPercentageOverviewCrossChains />
        )}
        {renderPortfolioButton()}
      </Box>
    );

    const renderNonEvmView = () => (
      <Box className="wallet-overview__currency-wrapper">
        {renderPortfolioButton()}
      </Box>
    );

    if (!isEvm) {
      return renderNonEvmView();
    }

    return showNativeTokenAsMainBalance
      ? renderNativeTokenView()
      : renderAggregatedView();
  };

  return (
    <WalletOverview
      balance={
        <Tooltip
          position="top"
          title={t('balanceOutdated')}
          disabled={!balanceIsCached}
        >
          <div
            className={`${classPrefix}-overview__balance`}
            style={{ alignItems: 'center' }}
          >
            <div
              className={`${classPrefix}-overview__primary-container`}
              onMouseEnter={handleMouseEnter}
              ref={setBoxRef}
            >
              {isEvm ? (
                <LegacyAggregatedBalance
                  classPrefix={classPrefix}
                  account={account}
                  balance={balance}
                  balanceIsCached={balanceIsCached}
                  handleSensitiveToggle={handleSensitiveToggle}
                />
              ) : (
                <AggregatedBalance
                  classPrefix={classPrefix}
                  balanceIsCached={balanceIsCached}
                  handleSensitiveToggle={handleSensitiveToggle}
                />
              )}
              {balanceIsCached && (
                <span className={`${classPrefix}-overview__cached-star`}>
                  *
                </span>
              )}
            </div>
            {shouldShowPopover &&
            (!isTestnet || (isTestnet && showFiatInTestnets)) &&
            !showNativeTokenAsMainBalance ? (
              <Popover
                referenceElement={referenceElement}
                isOpen={isOpen}
                position={PopoverPosition.BottomStart}
                hasArrow
                flip
                data-theme={theme === 'light' ? 'dark' : 'light'}
                className="balance-popover__container"
                padding={3}
                onClickOutside={handleClick}
                onPressEscKey={handleClick}
                preventOverflow
              >
                <Box>
                  <Box
                    display={Display.Flex}
                    justifyContent={JustifyContent.spaceBetween}
                  >
                    <Text
                      variant={TextVariant.bodySmBold}
                      textAlign={TextAlign.Left}
                      alignItems={AlignItems.flexStart}
                    >
                      {t('yourBalanceIsAggregated')}
                    </Text>
                    <ButtonIcon
                      size={ButtonIconSize.Sm}
                      onClick={handleClick}
                      iconName={IconName.Close}
                      justifyContent={JustifyContent.center}
                      ariaLabel="close"
                      data-testid="popover-close"
                    />
                  </Box>

                  <Text variant={TextVariant.bodySm}>
                    {process.env.PORTFOLIO_VIEW
                      ? t('crossChainAggregatedBalancePopover', [
                          <ButtonLink
                            size={ButtonLinkSize.Inherit}
                            textProps={{
                              variant: TextVariant.bodyMd,
                              alignItems: AlignItems.flexStart,
                            }}
                            as="a"
                            href={`#${showNativeTokenAsMainBalanceRoute.route}`}
                            rel="noopener noreferrer"
                            onClick={handleClick}
                          >
                            {t('settings')}
                          </ButtonLink>,
                        ])
                      : t('aggregatedBalancePopover', [
                          <ButtonLink
                            size={ButtonLinkSize.Inherit}
                            textProps={{
                              variant: TextVariant.bodyMd,
                              alignItems: AlignItems.flexStart,
                            }}
                            as="a"
                            href={`#${showNativeTokenAsMainBalanceRoute.route}`}
                            rel="noopener noreferrer"
                            onClick={handleClick}
                          >
                            {t('settings')}
                          </ButtonLink>,
                        ])}
                  </Text>
                </Box>
              </Popover>
            ) : null}

            {renderPercentageAndAmountChange()}
          </div>
        </Tooltip>
      }
      buttons={
        <CoinButtons
          {...{
            account,
            chainId,
            isSwapsChain,
            isSigningEnabled,
            ///: BEGIN:ONLY_INCLUDE_IF(build-beta)
            isBridgeChain,
            defaultSwapsToken,
            ///: END:ONLY_INCLUDE_IF
            classPrefix,
            iconButtonClassName: `${classPrefix}-overview__icon-button`,
          }}
        />
      }
      className={className}
    />
  );
};
