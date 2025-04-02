import React, { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { I18nContext } from '../../../contexts/i18n';
import { SEND_ROUTE } from '../../../helpers/constants/routes';
import { startNewDraftTransaction } from '../../../ducks/send';
import { getNetworkConfigurationIdByChainId } from '../../../selectors';
import { getCurrentChainId } from '../../../../shared/modules/selectors/networks';

import { INVALID_ASSET_TYPE } from '../../../helpers/constants/error-keys';
import {
  showModal,
  setSwitchedNetworkDetails,
  setActiveNetworkWithError,
} from '../../../store/actions';
import { AssetType } from '../../../../shared/constants/transaction';
import {
  Display,
  IconColor,
  JustifyContent,
} from '../../../helpers/constants/design-system';
import IconButton from '../../../components/ui/icon-button/icon-button';
import {
  Box,
  Icon,
  IconName,
  IconSize,
} from '../../../components/component-library';
import type { Asset } from './asset-page';

const TokenButtons = ({
  token,
}: {
  token: Asset & { type: AssetType.token };
}) => {
  const dispatch = useDispatch();
  const t = useContext(I18nContext);
  const history = useHistory();

  const currentChainId = useSelector(getCurrentChainId);
  const networks = useSelector(getNetworkConfigurationIdByChainId) as Record<
    string,
    string
  >;

  useEffect(() => {
    if (token.isERC721) {
      dispatch(
        showModal({
          name: 'CONVERT_TOKEN_TO_NFT',
          tokenAddress: token.address,
        }),
      );
    }
  }, [token.isERC721, token.address, dispatch]);

  const setCorrectChain = async () => {
    // If we aren't presently on the chain of the asset, change to it
    if (currentChainId !== token.chainId) {
      try {
        const networkConfigurationId = networks[token.chainId];
        await dispatch(setActiveNetworkWithError(networkConfigurationId));
        await dispatch(
          setSwitchedNetworkDetails({
            networkClientId: networkConfigurationId,
          }),
        );
      } catch (err) {
        console.error(`Failed to switch chains.
        Target chainId: ${token.chainId}, Current chainId: ${currentChainId}.
        ${err}`);
        throw err;
      }
    }
  };

  return (
    <Box display={Display.Flex} justifyContent={JustifyContent.spaceEvenly}>
      <IconButton
        className="token-overview__button"
        onClick={async () => {
          try {
            await setCorrectChain();
            await dispatch(
              startNewDraftTransaction({
                type: AssetType.token,
                details: token,
              }),
            );
            history.push(SEND_ROUTE);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (err: any) {
            if (!err.message.includes(INVALID_ASSET_TYPE)) {
              throw err;
            }
          }
        }}
        Icon={
          <Icon
            name={IconName.Arrow2UpRight}
            color={IconColor.primaryInverse}
            size={IconSize.Sm}
          />
        }
        label={t('send')}
        data-testid="eth-overview-send"
        disabled={token.isERC721}
        tooltipRender={null}
      />
    </Box>
  );
};

export default TokenButtons;
