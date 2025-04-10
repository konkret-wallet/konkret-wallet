import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Button from '../../../components/ui/button';

// import { SUPPORT_REQUEST_LINK } from '../../../helpers/constants/common';
import { isBeta } from '../../../helpers/utils/build-types';
import {
  getNumberOfSettingRoutesInTab,
  handleSettingsRefs,
} from '../../../helpers/utils/settings-search';

export default class InfoTab extends PureComponent {
  state = {
    version: process.env.METAMASK_VERSION,
  };

  static contextTypes = {
    t: PropTypes.func,
  };

  settingsRefs = Array(
    getNumberOfSettingRoutesInTab(this.context.t, this.context.t('about')),
  )
    .fill(undefined)
    .map(() => {
      return React.createRef();
    });

  componentDidUpdate() {
    const { t } = this.context;
    handleSettingsRefs(t, t('about'), this.settingsRefs);
  }

  componentDidMount() {
    const { t } = this.context;
    handleSettingsRefs(t, t('about'), this.settingsRefs);
  }

  renderInfoLinks() {
    const { t } = this.context;
    return (
      <div className="settings-page__content-item settings-page__content-item--without-height">
        <div ref={this.settingsRefs[1]} className="info-tab__link-header">
          {t('links')}
        </div>
        <div ref={this.settingsRefs[3]} className="info-tab__link-item">
          <Button
            type="link"
            href={`https://codeberg.org/konkret/konkret-wallet/raw/tag/v${this.state.version}/LICENSE.txt`}
            target="_blank"
            rel="noopener noreferrer"
            className="info-tab__link-text"
          >
            {t('license')}
          </Button>
        </div>
        <div ref={this.settingsRefs[4]} className="info-tab__link-item">
          <Button
            type="link"
            href={`https://codeberg.org/konkret/konkret-wallet/raw/tag/v${this.state.version}/attribution.txt`}
            target="_blank"
            rel="noopener noreferrer"
            className="info-tab__link-text"
          >
            {t('attributions')}
          </Button>
        </div>
        <hr className="info-tab__separator" />
      </div>
    );
  }

  render() {
    const { t } = this.context;

    return (
      <div className="settings-page__body">
        <div className="settings-page__content-row">
          <div className="settings-page__content-item settings-page__content-item--without-height">
            <div className="info-tab__item">
              <div
                ref={this.settingsRefs[0]}
                className="info-tab__version-header"
              >
                {isBeta() ? t('betaMetamaskVersion') : t('metamaskVersion')}
              </div>
              <div className="info-tab__version-number">
                {this.state.version}
              </div>
            </div>
            <div className="info-tab__item">
              <div className="info-tab__about">{t('builtAroundTheWorld')}</div>
            </div>
          </div>
          {this.renderInfoLinks()}
        </div>
        <div className="info-tab__logo-wrapper">
          <img
            src="./images/logo/metamask-fox.svg"
            className="info-tab__logo"
            alt="MetaMask Logo"
          />
        </div>
      </div>
    );
  }
}
