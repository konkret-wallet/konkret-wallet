import React from 'react';
import configureMockStore from 'redux-mock-store';
import { fireEvent } from '@testing-library/react';
import thunk from 'redux-thunk';
import { Cryptocurrency } from '@metamask/assets-controllers';
import { BtcAccountType, BtcMethod } from '@metamask/keyring-api';
import { MultichainNativeAssets } from '../../../../shared/constants/multichain/assets';
import mockState from '../../../../test/data/mock-state.json';
import { renderWithProvider } from '../../../../test/jest/rendering';
import { setBackgroundConnection } from '../../../store/background-connection';
import useMultiPolling from '../../../hooks/useMultiPolling';
import { BITCOIN_WALLET_SNAP_ID } from '../../../../shared/lib/accounts/bitcoin-wallet-snap';
import NonEvmOverview from './non-evm-overview';

// We need to mock `dispatch` since we use it for `setDefaultHomeActiveTabName`.
const mockDispatch = jest.fn().mockReturnValue(() => jest.fn());
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

jest.mock('../../../store/actions', () => ({
  handleSnapRequest: jest.fn(),
  sendMultichainTransaction: jest.fn(),
  setDefaultHomeActiveTabName: jest.fn(),
  tokenBalancesStartPolling: jest.fn().mockResolvedValue('pollingToken'),
  tokenBalancesStopPollingByPollingToken: jest.fn(),
}));

