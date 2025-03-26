import React from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PrivacySettings from '../privacy-settings/privacy-settings';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/component-library/button';
import {
  TextVariant,
  Display,
  AlignItems,
  JustifyContent,
  FlexDirection,
} from '../../../helpers/constants/design-system';
import {
  Box,
  Text,
  ButtonLink,
  ButtonLinkSize,
} from '../../../components/component-library';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { ONBOARDING_PIN_EXTENSION_ROUTE } from '../../../helpers/constants/routes';
import { FirstTimeFlowType } from '../../../../shared/constants/onboarding';
import { getFirstTimeFlowType } from '../../../selectors';
import { getSeedPhraseBackedUp } from '../../../ducks/metamask/metamask';

export default function CreationSuccessful() {
  const history = useHistory();
  const t = useI18nContext();
  const firstTimeFlowType = useSelector(getFirstTimeFlowType);
  const seedPhraseBackedUp = useSelector(getSeedPhraseBackedUp);
  const learnMoreLink =
    'https://support.metamask.io/hc/en-us/articles/360015489591-Basic-Safety-and-Security-Tips-for-MetaMask';
  const learnHowToKeepWordsSafe =
    'https://community.metamask.io/t/what-is-a-secret-recovery-phrase-and-how-to-keep-your-crypto-wallet-secure/3440';

  return (
    <Box
      className="creation-successful"
      data-testid="creation-successful"
      display={Display.Flex}
      flexDirection={FlexDirection.Column}
    >
      <Box
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        justifyContent={JustifyContent.center}
        marginTop={6}
      >
        <Text
          justifyContent={JustifyContent.center}
          marginBottom={4}
          style={{
            alignSelf: AlignItems.center,
            fontSize: '70px',
          }}
        >
          <span>
            {firstTimeFlowType === FirstTimeFlowType.create &&
            !seedPhraseBackedUp
              ? '🔓'
              : '🎉'}
          </span>
        </Text>
        <Text
          variant={TextVariant.headingLg}
          as="h2"
          margin={6}
          justifyContent={JustifyContent.center}
          style={{
            alignSelf: AlignItems.center,
          }}
        >
          {firstTimeFlowType === FirstTimeFlowType.import &&
            t('yourWalletIsReady')}

          {firstTimeFlowType === FirstTimeFlowType.create &&
            !seedPhraseBackedUp &&
            t('reminderSet')}

          {firstTimeFlowType === FirstTimeFlowType.create &&
            seedPhraseBackedUp &&
            t('congratulations')}
        </Text>
        <Text variant={TextVariant.bodyLgMedium} marginBottom={6}>
          {firstTimeFlowType === FirstTimeFlowType.import &&
            t('rememberSRPIfYouLooseAccess', [
              <ButtonLink
                key="rememberSRPIfYouLooseAccess"
                size={ButtonLinkSize.Inherit}
                textProps={{
                  variant: TextVariant.bodyMd,
                  alignItems: AlignItems.flexStart,
                }}
                as="a"
                href={learnHowToKeepWordsSafe}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('learnHow')}
              </ButtonLink>,
            ])}

          {firstTimeFlowType === FirstTimeFlowType.create &&
            seedPhraseBackedUp &&
            t('walletProtectedAndReadyToUse', [
              <b key="walletProtectedAndReadyToUse">
                {t('securityPrivacyPath')}
              </b>,
            ])}
          {firstTimeFlowType === FirstTimeFlowType.create &&
            !seedPhraseBackedUp &&
            t('ifYouGetLockedOut', [
              <b key="ifYouGetLockedOut">{t('securityPrivacyPath')}</b>,
            ])}
        </Text>
      </Box>

      {firstTimeFlowType === FirstTimeFlowType.create && (
        <Text variant={TextVariant.bodyLgMedium} marginBottom={6}>
          {t('keepReminderOfSRP', [
            <ButtonLink
              key="keepReminderOfSRP"
              size={ButtonLinkSize.Inherit}
              textProps={{
                variant: TextVariant.bodyMd,
                alignItems: AlignItems.flexStart,
              }}
              as="a"
              href={learnMoreLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('learnMoreUpperCaseWithDot')}
            </ButtonLink>,
          ])}
        </Text>
      )}

      <Box
        marginTop={6}
        className="creation-successful__actions"
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        justifyContent={JustifyContent.center}
        alignItems={AlignItems.center}
      >
        <Box
          display={Display.Flex}
          flexDirection={FlexDirection.Column}
          alignItems={AlignItems.flexStart}
        >
          <PrivacySettings />
          <Text variant={TextVariant.bodySm}>
            {t('settingsOptimisedForEaseOfUseAndSecurity')}
          </Text>
        </Box>
        <Button
          data-testid="onboarding-complete-done"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Lg}
          style={{
            width: '184px',
          }}
          marginTop={6}
          onClick={() => {
            history.push(ONBOARDING_PIN_EXTENSION_ROUTE);
          }}
        >
          {t('done')}
        </Button>
      </Box>
    </Box>
  );
}
