import React, { useContext } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import isEqual from 'lodash/isEqual';

import { I18nContext } from '../../../contexts/i18n';
import {
  getFetchParams,
  getApproveTxParams,
  prepareToLeaveSwaps,
} from '../../../ducks/swaps/swaps';
import {
  DEFAULT_ROUTE,
  PREPARE_SWAP_ROUTE,
} from '../../../helpers/constants/routes';
import PulseLoader from '../../../components/ui/pulse-loader';
import Box from '../../../components/ui/box';
import {
  BLOCK_SIZES,
  TextVariant,
  JustifyContent,
  DISPLAY,
  TextColor,
} from '../../../helpers/constants/design-system';
import SwapsFooter from '../swaps-footer';
import { Text } from '../../../components/component-library';
import SwapStepIcon from './swap-step-icon';

export default function AwaitingSignatures() {
  const t = useContext(I18nContext);
  const history = useHistory();
  const dispatch = useDispatch();
  const fetchParams = useSelector(getFetchParams, isEqual);
  const { destinationTokenInfo, sourceTokenInfo } = fetchParams?.metaData || {};
  const approveTxParams = useSelector(getApproveTxParams, shallowEqual);
  const needsTwoConfirmations = Boolean(approveTxParams);

  const headerText = needsTwoConfirmations
    ? t('swapTwoTransactions')
    : t('swapConfirmWithHwWallet');

  return (
    <div className="awaiting-signatures">
      <Box
        paddingLeft={8}
        paddingRight={8}
        height={BLOCK_SIZES.FULL}
        justifyContent={JustifyContent.center}
        display={DISPLAY.FLEX}
        className="awaiting-signatures__content"
      >
        <Box marginTop={3} marginBottom={4}>
          <PulseLoader />
        </Box>
        <Text
          color={TextColor.textDefault}
          variant={TextVariant.headingMd}
          as="h3"
        >
          {headerText}
        </Text>
        {needsTwoConfirmations && (
          <>
            <Text variant={TextVariant.bodyMdBold} marginTop={2}>
              {t('swapToConfirmWithHwWallet')}
            </Text>
            <ul className="awaiting-signatures__steps">
              <li>
                <SwapStepIcon stepNumber={1} />
                {t('swapAllowSwappingOf', [
                  <Text
                    as="span"
                    variant={TextVariant.bodyMdBold}
                    key="allowToken"
                  >
                    {destinationTokenInfo?.symbol}
                  </Text>,
                ])}
              </li>
              <li>
                <SwapStepIcon stepNumber={2} />
                {t('swapFromTo', [
                  <Text
                    as="span"
                    variant={TextVariant.bodyMdBold}
                    key="tokenFrom"
                  >
                    {sourceTokenInfo?.symbol}
                  </Text>,
                  <Text
                    as="span"
                    variation={TextVariant.bodyMdBold}
                    key="tokenTo"
                  >
                    {destinationTokenInfo?.symbol}
                  </Text>,
                ])}
              </li>
            </ul>
            <Text variant={TextVariant.bodyMd}>{t('swapGasFeesSplit')}</Text>
          </>
        )}
      </Box>
      <SwapsFooter
        onSubmit={async () => {
          dispatch(prepareToLeaveSwaps());
          // Go to the default route and then to the build quote route in order to clean up
          // the `inputValue` local state in `pages/swaps/index.js`
          history.push(DEFAULT_ROUTE);
          history.push(PREPARE_SWAP_ROUTE);
        }}
        submitText={t('cancel')}
        hideCancel
      />
    </div>
  );
}
