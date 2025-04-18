import { MultichainNetworks } from './multichain/networks';
import { CHAIN_IDS, NETWORK_TO_NAME_MAP } from './network';

// TODO read from feature flags
export const ALLOWED_BRIDGE_CHAIN_IDS = [
  CHAIN_IDS.MAINNET,
  CHAIN_IDS.BSC,
  CHAIN_IDS.POLYGON,
  CHAIN_IDS.ZKSYNC_ERA,
  CHAIN_IDS.AVALANCHE,
  CHAIN_IDS.OPTIMISM,
  CHAIN_IDS.ARBITRUM,
  CHAIN_IDS.LINEA_MAINNET,
  CHAIN_IDS.BASE,
  ///: BEGIN:ONLY_INCLUDE_IF(solana-swaps)
  MultichainNetworks.SOLANA,
  ///: END:ONLY_INCLUDE_IF
];

export type AllowedBridgeChainIds = (typeof ALLOWED_BRIDGE_CHAIN_IDS)[number];

export const BRIDGE_DEV_API_BASE_URL =
  'http://localhost:1239:bridge.dev-api.cx.metamask.io';
export const BRIDGE_PROD_API_BASE_URL =
  'http://localhost:1239:bridge.api.cx.metamask.io';
export const BRIDGE_API_BASE_URL = process.env.BRIDGE_USE_DEV_APIS
  ? BRIDGE_DEV_API_BASE_URL
  : BRIDGE_PROD_API_BASE_URL;

export const BRIDGE_CLIENT_ID = 'extension';

export const ETH_USDT_ADDRESS = '0xdac17f958d2ee523a2206206994597c13d831ec7';
export const METABRIDGE_ETHEREUM_ADDRESS =
  '0x0439e60F02a8900a951603950d8D4527f400C3f1';
export const BRIDGE_QUOTE_MAX_ETA_SECONDS = 60 * 60; // 1 hour
export const BRIDGE_QUOTE_MAX_RETURN_DIFFERENCE_PERCENTAGE = 0.35; // if a quote returns in x times less return than the best quote, ignore it

export const BRIDGE_PREFERRED_GAS_ESTIMATE = 'high';
export const BRIDGE_DEFAULT_SLIPPAGE = 0.5;

export const NETWORK_TO_SHORT_NETWORK_NAME_MAP: Record<
  AllowedBridgeChainIds,
  string
> = {
  [CHAIN_IDS.MAINNET]: 'Ethereum',
  [CHAIN_IDS.LINEA_MAINNET]: 'Linea',
  [CHAIN_IDS.POLYGON]: NETWORK_TO_NAME_MAP[CHAIN_IDS.POLYGON],
  [CHAIN_IDS.AVALANCHE]: 'Avalanche',
  [CHAIN_IDS.BSC]: NETWORK_TO_NAME_MAP[CHAIN_IDS.BSC],
  [CHAIN_IDS.ARBITRUM]: NETWORK_TO_NAME_MAP[CHAIN_IDS.ARBITRUM],
  [CHAIN_IDS.OPTIMISM]: NETWORK_TO_NAME_MAP[CHAIN_IDS.OPTIMISM],
  [CHAIN_IDS.ZKSYNC_ERA]: 'ZkSync Era',
  [CHAIN_IDS.BASE]: 'Base',
  ///: BEGIN:ONLY_INCLUDE_IF(solana-swaps)
  [MultichainNetworks.SOLANA]: 'Solana',
  [MultichainNetworks.SOLANA_TESTNET]: 'Solana Testnet',
  [MultichainNetworks.SOLANA_DEVNET]: 'Solana Devnet',
  ///: END:ONLY_INCLUDE_IF
  ///: BEGIN:ONLY_INCLUDE_IF(bitcoin)
  [MultichainNetworks.BITCOIN]: 'Bitcoin',
  [MultichainNetworks.BITCOIN_TESTNET]: 'Bitcoin Testnet',
  ///: END:ONLY_INCLUDE_IF
};
export const BRIDGE_MM_FEE_RATE = 0.875;
export const REFRESH_INTERVAL_MS = 30 * 1000 * 120 * 10000000000;
export const DEFAULT_MAX_REFRESH_COUNT = 0;

export const STATIC_METAMASK_BASE_URL = '/static/static.cx.metamask.io/';

export const SOLANA_USDC_ASSET = {
  address:
    'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  symbol: 'USDC',
  decimals: 6,
  image:
    '/static/static.cx.metamask.io/api/v2/tokenIcons/assets/solana/5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v.png',
  chainId: MultichainNetworks.SOLANA,
};
