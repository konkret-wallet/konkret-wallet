import React, { useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type {
  Token,
  TokenListMap,
  TokenListToken,
} from '@metamask/assets-controllers';
import { isCaipChainId, isStrictHexString, type Hex } from '@metamask/utils';
import { zeroAddress } from '@ethereumjs/util';
import {
  Modal,
  ModalContent,
  ModalOverlay,
  ModalHeader,
  Box,
  AvatarTokenSize,
  AvatarToken,
  Text,
  PickerNetwork,
} from '../../../component-library';
import {
  BorderRadius,
  TextVariant,
  TextAlign,
  Display,
  AlignItems,
} from '../../../../helpers/constants/design-system';
import { useI18nContext } from '../../../../hooks/useI18nContext';

import { AssetType } from '../../../../../shared/constants/transaction';
import {
  getAllTokens,
  getSelectedEvmInternalAccount,
  getTokenExchangeRates,
  getTokenList,
  // getUseExternalServices,
  ///: BEGIN:ONLY_INCLUDE_IF(solana-swaps)
  hasCreatedSolanaAccount,
  ///: END:ONLY_INCLUDE_IF
} from '../../../../selectors';
import { getRenderableTokenData } from '../../../../hooks/useTokensToSearch';
import { isEqualCaseInsensitive } from '../../../../../shared/modules/string-utils';
import {
  CHAIN_ID_TOKEN_IMAGE_MAP,
  NETWORK_TO_NAME_MAP,
} from '../../../../../shared/constants/network';
import { useMultichainBalances } from '../../../../hooks/useMultichainBalances';
import { AvatarType } from '../../avatar-group/avatar-group.types';
import { NETWORK_TO_SHORT_NETWORK_NAME_MAP } from '../../../../../shared/constants/bridge';
import { useMultichainSelector } from '../../../../hooks/useMultichainSelector';
import {
  getMultichainConversionRate,
  getMultichainCurrencyImage,
  getImageForChainId,
  getMultichainCurrentChainId,
  getMultichainCurrentCurrency,
  getMultichainNativeCurrency,
  getMultichainNetworkConfigurationsByChainId,
  getMultichainSelectedAccountCachedBalance,
  getMultichainIsEvm,
} from '../../../../selectors/multichain';
import { MultichainNetworks } from '../../../../../shared/constants/multichain/networks';
import { getAssetsMetadata } from '../../../../selectors/assets';
import { Numeric } from '../../../../../shared/modules/Numeric';
import type {
  ERC20Asset,
  NativeAsset,
  NFT,
  AssetWithDisplayData,
} from './types';
import { AssetPickerModalTabs, TabName } from './asset-picker-modal-tabs';
import { AssetPickerModalNftTab } from './asset-picker-modal-nft-tab';
import AssetList from './AssetList';
import { Search } from './asset-picker-modal-search';
import { AssetPickerModalNetwork } from './asset-picker-modal-network';
import { SolanaAccountCreationPrompt } from './solana-account-creation-prompt';

type AssetPickerModalProps = {
  header: JSX.Element | string | null;
  isOpen: boolean;
  onClose: () => void;
  action?: 'send' | 'receive';
  asset?:
    | ERC20Asset
    | NativeAsset
    | Pick<NFT, 'type' | 'tokenId' | 'image' | 'symbol' | 'address'>;
  onBack?: () => void;
  onAssetChange: (
    asset: AssetWithDisplayData<ERC20Asset> | AssetWithDisplayData<NativeAsset>,
  ) => void;
  /**
   * Sending asset for UI treatments; only for dest component
   */
  sendingAsset?: { image: string; symbol: string } | undefined;
  onNetworkPickerClick?: () => void;
  /**
   * Generator function that returns a list of tokens filtered by a predicate and sorted
   * by a custom order.
   */
  customTokenListGenerator?: (
    filterPredicate: (
      symbol: string,
      address?: null | string,
      chainId?: string,
    ) => boolean,
  ) => Generator<
    AssetWithDisplayData<NativeAsset> | AssetWithDisplayData<ERC20Asset>
  >;
  isTokenListLoading?: boolean;
  autoFocus: boolean;
} & Pick<
  React.ComponentProps<typeof AssetPickerModalTabs>,
  'visibleTabs' | 'defaultActiveTabKey'
> &
  Pick<
    React.ComponentProps<typeof AssetPickerModalNetwork>,
    'network' | 'networks' | 'isMultiselectEnabled' | 'selectedChainIds'
  >;

const MAX_UNOWNED_TOKENS_RENDERED = 30;

export function AssetPickerModal({
  header,
  isOpen,
  onClose,
  onBack,
  asset,
  onAssetChange,
  sendingAsset,
  network,
  networks,
  action,
  onNetworkPickerClick,
  customTokenListGenerator,
  isTokenListLoading = false,
  isMultiselectEnabled,
  selectedChainIds,
  autoFocus,
  ...tabProps
}: AssetPickerModalProps) {
  const t = useI18nContext();

  const [searchQuery, setSearchQuery] = useState('');

  const handleAssetChange = useCallback(onAssetChange, [onAssetChange]);

  const currentChainId = useSelector(getMultichainCurrentChainId);
  const allNetworks = useSelector(getMultichainNetworkConfigurationsByChainId);
  const selectedNetwork =
    network ??
    (currentChainId && allNetworks[currentChainId as keyof typeof allNetworks]);
  const allNetworksToUse = networks ?? Object.values(allNetworks ?? {});
  // This indicates whether tokens in the wallet's active network are displayed
  const isSelectedNetworkActive = selectedNetwork.chainId === currentChainId;
  const isEvm = useMultichainSelector(getMultichainIsEvm);

  const nativeCurrencyImage = useMultichainSelector(getMultichainCurrencyImage);
  const nativeCurrency = useMultichainSelector(getMultichainNativeCurrency);
  const balanceValue = useMultichainSelector(
    getMultichainSelectedAccountCachedBalance,
  );

  const tokenConversionRates = useMultichainSelector(getTokenExchangeRates);
  const conversionRate = useMultichainSelector(getMultichainConversionRate);
  const currentCurrency = useSelector(getMultichainCurrentCurrency);

  // Default to false before the code fence is enabled (will not render the prompt)
  let needsSolanaAccount = false;

  ///: BEGIN:ONLY_INCLUDE_IF(solana-swaps)
  // Check if we need to show the Solana account creation UI when Solana is selected
  const hasSolanaAccount = useSelector(hasCreatedSolanaAccount);
  needsSolanaAccount =
    !hasSolanaAccount && selectedNetwork.chainId === MultichainNetworks.SOLANA;
  ///: END:ONLY_INCLUDE_IF

  const { address: selectedEvmAddress } = useSelector(
    getSelectedEvmInternalAccount,
  );

  const detectedTokens: Record<Hex, Record<string, Token[]>> = useSelector(
    getAllTokens,
  );
  // This only returns the detected tokens for the selected EVM account address
  const allDetectedTokens = useMemo(
    () =>
      (isCaipChainId(currentChainId)
        ? []
        : detectedTokens?.[currentChainId]?.[selectedEvmAddress]) ?? [],
    [detectedTokens, currentChainId, selectedEvmAddress],
  );

  const { assetsWithBalance: multichainTokensWithBalance } =
    useMultichainBalances();

  const evmTokenMetadataByAddress = useSelector(getTokenList) as TokenListMap;
  const nonEvmTokenMetadataByAddress = useSelector(getAssetsMetadata);

  /*
  const allowExternalServices = useSelector(getUseExternalServices);
  // Swaps top tokens
  const { value: topTokens } = useAsyncResult<
    { address: Hex }[] | undefined
  >(async () => {
    if (allowExternalServices && selectedNetwork?.chainId) {
      return await fetchTopAssetsList(selectedNetwork.chainId);
    }
    return undefined;
  }, [selectedNetwork?.chainId, allowExternalServices]);
  */

  const getIsDisabled = useCallback(
    ({
      symbol,
    }:
      | TokenListToken
      | AssetWithDisplayData<ERC20Asset>
      | AssetWithDisplayData<NativeAsset>) => {
      const isDisabled = sendingAsset?.symbol
        ? !isEqualCaseInsensitive(sendingAsset.symbol, symbol)
        : false;

      return isDisabled;
    },
    [sendingAsset?.symbol],
  );

  /**
   * Generates a list of tokens sorted in this order
   * - native tokens with balance
   * - tokens with highest to lowest balance in selected currency
   * - selected network's native token
   * - matches URL token parameter
   * - matches search query
   * - detected tokens (without balance)
   * - popularity
   * - all other tokens
   * - blocked tokens
   */
  const tokenListGenerator = useCallback(
    function* (
      shouldAddToken: (
        symbol: string,
        address?: null | string,
        tokenChainId?: string,
      ) => boolean,
    ): Generator<
      | AssetWithDisplayData<NativeAsset>
      | ((Token | TokenListToken) & {
          chainId: string;
          balance?: string;
          string?: string;
        })
    > {
      // Yield multichain tokens with balances
      for (const token of multichainTokensWithBalance) {
        if (shouldAddToken(token.symbol, token.address, token.chainId)) {
          yield token.isNative
            ? {
                ...token,
                image:
                  CHAIN_ID_TOKEN_IMAGE_MAP[
                    token.chainId as keyof typeof CHAIN_ID_TOKEN_IMAGE_MAP
                  ],
                type: AssetType.native,
              }
            : {
                ...token,
                // The Send flow requires the balance to be in Hex
                balance: Numeric.from(token.balance ?? '0', 10)
                  .shiftedBy(-1 * token.decimals)
                  .toPrefixedHexString(),
              };
        }
      }

      // Yield the native token for the selected chain
      const nativeToken: AssetWithDisplayData<NativeAsset> = {
        address: '',
        symbol: nativeCurrency,
        decimals: 18,
        image: nativeCurrencyImage,
        balance: balanceValue,
        string: undefined,
        chainId: selectedNetwork.chainId,
        type: AssetType.native,
      };

      if (
        isEvm &&
        shouldAddToken(
          nativeToken.symbol,
          nativeToken.address,
          nativeToken.chainId,
        )
      ) {
        yield nativeToken;
      }

      for (const token of allDetectedTokens) {
        if (shouldAddToken(token.symbol, token.address, currentChainId)) {
          yield { ...token, chainId: currentChainId };
        }
      }

      // Return early when SOLANA is selected since blocked and top tokens are not available
      if (selectedNetwork?.chainId === MultichainNetworks.SOLANA) {
        for (const [address, token] of Object.entries(
          nonEvmTokenMetadataByAddress,
        )) {
          const [caipChainId] = address.split('/');

          if (shouldAddToken(token.symbol, address, caipChainId)) {
            yield {
              ...token,
              address,
              chainId: caipChainId,
              decimals: token.units[0].decimals,
            };
          }
        }
        return;
      }

      /*
      // For EVM tokens only
      // topTokens are sorted by popularity
      for (const topToken of topTokens ?? []) {
        const token: TokenListToken =
          evmTokenMetadataByAddress?.[topToken.address];
        if (
          token &&
          shouldAddToken(token.symbol, token.address, currentChainId)
        ) {
          if (getIsDisabled(token)) {
            blockedTokens.push(token);
            continue;
          } else {
            yield { ...token, chainId: currentChainId };
          }
        }
      }
      */

      for (const token of Object.values(evmTokenMetadataByAddress)) {
        if (shouldAddToken(token.symbol, token.address, currentChainId)) {
          yield { ...token, chainId: currentChainId };
        }
      }
    },
    [
      nativeCurrency,
      nativeCurrencyImage,
      balanceValue,
      currentChainId,
      isEvm,
      selectedNetwork?.chainId,
      multichainTokensWithBalance,
      allDetectedTokens,
      nonEvmTokenMetadataByAddress,
      // topTokens,
      evmTokenMetadataByAddress,
      getIsDisabled,
    ],
  );

  const filteredTokenList = useMemo(() => {
    const filteredTokens: (
      | AssetWithDisplayData<ERC20Asset>
      | AssetWithDisplayData<NativeAsset>
    )[] = [];
    // List of token identifiers formatted like `chainId:address`
    const filteredTokensAddresses = new Set<string | undefined>();
    const getTokenKey = (address?: string | null, tokenChainId?: string) =>
      `${address?.toLowerCase() ?? zeroAddress()}:${
        tokenChainId ?? currentChainId
      }`;

    // Default filter predicate for whether a token should be included in displayed list
    const shouldAddToken = (
      symbol: string,
      address?: string | null,
      tokenChainId?: string,
    ) => {
      const trimmedSearchQuery = searchQuery.trim().toLowerCase();
      const isMatchedBySearchQuery = Boolean(
        !trimmedSearchQuery ||
          symbol?.toLowerCase().includes(trimmedSearchQuery) ||
          address?.toLowerCase().includes(trimmedSearchQuery),
      );
      const isTokenInSelectedChain = isMultiselectEnabled
        ? tokenChainId && selectedChainIds?.includes(tokenChainId)
        : selectedNetwork?.chainId === tokenChainId;

      return Boolean(
        isTokenInSelectedChain &&
          isMatchedBySearchQuery &&
          !filteredTokensAddresses.has(getTokenKey(address, tokenChainId)),
      );
    };

    // If filteredTokensGenerator is passed in, use it to generate the filtered tokens
    // Otherwise use the default tokenGenerator
    for (const token of (customTokenListGenerator ?? tokenListGenerator)(
      shouldAddToken,
    )) {
      if (action === 'send' && token.balance === undefined) {
        continue;
      }

      filteredTokensAddresses.add(getTokenKey(token.address, token.chainId));
      if (!customTokenListGenerator && isStrictHexString(token.address)) {
        filteredTokens.push(
          getRenderableTokenData(
            token.address
              ? ({
                  ...token,
                  ...evmTokenMetadataByAddress[token.address.toLowerCase()],
                  type: AssetType.token,
                } as AssetWithDisplayData<ERC20Asset>)
              : token,
            tokenConversionRates,
            conversionRate,
            currentCurrency,
            token.chainId,
            evmTokenMetadataByAddress,
          ),
        );
      } else {
        filteredTokens.push(
          token as unknown as AssetWithDisplayData<ERC20Asset>,
        );
      }

      if (filteredTokens.length > MAX_UNOWNED_TOKENS_RENDERED) {
        break;
      }
    }

    return filteredTokens;
  }, [
    currentChainId,
    searchQuery,
    isMultiselectEnabled,
    selectedChainIds,
    selectedNetwork?.chainId,
    customTokenListGenerator,
    tokenListGenerator,
    action,
    evmTokenMetadataByAddress,
    tokenConversionRates,
    conversionRate,
    currentCurrency,
  ]);

  const getNetworkPickerLabel = () => {
    if (!isMultiselectEnabled) {
      return (
        (selectedNetwork?.chainId &&
          NETWORK_TO_NAME_MAP[
            selectedNetwork.chainId as keyof typeof NETWORK_TO_NAME_MAP
          ]) ??
        selectedNetwork?.name ??
        t('bridgeSelectNetwork')
      );
    }
    switch (selectedChainIds?.length) {
      case allNetworksToUse.length:
        return t('allNetworks');
      case 1:
        return t('singleNetwork');
      case 0:
        return t('bridgeSelectNetwork');
      default:
        return t('someNetworks', [selectedChainIds?.length]);
    }
  };

  return (
    <Modal
      className="asset-picker-modal"
      isOpen={isOpen}
      onClose={onClose}
      data-testid="asset-picker-modal"
    >
      <ModalOverlay />
      <ModalContent modalDialogProps={{ padding: 0 }}>
        <ModalHeader onClose={onClose} onBack={asset ? undefined : onBack}>
          <Text variant={TextVariant.headingSm} textAlign={TextAlign.Center}>
            {header}
          </Text>
        </ModalHeader>
        {sendingAsset?.image && sendingAsset?.symbol && (
          <Box
            display={Display.Flex}
            gap={1}
            alignItems={AlignItems.center}
            marginInline="auto"
          >
            <AvatarToken
              borderRadius={BorderRadius.full}
              src={sendingAsset.image}
              size={AvatarTokenSize.Xs}
            />
            <Text variant={TextVariant.bodySm}>
              {t('sendingAsset', [sendingAsset.symbol])}
            </Text>
          </Box>
        )}
        {onNetworkPickerClick && (
          <Box className="network-picker">
            <PickerNetwork
              label={getNetworkPickerLabel()}
              src={
                selectedNetwork?.chainId
                  ? getImageForChainId(selectedNetwork.chainId)
                  : undefined
              }
              avatarGroupProps={
                isMultiselectEnabled && selectedChainIds
                  ? {
                      limit: 2,
                      members: selectedChainIds.map((c) => ({
                        avatarValue: getImageForChainId(c) ?? '',
                        symbol:
                          NETWORK_TO_SHORT_NETWORK_NAME_MAP[
                            c as keyof typeof NETWORK_TO_SHORT_NETWORK_NAME_MAP
                          ],
                      })),
                      avatarType: AvatarType.NETWORK,
                    }
                  : undefined
              }
              onClick={onNetworkPickerClick}
              data-testid="multichain-asset-picker__network"
            />
          </Box>
        )}
        <Box className="modal-tab__wrapper">
          {/* Show Solana account creation prompt if the destination is Solana but no Solana account exists */}
          {needsSolanaAccount ? (
            <SolanaAccountCreationPrompt
              onSuccess={() => {
                // Refresh the component after account creation
                onClose();
              }}
            />
          ) : (
            <AssetPickerModalTabs {...tabProps}>
              <React.Fragment key={TabName.TOKENS}>
                <Search
                  searchQuery={searchQuery}
                  onChange={(value) => setSearchQuery(value)}
                  autoFocus={autoFocus}
                />
                <AssetList
                  network={network}
                  handleAssetChange={handleAssetChange}
                  asset={asset?.type === AssetType.NFT ? undefined : asset}
                  tokenList={filteredTokenList}
                  isTokenDisabled={getIsDisabled}
                  isTokenListLoading={isTokenListLoading}
                  assetItemProps={{
                    isTitleNetworkName:
                      // For src cross-chain swaps assets
                      isMultiselectEnabled,
                    isTitleHidden:
                      // For dest cross-chain swaps assets
                      !isSelectedNetworkActive,
                  }}
                />
              </React.Fragment>
              <AssetPickerModalNftTab
                key={TabName.NFTS}
                searchQuery={searchQuery}
                onClose={onClose}
                renderSearch={() => (
                  <Search
                    isNFTSearch
                    searchQuery={searchQuery}
                    onChange={(value) => setSearchQuery(value)}
                  />
                )}
              />
            </AssetPickerModalTabs>
          )}
        </Box>
      </ModalContent>
    </Modal>
  );
}
