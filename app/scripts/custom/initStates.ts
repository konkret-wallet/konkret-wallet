import { DEFAULT_CUSTOM_TESTNET_MAP } from '../../../shared/constants/network';

export function getDefaultNetworkControllerState() {
  // replacing function in @metamask/network-controller
  return {
    selectedNetworkClientId: null,
    networksMetadata: {},
    networkConfigurationsByChainId: DEFAULT_CUSTOM_TESTNET_MAP,
  };
}
