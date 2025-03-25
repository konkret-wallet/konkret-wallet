import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import fetchWithCache from '../../../../shared/lib/fetch-with-cache';
import { DAY } from '../../../../shared/constants/time';
import {
  getSelectedInternalAccount,
  getLastViewedUserSurvey,
  getUseExternalServices,
} from '../../../selectors';
import { ACCOUNTS_API_BASE_URL } from '../../../../shared/constants/accounts';
import { setLastViewedUserSurvey } from '../../../store/actions';
import { Toast } from '../../multichain';

type Survey = {
  url: string;
  description: string;
  cta: string;
  id: number;
};

export function SurveyToast() {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const dispatch = useDispatch();
  const lastViewedUserSurvey = useSelector(getLastViewedUserSurvey);
  const basicFunctionality = useSelector(getUseExternalServices);
  const internalAccount = useSelector(getSelectedInternalAccount);

  const surveyUrl = useMemo(
    () => `${ACCOUNTS_API_BASE_URL}/v1/users/0/surveys`,
    [],
  );

  useEffect(() => {
    if (!basicFunctionality) {
      return undefined;
    }

    const controller = new AbortController();

    const fetchSurvey = async () => {
      try {
        const response = await fetchWithCache({
          url: surveyUrl,
          fetchOptions: {
            method: 'GET',
            headers: {
              'x-metamask-clientproduct': 'metamask-extension',
            },
            signal: controller.signal,
          },
          functionName: 'fetchSurveys',
          cacheOptions: { cacheRefreshTime: process.env.IN_TEST ? 0 : DAY },
        });

        const _survey: Survey = response?.surveys;

        if (
          !_survey ||
          Object.keys(_survey).length === 0 ||
          _survey.id <= lastViewedUserSurvey
        ) {
          return;
        }

        setSurvey(_survey);
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Failed to fetch survey:', error);
        }
      }
    };

    fetchSurvey();

    return () => {
      controller.abort();
    };
  }, [
    internalAccount?.address,
    lastViewedUserSurvey,
    basicFunctionality,
    dispatch,
  ]);

  function handleActionClick() {
    if (!survey) {
      return;
    }
    global.platform.openTab({
      url: survey.url,
    });
    dispatch(setLastViewedUserSurvey(survey.id));
  }

  function handleClose() {
    if (!survey) {
      return;
    }
    dispatch(setLastViewedUserSurvey(survey.id));
  }

  if (!survey || survey.id <= lastViewedUserSurvey) {
    return null;
  }

  return (
    <Toast
      dataTestId="survey-toast"
      key="survey-toast"
      text={survey.description}
      actionText={survey.cta}
      onActionClick={handleActionClick}
      onClose={handleClose}
      startAdornment={null}
    />
  );
}
