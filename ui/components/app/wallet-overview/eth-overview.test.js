import React from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { fireEvent, waitFor } from '@testing-library/react';
import { EthAccountType, EthMethod } from '@metamask/keyring-api';
import { CHAIN_IDS } from '../../../../shared/constants/network';
import { renderWithProvider } from '../../../../test/jest/rendering';
import { KeyringType } from '../../../../shared/constants/keyring';
import { useIsOriginalNativeTokenSymbol } from '../../../hooks/useIsOriginalNativeTokenSymbol';
import useMultiPolling from '../../../hooks/useMultiPolling';
import { ETH_EOA_METHODS } from '../../../../shared/constants/eth-methods';
import { getIntlLocale } from '../../../ducks/locale/locale';
import { setBackgroundConnection } from '../../../store/background-connection';
import { mockNetworkState } from '../../../../test/stub/networks';
import EthOverview from './eth-overview';

// We need to mock `dispatch` since we use it for `setDefaultHomeActiveTabName`.
const mockDispatch = jest.fn().mockReturnValue(() => jest.fn());
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

jest.mock('../../../hooks/useIsOriginalNativeTokenSymbol', () => {
  return {
    useIsOriginalNativeTokenSymbol: jest.fn(),
  };
});

jest.mock('../../../ducks/locale/locale', () => ({
  getIntlLocale: jest.fn(),
}));

jest.mock('../../../store/actions', () => ({
  startNewDraftTransaction: jest.fn(),
  tokenBalancesStartPolling: jest.fn().mockResolvedValue('pollingToken'),
  tokenBalancesStopPollingByPollingToken: jest.fn(),
}));

