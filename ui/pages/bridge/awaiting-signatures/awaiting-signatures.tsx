import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import isEqual from 'lodash/isEqual';

import PulseLoader from '../../../components/ui/pulse-loader';
import {
  TextVariant,
  JustifyContent,
  TextColor,
  BlockSize,
  Display,
  FlexDirection,
  BackgroundColor,
} from '../../../helpers/constants/design-system';
import {
  AvatarBase,
  AvatarBaseSize,
  Box,
  Text,
} from '../../../components/component-library';
import {
  getBridgeQuotes,
  getFromChain,
  getFromToken,
  getToChain,
} from '../../../ducks/bridge/selectors';
import { useI18nContext } from '../../../hooks/useI18nContext';

export default function AwaitingSignatures() {
  const t = useI18nContext();
  const { activeQuote } = useSelector(getBridgeQuotes, shallowEqual);
  const fromAmount = activeQuote?.sentAmount?.amount?.toNumber();
  const fromToken = useSelector(getFromToken, isEqual);
  const fromChain = useSelector(getFromChain, isEqual);
  const toChain = useSelector(getToChain, isEqual);
  const needsTwoConfirmations = Boolean(activeQuote?.approval);

  return (
    <div className="awaiting-bridge-signatures">
      <Box
        paddingLeft={6}
        paddingRight={6}
        height={BlockSize.Full}
        justifyContent={JustifyContent.center}
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
      >
        <Box marginTop={3} marginBottom={4}>
          <PulseLoader />
        </Box>
        {!needsTwoConfirmations && (
          <Text
            color={TextColor.textDefault}
            variant={TextVariant.headingMd}
            as="h3"
          >
            {t('swapConfirmWithHwWallet')}
          </Text>
        )}
        {needsTwoConfirmations && (
          <>
            <Text variant={TextVariant.bodyMdBold} marginTop={2}>
              {t('bridgeConfirmTwoTransactions')}
            </Text>
            <ul className="awaiting-bridge-signatures__steps">
              <li>
                <AvatarBase
                  size={AvatarBaseSize.Sm}
                  backgroundColor={BackgroundColor.primaryMuted}
                  color={TextColor.primaryDefault}
                  marginRight={2}
                >
                  1
                </AvatarBase>
                {/* <BridgeStepIcon stepNumber={1} /> */}
                {t('bridgeAllowSwappingOf', [
                  <Text
                    as="span"
                    variant={TextVariant.bodyMd}
                    key="allowAmount"
                  >
                    {fromAmount}
                  </Text>,
                  <Text as="span" variant={TextVariant.bodyMd} key="allowToken">
                    {fromToken?.symbol}
                  </Text>,
                  <Text
                    as="span"
                    variant={TextVariant.bodyMd}
                    key="allowNetwork"
                  >
                    {fromChain?.name}
                  </Text>,
                ])}
              </li>
              <li>
                <AvatarBase
                  size={AvatarBaseSize.Sm}
                  backgroundColor={BackgroundColor.primaryMuted}
                  color={TextColor.primaryDefault}
                  marginRight={2}
                >
                  2
                </AvatarBase>
                {t('bridgeFromTo', [
                  <Text as="span" variant={TextVariant.bodyMd} key="fromAmount">
                    {fromAmount}
                  </Text>,
                  <Text as="span" variant={TextVariant.bodyMd} key="fromToken">
                    {fromToken?.symbol}
                  </Text>,
                  <Text as="span" variant={TextVariant.bodyMd} key="toNetwork">
                    {toChain?.name}
                  </Text>,
                ])}
              </li>
            </ul>
            <Text variant={TextVariant.bodyXs}>{t('bridgeGasFeesSplit')}</Text>
          </>
        )}
      </Box>
    </div>
  );
}
