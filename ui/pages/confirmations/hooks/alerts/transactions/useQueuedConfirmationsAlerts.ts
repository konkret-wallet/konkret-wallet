import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Alert } from '../../../../../ducks/confirm-alerts/confirm-alerts';
import { Severity } from '../../../../../helpers/constants/design-system';
import { useI18nContext } from '../../../../../hooks/useI18nContext';
import { getQueuedRequestCount } from '../../../../../selectors';

export function useQueuedConfirmationsAlerts(): Alert[] {
  const t = useI18nContext();

  const queuedRequestCount = useSelector(getQueuedRequestCount);
  const isQueuedConfirmation = queuedRequestCount > 0;

  return useMemo(() => {
    if (!isQueuedConfirmation) {
      return [];
    }

    return [
      {
        isBlocking: false,
        key: 'queuedConfirmations',
        message: t('existingRequestsBannerAlertDesc'),
        severity: Severity.Info,
      },
    ];
  }, [isQueuedConfirmation]);
}
