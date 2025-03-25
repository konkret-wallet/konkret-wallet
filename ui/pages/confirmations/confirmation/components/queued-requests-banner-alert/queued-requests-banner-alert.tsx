import React from 'react';
import { useSelector } from 'react-redux';
import {
  BannerAlert,
  BannerAlertSeverity,
} from '../../../../../components/component-library';
import { useI18nContext } from '../../../../../hooks/useI18nContext';
import { getQueuedRequestCount } from '../../../../../selectors';

export const QueuedRequestsBannerAlert = () => {
  const t = useI18nContext();

  const queuedRequestCount = useSelector(getQueuedRequestCount);

  if (queuedRequestCount === 0) {
    return null;
  }

  return (
    <BannerAlert
      severity={BannerAlertSeverity.Info}
      description={t('existingRequestsBannerAlertDesc')}
      margin={4}
    />
  );
};
