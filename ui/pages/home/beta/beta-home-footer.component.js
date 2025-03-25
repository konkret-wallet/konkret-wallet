import React from 'react';

import { SUPPORT_LINK } from '../../../helpers/constants/common';
import { useI18nContext } from '../../../hooks/useI18nContext';

const BetaHomeFooter = () => {
  const t = useI18nContext();

  return (
    <>
      <a target="_blank" rel="noopener noreferrer" href={SUPPORT_LINK}>
        {t('needHelpSubmitTicket')}
      </a>
    </>
  );
};

export default BetaHomeFooter;
