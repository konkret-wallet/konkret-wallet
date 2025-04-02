// Mocha type definitions are conflicting with Jest
import { it as jestIt } from '@jest/globals';

import { createSwapsMockStore } from '../../../test/jest';
import { CHAIN_IDS } from '../../constants/network';
import { mockNetworkState } from '../../../test/stub/networks';

describe('Selectors', () => {
  const createMockState = () => {
    return {
      metamask: {
        preferences: {},
        internalAccounts: {
          selectedAccount: 'account1',
          accounts: {
            account1: {
              metadata: {
                keyring: {
                  type: 'Hardware',
                },
              },
              address: '0x123',
              type: 'eip155:eoa',
            },
          },
        },
        accounts: {
          '0x123': {
            address: '0x123',
            balance: '0x15f6f0b9d4f8d000',
          },
        },
        ...mockNetworkState({
          id: 'network-configuration-id-1',
          chainId: CHAIN_IDS.MAINNET,
          rpcUrl: 'https://mainnet.infura.io/v3/',
        }),
      },
    };
  };
});
