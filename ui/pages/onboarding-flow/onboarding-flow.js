import React, { useEffect, useState } from 'react';
import { Switch, Route, useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Unlock from '../unlock-page';
import {
  ///: BEGIN:ONLY_INCLUDE_IF(build-flask)
  ONBOARDING_EXPERIMENTAL_AREA,
  ///: END:ONLY_INCLUDE_IF
  ONBOARDING_CREATE_PASSWORD_ROUTE,
  ONBOARDING_REVIEW_SRP_ROUTE,
  ONBOARDING_CONFIRM_SRP_ROUTE,
  ONBOARDING_UNLOCK_ROUTE,
  ONBOARDING_WELCOME_ROUTE,
  DEFAULT_ROUTE,
  ONBOARDING_SECURE_YOUR_WALLET_ROUTE,
  ONBOARDING_PRIVACY_SETTINGS_ROUTE,
  ONBOARDING_COMPLETION_ROUTE,
  ONBOARDING_IMPORT_WITH_SRP_ROUTE,
} from '../../helpers/constants/routes';
import {
  getCompletedOnboarding,
  getIsUnlocked,
} from '../../ducks/metamask/metamask';
import {
  createNewVaultAndGetSeedPhrase,
  unlockAndGetSeedPhrase,
  createNewVaultAndRestore,
  toggleNetworkMenu,
} from '../../store/actions';
import {
  getFirstTimeFlowTypeRouteAfterUnlock,
  getEditedNetwork,
} from '../../selectors';
import RevealSRPModal from '../../components/app/reveal-SRP-modal';
///: BEGIN:ONLY_INCLUDE_IF(build-flask)
import ExperimentalArea from '../../components/app/flask/experimental-area';
///: END:ONLY_INCLUDE_IF
import OnboardingFlowSwitch from './onboarding-flow-switch/onboarding-flow-switch';
import CreatePassword from './create-password/create-password';
import ReviewRecoveryPhrase from './recovery-phrase/review-recovery-phrase';
import SecureYourWallet from './secure-your-wallet/secure-your-wallet';
import ConfirmRecoveryPhrase from './recovery-phrase/confirm-recovery-phrase';
import PrivacySettings from './privacy-settings/privacy-settings';
import CreationSuccessful from './creation-successful/creation-successful';
import OnboardingWelcome from './welcome/welcome';
import ImportSRP from './import-srp/import-srp';

export default function OnboardingFlow() {
  const [secretRecoveryPhrase, setSecretRecoveryPhrase] = useState('');
  const dispatch = useDispatch();
  const { pathname, search } = useLocation();
  const history = useHistory();
  const completedOnboarding = useSelector(getCompletedOnboarding);
  const nextRoute = useSelector(getFirstTimeFlowTypeRouteAfterUnlock);
  const editedNetwork = useSelector(getEditedNetwork);
  const isFromReminder = new URLSearchParams(search).get('isFromReminder');
  const isUnlocked = useSelector(getIsUnlocked);

  useEffect(() => {
    if (completedOnboarding && !isFromReminder) {
      history.push(DEFAULT_ROUTE);
    }
  }, [history, completedOnboarding, isFromReminder]);

  useEffect(() => {
    if (
      isUnlocked &&
      !completedOnboarding &&
      !editedNetwork &&
      pathname.startsWith(ONBOARDING_SECURE_YOUR_WALLET_ROUTE)
    ) {
      dispatch(
        toggleNetworkMenu({
          isAddingNewNetwork: false,
          isMultiRpcOnboarding: true,
        }),
      );
    }
  }, [
    isUnlocked,
    completedOnboarding,
    editedNetwork,
    pathname,
    toggleNetworkMenu,
    dispatch,
  ]);

  useEffect(() => {
    if (isUnlocked && !completedOnboarding && !secretRecoveryPhrase) {
      const needsSRP = [
        ONBOARDING_REVIEW_SRP_ROUTE,
        ONBOARDING_CONFIRM_SRP_ROUTE,
      ].some((route) => pathname.startsWith(route));

      if (needsSRP) {
        history.push(ONBOARDING_UNLOCK_ROUTE);
      }
    }
  }, [
    isUnlocked,
    completedOnboarding,
    secretRecoveryPhrase,
    pathname,
    history,
  ]);

  const handleCreateNewAccount = async (password) => {
    const newSecretRecoveryPhrase = await dispatch(
      createNewVaultAndGetSeedPhrase(password),
    );
    setSecretRecoveryPhrase(newSecretRecoveryPhrase);
  };

  const handleUnlock = async (password) => {
    const retrievedSecretRecoveryPhrase = await dispatch(
      unlockAndGetSeedPhrase(password),
    );
    setSecretRecoveryPhrase(retrievedSecretRecoveryPhrase);
    history.push(nextRoute);
  };

  const handleImportWithRecoveryPhrase = async (password, srp) => {
    return await dispatch(createNewVaultAndRestore(password, srp));
  };

  const showPasswordModalToAllowSRPReveal =
    pathname === `${ONBOARDING_REVIEW_SRP_ROUTE}/` &&
    completedOnboarding &&
    !secretRecoveryPhrase &&
    isFromReminder;

  return (
    <div className="onboarding-flow">
      <RevealSRPModal
        setSecretRecoveryPhrase={setSecretRecoveryPhrase}
        onClose={() => history.push(DEFAULT_ROUTE)}
        isOpen={showPasswordModalToAllowSRPReveal}
      />
      <div className="onboarding-flow__wrapper">
        <Switch>
          <Route
            path={ONBOARDING_CREATE_PASSWORD_ROUTE}
            render={(routeProps) => (
              <CreatePassword
                {...routeProps}
                createNewAccount={handleCreateNewAccount}
                importWithRecoveryPhrase={handleImportWithRecoveryPhrase}
                secretRecoveryPhrase={secretRecoveryPhrase}
              />
            )}
          />
          <Route
            path={ONBOARDING_SECURE_YOUR_WALLET_ROUTE}
            component={SecureYourWallet}
          />
          <Route
            path={ONBOARDING_REVIEW_SRP_ROUTE}
            render={() => (
              <ReviewRecoveryPhrase
                secretRecoveryPhrase={secretRecoveryPhrase}
              />
            )}
          />
          <Route
            path={ONBOARDING_CONFIRM_SRP_ROUTE}
            render={() => (
              <ConfirmRecoveryPhrase
                secretRecoveryPhrase={secretRecoveryPhrase}
              />
            )}
          />
          <Route
            path={ONBOARDING_IMPORT_WITH_SRP_ROUTE}
            render={(routeProps) => (
              <ImportSRP
                {...routeProps}
                submitSecretRecoveryPhrase={setSecretRecoveryPhrase}
              />
            )}
          />
          <Route
            path={ONBOARDING_UNLOCK_ROUTE}
            render={(routeProps) => (
              <Unlock {...routeProps} onSubmit={handleUnlock} />
            )}
          />
          <Route
            path={ONBOARDING_PRIVACY_SETTINGS_ROUTE}
            component={PrivacySettings}
          />
          <Route
            path={ONBOARDING_COMPLETION_ROUTE}
            component={CreationSuccessful}
          />
          <Route
            path={ONBOARDING_WELCOME_ROUTE}
            component={OnboardingWelcome}
          />
          {
            ///: BEGIN:ONLY_INCLUDE_IF(build-flask)
          }
          <Route
            path={ONBOARDING_EXPERIMENTAL_AREA}
            render={(routeProps) => (
              <ExperimentalArea
                {...routeProps}
                redirectTo={ONBOARDING_WELCOME_ROUTE}
              />
            )}
          />
          {
            ///: END:ONLY_INCLUDE_IF
          }
          <Route exact path="*" component={OnboardingFlowSwitch} />
        </Switch>
      </div>
    </div>
  );
}
