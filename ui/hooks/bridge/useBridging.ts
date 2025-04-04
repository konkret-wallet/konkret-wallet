import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toChecksumAddress } from '@ethereumjs/util';
import { isStrictHexString } from '@metamask/utils';
import { setBridgeFeatureFlags } from '../../ducks/bridge/actions';
import {
  ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
  getIsBridgeChain,
  getIsBridgeEnabled,
  getUseExternalServices,
  SwapsEthToken,
  ///: END:ONLY_INCLUDE_IF
} from '../../selectors';

import {
  ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
  CROSS_CHAIN_SWAP_ROUTE,
  PREPARE_SWAP_ROUTE,
  ///: END:ONLY_INCLUDE_IF
} from '../../helpers/constants/routes';
///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
import { getPortfolioUrl } from '../../helpers/utils/portfolio';
import { SwapsTokenObject } from '../../../shared/constants/swaps';
import { getProviderConfig } from '../../../shared/modules/selectors/networks';
// eslint-disable-next-line import/no-restricted-paths
///: END:ONLY_INCLUDE_IF

const useBridging = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const providerConfig = useSelector(getProviderConfig);
  const isExternalServicesEnabled = useSelector(getUseExternalServices);

  const isBridgeSupported = useSelector(getIsBridgeEnabled);
  const isBridgeChain = useSelector(getIsBridgeChain);

  useEffect(() => {
    if (isExternalServicesEnabled) {
      dispatch(setBridgeFeatureFlags());
    }
  }, [dispatch, setBridgeFeatureFlags]);

  const openBridgeExperience = useCallback(
    (
      _location: string,
      token: SwapsTokenObject | SwapsEthToken,
      portfolioUrlSuffix?: string,
      isSwap = false,
    ) => {
      if (!isBridgeChain || !providerConfig) {
        return;
      }

      if (isBridgeSupported) {
        let url = `${CROSS_CHAIN_SWAP_ROUTE}${PREPARE_SWAP_ROUTE}`;
        url += `?token=${
          isStrictHexString(token.address)
            ? toChecksumAddress(token.address)
            : token.address
        }`;
        if (isSwap) {
          url += '&swaps=true';
        }
        history.push(url);
      } else {
        const portfolioUrl = getPortfolioUrl('bridge', 'ext_bridge_button');
        global.platform.openTab({
          url: `${portfolioUrl}${
            portfolioUrlSuffix ?? `&token=${token.address}`
          }`,
        });
      }
    },
    [isBridgeSupported, isBridgeChain, dispatch, history, providerConfig],
  );

  return { openBridgeExperience };
};

export default useBridging;
