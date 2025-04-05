import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { capitalize } from 'lodash';
import { EditGasModes } from '../../../../../../shared/constants/gas';

import {
  Display,
  FlexDirection,
} from '../../../../../helpers/constants/design-system';
import {
  getAdvancedGasFeeValues,
  selectNetworkIdentifierByChainId,
} from '../../../../../selectors';
import { setAdvancedGasFee } from '../../../../../store/actions';
import { useGasFeeContext } from '../../../../../contexts/gasFee';
import { useAdvancedGasFeePopoverContext } from '../context';
import { useI18nContext } from '../../../../../hooks/useI18nContext';
import { Checkbox, Box } from '../../../../../components/component-library';
import { Numeric } from '../../../../../../shared/modules/Numeric';

const AdvancedGasFeeDefaults = () => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const {
    gasErrors,
    maxBaseFee: maxBaseFeeNumber,
    maxPriorityFeePerGas: maxPriorityFeePerGasNumber,
  } = useAdvancedGasFeePopoverContext();
  const maxBaseFee = new Numeric(maxBaseFeeNumber, 10).toString();
  const maxPriorityFeePerGas = new Numeric(
    maxPriorityFeePerGasNumber,
    10,
  ).toString();
  const advancedGasFeeValues = useSelector(getAdvancedGasFeeValues);
  const { editGasMode, transaction } = useGasFeeContext();
  const { chainId } = transaction;

  const networkIdentifier = useSelector((state) =>
    selectNetworkIdentifierByChainId(state, chainId),
  );

  const [isDefaultSettingsSelected, setDefaultSettingsSelected] = useState(
    Boolean(advancedGasFeeValues) &&
      advancedGasFeeValues.maxBaseFee === maxBaseFee &&
      advancedGasFeeValues.priorityFee === maxPriorityFeePerGas,
  );

  useEffect(() => {
    setDefaultSettingsSelected(
      Boolean(advancedGasFeeValues) &&
        advancedGasFeeValues.maxBaseFee === maxBaseFee &&
        advancedGasFeeValues.priorityFee === maxPriorityFeePerGas,
    );
  }, [advancedGasFeeValues, maxBaseFee, maxPriorityFeePerGas]);

  const handleUpdateDefaultSettings = () => {
    if (isDefaultSettingsSelected) {
      dispatch(setAdvancedGasFee({ chainId, gasFeePreferences: undefined }));
      setDefaultSettingsSelected(false);
    } else {
      dispatch(
        setAdvancedGasFee({
          chainId,
          gasFeePreferences: {
            maxBaseFee,
            priorityFee: maxPriorityFeePerGas,
          },
        }),
      );
    }
  };

  if (editGasMode === EditGasModes.swaps) {
    return null;
  }

  return (
    <Box
      display={Display.Flex}
      flexDirection={FlexDirection.Row}
      marginTop={4}
      marginLeft={2}
      marginRight={2}
      paddingTop={4}
      paddingBottom={4}
      className="advanced-gas-fee-defaults"
    >
      <Checkbox
        isChecked={isDefaultSettingsSelected}
        onChange={handleUpdateDefaultSettings}
        isDisabled={gasErrors.maxFeePerGas || gasErrors.maxPriorityFeePerGas}
        label={t('advancedGasFeeDefaultOptIn', [capitalize(networkIdentifier)])}
      />
    </Box>
  );
};

export default AdvancedGasFeeDefaults;
