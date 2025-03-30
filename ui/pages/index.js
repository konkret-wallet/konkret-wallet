import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { CompatRouter } from 'react-router-dom-v5-compat';
import { I18nProvider, LegacyI18nProvider } from '../contexts/i18n';
import { MetamaskNotificationsProvider } from '../contexts/metamask-notifications';
import { AssetPollingProvider } from '../contexts/assetPolling';
import ErrorPage from './error-page/error-page.component';

import Routes from './routes';

class Index extends PureComponent {
  state = {};

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.warn(error);
  }

  render() {
    const { error } = this.state;
    const { store } = this.props;

    if (error) {
      return (
        <Provider store={store}>
          <I18nProvider>
            <LegacyI18nProvider>
              <ErrorPage error={error} />
            </LegacyI18nProvider>
          </I18nProvider>
        </Provider>
      );
    }

    return (
      <Provider store={store}>
        <HashRouter hashType="noslash">
          <CompatRouter>
            <I18nProvider>
              <LegacyI18nProvider>
                <AssetPollingProvider>
                  <MetamaskNotificationsProvider>
                    <Routes />
                  </MetamaskNotificationsProvider>
                </AssetPollingProvider>
              </LegacyI18nProvider>
            </I18nProvider>
          </CompatRouter>
        </HashRouter>
      </Provider>
    );
  }
}

Index.propTypes = {
  store: PropTypes.object,
};

export default Index;
