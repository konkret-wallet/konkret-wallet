import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { ReceiveModal } from '../../../../multichain';
import { FundingMethodModal } from '../../../../multichain/funding-method-modal/funding-method-modal';
import { useI18nContext } from '../../../../../hooks/useI18nContext';
import { getSelectedAccount } from '../../../../../selectors';

const AssetListFundingModals = () => {
  const t = useI18nContext();
  const selectedAccount = useSelector(getSelectedAccount);

  const [showFundingMethodModal, setShowFundingMethodModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  const onClickReceive = () => {
    setShowFundingMethodModal(false);
    setShowReceiveModal(true);
  };

  return (
    <>
      {showReceiveModal && selectedAccount?.address && (
        <ReceiveModal
          address={selectedAccount.address}
          onClose={() => setShowReceiveModal(false)}
        />
      )}
      {showFundingMethodModal && (
        <FundingMethodModal
          isOpen={showFundingMethodModal}
          onClose={() => setShowFundingMethodModal(false)}
          title={t('fundingMethod')}
          onClickReceive={onClickReceive}
        />
      )}
    </>
  );
};

export default AssetListFundingModals;