jest.mock('../../../hooks/useMultiPolling', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const BTC_OVERVIEW_BRIDGE = 'coin-overview-bridge';
const BTC_OVERVIEW_RECEIVE = 'coin-overview-receive';
const BTC_OVERVIEW_SWAP = 'token-overview-button-swap';
const BTC_OVERVIEW_SEND = 'coin-overview-send';
const BTC_OVERVIEW_PRIMARY_CURRENCY = 'coin-overview__primary-currency';

const mockNonEvmBalance = '1';
const mockNonEvmBalanceUsd = '1.00';
const mockNonEvmAccount = {
  address: 'bc1qwl8399fz829uqvqly9tcatgrgtwp3udnhxfq4k',
  id: '542490c8-d178-433b-9f31-f680b11f45a5',
  metadata: {
    name: 'Bitcoin Account',
    keyring: {
      type: 'Snap Keyring',
    },
    snap: {
      id: BITCOIN_WALLET_SNAP_ID,
      name: 'btc-snap-name',
    },
  },
  options: {},
  methods: [BtcMethod.SendBitcoin],
  type: BtcAccountType.P2wpkh,
};

const mockMetamaskStore = {
  ...mockState.metamask,
  accountsAssets: {
    [mockNonEvmAccount.id]: [MultichainNativeAssets.BITCOIN],
  },
  internalAccounts: {
    accounts: {
      [mockNonEvmAccount.id]: mockNonEvmAccount,
    },
    selectedAccount: mockNonEvmAccount.id,
  },
  // MultichainBalancesController
  balances: {
    [mockNonEvmAccount.id]: {
      [MultichainNativeAssets.BITCOIN]: {
        amount: mockNonEvmBalance,
        unit: 'BTC',
      },
    },
  },
  // (Multichain) RatesController
  fiatCurrency: 'usd',
  conversionRates: {
    [Cryptocurrency.Btc]: {
      conversionRate: '1.000',
      conversionDate: 0,
    },
  },
  cryptocurrencies: [Cryptocurrency.Btc],
  // Required, during onboarding, the extension will assume we're in an "EVM context", meaning
  // most multichain selectors will not use non-EVM logic despite having a non-EVM
  // selected account
  completedOnboarding: true,
  // Override state if provided
};

function getStore(state?: Record<string, unknown>) {
  return configureMockStore([thunk])({
    metamask: mockMetamaskStore,
    localeMessages: {
      currentLocale: 'en',
    },
    ...state,
  });
}

describe('NonEvmOverview', () => {
  beforeEach(() => {
    setBackgroundConnection({ setBridgeFeatureFlags: jest.fn() } as never);
    // Clear previous mock implementations
    (useMultiPolling as jest.Mock).mockClear();

    // Mock implementation for useMultiPolling
    (useMultiPolling as jest.Mock).mockImplementation(({ input }) => {
      // Mock startPolling and stopPollingByPollingToken for each input
      const startPolling = jest.fn().mockResolvedValue('mockPollingToken');
      const stopPollingByPollingToken = jest.fn();

      input.forEach((inputItem: string) => {
        const key = JSON.stringify(inputItem);
        // Simulate returning a unique token for each input
        startPolling.mockResolvedValueOnce(`mockToken-${key}`);
      });

      return { startPolling, stopPollingByPollingToken };
    });
  });

  it('shows the primary balance using the native token when showNativeTokenAsMainBalance if true', async () => {
    const { queryByTestId } = renderWithProvider(
      <NonEvmOverview />,
      getStore(),
    );

    const primaryBalance = queryByTestId(BTC_OVERVIEW_PRIMARY_CURRENCY);
    expect(primaryBalance).toBeInTheDocument();
    expect(primaryBalance).toHaveTextContent(`${mockNonEvmBalance}BTC`);
  });

  it('shows the primary balance as fiat when showNativeTokenAsMainBalance if false', async () => {
    const { queryByTestId } = renderWithProvider(
      <NonEvmOverview />,
      getStore({
        metamask: {
          ...mockMetamaskStore,
          // The balances won't be available
          preferences: {
            showNativeTokenAsMainBalance: false,
            tokenNetworkFilter: {},
            privacyMode: false,
          },
          currentCurrency: 'usd',
          conversionRates: {
            [MultichainNativeAssets.BITCOIN]: {
              rate: '1',
            },
          },
        },
      }),
    );

    const primaryBalance = queryByTestId(BTC_OVERVIEW_PRIMARY_CURRENCY);
    expect(primaryBalance).toBeInTheDocument();
    expect(primaryBalance).toHaveTextContent(`$${mockNonEvmBalanceUsd}USD`);
  });

  it('shows a spinner if balance is not available', async () => {
    const { container } = renderWithProvider(
      <NonEvmOverview />,
      getStore({
        metamask: {
          ...mockMetamaskStore,
          // The balances won't be available
          balances: {},
          accountsAssets: {
            [mockNonEvmAccount.id]: [],
          },
        },
      }),
    );

    const spinner = container.querySelector(
      '.coin-overview__balance .coin-overview__primary-container .spinner',
    );
    expect(spinner).toBeInTheDocument();
  });

  it('buttons Swap/Bridge are disabled', () => {
    const { queryByTestId } = renderWithProvider(
      <NonEvmOverview />,
      getStore(),
    );

    for (const buttonTestId of [BTC_OVERVIEW_SWAP, BTC_OVERVIEW_BRIDGE]) {
      const button = queryByTestId(buttonTestId);
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    }
  });

  it('always show the Receive button', () => {
    const { queryByTestId } = renderWithProvider(
      <NonEvmOverview />,
      getStore(),
    );
    const receiveButton = queryByTestId(BTC_OVERVIEW_RECEIVE);
    expect(receiveButton).toBeInTheDocument();
  });

  it('always show the Send button', () => {
    const { queryByTestId } = renderWithProvider(
      <NonEvmOverview />,
      getStore(),
    );
    const sendButton = queryByTestId(BTC_OVERVIEW_SEND);
    expect(sendButton).toBeInTheDocument();
    expect(sendButton).not.toBeDisabled();
  });

  it('sends an event when clicking the Send button', () => {
    const { queryByTestId } = renderWithProvider(
      <NonEvmOverview />,
      getStore(),
    );

    const sendButton = queryByTestId(BTC_OVERVIEW_SEND);
    expect(sendButton).toBeInTheDocument();
    expect(sendButton).not.toBeDisabled();
    fireEvent.click(sendButton as HTMLElement);
  });
});
