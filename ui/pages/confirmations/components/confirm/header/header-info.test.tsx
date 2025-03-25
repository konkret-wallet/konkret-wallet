import { fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { TransactionType } from '@metamask/transaction-controller';

import {
  MetaMetricsEventCategory,
  MetaMetricsEventLocation,
  MetaMetricsEventName,
} from '../../../../../../shared/constants/metametrics';
import {
  getMockContractInteractionConfirmState,
  getMockTypedSignConfirmState,
} from '../../../../../../test/data/confirmations/helper';
import { renderWithConfirmContextProvider } from '../../../../../../test/lib/confirmations/render-helpers';
import { MetaMetricsContext } from '../../../../../contexts/metametrics';
import configureStore from '../../../../../store/store';
import HeaderInfo from './header-info';

const mockStore = getMockTypedSignConfirmState();

const render = () => {
  const store = configureStore(mockStore);
  return renderWithConfirmContextProvider(<HeaderInfo />, store);
};

describe('Header', () => {
  it('should match snapshot', async () => {
    const { container } = render();
    expect(container).toMatchSnapshot();
  });
  it('shows account info icon', async () => {
    const { getByLabelText } = render();
    expect(getByLabelText('Account details')).toBeInTheDocument();
  });

  describe('when account info icon is clicked', () => {
    it('shows account info modal with address', async () => {
      const { getByLabelText, getByText, queryByTestId } = render();
      const accountInfoIcon = getByLabelText('Account details');
      fireEvent.click(accountInfoIcon);
      await waitFor(() => {
        expect(queryByTestId('account-details-modal')).toBeInTheDocument();
        expect(getByText('0x0DCD5...3E7bc')).toBeInTheDocument();
      });
    });
  });
});
