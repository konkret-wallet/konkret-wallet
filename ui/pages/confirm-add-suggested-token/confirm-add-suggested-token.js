import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { providerErrors, serializeError } from '@metamask/rpc-errors';
import {
  BannerAlert,
  Button,
  ButtonLinkSize,
  ButtonVariant,
} from '../../components/component-library';
import Identicon from '../../components/ui/identicon';
import TokenBalance from '../../components/ui/token-balance';
import { PageContainerFooter } from '../../components/ui/page-container';
import { I18nContext } from '../../contexts/i18n';
import { getMostRecentOverviewPage } from '../../ducks/history/history';
import { getTokens } from '../../ducks/metamask/metamask';
import ZENDESK_URLS from '../../helpers/constants/zendesk-url';
import { isEqualCaseInsensitive } from '../../../shared/modules/string-utils';
import {
  resolvePendingApproval,
  rejectPendingApproval,
} from '../../store/actions';
import { getSuggestedTokens } from '../../selectors';
import { Severity } from '../../helpers/constants/design-system';
import { Nav } from '../confirmations/components/confirm/nav';

function getTokenName(name, symbol) {
  return name === undefined ? symbol : `${name} (${symbol})`;
}

/**
 * @param {Array} suggestedTokens - an array of assets suggested to add to the user's wallet
 * via the RPC method `wallet_watchAsset`
 * @param {Array} tokens - the list of tokens currently tracked in state
 * @returns {boolean} Returns true when the list of suggestedTokens contains an entry with
 *          an address that matches an existing token.
 */
function hasDuplicateAddress(suggestedTokens, tokens) {
  const duplicate = suggestedTokens.find(({ requestData: { asset } }) => {
    const dupe = tokens.find(({ address }) => {
      return isEqualCaseInsensitive(address, asset?.address);
    });
    return Boolean(dupe);
  });
  return Boolean(duplicate);
}

/**
 * @param {Array} suggestedTokens - a list of assets suggested to add to the user's wallet
 * via RPC method `wallet_watchAsset`
 * @param {Array} tokens - the list of tokens currently tracked in state
 * @returns {boolean} Returns true when the list of suggestedTokens contains an entry with both
 *          1. a symbol that matches an existing token
 *          2. an address that does not match an existing token
 */
function hasDuplicateSymbolAndDiffAddress(suggestedTokens, tokens) {
  const duplicate = suggestedTokens.find(({ requestData: { asset } }) => {
    const dupe = tokens.find((token) => {
      return (
        isEqualCaseInsensitive(token.symbol, asset?.symbol) &&
        !isEqualCaseInsensitive(token.address, asset?.address)
      );
    });
    return Boolean(dupe);
  });
  return Boolean(duplicate);
}

const ConfirmAddSuggestedToken = () => {
  const t = useContext(I18nContext);
  const dispatch = useDispatch();
  const history = useHistory();

  const mostRecentOverviewPage = useSelector(getMostRecentOverviewPage);
  const suggestedTokens = useSelector(getSuggestedTokens);
  const tokens = useSelector(getTokens);
  const approvalId = suggestedTokens[0]?.id;

  const knownTokenBannerAlert = useMemo(() => {
    return (
      hasDuplicateAddress(suggestedTokens, tokens) && (
        <BannerAlert severity={Severity.Warning} marginTop={4}>
          {t('knownTokenWarning', [
            <Button
              variant={ButtonVariant.Link}
              key="confirm-add-suggested-token-duplicate-warning"
              className="confirm-add-suggested-token__link"
              externalLink
              size={ButtonLinkSize.Inherit}
              href={ZENDESK_URLS.TOKEN_SAFETY_PRACTICES}
            >
              {t('learnScamRisk')}
            </Button>,
          ])}
        </BannerAlert>
      )
    );
  }, [suggestedTokens, tokens, t]);

  const reusedTokenNameBannerAlert = useMemo(() => {
    return (
      hasDuplicateSymbolAndDiffAddress(suggestedTokens, tokens) && (
        <BannerAlert
          marginTop={4}
          severity={Severity.Warning}
          description={t('reusedTokenNameWarning')}
        />
      )
    );
  }, [suggestedTokens, tokens, t]);

  const handleAddTokensClick = useCallback(async () => {
    await Promise.all(
      suggestedTokens.map(async ({ id }) => {
        await dispatch(resolvePendingApproval(id, null));
      }),
    );
    history.push(mostRecentOverviewPage);
  }, [dispatch, history, mostRecentOverviewPage, suggestedTokens]);

  const handleCancelTokenClick = useCallback(async () => {
    await Promise.all(
      suggestedTokens.map(({ id }) =>
        dispatch(
          rejectPendingApproval(
            id,
            serializeError(providerErrors.userRejectedRequest()),
          ),
        ),
      ),
    );
    history.push(mostRecentOverviewPage);
  }, [dispatch, history, mostRecentOverviewPage, suggestedTokens]);

  const goBackIfNoSuggestedTokensOnFirstRender = () => {
    if (!suggestedTokens.length) {
      history.push(mostRecentOverviewPage);
    }
  };

  useEffect(() => {
    goBackIfNoSuggestedTokensOnFirstRender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page-container">
      <Nav confirmationId={approvalId} />
      <div className="page-container__header">
        <div className="page-container__title">{t('addSuggestedTokens')}</div>
        <div className="page-container__subtitle">
          {t('likeToImportTokens')}
        </div>
        {knownTokenBannerAlert}
        {reusedTokenNameBannerAlert}
      </div>
      <div className="page-container__content">
        <div className="confirm-add-suggested-token">
          <div className="confirm-add-suggested-token__header">
            <div className="confirm-add-suggested-token__token">
              {t('token')}
            </div>
            <div className="confirm-add-suggested-token__balance">
              {t('balance')}
            </div>
          </div>
          <div className="confirm-add-suggested-token__token-list">
            {suggestedTokens.map(({ requestData: { asset } }) => {
              return (
                <div
                  className="confirm-add-suggested-token__token-list-item"
                  key={asset.address}
                >
                  <div className="confirm-add-suggested-token__token confirm-add-suggested-token__data">
                    <Identicon
                      className="confirm-add-suggested-token__token-icon"
                      diameter={48}
                      address={asset.address}
                      image={asset.image}
                    />
                    <div className="confirm-add-suggested-token__name">
                      {getTokenName(asset.name, asset.symbol)}
                    </div>
                  </div>
                  <div className="confirm-add-suggested-token__balance">
                    <TokenBalance token={asset} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <PageContainerFooter
        cancelText={t('cancel')}
        submitText={t('addToken')}
        onCancel={handleCancelTokenClick}
        onSubmit={handleAddTokensClick}
        disabled={suggestedTokens.length === 0}
      />
    </div>
  );
};

export default ConfirmAddSuggestedToken;
