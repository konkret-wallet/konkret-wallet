/* eslint-disable no-unused-vars */
import { startCase } from 'lodash';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import {
  addUrlProtocolPrefix,
  getEnvironmentType,
  // TODO: Remove restricted import
  // eslint-disable-next-line import/no-restricted-paths
} from '../../../../app/scripts/lib/util';
import { ENVIRONMENT_TYPE_POPUP } from '../../../../shared/constants/app';
import { IPFS_DEFAULT_GATEWAY_URL } from '../../../../shared/constants/network';
import {
  AUTO_DETECT_TOKEN_LEARN_MORE_LINK,
  COINGECKO_LINK,
  CRYPTOCOMPARE_LINK,
  TRANSACTION_SIMULATIONS_LEARN_MORE_LINK,
} from '../../../../shared/lib/ui-utils';
import SRPQuiz from '../../../components/app/srp-quiz-modal/SRPQuiz';
import {
  Button,
  ButtonSize,
  Icon,
  IconSize,
  IconName,
  Box,
  Text,
} from '../../../components/component-library';
import TextField from '../../../components/ui/text-field';
import ToggleButton from '../../../components/ui/toggle-button';
import Popover from '../../../components/ui/popover';
import {
  Display,
  BlockSize,
  FlexDirection,
  JustifyContent,
  TextColor,
  TextVariant,
  IconColor,
  AlignItems,
} from '../../../helpers/constants/design-system';
import { ADD_POPULAR_CUSTOM_NETWORK } from '../../../helpers/constants/routes';
import {
  getNumberOfSettingRoutesInTab,
  handleSettingsRefs,
} from '../../../helpers/utils/settings-search';

import IncomingTransactionToggle from '../../../components/app/incoming-trasaction-toggle/incoming-transaction-toggle';
import { updateDataDeletionTaskStatus } from '../../../store/actions';

export default class SecurityTab extends PureComponent {
  static contextTypes = {
    t: PropTypes.func,
  };

  static propTypes = {
    history: PropTypes.object,
    openSeaEnabled: PropTypes.bool,
    setOpenSeaEnabled: PropTypes.func,
    incomingTransactionsPreferences: PropTypes.object.isRequired,
    networkConfigurations: PropTypes.object.isRequired,
    setIncomingTransactionsPreferences: PropTypes.func.isRequired,
    setUsePhishDetect: PropTypes.func.isRequired,
    usePhishDetect: PropTypes.bool.isRequired,
    setUse4ByteResolution: PropTypes.func.isRequired,
    use4ByteResolution: PropTypes.bool.isRequired,
    useTokenDetection: PropTypes.bool.isRequired,
    setUseTokenDetection: PropTypes.func.isRequired,
    setIpfsGateway: PropTypes.func.isRequired,
    setIsIpfsGatewayEnabled: PropTypes.func.isRequired,
    ipfsGateway: PropTypes.string.isRequired,
    useMultiAccountBalanceChecker: PropTypes.bool.isRequired,
    setUseMultiAccountBalanceChecker: PropTypes.func.isRequired,
    // useSafeChainsListValidation: PropTypes.bool.isRequired,
    // setUseSafeChainsListValidation: PropTypes.func.isRequired,
    useCurrencyRateCheck: PropTypes.bool.isRequired,
    setUseCurrencyRateCheck: PropTypes.func.isRequired,
    useAddressBarEnsResolution: PropTypes.bool.isRequired,
    setUseAddressBarEnsResolution: PropTypes.func.isRequired,
    useExternalNameSources: PropTypes.bool.isRequired,
    setUseExternalNameSources: PropTypes.func.isRequired,
    setBasicFunctionalityModalOpen: PropTypes.func.isRequired,
    setUseTransactionSimulations: PropTypes.func.isRequired,
    useTransactionSimulations: PropTypes.bool.isRequired,
    petnamesEnabled: PropTypes.bool.isRequired,
    useExternalServices: PropTypes.bool,
    toggleExternalServices: PropTypes.func.isRequired,
    metaMetricsDataDeletionId: PropTypes.string,
  };

  state = {
    ipfsGateway: this.props.ipfsGateway || IPFS_DEFAULT_GATEWAY_URL,
    ipfsGatewayError: '',
    srpQuizModalVisible: false,
    showDataCollectionDisclaimer: false,
    ipfsToggle: this.props.ipfsGateway.length > 0,
  };

