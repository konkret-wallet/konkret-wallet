import React from 'react';
import { useSelector } from 'react-redux';
import {
  getMultichainProviderConfig,
  getMultichainSelectedAccountCachedBalance,
} from '../../../selectors/multichain';
import {
  ///: BEGIN:ONLY_INCLUDE_IF(build-beta)
  getIsSwapsChain,
  getIsBridgeChain,
  getSwapsDefaultToken,
  ///: END:ONLY_INCLUDE_IF
  getSelectedInternalAccount,
} from '../../../selectors';
import { CoinOverview } from './coin-overview';

type NonEvmOverviewProps = {
  className?: string;
};

const NonEvmOverview = ({ className }: NonEvmOverviewProps) => {
  const { chainId } = useSelector(getMultichainProviderConfig);
  const balance = useSelector(getMultichainSelectedAccountCachedBalance);
  const account = useSelector(getSelectedInternalAccount);

  ///: BEGIN:ONLY_INCLUDE_IF(build-beta)
  const defaultSwapsToken = useSelector(getSwapsDefaultToken);
  let isSwapsChain = false;
  let isBridgeChain = false;
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
      ///: BEGIN:ONLY_INCLUDE_IF(build-beta)
      isSwapsChain={isSwapsChain}
      defaultSwapsToken={defaultSwapsToken}
      isBridgeChain={isBridgeChain}
      ///: END:ONLY_INCLUDE_IF
    />
  );
};

export default NonEvmOverview;
