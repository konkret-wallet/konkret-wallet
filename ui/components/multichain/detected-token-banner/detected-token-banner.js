import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useI18nContext } from '../../../hooks/useI18nContext';
import { getNetworkConfigurationsByChainId } from '../../../../shared/modules/selectors/networks';
import {
  getDetectedTokensInCurrentNetwork,
  getAllDetectedTokensForSelectedAddress,
  getIsTokenNetworkFilterEqualCurrentNetwork,
} from '../../../selectors';
import { BannerAlert } from '../../component-library';

export const DetectedTokensBanner = ({
  className,
  actionButtonOnClick,
  ...props
}) => {
  const t = useI18nContext();
  const isTokenNetworkFilterEqualCurrentNetwork = useSelector(
    getIsTokenNetworkFilterEqualCurrentNetwork,
  );

  const allNetworks = useSelector(getNetworkConfigurationsByChainId);

  const allOpts = {};
  Object.keys(allNetworks || {}).forEach((chainId) => {
    allOpts[chainId] = true;
  });

  const detectedTokens = useSelector(getDetectedTokensInCurrentNetwork);

  const detectedTokensMultichain = useSelector(
    getAllDetectedTokensForSelectedAddress,
  );

  const totalTokens =
    process.env.PORTFOLIO_VIEW && !isTokenNetworkFilterEqualCurrentNetwork
      ? Object.values(detectedTokensMultichain).reduce(
          (count, tokenArray) => count + tokenArray.length,
          0,
        )
      : detectedTokens.length;

  const handleOnClick = () => {
    actionButtonOnClick();
  };
  return (
    <BannerAlert
      className={classNames('multichain-detected-token-banner', className)}
      actionButtonLabel={t('importTokensCamelCase')}
      actionButtonOnClick={handleOnClick}
      data-testid="detected-token-banner"
      {...props}
    >
      {totalTokens === 1
        ? t('numberOfNewTokensDetectedSingular')
        : t('numberOfNewTokensDetectedPlural', [totalTokens])}
    </BannerAlert>
  );
};

DetectedTokensBanner.propTypes = {
  /**
   * Handler to be passed to the DetectedTokenBanner component
   */
  actionButtonOnClick: PropTypes.func.isRequired,
  /**
   * An additional className to the DetectedTokenBanner component
   */
  className: PropTypes.string,
};
