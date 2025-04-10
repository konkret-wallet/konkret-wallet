import React from 'react';
import { useSelector } from 'react-redux';
import {
  ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
  ///: END:ONLY_INCLUDE_IF
  getMultichainProviderConfig,
  getMultichainSelectedAccountCachedBalance,
} from '../../../selectors/multichain';
import {
  ///: BEGIN:ONLY_INCLUDE_IF(solana-swaps)
  getIsSwapsChain,
  getIsBridgeChain,
  ///: END:ONLY_INCLUDE_IF
  getSelectedInternalAccount,
  getSwapsDefaultToken,
} from '../../../selectors';
import { CoinOverview } from './coin-overview';

type NonEvmOverviewProps = {
  className?: string;
};

const NonEvmOverview = ({ className }: NonEvmOverviewProps) => {
  const { chainId } = useSelector(getMultichainProviderConfig);
  const balance = useSelector(getMultichainSelectedAccountCachedBalance);
  const account = useSelector(getSelectedInternalAccount);
  const defaultSwapsToken = useSelector(getSwapsDefaultToken);

  let isSwapsChain = false;
  let isBridgeChain = false;
  ///: BEGIN:ONLY_INCLUDE_IF(solana-swaps)
  isSwapsChain = useSelector((state) => getIsSwapsChain(state, chainId));
  isBridgeChain = useSelector((state) => getIsBridgeChain(state, chainId));
  ///: END:ONLY_INCLUDE_IF

  return (
    <CoinOverview
      account={account}
      balance={balance}
      // We turn this off to avoid having that asterisk + the "Balance maybe be outdated" message for now
      balanceIsCached={false}
      className={className}
      chainId={chainId}
      isSigningEnabled={true}
      isSwapsChain={isSwapsChain}
      defaultSwapsToken={defaultSwapsToken}
      ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
      isBridgeChain={isBridgeChain}
      ///: END:ONLY_INCLUDE_IF
    />
  );
};

export default NonEvmOverview;
