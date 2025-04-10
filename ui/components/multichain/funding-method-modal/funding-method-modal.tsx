import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
// import { CaipChainId } from '@metamask/utils';
import {
  Modal,
  ModalContent,
  ModalOverlay,
  ModalHeader,
  Text,
  IconName,
} from '../../component-library';
import {
  TextVariant,
  TextAlign,
} from '../../../helpers/constants/design-system';
// import { getMultichainCurrentNetwork } from '../../../selectors/multichain';
import { getPortfolioUrl } from '../../../helpers/utils/portfolio';
import { getSelectedAccount } from '../../../selectors';
import { useI18nContext } from '../../../hooks/useI18nContext';
// import { ChainId } from '../../../../shared/constants/network';
import FundingMethodItem from './funding-method-item';

type FundingMethodModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onClickReceive: () => void;
};

export const FundingMethodModal: React.FC<FundingMethodModalProps> = ({
  isOpen,
  onClose,
  title,
  onClickReceive,
}) => {
  const t = useI18nContext();
  const { address: accountAddress } = useSelector(getSelectedAccount);
  // const { chainId } = useSelector(getMultichainCurrentNetwork);

  const handleTransferCryptoClick = useCallback(() => {
    const url = getPortfolioUrl('transfer', accountAddress, 'transfer');
    global.platform.openTab({ url });
  }, [accountAddress]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} data-testid="funding-method-modal">
      <ModalOverlay />
      <ModalContent modalDialogProps={{ padding: 0 }}>
        <ModalHeader paddingBottom={2} onClose={onClose}>
          <Text variant={TextVariant.headingSm} textAlign={TextAlign.Center}>
            {title}
          </Text>
        </ModalHeader>
        <FundingMethodItem
          icon={IconName.Received}
          title={t('receiveCrypto')}
          description={t('depositCrypto')}
          onClick={onClickReceive}
        />
        <FundingMethodItem
          icon={IconName.Link}
          title={t('transferCrypto')}
          description={t('linkCentralizedExchanges')}
          onClick={handleTransferCryptoClick}
        />
      </ModalContent>
    </Modal>
  );
};
