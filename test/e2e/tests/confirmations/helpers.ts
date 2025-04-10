import { TransactionEnvelopeType } from '@metamask/transaction-controller';
import FixtureBuilder from '../../fixture-builder';
import {
  defaultGanacheOptions,
  defaultGanacheOptionsForType2Transactions,
  withFixtures,
} from '../../helpers';
import { MockedEndpoint, Mockttp } from '../../mock-e2e';
import { SMART_CONTRACTS } from '../../seeder/smart-contracts';
import { Driver } from '../../webdriver/driver';
import Confirmation from '../../page-objects/pages/confirmations/redesign/confirmation';

export async function scrollAndConfirmAndAssertConfirm(driver: Driver) {
  const confirmation = new Confirmation(driver);
  await confirmation.clickScrollToBottomButton();
  await confirmation.clickFooterConfirmButton();
}

export function withTransactionEnvelopeTypeFixtures(
  // Default params first is discouraged because it makes it hard to call the function without the
  // optional parameters. But it doesn't apply here because we're always passing in a variable for
  // title. It's optional because it's sometimes unset.
  // eslint-disable-next-line @typescript-eslint/default-param-last
  title: string = '',
  transactionEnvelopeType: TransactionEnvelopeType,
  testFunction: Parameters<typeof withFixtures>[1],
  mocks?: (mockServer: Mockttp) => Promise<MockedEndpoint[]>, // Add mocks as an optional parameter
  smartContract?: typeof SMART_CONTRACTS,
) {
  return withFixtures(
    {
      dapp: true,
      driverOptions: { timeOut: 20000 },
      fixtures: new FixtureBuilder()
        .withPermissionControllerConnectedToTestDapp()
        .build(),
      localNodeOptions:
        transactionEnvelopeType === TransactionEnvelopeType.legacy
          ? defaultGanacheOptions
          : defaultGanacheOptionsForType2Transactions,
      ...(smartContract && { smartContract }),
      ...(mocks && { testSpecificMock: mocks }),
      title,
    },
    testFunction,
  );
}

export async function mockSignatureApproved(
  _mockServer: Mockttp,
  _withAnonEvents = false,
) {
  return [];
}

export async function mockSignatureApprovedWithDecoding(
  mockServer: Mockttp,
  withAnonEvents = false,
) {
  return [...(await mockSignatureApproved(mockServer, withAnonEvents))];
}

export async function mockSignatureRejected(
  _mockServer: Mockttp,
  _withAnonEvents = false,
) {
  return [];
}

export async function mockSignatureRejectedWithDecoding(
  mockServer: Mockttp,
  withAnonEvents = false,
) {
  return [...(await mockSignatureRejected(mockServer, withAnonEvents))];
}

export async function mockedSourcifyTokenSend(mockServer: Mockttp) {
  return await mockServer
    .forGet('https://www.4byte.directory/api/v1/signatures/')
    .withQuery({ hex_signature: '0xa9059cbb' })
    .always()
    .thenCallback(() => ({
      statusCode: 200,
      json: {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            bytes_signature: '©\u0005»',
            created_at: '2016-07-09T03:58:28.234977Z',
            hex_signature: '0xa9059cbb',
            id: 145,
            text_signature: 'transfer(address,uint256)',
          },
        ],
      },
    }));
}
