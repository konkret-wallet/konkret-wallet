import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TokenListMap } from '@metamask/assets-controllers';
import {
  BannerAlert,
  BannerAlertSeverity,
  Box,
} from '../../../../component-library';
import {
  getNativeCurrency,
  getSendHexDataFeatureFlagState,
} from '../../../../../ducks/metamask/metamask';
import {
  Asset,
  acknowledgeRecipientWarning,
  getCurrentDraftTransaction,
  getSendAsset,
} from '../../../../../ducks/send';
import { AssetType } from '../../../../../../shared/constants/transaction';
import { CONTRACT_ADDRESS_LINK } from '../../../../../helpers/constants/common';
import { Display } from '../../../../../helpers/constants/design-system';
import { useI18nContext } from '../../../../../hooks/useI18nContext';
import { AssetPickerAmount } from '../../..';
import {
  getIpfsGateway,
  getNativeCurrencyImage,
  getTokenList,
} from '../../../../../selectors';
import useGetAssetImageUrl from '../../../../../hooks/useGetAssetImageUrl';

import { isEqualCaseInsensitive } from '../../../../../../shared/modules/string-utils';
import { AssetPicker } from '../../../asset-picker-amount/asset-picker';
import { TabName } from '../../../asset-picker-amount/asset-picker-modal/asset-picker-modal-tabs';
import { SendPageRow } from './send-page-row';
import { SendHexData } from './hex';

export const SendPageRecipientContent = ({
  requireContractAddressAcknowledgement,
  onAssetChange,
  onClick,
}: {
  requireContractAddressAcknowledgement: boolean;
  onAssetChange: (newAsset: Asset, isReceived: boolean) => void;
  onClick: () => React.ComponentProps<typeof AssetPicker>['onClick'];
}) => {
  const t = useI18nContext();

  const {
    receiveAsset,
    sendAsset,
    amount: sendAmount,
  } = useSelector(getCurrentDraftTransaction);

  const nativeCurrencySymbol = useSelector(getNativeCurrency);
  const nativeCurrencyImageUrl = useSelector(getNativeCurrencyImage);
  const tokenList = useSelector(getTokenList) as TokenListMap;
  const ipfsGateway = useSelector(getIpfsGateway);

  const nftImageURL = useGetAssetImageUrl(
    sendAsset.details?.image ?? undefined,
    ipfsGateway,
  );

  const isBasicSend = isEqualCaseInsensitive(
    receiveAsset.details?.address ?? '',
    sendAsset.details?.address ?? '',
  );

  if (!isBasicSend) {
    throw new Error('Swaps not supported');
  }

  const amount = sendAmount;

  // Hex data
  const showHexDataFlag = useSelector(getSendHexDataFeatureFlagState);
  const asset = useSelector(getSendAsset);
  const showHexData =
    isBasicSend &&
    showHexDataFlag &&
    asset &&
    asset.type !== AssetType.token &&
    asset.type !== AssetType.NFT;

  // Gas data
  const dispatch = useDispatch();

  return (
    <Box>
      {requireContractAddressAcknowledgement ? (
        <SendPageRow>
          <BannerAlert
            severity={BannerAlertSeverity.Danger}
            data-testid="send-warning"
            actionButtonLabel={t('tooltipApproveButton')}
            actionButtonOnClick={() => {
              dispatch(acknowledgeRecipientWarning());
            }}
            actionButtonProps={{ display: Display.Block, marginTop: 4 }}
          >
            {t('sendingToTokenContractWarning', [
              <a
                key="contractWarningSupport"
                target="_blank"
                rel="noopener noreferrer"
                className="send__warning-container__link"
                href={CONTRACT_ADDRESS_LINK}
              >
                {t('learnMoreUpperCase')}
              </a>,
            ])}
          </BannerAlert>
        </SendPageRow>
      ) : null}
      <SendPageRow>
        <AssetPickerAmount
          header={t('sendSelectReceiveAsset')}
          action="receive"
          asset={sendAsset}
          sendingAsset={
            sendAsset && {
              image:
                sendAsset.type === AssetType.native
                  ? nativeCurrencyImageUrl
                  : tokenList &&
                    sendAsset.details &&
                    (nftImageURL ||
                      tokenList[sendAsset.details?.address?.toLowerCase()]
                        ?.iconUrl),
              symbol: sendAsset?.details?.symbol || nativeCurrencySymbol,
            }
          }
          onAssetChange={useCallback(
            (newAsset) => onAssetChange(newAsset, false),
            [onAssetChange],
          )}
          isAmountLoading={false}
          amount={amount}
          isDisabled={true}
          onClick={onClick}
          visibleTabs={[TabName.TOKENS]}
        />
      </SendPageRow>
      {showHexData ? <SendHexData /> : null}
    </Box>
  );
};
