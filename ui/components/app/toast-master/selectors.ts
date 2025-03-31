import { isEvmAccountType } from '@metamask/keyring-api';
import { InternalAccount } from '@metamask/keyring-internal-api';
import { getAlertEnabledness } from '../../../ducks/metamask/metamask';
import { getPermittedAccountsForCurrentTab } from '../../../selectors';
import { MetaMaskReduxState } from '../../../store/store';

// TODO: get this into one of the larger definitions of state type
type State = Omit<MetaMaskReduxState, 'appState'> & {
  appState: {
    showNftDetectionEnablementToast?: boolean;
    ///: BEGIN:ONLY_INCLUDE_IF(multi-srp)
    showNewSrpAddedToast?: boolean;
    ///: END:ONLY_INCLUDE_IF
  };
  metamask: {
    newPrivacyPolicyToastClickedOrClosed?: boolean;
    newPrivacyPolicyToastShownDate?: number;
    onboardingDate?: number;
    showNftDetectionEnablementToast?: boolean;
    switchedNetworkNeverShowMessage?: boolean;
  };
};

/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Determines if the privacy policy toast should be shown based on the current date and whether the new privacy policy toast was clicked or closed.
 *
 * @param state - The application state containing the privacy policy data.
 * @returns Boolean is True if the toast should be shown, and the number is the date the toast was last shown.
 */
export function selectShowPrivacyPolicyToast(state: State): {
  showPrivacyPolicyToast: boolean;
  newPrivacyPolicyToastShownDate?: number;
} {
  return { showPrivacyPolicyToast: false };
  /*
  const {
    newPrivacyPolicyToastClickedOrClosed,
    newPrivacyPolicyToastShownDate,
    onboardingDate,
  } = state.metamask || {};
  const newPrivacyPolicyDate = new Date(PRIVACY_POLICY_DATE);
  const currentDate = new Date(Date.now());

  const showPrivacyPolicyToast =
    !newPrivacyPolicyToastClickedOrClosed &&
    currentDate >= newPrivacyPolicyDate &&
    getIsPrivacyToastRecent(newPrivacyPolicyToastShownDate) &&
    // users who onboarded before the privacy policy date should see the notice
    // and
    // old users who don't have onboardingDate set should see the notice
    (!onboardingDate || onboardingDate < newPrivacyPolicyDate.valueOf());

  return { showPrivacyPolicyToast, newPrivacyPolicyToastShownDate };
  */
}

export function selectNftDetectionEnablementToast(state: State): boolean {
  return Boolean(state.appState?.showNftDetectionEnablementToast);
}

// If there is more than one connected account to activeTabOrigin,
// *BUT* the current account is not one of them, show the banner
export function selectShowConnectAccountToast(
  state: State,
  account: InternalAccount,
): boolean {
  const allowShowAccountSetting = getAlertEnabledness(state).unconnectedAccount;
  const connectedAccounts = getPermittedAccountsForCurrentTab(state);
  const isEvmAccount = isEvmAccountType(account?.type);

  return (
    allowShowAccountSetting &&
    account &&
    state.activeTab?.origin &&
    isEvmAccount &&
    connectedAccounts.length > 0 &&
    !connectedAccounts.some((address) => address === account.address)
  );
}

/**
 * Retrieves user preference to never see the "Switched Network" toast
 *
 * @param state - Redux state object.
 * @returns Boolean preference value
 */
export function selectSwitchedNetworkNeverShowMessage(state: State): boolean {
  return Boolean(state.metamask.switchedNetworkNeverShowMessage);
}

/**
 * Retrieves user preference to see the "New SRP Added" toast
 *
 * @param state - Redux state object.
 * @returns Boolean preference value
 */
///: BEGIN:ONLY_INCLUDE_IF(multi-srp)
export function selectNewSrpAdded(state: State): boolean {
  return Boolean(state.appState.showNewSrpAddedToast);
}
///: END:ONLY_INCLUDE_IF
