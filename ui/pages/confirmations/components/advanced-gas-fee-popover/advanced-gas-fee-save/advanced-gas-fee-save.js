import React from 'react';

import { PriorityLevels } from '../../../../../../shared/constants/gas';
import { decGWEIToHexWEI } from '../../../../../../shared/modules/conversion.utils';
import { useTransactionModalContext } from '../../../../../contexts/transaction-modal';
import { useGasFeeContext } from '../../../../../contexts/gasFee';
import { useI18nContext } from '../../../../../hooks/useI18nContext';
import Button from '../../../../../components/ui/button';

import { useAdvancedGasFeePopoverContext } from '../context';

const AdvancedGasFeeSaveButton = () => {
  const { closeModal } = useTransactionModalContext();
  const { updateTransaction } = useGasFeeContext();
  const t = useI18nContext();
  const { gasLimit, hasErrors, maxFeePerGas, maxPriorityFeePerGas } =
    useAdvancedGasFeePopoverContext();

  const onSave = () => {
    updateTransaction({
      estimateUsed: PriorityLevels.custom,
      maxFeePerGas: decGWEIToHexWEI(maxFeePerGas),
      maxPriorityFeePerGas: decGWEIToHexWEI(maxPriorityFeePerGas),
      gasLimit,
    });
    closeModal(['advancedGasFee', 'editGasFee']);
  };

  return (
    <Button type="primary" disabled={hasErrors} onClick={onSave}>
      {t('save')}
    </Button>
  );
};

export default AdvancedGasFeeSaveButton;
