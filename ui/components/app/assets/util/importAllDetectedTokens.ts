import {
  NetworkClientId,
  NetworkConfiguration,
} from '@metamask/network-controller';
import { Token } from '../types';

export const importAllDetectedTokens = async (
  isOnCurrentNetwork: boolean,
  detectedTokensMultichain: {
    [key: string]: Token[];
  },
  allNetworks: Record<string, NetworkConfiguration>,
  networkClientId: NetworkClientId,
  _currentChainId: string,
  detectedTokens: Token[],
  addImportedTokens: (tokens: Token[], networkClientId: string) => void,
) => {
  if (process.env.PORTFOLIO_VIEW && !isOnCurrentNetwork) {
    const importPromises = Object.entries(detectedTokensMultichain).map(
      async ([networkId, tokens]) => {
        const chainConfig = allNetworks[networkId];
        const { defaultRpcEndpointIndex } = chainConfig;
        const { networkClientId: networkInstanceId } =
          chainConfig.rpcEndpoints[defaultRpcEndpointIndex];

        await addImportedTokens(tokens as Token[], networkInstanceId);
      },
    );

    await Promise.all(importPromises);
  } else if (detectedTokens.length > 0) {
    await addImportedTokens(detectedTokens, networkClientId);
  }
};