jest.mock('../../../hooks/useMultiPolling', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockGetIntlLocale = getIntlLocale;

let openTabSpy;

describe('EthOverview', () => {
  useIsOriginalNativeTokenSymbol.mockReturnValue(true);
  mockGetIntlLocale.mockReturnValue('en-US');

  const mockEvmAccount1 = {
    address: '0x1',
    id: 'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3',
    metadata: {
      name: 'Account 1',
      keyring: {
        type: KeyringType.imported,
      },
    },
    options: {},
    methods: ETH_EOA_METHODS,
    type: EthAccountType.Eoa,
  };

  const mockEvmAccount2 = {
    address: '0x2',
    id: 'e9b992f9-e151-4317-b8b7-c771bb73dd02',
    metadata: {
      name: 'Account 2',
      keyring: {
        type: KeyringType.imported,
      },
    },
    options: {},
    methods: ETH_EOA_METHODS,
    type: EthAccountType.Eoa,
  };

  const mockStore = {
    metamask: {
      ...mockNetworkState({ chainId: CHAIN_IDS.MAINNET }),
      accountsByChainId: {
        [CHAIN_IDS.MAINNET]: {
          '0x1': { address: mockEvmAccount1.address, balance: '0x1F4' },
        },
      },
      tokenList: [],
      cachedBalances: {
        '0x1': {
          [mockEvmAccount1.address]: '0x1F4',
        },
      },
      preferences: {
        showNativeTokenAsMainBalance: true,
        tokenNetworkFilter: {},
      },
      useExternalServices: true,
      useCurrencyRateCheck: true,
      currentCurrency: 'usd',
      currencyRates: {
        ETH: {
          conversionRate: 2,
        },
      },
      accounts: {
        [mockEvmAccount1.address]: {
          address: mockEvmAccount1.address,
          balance: '0x1F4',
        },
      },
      internalAccounts: {
        accounts: {
          [mockEvmAccount1.id]: mockEvmAccount1,
          [mockEvmAccount2.id]: mockEvmAccount2,
        },
        selectedAccount: mockEvmAccount1.id,
      },
      keyrings: [
        {
          type: KeyringType.imported,
          accounts: [mockEvmAccount1.address, mockEvmAccount2.address],
        },
        {
          type: KeyringType.ledger,
          accounts: [],
        },
      ],
      balances: {},
    },
  };

  const store = configureMockStore([thunk])(mockStore);
  const ETH_OVERVIEW_BRIDGE = 'eth-overview-bridge';
  const ETH_OVERVIEW_SEND = 'eth-overview-send';
  const ETH_OVERVIEW_PRIMARY_CURRENCY = 'eth-overview__primary-currency';

  afterEach(() => {
    store.clearActions();
  });

  describe('EthOverview', () => {
    beforeAll(() => {
      jest.clearAllMocks();
      Object.defineProperty(global, 'platform', {
        value: {
          openTab: jest.fn(),
        },
      });
      openTabSpy = jest.spyOn(global.platform, 'openTab');
      setBackgroundConnection({ setBridgeFeatureFlags: jest.fn() });
    });

    beforeEach(() => {
      openTabSpy.mockClear();
      // Clear previous mock implementations
      useMultiPolling.mockClear();

      // Mock implementation for useMultiPolling
      useMultiPolling.mockImplementation(({ input }) => {
        // Mock startPolling and stopPollingByPollingToken for each input
        const startPolling = jest.fn().mockResolvedValue('mockPollingToken');
        const stopPollingByPollingToken = jest.fn();

        input.forEach((inputItem) => {
          const key = JSON.stringify(inputItem);
          // Simulate returning a unique token for each input
          startPolling.mockResolvedValueOnce(`mockToken-${key}`);
        });

        return { startPolling, stopPollingByPollingToken };
      });
    });

    it('should show the primary balance', async () => {
      const { queryByTestId, queryByText } = renderWithProvider(
        <EthOverview />,
        store,
      );

      const primaryBalance = queryByTestId(ETH_OVERVIEW_PRIMARY_CURRENCY);
      expect(primaryBalance).toBeInTheDocument();
      expect(primaryBalance).toHaveTextContent('<0.000001ETH');
      expect(queryByText('*')).not.toBeInTheDocument();
    });

    it('should show the cached primary balance', async () => {
      const mockedStoreWithCachedBalance = {
        ...mockStore,
        metamask: {
          ...mockStore.metamask,
          accounts: {
            '0x1': {
              address: '0x1',
            },
          },
          accountsByChainId: {
            [CHAIN_IDS.MAINNET]: {
              '0x1': { address: '0x1', balance: '0x24da51d247e8b8' },
            },
          },
        },
      };
      const mockedStore = configureMockStore([thunk])(
        mockedStoreWithCachedBalance,
      );

      const { queryByTestId, queryByText } = renderWithProvider(
        <EthOverview />,
        mockedStore,
      );

      const primaryBalance = queryByTestId(ETH_OVERVIEW_PRIMARY_CURRENCY);
      expect(primaryBalance).toBeInTheDocument();
      expect(primaryBalance).toHaveTextContent('0.0104ETH');
      expect(queryByText('*')).toBeInTheDocument();
    });

    it('should have the Bridge button enabled if chain id is part of supported chains', () => {
      const mockedAvalancheStore = {
        ...mockStore,
        metamask: {
          ...mockStore.metamask,
          ...mockNetworkState({ chainId: '0xa86a' }),
        },
      };
      const mockedStore = configureMockStore([thunk])(mockedAvalancheStore);

      const { queryByTestId, queryByText } = renderWithProvider(
        <EthOverview />,
        mockedStore,
      );
      const bridgeButton = queryByTestId(ETH_OVERVIEW_BRIDGE);
      expect(bridgeButton).toBeInTheDocument();
      expect(bridgeButton).toBeEnabled();
      expect(queryByText('Bridge').parentElement).not.toHaveAttribute(
        'data-original-title',
        'Unavailable on this network',
      );
    });

    it('should open the Bridge URI when clicking on Bridge button on supported network', async () => {
      const mockedStore = configureMockStore([thunk])({
        ...store,
        metamask: {
          ...mockStore.metamask,
          ...mockNetworkState({ chainId: '0xa86a' }),
          useExternalServices: true,
          bridgeState: {
            bridgeFeatureFlags: {
              extensionConfig: {
                support: false,
              },
            },
          },
        },
      });
      const { queryByTestId } = renderWithProvider(
        <EthOverview />,
        mockedStore,
      );

      const bridgeButton = queryByTestId(ETH_OVERVIEW_BRIDGE);

      expect(bridgeButton).toBeInTheDocument();
      expect(bridgeButton).not.toBeDisabled();

      fireEvent.click(bridgeButton);

      await waitFor(() => {
        expect(openTabSpy).toHaveBeenCalledTimes(1);
        expect(openTabSpy).toHaveBeenCalledWith({
          url: expect.stringContaining(
            '/bridge?metamaskEntry=ext_bridge_button',
          ),
        });
      });
    });

    it('should have the Bridge button disabled if chain id is not part of supported chains', () => {
      const mockedFantomStore = {
        ...mockStore,
        metamask: {
          ...mockStore.metamask,
          ...mockNetworkState({ chainId: CHAIN_IDS.SEPOLIA }),
        },
      };
      const mockedStore = configureMockStore([thunk])(mockedFantomStore);

      const { queryByTestId, queryByText } = renderWithProvider(
        <EthOverview />,
        mockedStore,
      );
      const bridgeButton = queryByTestId(ETH_OVERVIEW_BRIDGE);
      expect(bridgeButton).toBeInTheDocument();
      expect(bridgeButton).toBeDisabled();
      expect(queryByText('Bridge').parentElement).toHaveAttribute(
        'data-original-title',
        'Unavailable on this network',
      );
    });
  });

  describe('Disabled buttons when an account cannot sign transactions', () => {
    const buttonTestCases = [{ testId: ETH_OVERVIEW_SEND, buttonText: 'Send' }];

    it.each(buttonTestCases)(
      'should have the $buttonText button disabled when an account cannot sign transactions or user operations',
      ({ testId, buttonText }) => {
        const mockedStoreWithoutSigningMethods = {
          ...mockStore,
          metamask: {
            ...mockStore.metamask,
            internalAccounts: {
              ...mockStore.metamask.internalAccounts,
              accounts: {
                [mockEvmAccount1.id]: {
                  ...mockEvmAccount1,
                  // Filter out all methods used for signing transactions.
                  methods: Object.values(EthMethod).filter(
                    (method) =>
                      method !== EthMethod.SignTransaction &&
                      method !== EthMethod.SignUserOperation,
                  ),
                },
              },
            },
          },
        };

        const mockedStore = configureMockStore([thunk])(
          mockedStoreWithoutSigningMethods,
        );
        const { queryByTestId, queryByText } = renderWithProvider(
          <EthOverview />,
          mockedStore,
        );

        const button = queryByTestId(testId);
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
        expect(queryByText(buttonText).parentElement).toHaveAttribute(
          'data-original-title',
          'Not supported with this account.',
        );
      },
    );
  });

  it.each([
    CHAIN_IDS.MAINNET,
    // We want to test with a different chain ID than mainnet to make sure the events are still using
    // the right `token_symbol`.
    CHAIN_IDS.SEPOLIA,
  ])('can click the Send button: %s', (chainId) => {
    const mockedStoreWithSpecificChainId = {
      ...mockStore,
      metamask: {
        ...mockStore.metamask,
        ...mockNetworkState({ chainId }),
      },
    };

    const mockedStore = configureMockStore([thunk])(
      mockedStoreWithSpecificChainId,
    );
    const { queryByTestId } = renderWithProvider(<EthOverview />, mockedStore);

    const sendButton = queryByTestId(ETH_OVERVIEW_SEND);
    expect(sendButton).toBeInTheDocument();
    expect(sendButton).not.toBeDisabled();
    fireEvent.click(sendButton);
  });
});
