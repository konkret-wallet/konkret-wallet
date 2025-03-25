import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { BannerAlert } from '../../../../components/component-library';
import { Severity } from '../../../../helpers/constants/design-system';

import { I18nContext } from '../../../../../.storybook/i18n';

export default function SimulationErrorMessage({
  userAcknowledgedGasMissing = false,
  setUserAcknowledgedGasMissing,
}) {
  const t = useContext(I18nContext);

  return userAcknowledgedGasMissing === true ? (
    <BannerAlert severity={Severity.Danger}>
      {t('simulationErrorMessageV2')}
    </BannerAlert>
  ) : (
    <BannerAlert
      severity={Severity.Danger}
      actionButtonLabel={t('proceedWithTransaction')}
      actionButtonOnClick={setUserAcknowledgedGasMissing}
    >
      {t('simulationErrorMessageV2')}
    </BannerAlert>
  );
}

SimulationErrorMessage.propTypes = {
  userAcknowledgedGasMissing: PropTypes.bool,
  setUserAcknowledgedGasMissing: PropTypes.func,
};
