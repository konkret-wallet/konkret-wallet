import { useCallback } from 'react';
import { CaipChainId, Hex } from '@metamask/utils';
import { ChainId } from '../../../../shared/constants/network';

type IUseRamps = {
  openBuyCryptoInPdapp: (chainId?: ChainId | CaipChainId) => void;
  getBuyURI: (chainId: ChainId | CaipChainId) => string;
};

export enum RampsMetaMaskEntry {
  BuySellButton = 'ext_buy_sell_button',
  NftBanner = 'ext_buy_banner_nfts',
  TokensBanner = 'ext_buy_banner_tokens',
  ActivityBanner = 'ext_buy_banner_activity',
  BtcBanner = 'ext_buy_banner_btc',
}

const useRamps = (
  metamaskEntry: RampsMetaMaskEntry = RampsMetaMaskEntry.BuySellButton,
): IUseRamps => {
  const getBuyURI = useCallback((_chainId?: Hex | CaipChainId) => {
    try {
      const params = new URLSearchParams();
      params.set('metamaskEntry', metamaskEntry);
      if (_chainId) {
        params.set('chainId', _chainId);
      }
      params.set('metricsEnabled', String(false));
      params.set('marketingEnabled', String(false));

      const url = new URL(process.env.PORTFOLIO_URL || '');
      url.pathname = 'buy';
      url.search = params.toString();
      return url.toString();
    } catch {
      return 'https://portfolio.metamask.io/buy';
    }
  }, []);

  const openBuyCryptoInPdapp = useCallback(
    (_chainId?: ChainId | CaipChainId) => {
      const buyUrl = getBuyURI(_chainId);
      global.platform.openTab({
        url: buyUrl,
      });
    },
    [],
  );

  return { openBuyCryptoInPdapp, getBuyURI };
};

export default useRamps;
