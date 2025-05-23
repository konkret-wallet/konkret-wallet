import React from 'react';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { renderWithProvider } from '../../../../../../test/jest';
import AssetListControlBar from './asset-list-control-bar';

describe('AssetListControlBar', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be able to click refresh button', async () => {
    const store = configureMockStore([thunk])({
      metamask: {
        selectedNetworkClientId: 'selectedNetworkClientId',
        networkConfigurationsByChainId: {
          '0x1': {
            chainId: '0x1',
            defaultRpcEndpointIndex: 0,
            rpcEndpoints: [
              {
                networkClientId: 'selectedNetworkClientId',
              },
            ],
          },
        },
        internalAccounts: {
          selectedAccount: 'selectedAccount',
          accounts: {
            selectedAccount: {},
          },
        },
      },
    });

    const { findByTestId } = renderWithProvider(<AssetListControlBar />, store);

    const importButton = await findByTestId('import-token-button');
    importButton.click();

    const refreshListItem = await findByTestId('refreshList__button');
    refreshListItem.click();
  });
});
