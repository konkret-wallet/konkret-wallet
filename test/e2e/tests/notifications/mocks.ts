import { Mockttp, RequestRuleBuilder } from 'mockttp';
import { NotificationServicesController } from '@metamask/notification-services-controller';

const NotificationMocks = NotificationServicesController.Mocks;

type MockResponse = {
  url: string | RegExp;
  requestMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
  response: unknown;
};

/**
 * E2E mock setup for notification APIs (Auth, UserStorage, Notifications, Profile syncing)
 *
 * @param server - server obj used to mock our endpoints
 */
export async function mockNotificationServices(server: Mockttp) {
  // Notifications
  mockAPICall(server, NotificationMocks.getMockFeatureAnnouncementResponse());
  mockAPICall(server, NotificationMocks.getMockBatchCreateTriggersResponse());
  mockAPICall(server, NotificationMocks.getMockBatchDeleteTriggersResponse());
  mockAPICall(server, NotificationMocks.getMockListNotificationsResponse());
  mockAPICall(
    server,
    NotificationMocks.getMockMarkNotificationsAsReadResponse(),
  );
}

function mockAPICall(server: Mockttp, response: MockResponse) {
  let requestRuleBuilder: RequestRuleBuilder | undefined;

  if (response.requestMethod === 'GET') {
    requestRuleBuilder = server.forGet(response.url);
  }

  if (response.requestMethod === 'POST') {
    requestRuleBuilder = server.forPost(response.url);
  }

  if (response.requestMethod === 'PUT') {
    requestRuleBuilder = server.forPut(response.url);
  }

  if (response.requestMethod === 'DELETE') {
    requestRuleBuilder = server.forDelete(response.url);
  }

  requestRuleBuilder?.thenCallback(() => ({
    statusCode: 200,
    json: response.response,
  }));
}

type MockInfuraAndAccountSyncOptions = {
  accountsToMock?: string[];
};

const MOCK_ETH_BALANCE = '0xde0b6b3a7640000';
const INFURA_URL =
  'https://mainnet.infura.io/v3/00000000000000000000000000000000';

/**
 * Sets up mock responses for Infura balance checks and account syncing
 *
 * @param mockServer - The Mockttp server instance
 * @param options - Configuration options for mocking
 */
export async function mockInfuraAndAccountSync(
  mockServer: Mockttp,
  options: MockInfuraAndAccountSyncOptions = {},
): Promise<void> {
  const accounts = options.accountsToMock ?? [];

  // Account Balances
  if (accounts.length > 0) {
    accounts.forEach((account) => {
      mockServer
        .forPost(INFURA_URL)
        .withJsonBodyIncluding({
          method: 'eth_getBalance',
          params: [account.toLowerCase()],
        })
        .thenCallback(() => ({
          statusCode: 200,
          json: {
            jsonrpc: '2.0',
            id: '1111111111111111',
            result: MOCK_ETH_BALANCE,
          },
        }));
    });
  }

  mockNotificationServices(mockServer);
}
