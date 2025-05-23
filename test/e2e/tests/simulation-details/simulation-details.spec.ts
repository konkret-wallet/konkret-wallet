import { hexToNumber } from '@metamask/utils';
import { Mockttp, MockttpServer } from 'mockttp';
import { CHAIN_IDS } from '../../../../shared/constants/network';
import { TX_SENTINEL_URL } from '../../../../shared/constants/transaction';
import FixtureBuilder from '../../fixture-builder';
import {
  createDappTransaction,
  Fixtures,
  unlockWallet,
  WINDOW_TITLES,
  withFixtures,
} from '../../helpers';
import { Driver } from '../../webdriver/driver';
import {
  INSUFFICIENT_GAS_REQUEST_MOCK,
  INSUFFICIENT_GAS_TRANSACTION_MOCK,
} from './mock-request-error-insuffient-gas';
import {
  MALFORMED_TRANSACTION_MOCK,
  MALFORMED_TRANSACTION_REQUEST_MOCK,
} from './mock-request-error-malformed-transaction';
import {
  NO_CHANGES_REQUEST_MOCK,
  NO_CHANGES_TRANSACTION_MOCK,
} from './mock-request-no-changes';
import {
  SEND_ETH_REQUEST_MOCK,
  SEND_ETH_TRANSACTION_MOCK,
} from './mock-request-send-eth';
import { MockRequestResponse } from './types';

async function withFixturesForSimulationDetails(
  {
    title,
    inputChainId = CHAIN_IDS.MAINNET,
    mockRequests,
  }: {
    title?: string;
    inputChainId?: string;
    mockRequests: (mockServer: MockttpServer) => Promise<void>;
  },
  test: (args: Pick<Fixtures, 'driver' | 'mockServer'>) => Promise<void>,
) {
  await withFixtures(
    {
      fixtures: new FixtureBuilder({ inputChainId })
        .withPermissionControllerConnectedToTestDapp()
        .build(),
      title,
      testSpecificMock: mockRequests,
      dapp: true,
      localNodeOptions: {
        hardfork: 'london',
        chainId: hexToNumber(inputChainId),
      },
    },
    async ({ driver, mockServer }) => {
      await unlockWallet(driver);
      await test({ driver, mockServer });
    },
  );
}

async function expectBalanceChange(
  driver: Driver,
  isOutgoing: boolean,
  index: number,
  displayAmount: string,
  assetName: string,
) {
  const listTestId = isOutgoing
    ? 'simulation-rows-outgoing'
    : 'simulation-rows-incoming';

  const css = `[data-testid="${listTestId}"] [data-testid="simulation-details-balance-change-row"]:nth-child(${
    index + 1
  })`;

  await driver.findElement({
    css,
    text: displayAmount,
  });

  await driver.findElement({
    css,
    text: assetName,
  });
}

export async function mockRequest(
  server: Mockttp,
  { request, response }: MockRequestResponse,
) {
  await server
    .forPost(TX_SENTINEL_URL)
    .withJsonBodyIncluding(request)
    .thenJson(200, response);
}

describe('Simulation Details', () => {
  it('renders send eth transaction', async function (this: Mocha.Context) {
    const mockRequests = async (mockServer: MockttpServer) => {
      await mockRequest(mockServer, SEND_ETH_REQUEST_MOCK);
    };
    await withFixturesForSimulationDetails(
      { title: this.test?.fullTitle(), mockRequests },
      async ({ driver }) => {
        await createDappTransaction(driver, SEND_ETH_TRANSACTION_MOCK);

        await driver.switchToWindowWithTitle(WINDOW_TITLES.Dialog);
        await expectBalanceChange(driver, true, 0, '- 0.001', 'ETH');
      },
    );
  });

  it('renders no changes transaction', async function (this: Mocha.Context) {
    const mockRequests = async (mockServer: MockttpServer) => {
      await mockRequest(mockServer, NO_CHANGES_REQUEST_MOCK);
    };
    await withFixturesForSimulationDetails(
      { title: this.test?.fullTitle(), mockRequests },
      async ({ driver }) => {
        await createDappTransaction(driver, NO_CHANGES_TRANSACTION_MOCK);

        await driver.switchToWindowWithTitle(WINDOW_TITLES.Dialog);
        await driver.findElement({
          css: '[data-testid="simulation-details-layout"]',
          text: 'No changes',
        });
      },
    );
  });

  it('displays error message if transaction will fail or revert', async function (this: Mocha.Context) {
    const mockRequests = async (mockServer: MockttpServer) => {
      await mockRequest(mockServer, INSUFFICIENT_GAS_REQUEST_MOCK);
    };
    await withFixturesForSimulationDetails(
      { title: this.test?.fullTitle(), mockRequests },
      async ({ driver }) => {
        await createDappTransaction(driver, INSUFFICIENT_GAS_TRANSACTION_MOCK);

        await driver.switchToWindowWithTitle(WINDOW_TITLES.Dialog);
        await driver.findElement({
          css: '[data-testid="simulation-details-layout"]',
          text: 'This transaction is likely to fail',
        });
      },
    );
  });

  it('does not display if chain is not supported', async function (this: Mocha.Context) {
    const mockRequests = async (mockServer: MockttpServer) => {
      await mockRequest(mockServer, SEND_ETH_REQUEST_MOCK);
    };
    await withFixturesForSimulationDetails(
      {
        title: this.test?.fullTitle(),
        inputChainId: CHAIN_IDS.LOCALHOST, // Localhost chain is not supported.
        mockRequests,
      },
      async ({ driver }) => {
        await createDappTransaction(driver, SEND_ETH_TRANSACTION_MOCK);

        await driver.switchToWindowWithTitle(WINDOW_TITLES.Dialog);
        await driver.assertElementNotPresent(
          '[data-testid="simulation-details-layout"]',
          { waitAtLeastGuard: 1000 },
        );
      },
    );
  });

  it('displays generic error message', async function (this: Mocha.Context) {
    const mockRequests = async (mockServer: MockttpServer) => {
      await mockRequest(mockServer, MALFORMED_TRANSACTION_REQUEST_MOCK);
    };
    await withFixturesForSimulationDetails(
      {
        title: this.test?.fullTitle(),
        mockRequests,
      },
      async ({ driver }) => {
        await createDappTransaction(driver, MALFORMED_TRANSACTION_MOCK);

        await driver.switchToWindowWithTitle(WINDOW_TITLES.Dialog);
        await driver.findElement({
          css: '[data-testid="simulation-details-layout"]',
          text: 'Unavailable',
        });
      },
    );
  });
});
