import { Mockttp } from 'mockttp';
import FixtureBuilder from '../../fixture-builder';
import { withFixtures } from '../../helpers';
import {
  ACCOUNT_TYPE,
  DEFAULT_BTC_ACCOUNT,
  DEFAULT_BTC_BALANCE,
  DEFAULT_BTC_FEES_RATE,
  DEFAULT_BTC_TRANSACTION_ID,
  DEFAULT_BTC_CONVERSION_RATE,
  DEFAULT_BTC_BLOCK_NUMBER,
  SATS_IN_1_BTC,
} from '../../constants';
import { Driver } from '../../webdriver/driver';
import { loginWithBalanceValidation } from '../../page-objects/flows/login.flow';
import AccountListPage from '../../page-objects/pages/account-list-page';
import HeaderNavbar from '../../page-objects/pages/header-navbar';

const SIMPLEHASH_URL = 'https://api.simplehash.com';
const QUICKNODE_URL_REGEX = /^https:\/\/.*\.btc.*\.quiknode\.pro(\/|$)/u;

export function btcToSats(btc: number): number {
  // Watchout, we're not using BigNumber(s) here (but that's ok for test purposes)
  return btc * SATS_IN_1_BTC;
}

export async function mockBtcBalanceQuote(
  mockServer: Mockttp,
  address: string = DEFAULT_BTC_ACCOUNT,
) {
  return await mockServer
    .forPost(QUICKNODE_URL_REGEX)
    .withJsonBodyIncluding({
      method: 'bb_getaddress',
    })
    .thenCallback(() => {
      return {
        statusCode: 200,
        json: {
          result: {
            address,
            balance: btcToSats(DEFAULT_BTC_BALANCE).toString(), // Converts from BTC to sats
            totalReceived: '0',
            totalSent: '0',
            unconfirmedBalance: '0',
            unconfirmedTxs: 0,
            txs: 0,
          },
        },
      };
    });
}

export async function mockBtcFeeCallQuote(mockServer: Mockttp) {
  return await mockServer
    .forPost(QUICKNODE_URL_REGEX)
    .withJsonBodyIncluding({
      method: 'estimatesmartfee',
    })
    .thenCallback(() => {
      return {
        statusCode: 200,
        json: {
          result: {
            blocks: 1,
            feerate: DEFAULT_BTC_FEES_RATE, // sats
          },
        },
      };
    });
}

export async function mockMempoolInfo(mockServer: Mockttp) {
  return await mockServer
    .forPost(QUICKNODE_URL_REGEX)
    .withJsonBodyIncluding({
      method: 'getmempoolinfo',
    })
    .thenCallback(() => {
      return {
        statusCode: 200,
        json: {
          result: {
            loaded: true,
            size: 165194,
            bytes: 93042828,
            usage: 550175264,
            total_fee: 1.60127931,
            maxmempool: 2048000000,
            mempoolminfee: DEFAULT_BTC_FEES_RATE,
            minrelaytxfee: DEFAULT_BTC_FEES_RATE,
            incrementalrelayfee: 0.00001,
            unbroadcastcount: 0,
            fullrbf: true,
          },
        },
      };
    });
}

export async function mockGetUTXO(mockServer: Mockttp) {
  return await mockServer
    .forPost(QUICKNODE_URL_REGEX)
    .withJsonBodyIncluding({
      method: 'bb_getutxos',
    })
    .thenCallback(() => {
      return {
        statusCode: 200,
        json: {
          result: [
            {
              txid: DEFAULT_BTC_TRANSACTION_ID,
              vout: 0,
              value: btcToSats(DEFAULT_BTC_BALANCE).toString(),
              height: DEFAULT_BTC_BLOCK_NUMBER,
              confirmations: 6,
            },
          ],
        },
      };
    });
}

export async function mockSendTransaction(mockServer: Mockttp) {
  return await mockServer
    .forPost(QUICKNODE_URL_REGEX)
    .withJsonBodyIncluding({
      method: 'sendrawtransaction',
    })
    .thenCallback(() => {
      return {
        statusCode: 200,
        json: {
          result: DEFAULT_BTC_TRANSACTION_ID,
        },
      };
    });
}

export async function mockRatesCall(mockServer: Mockttp) {
  return await mockServer
    .forGet('https://min-api.cryptocompare.com/data/pricemulti')
    .withQuery({ fsyms: 'btc', tsyms: 'usd,USD' })
    .thenCallback(() => {
      return {
        statusCode: 200,
        json: { BTC: { USD: DEFAULT_BTC_CONVERSION_RATE } },
      };
    });
}

export async function mockBtcSatProtectionService(
  mockServer: Mockttp,
  address: string = DEFAULT_BTC_ACCOUNT,
) {
  // NOTE: This endpoint is also used to compute the total balance if Sat Protection is enabled, so we have
  // to compute the set of UTXOS here too.
  const utxos = [
    {
      output: `${DEFAULT_BTC_TRANSACTION_ID}:0`,
      value: btcToSats(DEFAULT_BTC_BALANCE),
      block_number: DEFAULT_BTC_BLOCK_NUMBER,
    },
  ];

  return await mockServer
    .forGet(`${SIMPLEHASH_URL}/api/v0/custom/wallet_assets_by_utxo/${address}`)
    .withQuery({
      without_inscriptions_runes_raresats: '1',
    })
    .thenCallback(() => {
      return {
        statusCode: 200,
        json: {
          count: utxos.length,
          utxos,
        },
      };
    });
}

export async function withBtcAccountSnap(
  {
    title,
    bitcoinSupportEnabled,
  }: { title?: string; bitcoinSupportEnabled?: boolean },
  test: (driver: Driver, mockServer: Mockttp) => Promise<void>,
) {
  await withFixtures(
    {
      fixtures: new FixtureBuilder()
        .withPreferencesController({
          bitcoinSupportEnabled: bitcoinSupportEnabled ?? true,
        })
        .build(),
      title,
      dapp: true,
      testSpecificMock: async (mockServer: Mockttp) => [
        await mockRatesCall(mockServer),
        await mockBtcBalanceQuote(mockServer),
        await mockMempoolInfo(mockServer),
        await mockBtcFeeCallQuote(mockServer),
        await mockGetUTXO(mockServer),
        await mockSendTransaction(mockServer),
        // Sat Protection
        await mockBtcSatProtectionService(mockServer),
      ],
    },
    async ({ driver, mockServer }: { driver: Driver; mockServer: Mockttp }) => {
      await loginWithBalanceValidation(driver);
      // create one BTC account
      await new HeaderNavbar(driver).openAccountMenu();
      const accountListPage = new AccountListPage(driver);
      await accountListPage.check_pageIsLoaded();
      await accountListPage.addAccount({ accountType: ACCOUNT_TYPE.Bitcoin });
      await test(driver, mockServer);
    },
  );
}

export async function getQuickNodeSeenRequests(mockServer: Mockttp) {
  const seenRequests = await Promise.all(
    (
      await mockServer.getMockedEndpoints()
    ).map((mockedEndpoint) => mockedEndpoint.getSeenRequests()),
  );
  return seenRequests
    .flat()
    .filter((request) => request.url.match(QUICKNODE_URL_REGEX));
}

export async function getTransactionRequest(mockServer: Mockttp) {
  // Check that the transaction has been sent.
  const transactionRequest = (await getQuickNodeSeenRequests(mockServer)).find(
    async (request) => {
      const body = (await request.body.getJson()) as { method: string };
      return body.method === 'sendrawtransaction';
    },
  );
  return transactionRequest;
}
