import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Asset,
  getSendMaxModeState,
  toggleSendMaxMode,
} from '../../../ducks/send';
import { ButtonLink } from '../../component-library';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { TextVariant } from '../../../helpers/constants/design-system';
import { AssetType } from '../../../../shared/constants/transaction';
import { hexToDecimal } from '../../../../shared/modules/conversion.utils';

// A button that updates the send amount to max balance or 0.
export default function MaxClearButton({ asset }: { asset: Asset }) {
  const t = useI18nContext();
  const maxModeOn = useSelector(getSendMaxModeState);
  const dispatch = useDispatch();

  const onClick = () => {
    dispatch(toggleSendMaxMode());
  };

  return asset.type === AssetType.NFT ||
    Number(hexToDecimal(asset.balance || '0x0')) <= 0 ? null : (
    <ButtonLink
      className="asset-picker-amount__max-clear"
      onClick={onClick}
      marginLeft="auto"
      textProps={{ variant: TextVariant.bodySm }}
      data-testid="max-clear-button"
    >
      {maxModeOn ? t('clear') : t('max')}
    </ButtonLink>
  );
}
