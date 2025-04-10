import React from 'react';
import { BannerAlert, Box, Text } from '../../../component-library';
import Disclosure from '../../../ui/disclosure';
import { DisclosureVariant } from '../../../ui/disclosure/disclosure.constants';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import {
  FontWeight,
  TextVariant,
} from '../../../../helpers/constants/design-system';
import { getBannerAlertSeverity } from '../utils';
import { AlertSeverity } from '../../../../ducks/confirm-alerts/confirm-alerts';

export type GeneralAlertProps = {
  description?: string;
  details?: React.ReactNode | string[];
  onClickSupportLink?: () => void;
  reportUrl?: string;
  severity: AlertSeverity;
  title?: string;
  children?: React.ReactNode;
};

function AlertDetails({
  details,
}: {
  details?: React.ReactNode | string[];
  reportUrl?: string;
  onClickSupportLink?: () => void;
}) {
  const t = useI18nContext();
  if (!details) {
    return null;
  }

  return (
    <Box marginTop={1}>
      <Disclosure title={t('seeDetails')} variant={DisclosureVariant.Arrow}>
        {details instanceof Array ? (
          <Box as="ul" className="alert-modal__alert-details" paddingLeft={6}>
            {details.map((detail, index) => (
              <Box as="li" key={`disclosure-detail-${index}`}>
                <Text
                  variant={TextVariant.bodyMdMedium}
                  fontWeight={FontWeight.Normal}
                >
                  {detail}
                </Text>
              </Box>
            ))}
          </Box>
        ) : (
          details
        )}
      </Disclosure>
    </Box>
  );
}

function GeneralAlert({
  description,
  details,
  onClickSupportLink,
  severity,
  title,
  reportUrl,
  ...props
}: GeneralAlertProps) {
  return (
    <BannerAlert
      title={title}
      severity={getBannerAlertSeverity(severity)}
      description={description}
      {...props}
    >
      {props.children}
      <AlertDetails
        details={details}
        reportUrl={reportUrl}
        onClickSupportLink={onClickSupportLink}
      />
    </BannerAlert>
  );
}

export default GeneralAlert;