  settingsRefCounter = 0;

  settingsRefs = Array(
    getNumberOfSettingRoutesInTab(
      this.context.t,
      this.context.t('securityAndPrivacy'),
    ),
  )
    .fill(undefined)
    .map(() => {
      return React.createRef();
    });

  componentDidUpdate() {
    const { t } = this.context;
    handleSettingsRefs(t, t('securityAndPrivacy'), this.settingsRefs);
  }

  async componentDidMount() {
    const { t } = this.context;
    handleSettingsRefs(t, t('securityAndPrivacy'), this.settingsRefs);
    if (this.props.metaMetricsDataDeletionId) {
      await updateDataDeletionTaskStatus();
    }
  }

  toggleSetting(value, _eventName, _eventAction, toggleMethod) {
    toggleMethod(!value);
  }

  hideSrpQuizModal = () => this.setState({ srpQuizModalVisible: false });

  renderSeedWords() {
    const { t } = this.context;

    return (
      <>
        <div
          ref={this.settingsRefs[1]}
          className="settings-page__security-tab-sub-header"
        >
          {t('secretRecoveryPhrase')}
        </div>
        <div className="settings-page__content-padded">
          <Button
            data-testid="reveal-seed-words"
            type="danger"
            size={ButtonSize.Lg}
            onClick={(event) => {
              event.preventDefault();
              this.setState({ srpQuizModalVisible: true });
            }}
          >
            {t('revealSeedWords')}
          </Button>
          {this.state.srpQuizModalVisible && (
            <SRPQuiz
              isOpen={this.state.srpQuizModalVisible}
              onClose={this.hideSrpQuizModal}
            />
          )}
        </div>
      </>
    );
  }

  renderIncomingTransactionsOptIn() {
    const {
      incomingTransactionsPreferences,
      networkConfigurations,
      setIncomingTransactionsPreferences,
    } = this.props;

    return (
      <IncomingTransactionToggle
        wrapperRef={this.settingsRefs[2]}
        networkConfigurations={networkConfigurations}
        setIncomingTransactionsPreferences={setIncomingTransactionsPreferences}
        incomingTransactionsPreferences={incomingTransactionsPreferences}
      />
    );
  }

  renderPhishingDetectionToggle() {
    const { t } = this.context;
    const { usePhishDetect, setUsePhishDetect } = this.props;

    return (
      <Box
        ref={this.settingsRefs[3]}
        className="settings-page__content-row"
        display={Display.Flex}
        flexDirection={FlexDirection.Row}
        justifyContent={JustifyContent.spaceBetween}
        gap={4}
      >
        <div className="settings-page__content-item">
          <span>{t('usePhishingDetection')}</span>
          <div className="settings-page__content-description">
            {t('usePhishingDetectionDescription')}
          </div>
        </div>

        <div
          className="settings-page__content-item-col"
          data-testid="usePhishingDetection"
        >
          <ToggleButton
            value={usePhishDetect}
            onToggle={(value) => setUsePhishDetect(!value)}
            offLabel={t('off')}
            onLabel={t('on')}
          />
        </div>
      </Box>
    );
  }

  renderUse4ByteResolutionToggle() {
    const { t } = this.context;
    const { use4ByteResolution, setUse4ByteResolution } = this.props;
    return (
      <Box
        ref={this.settingsRefs[4]}
        className="settings-page__content-row"
        display={Display.Flex}
        flexDirection={FlexDirection.Row}
        justifyContent={JustifyContent.spaceBetween}
        gap={4}
      >
        <div className="settings-page__content-item">
          <span>{t('use4ByteResolution')}</span>
          <div className="settings-page__content-description">
            {t('toggleDecodeDescription')}
          </div>
        </div>

        <div
          className="settings-page__content-item-col"
          data-testid="4byte-resolution-container"
        >
          <ToggleButton
            value={use4ByteResolution}
            onToggle={(value) => setUse4ByteResolution(!value)}
            offLabel={t('off')}
            onLabel={t('on')}
          />
        </div>
      </Box>
    );
  }

