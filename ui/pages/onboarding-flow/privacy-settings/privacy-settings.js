import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import classnames from 'classnames';
import { ButtonVariant } from '@metamask/snaps-sdk';
// TODO: Remove restricted import
// eslint-disable-next-line import/no-restricted-paths
import { addUrlProtocolPrefix } from '../../../../app/scripts/lib/util';

import {
  COINGECKO_LINK,
  CRYPTOCOMPARE_LINK,
  PRIVACY_POLICY_LINK,
  TRANSACTION_SIMULATIONS_LEARN_MORE_LINK,
} from '../../../../shared/lib/ui-utils';
import Button from '../../../components/ui/button';

import {
  Box,
  Text,
  TextField,
  IconName,
  ButtonLink,
  AvatarNetwork,
  ButtonIcon,
  IconSize,
  Icon,
} from '../../../components/component-library';
import {
  Display,
  TextAlign,
  TextColor,
  TextVariant,
  IconColor,
  AlignItems,
  JustifyContent,
  FlexDirection,
  BlockSize,
} from '../../../helpers/constants/design-system';
import { ONBOARDING_COMPLETION_ROUTE } from '../../../helpers/constants/routes';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { getPetnamesEnabled } from '../../../selectors';
import { getNetworkConfigurationsByChainId } from '../../../../shared/modules/selectors/networks';
import {
  setIpfsGateway,
  setUseCurrencyRateCheck,
  setUseMultiAccountBalanceChecker,
  setUse4ByteResolution,
  setUseTokenDetection,
  setUseAddressBarEnsResolution,
  toggleNetworkMenu,
  setIncomingTransactionsPreferences,
  setUseTransactionSimulations,
  setPetnamesEnabled,
  setEditedNetwork,
} from '../../../store/actions';
import IncomingTransactionToggle from '../../../components/app/incoming-trasaction-toggle/incoming-transaction-toggle';
import { CHAIN_ID_TO_NETWORK_IMAGE_URL_MAP } from '../../../../shared/constants/network';
import { Setting } from './setting';

const ANIMATION_TIME = 500;

