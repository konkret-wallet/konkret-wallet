import { useCallback } from 'react';
import { AlertActionKey } from '../../../components/app/confirm/info/row/constants';
import { useTransactionModalContext } from '../../../contexts/transaction-modal';

const useConfirmationAlertActions = () => {
  const { openModal } = useTransactionModalContext();

  const processAction = useCallback((actionKey: string) => {
    switch (actionKey) {
      case AlertActionKey.Buy:
        console.error('Portfolio Buy not supported');
        break;

      case AlertActionKey.ShowAdvancedGasFeeModal:
        openModal('advancedGasFee');
        break;

      case AlertActionKey.ShowGasFeeModal:
        openModal('editGasFee');
        break;

      default:
        console.error('Unknown alert action key:', actionKey);
        break;
    }
  }, []);

  return processAction;
};

export default useConfirmationAlertActions;