  renderChooseYourNetworkButton() {
    const { t } = this.context;

    return (
      <Box
        className="settings-page__content-row"
        data-testid="advanced-setting-choose-your-network"
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        gap={4}
      >
        <div className="settings-page__content-item">
          <span>{t('chooseYourNetwork')}</span>
        </div>
        <div className="settings-page__content-item-col">
          <Button
            type="secondary"
            className="settings-page__button"
            onClick={() => {
              getEnvironmentType() === ENVIRONMENT_TYPE_POPUP
                ? global.platform.openExtensionInBrowser(
                    ADD_POPULAR_CUSTOM_NETWORK,
                  )
                : this.props.history.push(ADD_POPULAR_CUSTOM_NETWORK);
            }}
          >
            {t('addCustomNetwork')}
          </Button>
        </div>
      </Box>
    );
  }

  /*
  renderSafeChainsListValidationToggle() {
    const { t } = this.context;
    const { useSafeChainsListValidation, setUseSafeChainsListValidation } =
      this.props;

    const useSafeChainsListValidationWebsite = t(
      'useSafeChainsListValidationWebsite',
    );

    return (
      <Box
        ref={this.settingsRefs[14]}
        className="settings-page__content-row"
        data-testid="setting-safe-chains-validation"
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        gap={4}
      >
        <Box
          className="settings-page__content-row"
          gap={4}
          display={Display.Flex}
          flexDirection={FlexDirection.Row}
          justifyContent={JustifyContent.spaceBetween}
        >
          <div className="settings-page__content-item">
            <span>{t('useSafeChainsListValidation')}</span>
            <div className="settings-page__content-description">
              {t('useSafeChainsListValidationDescription', [
                <b key="safechain-list-validation-website">
                  {useSafeChainsListValidationWebsite}
                </b>,
              ])}
            </div>
          </div>

          <div
            className="settings-page__content-item-col"
            data-testid="useSafeChainsListValidation"
          >
            <ToggleButton
              value={useSafeChainsListValidation}
              onToggle={(value) => setUseSafeChainsListValidation(!value)}
              offLabel={t('off')}
              onLabel={t('on')}
            />
          </div>
        </Box>
      </Box>
    );
  }
  */

  renderIpfsGatewayControl() {
    const { t } = this.context;
    let ipfsError = '';

    const handleIpfsGatewayChange = (url) => {
      if (url.length > 0) {
        try {
          const validUrl = addUrlProtocolPrefix(url);

          if (!validUrl) {
            ipfsError = t('invalidIpfsGateway');
          }

          const urlObj = new URL(validUrl);

          // don't allow the use of this gateway
          if (urlObj.host === 'gateway.ipfs.io') {
            ipfsError = t('forbiddenIpfsGateway');
          }

          if (ipfsError.length === 0) {
            this.props.setIpfsGateway(urlObj.host);
          }
        } catch (error) {
          ipfsError = t('invalidIpfsGateway');
        }
      } else {
        ipfsError = t('invalidIpfsGateway');
      }

      this.setState({
        ipfsGateway: url,
        ipfsGatewayError: ipfsError,
      });
    };

    return (
      <Box
        ref={this.settingsRefs[7]}
        className="settings-page__content-row"
        data-testid="setting-ipfs-gateway"
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        gap={4}
      >
        <Box
          className="settings-page__content-row"
          gap={4}
          display={Display.Flex}
          flexDirection={FlexDirection.Row}
          justifyContent={JustifyContent.spaceBetween}
        >
          <div className="settings-page__content-item">
            <span>{t('ipfsGateway')}</span>
            <div className="settings-page__content-description">
              {t('ipfsGatewayDescription')}
            </div>
          </div>
          <div
            className="settings-page__content-item-col"
            data-testid="ipfsToggle"
          >
            <ToggleButton
              value={this.state.ipfsToggle}
              onToggle={(value) => {
                if (value) {
                  // turning from true to false
                  this.props.setIsIpfsGatewayEnabled(false);
                  this.props.setIpfsGateway('');
                } else {
                  // turning from false to true
                  this.props.setIsIpfsGatewayEnabled(true);
                  handleIpfsGatewayChange(this.state.ipfsGateway);
                }

                this.setState({ ipfsToggle: !value });
              }}
              offLabel={t('off')}
              onLabel={t('on')}
            />
          </div>
        </Box>
        {this.state.ipfsToggle && (
          <div className="settings-page__content-item">
            <span>{t('addIPFSGateway')}</span>
            <div className="settings-page__content-item-col">
              <TextField
                type="text"
                value={this.state.ipfsGateway}
                onChange={(e) => handleIpfsGatewayChange(e.target.value)}
                error={this.state.ipfsGatewayError}
                fullWidth
                margin="dense"
              />
            </div>
          </div>
        )}
        <Box
          className="settings-page__content-row"
          display={Display.Flex}
          flexDirection={FlexDirection.Row}
          justifyContent={JustifyContent.spaceBetween}
          gap={4}
          ref={this.settingsRefs[11]}
          marginTop={3}
          id="ens-domains"
        >
          <div>
            {t('ensDomainsSettingTitle')}
            <div className="settings-page__content-description">
              <Text color={TextColor.inherit} variant={TextVariant.inherit}>
                {t('ensDomainsSettingDescriptionIntroduction')}
              </Text>
              <Box
                as="ul"
                marginTop={4}
                marginBottom={4}
                paddingInlineStart={4}
                style={{ listStyleType: 'circle' }}
              >
                <Text
                  as="li"
                  color={TextColor.inherit}
                  variant={TextVariant.inherit}
                >
                  {t('ensDomainsSettingDescriptionPart1')}
                </Text>
                <Text
                  as="li"
                  color={TextColor.inherit}
                  variant={TextVariant.inherit}
                >
                  {t('ensDomainsSettingDescriptionPart2')}
                </Text>
              </Box>
              <Text color={TextColor.inherit} variant={TextVariant.inherit}>
                {t('ensDomainsSettingDescriptionOutroduction')}
              </Text>
            </div>
          </div>

          <div
            className="settings-page__content-item-col"
            data-testid="ipfs-gateway-resolution-container"
          >
            <ToggleButton
              value={this.props.useAddressBarEnsResolution}
              onToggle={(value) =>
                this.props.setUseAddressBarEnsResolution(!value)
              }
              offLabel={t('off')}
              onLabel={t('on')}
            />
          </div>
        </Box>
      </Box>
    );
  }

