import { SnapKeyring, SnapKeyringCallbacks } from '@metamask/eth-snap-keyring';
import browser from 'webextension-polyfill';
import { SnapId } from '@metamask/snaps-sdk';
import { assertIsValidSnapId } from '@metamask/snaps-utils';
import { SNAP_MANAGE_ACCOUNTS_CONFIRMATION_TYPES } from '../../../../shared/constants/app';
import { t } from '../../translate';
import MetamaskController from '../../metamask-controller';
// TODO: Remove restricted import
// eslint-disable-next-line import/no-restricted-paths
import { IconName } from '../../../../ui/components/component-library/icon';
import { getUniqueAccountName } from '../../../../shared/lib/accounts';
import { isBlockedUrl } from './utils/isBlockedUrl';
import { showError, showSuccess } from './utils/showResult';
import { SnapKeyringBuilderMessenger } from './types';
import { getSnapName, isSnapPreinstalled } from './snaps';

/**
 * Builder type for the Snap keyring.
 */
export type SnapKeyringBuilder = {
  (): SnapKeyring;
  type: typeof SnapKeyring.type;
};

/**
 * Helpers for the Snap keyring implementation.
 */
export type SnapKeyringHelpers = {
  persistKeyringHelper: () => Promise<void>;
  removeAccountHelper: (address: string) => Promise<void>;
};

/**
 * Get the addresses of the accounts managed by a given Snap.
 *
 * @param controller - Instance of the MetaMask Controller.
 * @param snapId - Snap ID to get accounts for.
 * @returns The addresses of the accounts.
 */
export const getAccountsBySnapId = async (
  controller: MetamaskController,
  snapId: SnapId,
) => {
  const snapKeyring: SnapKeyring = await controller.getSnapKeyring();
  return await snapKeyring.getAccountsBySnapId(snapId);
};

/**
 * Show the account creation dialog for a given Snap.
 * This function will start the approval flow, show the account creation dialog, and end the flow.
 *
 * @param snapId - Snap ID to show the account creation dialog for.
 * @param messenger - The controller messenger instance.
 * @returns The user's confirmation result.
 */
export async function showAccountCreationDialog(
  snapId: string,
  messenger: SnapKeyringBuilderMessenger,
) {
  try {
    const confirmationResult = Boolean(
      await messenger.call(
        'ApprovalController:addRequest',
        {
          origin: snapId,
          type: SNAP_MANAGE_ACCOUNTS_CONFIRMATION_TYPES.confirmAccountCreation,
        },
        true,
      ),
    );
    return confirmationResult;
  } catch (e) {
    throw new Error(
      `Error occurred while showing account creation dialog.\n${e}`,
    );
  }
}

/**
 * Show the account name suggestion confirmation dialog for a given Snap.
 *
 * @param snapId - Snap ID to show the account name suggestion dialog for.
 * @param messenger - The controller messenger instance.
 * @param accountNameSuggestion - Suggested name for the new account.
 * @returns The user's confirmation result.
 */
export async function showAccountNameSuggestionDialog(
  snapId: string,
  messenger: SnapKeyringBuilderMessenger,
  accountNameSuggestion: string,
): Promise<{ success: boolean; name?: string }> {
  try {
    const confirmationResult = (await messenger.call(
      'ApprovalController:addRequest',
      {
        origin: snapId,
        type: SNAP_MANAGE_ACCOUNTS_CONFIRMATION_TYPES.showNameSnapAccount,
        requestData: {
          snapSuggestedAccountName: accountNameSuggestion,
        },
      },
      true,
    )) as { success: boolean; name?: string };
    return confirmationResult;
  } catch (e) {
    throw new Error(`Error occurred while showing name account dialog.\n${e}`);
  }
}

class SnapKeyringImpl implements SnapKeyringCallbacks {
  readonly #messenger: SnapKeyringBuilderMessenger;

  readonly #persistKeyringHelper: SnapKeyringHelpers['persistKeyringHelper'];

  readonly #removeAccountHelper: SnapKeyringHelpers['removeAccountHelper'];

  constructor(
    messenger: SnapKeyringBuilderMessenger,
    { persistKeyringHelper, removeAccountHelper }: SnapKeyringHelpers,
  ) {
    this.#messenger = messenger;
    this.#persistKeyringHelper = persistKeyringHelper;
    this.#removeAccountHelper = removeAccountHelper;
  }

