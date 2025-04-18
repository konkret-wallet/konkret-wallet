import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fireEvent } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { TransactionStatus } from '@metamask/transaction-controller';
import mockState from '../../../../test/data/mock-state.json';
import transactionGroup from '../../../../test/data/mock-pending-transaction-data.json';
import {
  getConversionRate,
  getSelectedAccount,
  getTokenExchangeRates,
  getPreferences,
  getShouldShowFiat,
  getCurrentNetwork,
} from '../../../selectors';
import { renderWithProvider } from '../../../../test/jest';
import { setBackgroundConnection } from '../../../store/background-connection';
import { useGasFeeEstimates } from '../../../hooks/useGasFeeEstimates';
import { GasEstimateTypes } from '../../../../shared/constants/gas';
import { getTokens } from '../../../ducks/metamask/metamask';
import { abortTransactionSigning } from '../../../store/actions';
import TransactionListItem from '.';

const FEE_MARKET_ESTIMATE_RETURN_VALUE = {
  gasEstimateType: GasEstimateTypes.feeMarket,
  gasFeeEstimates: {
    low: {
      minWaitTimeEstimate: 180000,
      maxWaitTimeEstimate: 300000,
      suggestedMaxPriorityFeePerGas: '3',
      suggestedMaxFeePerGas: '53',
    },
    medium: {
      minWaitTimeEstimate: 15000,
      maxWaitTimeEstimate: 60000,
      suggestedMaxPriorityFeePerGas: '7',
      suggestedMaxFeePerGas: '70',
    },
    high: {
      minWaitTimeEstimate: 0,
      maxWaitTimeEstimate: 15000,
      suggestedMaxPriorityFeePerGas: '10',
      suggestedMaxFeePerGas: '100',
    },
    estimatedBaseFee: '50',
  },
  estimatedGasFeeTimeBounds: {},
};

jest.mock('react-redux', () => {
  const actual = jest.requireActual('react-redux');

  return {
    ...actual,
    useSelector: jest.fn(),
    useDispatch: jest.fn(),
  };
});

jest.mock('../../../hooks/useGasFeeEstimates', () => ({
  useGasFeeEstimates: jest.fn(),
}));

setBackgroundConnection({
  getGasFeeTimeEstimate: jest.fn(),
});

jest.mock('react', () => {
  const originReact = jest.requireActual('react');
  return {
    ...originReact,
    useLayoutEffect: jest.fn(),
  };
});

jest.mock('../../../store/actions.ts', () => ({
  tryReverseResolveAddress: jest.fn().mockReturnValue({ type: 'TYPE' }),
  abortTransactionSigning: jest.fn(),
}));

const mockStore = configureStore();

const generateUseSelectorRouter = (opts) => (selector) => {
  if (selector === getConversionRate) {
    return 1;
  } else if (selector === getSelectedAccount) {
    return {
      balance: opts.balance ?? '2AA1EFB94E0000',
    };
  } else if (selector === getTokenExchangeRates) {
    return opts.tokenExchangeRates ?? {};
  } else if (selector === getCurrentNetwork) {
    return { nickname: 'Ethereum Mainnet' };
  } else if (selector === getPreferences) {
    return opts.preferences ?? {};
  } else if (selector === getShouldShowFiat) {
    return opts.shouldShowFiat ?? false;
  } else if (selector === getTokens) {
    return opts.tokens ?? [];
  }
  return undefined;
};

describe('TransactionListItem', () => {
  beforeAll(() => {
    useGasFeeEstimates.mockImplementation(
      () => FEE_MARKET_ESTIMATE_RETURN_VALUE,
    );
  });

  afterAll(() => {
    useGasFeeEstimates.mockRestore();
  });

  describe('ActivityListItem interactions', () => {
    it('should show the activity details popover when the activity list item is clicked', () => {
      useSelector.mockImplementation(
        generateUseSelectorRouter({
          balance: '0x3',
        }),
      );

      const store = mockStore(mockState);
      const { queryByTestId } = renderWithProvider(
        <TransactionListItem transactionGroup={transactionGroup} />,
        store,
      );
      const activityListItem = queryByTestId('activity-list-item');
      fireEvent.click(activityListItem);
      const popoverClose = queryByTestId('popover-close');
      fireEvent.click(popoverClose);
    });
  });

  describe('when account has insufficient balance to cover gas', () => {
    it(`should indicate account has insufficient funds to cover gas price for cancellation of pending transaction`, () => {
      useSelector.mockImplementation(
        generateUseSelectorRouter({
          balance: '0x3',
        }),
      );
      const { queryByTestId } = renderWithProvider(
        <TransactionListItem transactionGroup={transactionGroup} />,
      );
      expect(queryByTestId('not-enough-gas__tooltip')).toBeInTheDocument();
    });

    it('should not disable "cancel" button when user has sufficient funds', () => {
      useSelector.mockImplementation(
        generateUseSelectorRouter({
          balance: '2AA1EFB94E0000',
        }),
      );
      const { queryByTestId } = renderWithProvider(
        <TransactionListItem transactionGroup={transactionGroup} />,
      );
      expect(queryByTestId('not-enough-gas__tooltip')).not.toBeInTheDocument();
    });

    it(`should open the edit gas popover when cancel is clicked`, () => {
      useSelector.mockImplementation(
        generateUseSelectorRouter({
          balance: '2AA1EFB94E0000',
        }),
      );
      const { getByText, queryByText } = renderWithProvider(
        <TransactionListItem transactionGroup={transactionGroup} />,
      );
      expect(queryByText('Cancel transaction')).not.toBeInTheDocument();

      const cancelButton = getByText('Cancel');
      fireEvent.click(cancelButton);
      expect(getByText('Cancel transaction')).toBeInTheDocument();
    });
  });

  it('hides speed up button if status is approved', () => {
    useSelector.mockImplementation(
      generateUseSelectorRouter({
        balance: '2AA1EFB94E0000',
      }),
    );

    const transactionGroupSigning = {
      ...transactionGroup,
      primaryTransaction: {
        ...transactionGroup.primaryTransaction,
        status: TransactionStatus.approved,
      },
    };

    const { queryByTestId } = renderWithProvider(
      <TransactionListItem transactionGroup={transactionGroupSigning} />,
    );

    const speedUpButton = queryByTestId('speed-up-button');
    expect(speedUpButton).not.toBeInTheDocument();
  });

  it('aborts transaction signing if cancel button clicked and status is approved', () => {
    useSelector.mockImplementation(
      generateUseSelectorRouter({
        balance: '2AA1EFB94E0000',
      }),
    );

    useDispatch.mockReturnValue(jest.fn());

    const transactionGroupSigning = {
      ...transactionGroup,
      primaryTransaction: {
        ...transactionGroup.primaryTransaction,
        status: TransactionStatus.approved,
      },
    };

    const { queryByTestId } = renderWithProvider(
      <TransactionListItem transactionGroup={transactionGroupSigning} />,
    );

    const cancelButton = queryByTestId('cancel-button');
    fireEvent.click(cancelButton);

    expect(abortTransactionSigning).toHaveBeenCalledTimes(1);
    expect(abortTransactionSigning).toHaveBeenCalledWith(
      transactionGroupSigning.primaryTransaction.id,
    );
  });
});
