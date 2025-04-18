import React, { memo, useCallback, useState } from 'react';
import { NameType } from '@metamask/name-controller';
import { Box } from '../../component-library';
import { Display } from '../../../helpers/constants/design-system';
import NameDisplay from './name-details/name-display';
import NameDetails from './name-details/name-details';

export type NameProps = {
  /**
   * Applies to recognized contracts with no petname saved:
   * If true the contract symbol (e.g. WBTC) will be used instead of the contract name.
   */
  preferContractSymbol?: boolean;

  /** The type of value, e.g. NameType.ETHEREUM_ADDRESS */
  type: NameType;

  /** The raw value to display the name of. */
  value: string;

  /**
   * The variation of the value.
   * Such as the chain ID if the `type` is an Ethereum address.
   */
  variation: string;
};

const Name = memo(
  ({ value, type, preferContractSymbol = false, variation }: NameProps) => {
    const [modalOpen, setModalOpen] = useState(false);

    const handleClick = useCallback(() => {
      setModalOpen(true);
    }, [setModalOpen]);

    const handleModalClose = useCallback(() => {
      setModalOpen(false);
    }, [setModalOpen]);

    return (
      <Box display={Display.Flex}>
        {modalOpen && (
          <NameDetails
            value={value}
            type={type}
            variation={variation}
            onClose={handleModalClose}
          />
        )}

        <NameDisplay
          value={value}
          type={type}
          preferContractSymbol={preferContractSymbol}
          variation={variation}
          handleClick={handleClick}
        />
      </Box>
    );
  },
);

export default Name;
