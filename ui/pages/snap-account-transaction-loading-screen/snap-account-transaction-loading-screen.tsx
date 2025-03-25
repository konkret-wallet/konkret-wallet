import React from 'react';
import { useI18nContext } from '../../hooks/useI18nContext';

const SnapAccountTransactionLoadingScreen = () => {
  const t = useI18nContext();

  return <span>{t('loadingScreenSnapMessage')}</span>;
};

export default SnapAccountTransactionLoadingScreen;