  async addressExists(address: string) {
    const addresses = await this.#messenger.call(
      'KeyringController:getAccounts',
    );
    return addresses.includes(address.toLowerCase());
  }

  async redirectUser(snapId: string, url: string, message: string) {
    // Either url or message must be defined
    if (url.length > 0 || message.length > 0) {
      const isBlocked = await isBlockedUrl(
        url,
        async () => {
          return await this.#messenger.call(
            'PhishingController:maybeUpdateState',
          );
        },
        (urlToTest: string) => {
          return this.#messenger.call(
            'PhishingController:testOrigin',
            urlToTest,
          );
        },
      );

      const confirmationResult = await this.#messenger.call(
        'ApprovalController:addRequest',
        {
          origin: snapId,
          requestData: { url, message, isBlockedUrl: isBlocked },
          type: SNAP_MANAGE_ACCOUNTS_CONFIRMATION_TYPES.showSnapAccountRedirect,
        },
        true,
      );

      if (Boolean(confirmationResult) && url.length > 0) {
        browser.tabs.create({ url });
      } else {
        console.log('User refused snap account redirection to:', url);
      }
    } else {
      console.log(
        'Error occurred when redirecting snap account. url or message must be defined',
      );
    }
  }

  async saveState() {
    await this.#persistKeyringHelper();
  }

  async #withApprovalFlow<Return>(
    run: (flowId: string) => Promise<Return>,
  ): Promise<Return> {
    const { id: flowId } = this.#messenger.call('ApprovalController:startFlow');

    try {
      return await run(flowId);
    } finally {
      this.#messenger.call('ApprovalController:endFlow', {
        id: flowId,
      });
    }
  }

  /**
   * Get the account name from the user through a dialog.
   *
   * @param snapId - ID of the Snap that created the account.
   * @param accountNameSuggestion - Suggested name for the account.
   * @returns The name that should be used for the account.
   */
  async #getAccountNameFromDialog(
    snapId: SnapId,
    accountNameSuggestion: string,
  ): Promise<{ success: boolean; accountName?: string }> {
    const { success, name: accountName } =
      await showAccountNameSuggestionDialog(
        snapId,
        this.#messenger,
        accountNameSuggestion,
      );

    return { success, accountName };
  }

  /**
   * Use the account name suggestion to decide the name of the account.
   *
   * @param accountNameSuggestion - Suggested name for the account.
   * @returns The name that should be used for the account.
   */
  async #getAccountNameFromSuggestion(
    accountNameSuggestion: string,
  ): Promise<{ success: boolean; accountName?: string }> {
    const accounts = await this.#messenger.call(
      'AccountsController:listMultichainAccounts',
    );
    const accountName = getUniqueAccountName(accounts, accountNameSuggestion);
    return { success: true, accountName };
  }

  async #addAccountConfirmations({
    snapId,
    skipConfirmationDialog,
    skipAccountNameSuggestionDialog,
    handleUserInput,
    accountNameSuggestion,
  }: {
    snapId: SnapId;
    skipConfirmationDialog: boolean;
    skipAccountNameSuggestionDialog: boolean;
    accountNameSuggestion: string;
    handleUserInput: (accepted: boolean) => Promise<void>;
  }): Promise<{ accountName?: string }> {
    return await this.#withApprovalFlow(async (_) => {
      // 1. Show the account CREATION confirmation dialog.
      {
        // If confirmation dialog are skipped, we consider the account creation to be confirmed until the account name dialog is closed
        const success =
          skipConfirmationDialog ||
          (await showAccountCreationDialog(snapId, this.#messenger));

        if (!success) {
          // User has cancelled account creation
          await handleUserInput(success);

          throw new Error('User denied account creation');
        }
      }

      // 2. Show the account RENAMING confirmation dialog. Note that
      //    pre-installed Snaps can skip this dialog.
      {
        const { success, accountName } = skipAccountNameSuggestionDialog
          ? await this.#getAccountNameFromSuggestion(accountNameSuggestion)
          : await this.#getAccountNameFromDialog(snapId, accountNameSuggestion);

        await handleUserInput(success);

        if (!success) {
          throw new Error('User denied account creation');
        }

        return { accountName };
      }
    });
  }

  async #addAccountFinalize({
    address,
    snapId,
    skipConfirmationDialog,
    accountName,
    onceSaved,
  }: {
    address: string;
    snapId: SnapId;
    skipConfirmationDialog: boolean;
    onceSaved: Promise<string>;
    accountName?: string;
  }) {
    const learnMoreLink =
      'https://support.metamask.io/managing-my-wallet/accounts-and-addresses/how-to-add-accounts-in-your-wallet/';

    const snapName = getSnapName(snapId, this.#messenger);

    await this.#withApprovalFlow(async (_) => {
      try {
        // First, wait for the account to be fully saved.
        // NOTE: This might throw, so keep this in the `try` clause.
        const accountId = await onceSaved;

        // From here, we know the account has been saved into the Snap keyring
        // state, so we can safely uses this state to run post-processing.
        // (e.g. renaming the account, select the account, etc...)

        // Set the selected account to the new account
        this.#messenger.call(
          'AccountsController:setSelectedAccount',
          accountId,
        );

        if (accountName) {
          this.#messenger.call(
            'AccountsController:setAccountName',
            accountId,
            accountName,
          );
        }

        if (!skipConfirmationDialog) {
          await showSuccess(
            this.#messenger,
            snapId,
            {
              icon: IconName.UserCircleAdd,
              title: t('snapAccountCreated'),
            },
            {
              message: t('snapAccountCreatedDescription') as string,
              address,
              learnMoreLink,
            },
          );
        }
      } catch (e) {
        // Error occurred while naming the account
        const error = (e as Error).message;

        await showError(
          this.#messenger,
          snapId,
          {
            icon: IconName.UserCircleAdd,
            title: t('snapAccountCreationFailed'),
          },
          {
            message: t(
              'snapAccountCreationFailedDescription',
              snapName,
            ) as string,
            learnMoreLink,
            error,
          },
        );

        // This part of the flow is not awaited, so we just log the error for now:
        console.error('Error occurred while creating snap account:', error);
      }
    });
  }

  async addAccount(
    address: string,
    snapId: string,
    handleUserInput: (accepted: boolean) => Promise<void>,
    onceSaved: Promise<string>,
    accountNameSuggestion: string = '',
    displayConfirmation: boolean = false,
    displayAccountNameSuggestion: boolean = true,
  ) {
    assertIsValidSnapId(snapId);

    // If Snap is preinstalled and does not request confirmation, skip the confirmation dialog.
    const skipConfirmationDialog =
      isSnapPreinstalled(snapId) && !displayConfirmation;

    // Only pre-installed Snaps can skip the account name suggestion dialog.
    const skipAccountNameSuggestionDialog =
      isSnapPreinstalled(snapId) && !displayAccountNameSuggestion;

    // First part of the flow, which includes confirmation dialogs (if not skipped).
    // Once confirmed, we resume the Snap execution.
    const { accountName } = await this.#addAccountConfirmations({
      snapId,
      skipConfirmationDialog,
      skipAccountNameSuggestionDialog,
      accountNameSuggestion,
      handleUserInput,
    });

    // The second part is about selecting the newly created account and showing some other
    // confirmation dialogs (or error dialogs if anything goes wrong while persisting the account
    // into the state.
    // eslint-disable-next-line no-void
    void this.#addAccountFinalize({
      address,
      snapId,
      skipConfirmationDialog,
      accountName,
      onceSaved,
    });
  }

  async removeAccount(
    address: string,
    snapId: string,
    handleUserInput: (accepted: boolean) => Promise<void>,
  ) {
    assertIsValidSnapId(snapId);

    const snapName = getSnapName(snapId, this.#messenger);
    const { id: removeAccountApprovalId } = this.#messenger.call(
      'ApprovalController:startFlow',
    );

    const learnMoreLink =
      'https://support.metamask.io/managing-my-wallet/accounts-and-addresses/how-to-remove-an-account-from-your-metamask-wallet/';

    // Since we use this in the finally, better to give it a default value if the controller call fails
    let confirmationResult = false;
    try {
      confirmationResult = Boolean(
        await this.#messenger.call(
          'ApprovalController:addRequest',
          {
            origin: snapId,
            type: SNAP_MANAGE_ACCOUNTS_CONFIRMATION_TYPES.confirmAccountRemoval,
            requestData: { publicAddress: address },
          },
          true,
        ),
      );

      if (confirmationResult) {
        try {
          await this.#removeAccountHelper(address);
          await handleUserInput(confirmationResult);
          await this.#persistKeyringHelper();

          // TODO: Add events tracking to the dialog itself, so that events are more
          // "linked" to UI actions
          // User should now see the "Successfuly removed account" page
          // This isn't actually an error, but we show it as one for styling reasons
          await showError(
            this.#messenger,
            snapId,
            {
              icon: IconName.UserCircleRemove,
              title: t('snapAccountRemoved'),
            },
            {
              message: t('snapAccountRemovedDescription') as string,
              learnMoreLink,
            },
          );
        } catch (e) {
          const error = (e as Error).message;

          await showError(
            this.#messenger,
            snapId,
            {
              icon: IconName.UserCircleRemove,
              title: t('snapAccountRemovalFailed'),
            },
            {
              message: t(
                'snapAccountRemovalFailedDescription',
                snapName,
              ) as string,
              learnMoreLink,
              error,
            },
          );

          throw new Error(
            `Error occurred while removing snap account: ${error}`,
          );
        }
      } else {
        await handleUserInput(confirmationResult);

        throw new Error('User denied account removal');
      }
    } finally {
      this.#messenger.call('ApprovalController:endFlow', {
        id: removeAccountApprovalId,
      });
    }
  }
}

/**
 * Constructs a SnapKeyring builder with specified handlers for managing Snap accounts.
 *
 * @param messenger - The messenger instace.
 * @param helpers - Helpers required by the Snap keyring implementation.
 * @returns A Snap keyring builder.
 */
export function snapKeyringBuilder(
  messenger: SnapKeyringBuilderMessenger,
  helpers: SnapKeyringHelpers,
) {
  const builder = (() => {
    // @ts-expect-error TODO: Resolve mismatch between base-controller versions.
    return new SnapKeyring(messenger, new SnapKeyringImpl(messenger, helpers));
  }) as SnapKeyringBuilder;
  builder.type = SnapKeyring.type;

  return builder;
}
