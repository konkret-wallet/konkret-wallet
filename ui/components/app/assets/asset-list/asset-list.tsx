import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import TokenList from '../token-list';
import {
  getMultichainIsEvm,
  getMultichainNetwork,
} from '../../../../selectors/multichain';
import DetectedToken from '../../detected-token/detected-token';
import {
  useAssetListTokenDetection,
  usePrimaryCurrencyProperties,
} from '../hooks';
import { getSelectedInternalAccount } from '../../../../selectors';
import { useMultichainSelector } from '../../../../hooks/useMultichainSelector';
import AssetListControlBar from './asset-list-control-bar';
import AssetListFundingModals from './asset-list-funding-modals';

type AssetListProps = {
  onClickAsset: (chainId: string, address: string) => void;
  showTokensLinks?: boolean;
};

const TokenListContainer = React.memo(
  ({ onClickAsset }: Pick<AssetListProps, 'onClickAsset'>) => {
    const account = useSelector(getSelectedInternalAccount);
    const { isEvmNetwork } = useMultichainSelector(
      getMultichainNetwork,
      account,
    );
    const { primaryCurrencyProperties } = usePrimaryCurrencyProperties();

    const onTokenClick = useCallback(
      (chainId: string, tokenAddress: string) => {
        if (isEvmNetwork) {
          onClickAsset(chainId, tokenAddress);
        }
      },
      [],
    );

    return <TokenList onTokenClick={onTokenClick} />;
  },
);

const AssetList = ({ onClickAsset, showTokensLinks }: AssetListProps) => {
  const { showDetectedTokens, setShowDetectedTokens } =
    useAssetListTokenDetection();
  const isEvm = useSelector(getMultichainIsEvm);
  // NOTE: Since we can parametrize it now, we keep the original behavior
  // for EVM assets
  const shouldShowTokensLinks = showTokensLinks ?? isEvm;

  return (
    <>
      <AssetListControlBar showTokensLinks={shouldShowTokensLinks} />
      <TokenListContainer onClickAsset={onClickAsset} />
      {showDetectedTokens && (
        <DetectedToken setShowDetectedTokens={setShowDetectedTokens} />
      )}
      <AssetListFundingModals />
    </>
  );
};

export default AssetList;