export default function PrivacySettings() {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const history = useHistory();

  const [showDetail, setShowDetail] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [hiddenClass, setHiddenClass] = useState(true);

  const defaultState = useSelector((state) => state.metamask);
  const {
    incomingTransactionsPreferences,
    use4ByteResolution,
    useTokenDetection,
    useCurrencyRateCheck,
    useMultiAccountBalanceChecker,
    ipfsGateway,
    useAddressBarEnsResolution,
    useTransactionSimulations,
  } = defaultState;
  const petnamesEnabled = useSelector(getPetnamesEnabled);

  const [turnOn4ByteResolution, setTurnOn4ByteResolution] =
    useState(use4ByteResolution);
  const [turnOnTokenDetection, setTurnOnTokenDetection] =
    useState(useTokenDetection);
  const [turnOnCurrencyRateCheck, setTurnOnCurrencyRateCheck] =
    useState(useCurrencyRateCheck);

  const [
    isMultiAccountBalanceCheckerEnabled,
    setMultiAccountBalanceCheckerEnabled,
  ] = useState(useMultiAccountBalanceChecker);
  const [isTransactionSimulationsEnabled, setTransactionSimulationsEnabled] =
    useState(useTransactionSimulations);
  const [ipfsURL, setIPFSURL] = useState(ipfsGateway);
  const [ipfsError, setIPFSError] = useState(null);
  const [addressBarResolution, setAddressBarResolution] = useState(
    useAddressBarEnsResolution,
  );
  const [turnOnPetnames, setTurnOnPetnames] = useState(petnamesEnabled);

  const networkConfigurations = useSelector(getNetworkConfigurationsByChainId);

  const handleSubmit = () => {
    dispatch(setUse4ByteResolution(turnOn4ByteResolution));
    dispatch(setUseTokenDetection(turnOnTokenDetection));
    dispatch(
      setUseMultiAccountBalanceChecker(isMultiAccountBalanceCheckerEnabled),
    );
    dispatch(setUseCurrencyRateCheck(turnOnCurrencyRateCheck));
    dispatch(setUseAddressBarEnsResolution(addressBarResolution));
    setUseTransactionSimulations(isTransactionSimulationsEnabled);
    dispatch(setPetnamesEnabled(turnOnPetnames));

    if (ipfsURL && !ipfsError) {
      const { host } = new URL(addUrlProtocolPrefix(ipfsURL));
      dispatch(setIpfsGateway(host));
    }

    history.push(ONBOARDING_COMPLETION_ROUTE);
  };

  const handleIPFSChange = (url) => {
    setIPFSURL(url);
    try {
      const { host } = new URL(addUrlProtocolPrefix(url));
      if (!host || host === 'gateway.ipfs.io') {
        throw new Error();
      }
      setIPFSError(null);
    } catch (error) {
      setIPFSError(t('onboardingAdvancedPrivacyIPFSInvalid'));
    }
  };

  const handleItemSelected = (item) => {
    setSelectedItem(item);
    setShowDetail(true);

    setTimeout(() => {
      setHiddenClass(false);
    }, ANIMATION_TIME);
  };

  const handleBack = () => {
    setShowDetail(false);
    setTimeout(() => {
      setHiddenClass(true);
    }, ANIMATION_TIME);
  };

  const items = [
    { id: 1, title: t('networkProvider'), subtitle: '' },
    { id: 2, title: t('options'), subtitle: '' },
    { id: 3, title: t('security'), subtitle: '' },
  ];

  return (
    <>
      <div className="privacy-settings" data-testid="privacy-settings">
        <div
          className={classnames('container', {
            'show-detail': showDetail,
            'show-list': !showDetail,
          })}
        >
          <div className="list-view">
            <Box
              className="privacy-settings__header"
              marginTop={6}
              marginBottom={6}
              display={Display.Flex}
              flexDirection={FlexDirection.Column}
              justifyContent={JustifyContent.flexStart}
            >
              <Box
                display={Display.Flex}
                alignItems={AlignItems.center}
                flexDirection={FlexDirection.Row}
                justifyContent={JustifyContent.flexStart}
              >
                <Button
                  type="inline"
                  icon={
                    <Icon
                      name={IconName.ArrowLeft}
                      size={IconSize.Lg}
                      color={IconColor.iconDefault}
                    />
                  }
                  data-testid="privacy-settings-back-button"
                  onClick={handleSubmit}
                />
                <Box
                  display={Display.Flex}
                  alignItems={AlignItems.center}
                  justifyContent={JustifyContent.center}
                  width={BlockSize.Full}
                >
                  <Text variant={TextVariant.headingLg} as="h2">
                    {t('defaultSettingsTitle')}
                  </Text>
                </Box>
              </Box>
              <Text variant={TextVariant.bodyLgMedium} marginTop={5}>
                {t('defaultSettingsSubTitle')}
              </Text>
              <a
                href="https://support.metamask.io/privacy-and-security/privacy-best-practices"
                target="_blank"
                rel="noreferrer"
                key="learnMoreAboutPrivacy"
                style={{
                  fontSize: 'var(--font-size-5)',
                }}
              >
                {t('learnMoreAboutPrivacy')}
              </a>
            </Box>
            <Box>
              <Box
                as="ul"
                marginTop={4}
                marginBottom={4}
                style={{ listStyleType: 'none' }}
                className="privacy-settings__categories-list"
              >
                {items.map((item) => (
                  <Box
                    marginTop={5}
                    marginBottom={5}
                    key={item.id}
                    className="categories-item"
                    onClick={() => handleItemSelected(item)}
                  >
                    <Box
                      display={Display.Flex}
                      alignItems={AlignItems.flexStart}
                      justifyContent={JustifyContent.spaceBetween}
                      data-testid={`category-item-${item.title}`}
                    >
                      <Text variant={TextVariant.bodyLgMedium}>
                        {item.title}
                      </Text>
                      <Button
                        type="inline"
                        icon={
                          <Icon
                            name={IconName.ArrowRight}
                            color={IconColor.iconDefault}
                          />
                        }
                        onClick={() => handleItemSelected(item)}
                      />
                    </Box>
                    <Text
                      className="description"
                      variant={TextVariant.bodyMd}
                      color={TextColor.textAlternative}
                    >
                      {item.subtitle}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          </div>

          <div
            className={classnames('detail-view', {
              hidden: !showDetail && hiddenClass,
            })}
          >
            <Box
              className="privacy-settings__header"
              marginTop={6}
              marginBottom={5}
              display={Display.Flex}
              flexDirection={FlexDirection.Row}
              justifyContent={JustifyContent.flexStart}
            >
              <Button
                data-testid="category-back-button"
                type="inline"
                icon={
                  <Icon
                    name={IconName.ArrowLeft}
                    size={IconSize.Lg}
                    color={IconColor.iconDefault}
                  />
                }
                onClick={handleBack}
              />
              <Box
                display={Display.Flex}
                alignItems={AlignItems.center}
                justifyContent={JustifyContent.center}
                width={BlockSize.Full}
              >
                <Text variant={TextVariant.headingLg} as="h2">
                  {selectedItem?.title}
                </Text>
              </Box>
            </Box>

            <div
              className="privacy-settings__settings"
              data-testid="privacy-settings-settings"
            >
              {selectedItem?.id === 1 ? (
                <>
                  <Setting
                    title={t('onboardingAdvancedPrivacyNetworkTitle')}
                    showToggle={false}
                    description={
                      <>
                        <Box paddingTop={4}>
                          <Box
                            display={Display.Flex}
                            flexDirection={FlexDirection.Column}
                            gap={5}
                          >
                            {Object.values(networkConfigurations)
                              /*
                              .filter(
                                ({ chainId }) => !TEST_CHAINS.includes(chainId),
                              )
                              */
                              .map((network) => (
                                <Box
                                  key={network.chainId}
                                  className="privacy-settings__customizable-network"
                                  onClick={() => {
                                    dispatch(
                                      setEditedNetwork({
                                        chainId: network.chainId,
                                      }),
                                    );
                                    dispatch(toggleNetworkMenu());
                                  }}
                                  display={Display.Flex}
                                  alignItems={AlignItems.center}
                                  justifyContent={JustifyContent.spaceBetween}
                                >
                                  <Box
                                    display={Display.Flex}
                                    alignItems={AlignItems.center}
                                  >
                                    <AvatarNetwork
                                      src={
                                        CHAIN_ID_TO_NETWORK_IMAGE_URL_MAP[
                                          network.chainId
                                        ]
                                      }
                                    />
                                    <Box
                                      textAlign={TextAlign.Left}
                                      marginLeft={3}
                                    >
                                      <Text variant={TextVariant.bodySmMedium}>
                                        {network.name}
                                      </Text>
                                      <Text
                                        variant={TextVariant.bodyXs}
                                        color={TextColor.textAlternative}
                                      >
                                        {
                                          // Get just the protocol + domain, not the infura key in path
                                          new URL(
                                            network?.rpcEndpoints[
                                              network?.defaultRpcEndpointIndex
                                            ]?.url,
                                          )?.origin
                                        }
                                      </Text>
                                    </Box>
                                  </Box>
                                  <ButtonIcon
                                    iconName={IconName.ArrowRight}
                                    size={IconSize.Md}
                                  />
                                </Box>
                              ))}
                            <ButtonLink
                              onClick={() => {
                                dispatch(
                                  toggleNetworkMenu({
                                    isAddingNewNetwork: true,
                                  }),
                                );
                              }}
                              justifyContent={JustifyContent.Left}
                              variant={ButtonVariant.link}
                            >
                              <Box
                                display={Display.Flex}
                                alignItems={AlignItems.center}
                              >
                                <Icon name={IconName.Add} marginRight={3} />
                                <Text color={TextColor.primaryDefault}>
                                  {t('addANetwork')}
                                </Text>
                              </Box>
                            </ButtonLink>
                          </Box>
                        </Box>
                      </>
                    }
                  />
                </>
              ) : null}
              {selectedItem?.id === 2 ? (
                <>
                  <Setting
                    value={turnOnTokenDetection}
                    setValue={setTurnOnTokenDetection}
                    title={t('turnOnTokenDetection')}
                    description={t('useTokenDetectionPrivacyDesc')}
                  />
                  <Setting
                    value={isTransactionSimulationsEnabled}
                    setValue={setTransactionSimulationsEnabled}
                    title={t('simulationsSettingSubHeader')}
                    description={t('simulationsSettingDescription', [
                      <a
                        key="learn_more_link"
                        href={TRANSACTION_SIMULATIONS_LEARN_MORE_LINK}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {t('learnMoreUpperCase')}
                      </a>,
                    ])}
                  />
                  <Setting
                    title={t('onboardingAdvancedPrivacyIPFSTitle')}
                    showToggle={false}
                    description={
                      <>
                        {t('onboardingAdvancedPrivacyIPFSDescription')}
                        <Box paddingTop={2}>
                          <TextField
                            value={ipfsURL}
                            style={{ width: '100%' }}
                            inputProps={{ 'data-testid': 'ipfs-input' }}
                            onChange={(e) => {
                              handleIPFSChange(e.target.value);
                            }}
                          />
                          {ipfsURL ? (
                            <Text
                              variant={TextVariant.bodySm}
                              color={
                                ipfsError
                                  ? TextColor.errorDefault
                                  : TextColor.successDefault
                              }
                            >
                              {ipfsError ||
                                t('onboardingAdvancedPrivacyIPFSValid')}
                            </Text>
                          ) : null}
                        </Box>
                      </>
                    }
                  />
                  <IncomingTransactionToggle
                    networkConfigurations={networkConfigurations}
                    setIncomingTransactionsPreferences={(chainId, value) =>
                      dispatch(
                        setIncomingTransactionsPreferences(chainId, value),
                      )
                    }
                    incomingTransactionsPreferences={
                      incomingTransactionsPreferences
                    }
                  />
                  <Setting
                    value={turnOnCurrencyRateCheck}
                    setValue={setTurnOnCurrencyRateCheck}
                    title={t('currencyRateCheckToggle')}
                    dataTestId="currency-rate-check-toggle"
                    description={t('currencyRateCheckToggleDescription', [
                      <a
                        key="coingecko_link"
                        href={COINGECKO_LINK}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {t('coingecko')}
                      </a>,
                      <a
                        key="cryptocompare_link"
                        href={CRYPTOCOMPARE_LINK}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {t('cryptoCompare')}
                      </a>,
                      <a
                        key="privacy_policy_link"
                        href={PRIVACY_POLICY_LINK}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {t('privacyMsg')}
                      </a>,
                    ])}
                  />
                  <Setting
                    value={addressBarResolution}
                    setValue={setAddressBarResolution}
                    title={t('ensDomainsSettingTitle')}
                    description={
                      <>
                        <Text variant={TextVariant.inherit}>
                          {t('ensDomainsSettingDescriptionIntroduction')}
                        </Text>
                        <Box
                          as="ul"
                          marginTop={4}
                          marginBottom={4}
                          paddingInlineStart={4}
                          style={{ listStyleType: 'circle' }}
                        >
                          <Text variant={TextVariant.inherit} as="li">
                            {t('ensDomainsSettingDescriptionPart1')}
                          </Text>
                          <Text variant={TextVariant.inherit} as="li">
                            {t('ensDomainsSettingDescriptionPart2')}
                          </Text>
                        </Box>
                        <Text variant={TextVariant.inherit}>
                          {t('ensDomainsSettingDescriptionOutroduction')}
                        </Text>
                      </>
                    }
                  />
                  <Setting
                    value={isMultiAccountBalanceCheckerEnabled}
                    setValue={setMultiAccountBalanceCheckerEnabled}
                    title={t('useMultiAccountBalanceChecker')}
                    description={t(
                      'useMultiAccountBalanceCheckerSettingDescription',
                    )}
                  />
                </>
              ) : null}
              {selectedItem?.id === 3 ? (
                <>
                  <Setting
                    value={turnOn4ByteResolution}
                    setValue={setTurnOn4ByteResolution}
                    title={t('use4ByteResolution')}
                    description={t('toggleDecodeDescription')}
                  />
                  <Setting
                    value={turnOnPetnames}
                    setValue={setTurnOnPetnames}
                    title={t('petnamesEnabledToggle')}
                    description={t('petnamesEnabledToggleDescription')}
                  />
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
