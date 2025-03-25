import { strict as assert } from 'assert';
import {
  withFixtures,
  logInWithBalanceValidation,
  unlockWallet,
} from '../../helpers';
import { Driver } from '../../webdriver/driver';

import FixtureBuilder from '../../fixture-builder';

describe('Settings: Show native token as main balance', function () {
  it('Should show balance in crypto when toggle is on', async function () {
    await withFixtures(
      {
        fixtures: new FixtureBuilder().withConversionRateDisabled().build(),
        title: this.test?.fullTitle(),
      },
      async ({
        driver,
        ganacheServer,
      }: {
        driver: Driver;
        ganacheServer: unknown;
      }) => {
        await logInWithBalanceValidation(driver, ganacheServer);

        await driver.clickElement(
          '[data-testid="account-overview__asset-tab"]',
        );
        const tokenValue = '25 ETH';
        const tokenListAmount = await driver.findElement(
          '[data-testid="multichain-token-list-item-value"]',
        );
        await driver.waitForNonEmptyElement(tokenListAmount);
        assert.equal(await tokenListAmount.getText(), tokenValue);
      },
    );
  });

  it('Should show balance in fiat when toggle is OFF', async function () {
    await withFixtures(
      {
        fixtures: new FixtureBuilder()
          .withConversionRateEnabled()
          .withPreferencesControllerShowNativeTokenAsMainBalanceDisabled()
          .build(),
        title: this.test?.fullTitle(),
      },
      async ({ driver }: { driver: Driver }) => {
        await unlockWallet(driver);

        await driver.clickElement(
          '[data-testid="account-options-menu-button"]',
        );
        await driver.clickElement({ text: 'Settings', tag: 'div' });

        await driver.clickElement({
          text: 'Advanced',
          tag: 'div',
        });
        await driver.clickElement('.show-fiat-on-testnets-toggle');

        await driver.delay(1000);

        await driver.clickElement(
          '.settings-page__header__title-container__close-button',
        );
        // close popover
        await driver.clickElement('[data-testid="popover-close"]');

        await driver.clickElement(
          '[data-testid="account-overview__asset-tab"]',
        );

        const tokenListAmount = await driver.findElement(
          '.eth-overview__primary-container',
        );
        assert.equal(await tokenListAmount.getText(), '$42,500.00\nUSD');
      },
    );
  });

  it('Should not show popover twice', async function () {
    await withFixtures(
      {
        fixtures: new FixtureBuilder()
          .withConversionRateEnabled()
          .withPreferencesControllerShowNativeTokenAsMainBalanceDisabled()
          .build(),
        title: this.test?.fullTitle(),
      },
      async ({ driver }: { driver: Driver }) => {
        await unlockWallet(driver);

        await driver.clickElement(
          '[data-testid="account-options-menu-button"]',
        );
        await driver.clickElement({ text: 'Settings', tag: 'div' });

        await driver.clickElement({
          text: 'Advanced',
          tag: 'div',
        });
        await driver.clickElement('.show-fiat-on-testnets-toggle');

        await driver.delay(1000);

        await driver.clickElement(
          '.settings-page__header__title-container__close-button',
        );
        // close popover for the first time
        await driver.clickElement('[data-testid="popover-close"]');
        // go to setting and back to home page and make sure popover is not shown again
        await driver.clickElement(
          '[data-testid="account-options-menu-button"]',
        );
        await driver.clickElement({ text: 'Settings', tag: 'div' });
        // close setting
        await driver.clickElement(
          '.settings-page__header__title-container__close-button',
        );
        // assert popover does not exist
        await driver.assertElementNotPresent('[data-testid="popover-close"]');
      },
    );
  });
});