  renderAutoDetectTokensToggle() {
    const { t } = this.context;
    const { useTokenDetection, setUseTokenDetection } = this.props;

    return (
      <Box
        ref={this.settingsRefs[8]}
        className="settings-page__content-row"
        data-testid="advanced-setting-gas-fee-estimation"
        display={Display.Flex}
        flexDirection={FlexDirection.Row}
        justifyContent={JustifyContent.spaceBetween}
        gap={4}
        id="advanced-settings-autodetect-tokens"
      >
        <div className="settings-page__content-item">
          <span>{t('autoDetectTokens')}</span>
          <div className="settings-page__content-description">
            {t('autoDetectTokensDescription', [
              // TODO: Update to use real link
              <a
                href={AUTO_DETECT_TOKEN_LEARN_MORE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                key="cyn-consensys-privacy-link"
              >
                {startCase(t('learnMore'))}
              </a>,
            ])}
          </div>
        </div>

        <div
          className="settings-page__content-item-col"
          data-testid="autoDetectTokens"
        >
          <ToggleButton
            value={useTokenDetection}
            onToggle={(value) => {
              this.toggleSetting(
                value,
                'MetaMetricsEventName.KeyAutoDetectTokens',
                'MetaMetricsEventName.KeyAutoDetectTokens',
                setUseTokenDetection,
              );
            }}
            offLabel={t('off')}
            onLabel={t('on')}
          />
        </div>
      </Box>
    );
  }

  renderBatchAccountBalanceRequestsToggle() {
    const { t } = this.context;
    const { useMultiAccountBalanceChecker, setUseMultiAccountBalanceChecker } =
      this.props;

    return (
      <Box
        ref={this.settingsRefs[9]}
        className="settings-page__content-row"
        display={Display.Flex}
        flexDirection={FlexDirection.Row}
        justifyContent={JustifyContent.spaceBetween}
        gap={4}
      >
        <div className="settings-page__content-item">
          <span>{t('useMultiAccountBalanceChecker')}</span>
          <div className="settings-page__content-description">
            {t('useMultiAccountBalanceCheckerSettingDescription')}
          </div>
        </div>

        <div
          className="settings-page__content-item-col"
          data-testid="useMultiAccountBalanceChecker"
        >
          <ToggleButton
            value={useMultiAccountBalanceChecker}
            onToggle={(value) => {
              this.toggleSetting(
                value,
                'MetaMetricsEventName.KeyBatchAccountBalanceRequests',
                'MetaMetricsEventName.KeyBatchAccountBalanceRequests',
                setUseMultiAccountBalanceChecker,
              );
            }}
            offLabel={t('off')}
            onLabel={t('on')}
          />
        </div>
      </Box>
    );
  }

  renderCurrencyRateCheckToggle() {
    const { t } = this.context;
    const { useCurrencyRateCheck, setUseCurrencyRateCheck } = this.props;

    return (
      <Box
        ref={this.settingsRefs[10]}
        className="settings-page__content-row"
        display={Display.Flex}
        flexDirection={FlexDirection.Row}
        justifyContent={JustifyContent.spaceBetween}
        gap={4}
      >
        <div className="settings-page__content-item">
          <span>{t('currencyRateCheckToggle')}</span>
          <div className="settings-page__content-description">
            {t('currencyRateCheckToggleDescription', [
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
            ])}
          </div>
        </div>

        <div
          className="settings-page__content-item-col"
          data-testid="currencyRateCheckToggle"
        >
          <ToggleButton
            value={useCurrencyRateCheck}
            onToggle={(value) => setUseCurrencyRateCheck(!value)}
            offLabel={t('off')}
            onLabel={t('on')}
          />
        </div>
      </Box>
    );
  }

  renderDisplayNftMediaToggle() {
    const { t } = this.context;
    const { openSeaEnabled, setOpenSeaEnabled } = this.props;

    return (
      <Box
        ref={this.settingsRefs[12]}
        className="settings-page__content-row"
        display={Display.Flex}
        flexDirection={FlexDirection.Row}
        justifyContent={JustifyContent.spaceBetween}
        gap={4}
        id="display-nft-media"
      >
        <div className="settings-page__content-item">
          <span>{t('displayNftMedia')}</span>
          <div className="settings-page__content-description">
            {t('displayNftMediaDescription')}
          </div>
        </div>
        <div
          className="settings-page__content-item-col"
          data-testid="displayNftMedia"
        >
          <ToggleButton
            value={openSeaEnabled}
            onToggle={(value) => {
              setOpenSeaEnabled(!value);
            }}
            offLabel={t('off')}
            onLabel={t('on')}
          />
        </div>
      </Box>
    );
  }

  renderExternalNameSourcesToggle() {
    const { t } = this.context;
    const { useExternalNameSources, setUseExternalNameSources } = this.props;

    return (
      <Box
        ref={this.settingsRefs[15]}
        className="settings-page__content-row"
        display={Display.Flex}
        flexDirection={FlexDirection.Row}
        justifyContent={JustifyContent.spaceBetween}
        gap={4}
      >
        <div className="settings-page__content-item">
          <span>{t('externalNameSourcesSetting')}</span>
          <div className="settings-page__content-description">
            {t('externalNameSourcesSettingDescription')}
          </div>
        </div>

        <div
          className="settings-page__content-item-col"
          data-testid="useExternalNameSources"
        >
          <ToggleButton
            value={useExternalNameSources}
            onToggle={(value) => setUseExternalNameSources(!value)}
            offLabel={t('off')}
            onLabel={t('on')}
          />
        </div>
      </Box>
    );
  }

  renderSimulationsToggle() {
    const { t } = this.context;
    const { useTransactionSimulations, setUseTransactionSimulations } =
      this.props;

    return (
      <Box
        ref={this.settingsRefs[17]}
        className="settings-page__content-row"
        display={Display.Flex}
        flexDirection={FlexDirection.Row}
        justifyContent={JustifyContent.spaceBetween}
        gap={4}
      >
        <div className="settings-page__content-item">
          <span>{t('simulationsSettingSubHeader')}</span>
          <div className="settings-page__content-description">
            {t('simulationsSettingDescription', [
              <a
                key="learn_more_link"
                href={TRANSACTION_SIMULATIONS_LEARN_MORE_LINK}
                rel="noreferrer"
                target="_blank"
              >
                {t('learnMoreUpperCase')}
              </a>,
            ])}
          </div>
        </div>

        <div
          className="settings-page__content-item-col"
          data-testid="useTransactionSimulations"
        >
          <ToggleButton
            value={useTransactionSimulations}
            onToggle={(value) => setUseTransactionSimulations(!value)}
            offLabel={t('off')}
            onLabel={t('on')}
          />
        </div>
      </Box>
    );
  }

  renderUseExternalServices() {
    const { t } = this.context;
    const {
      useExternalServices,
      toggleExternalServices,
      setBasicFunctionalityModalOpen,
    } = this.props;

    return (
      <Box
        ref={this.settingsRefs[0]}
        className="settings-page__content-row"
        display={Display.Flex}
        flexDirection={FlexDirection.Row}
        justifyContent={JustifyContent.spaceBetween}
        gap={4}
        data-testid="advanced-setting-show-testnet-conversion"
      >
        <div className="settings-page__content-item">
          <Box
            display={Display.Flex}
            justifyContent={JustifyContent.spaceBetween}
            alignItems={AlignItems.center}
            marginBottom={2}
          >
            <Text variant={TextVariant.headingSm}>
              {t('basicConfigurationLabel')}
            </Text>
            <ToggleButton
              value={useExternalServices}
              onToggle={() => {
                if (useExternalServices) {
                  // If we are going to be disabling external services, then we want to show the "turn off" warning modal
                  setBasicFunctionalityModalOpen();
                } else {
                  toggleExternalServices(true);
                }
              }}
              offLabel={t('off')}
              onLabel={t('on')}
            />
          </Box>
          <Text marginBottom={2} color={TextColor.textAlternative}>
            {t('basicConfigurationDescription', [
              <a
                href="https://consensys.io/privacy-policy"
                key="link"
                target="_blank"
                rel="noreferrer noopener"
              >
                {t('privacyMsg')}
              </a>,
            ])}
          </Text>
        </div>

        <div className="settings-page__content-item-col"></div>
      </Box>
    );
  }

  renderDataCollectionWarning = () => {
    const { t } = this.context;

    return (
      <Popover
        wrapTitle
        centerTitle
        onClose={() => this.setState({ showDataCollectionDisclaimer: false })}
        title={
          <Icon
            size={IconSize.Xl}
            name={IconName.Danger}
            color={IconColor.warningDefault}
          />
        }
        footer={
          <Button
            width={BlockSize.Full}
            type="primary"
            onClick={() =>
              this.setState({ showDataCollectionDisclaimer: false })
            }
          >
            {t('dataCollectionWarningPopoverButton')}
          </Button>
        }
      >
        <Box
          display={Display.Flex}
          flexDirection={FlexDirection.Column}
          gap={2}
          margin={4}
        >
          <Text>{t('dataCollectionWarningPopoverDescription')}</Text>
        </Box>
      </Popover>
    );
  };

  render() {
    const { petnamesEnabled } = this.props;
    const { showDataCollectionDisclaimer } = this.state;

    return (
      <div className="settings-page__body">
        <span className="settings-page__security-tab-sub-header__bold">
          {this.context.t('security')}
        </span>
        {this.renderSeedWords()}
        <span className="settings-page__security-tab-sub-header__bold">
          {this.context.t('networkOptions')}
        </span>
        <div className="settings-page__content-padded">
          {this.renderChooseYourNetworkButton()}
          {/* this.renderSafeChainsListValidationToggle() */}
          {this.renderIpfsGatewayControl()}
        </div>
        <span className="settings-page__security-tab-sub-header__bold">
          {this.context.t('privacy')}
        </span>
        <div>
          <span className="settings-page__security-tab-sub-header">
            {this.context.t('smartContracts')}
          </span>
        </div>
        <div className="settings-page__content-padded">
          {this.renderUse4ByteResolutionToggle()}
        </div>
        <span className="settings-page__security-tab-sub-header">
          {this.context.t('transactions')}
        </span>
        <div className="settings-page__content-padded">
          {this.renderIncomingTransactionsOptIn()}
          {this.renderCurrencyRateCheckToggle()}
        </div>
        <div className="settings-page__content-padded">
          {this.renderDisplayNftMediaToggle()}
        </div>
        <div>
          <span className="settings-page__security-tab-sub-header">
            {this.context.t('alerts')}
          </span>
        </div>
        <div className="settings-page__content-padded">
          {this.renderPhishingDetectionToggle()}
        </div>
        {petnamesEnabled && (
          <>
            <span className="settings-page__security-tab-sub-header">
              {this.context.t('settingsSubHeadingSignaturesAndTransactions')}
            </span>
            <div className="settings-page__content-padded">
              {this.renderExternalNameSourcesToggle()}
            </div>
          </>
        )}
      </div>
    );
  }
}
