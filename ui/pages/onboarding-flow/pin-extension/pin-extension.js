import React, {
  ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
  useState,
  ///: END:ONLY_INCLUDE_IF
} from 'react';
import { useHistory } from 'react-router-dom';
///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
import { useDispatch, useSelector } from 'react-redux';
import { Carousel } from 'react-responsive-carousel';
import {
  setCompletedOnboarding,
  performSignIn,
  toggleExternalServices,
} from '../../../store/actions';
///: END:ONLY_INCLUDE_IF
import { useI18nContext } from '../../../hooks/useI18nContext';
import Button from '../../../components/ui/button';
import {
  TextVariant,
  FontWeight,
  TextAlign,
} from '../../../helpers/constants/design-system';
import {
  ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
  DEFAULT_ROUTE,
  ///: END:ONLY_INCLUDE_IF
} from '../../../helpers/constants/routes';
import { Text } from '../../../components/component-library';
///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
import { getExternalServicesOnboardingToggleState } from '../../../selectors';
import OnboardingPinBillboard from './pin-billboard';
///: END:ONLY_INCLUDE_IF

export default function OnboardingPinExtension() {
  const t = useI18nContext();
  const history = useHistory();
  ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dispatch = useDispatch();

  const externalServicesOnboardingToggleState = useSelector(
    getExternalServicesOnboardingToggleState,
  );

  const handleClick = async () => {
    if (selectedIndex === 0) {
      setSelectedIndex(1);
    } else {
      await dispatch(
        toggleExternalServices(externalServicesOnboardingToggleState),
      );
      await dispatch(setCompletedOnboarding());

      if (externalServicesOnboardingToggleState) {
        await dispatch(performSignIn());
      }

      history.push(DEFAULT_ROUTE);
    }
  };
  ///: END:ONLY_INCLUDE_IF

  return (
    <div
      className="onboarding-pin-extension"
      data-testid="onboarding-pin-extension"
    >
      {
        ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
        <>
          <Text
            variant={TextVariant.headingLg}
            as="h2"
            align={TextAlign.Center}
            fontWeight={FontWeight.Bold}
          >
            {t('onboardingPinExtensionTitle')}
          </Text>
          <Carousel
            selectedItem={selectedIndex}
            showThumbs={false}
            showStatus={false}
            showArrows={false}
            onChange={(index) => setSelectedIndex(index)}
          >
            <div>
              <Text align={TextAlign.Center}>
                {t('onboardingPinExtensionDescription')}
              </Text>
              <div className="onboarding-pin-extension__diagram">
                <OnboardingPinBillboard />
              </div>
            </div>
            <div>
              <Text align={TextAlign.Center}>
                {t('onboardingPinExtensionDescription2')}
              </Text>
              <Text align={TextAlign.Center}>
                {t('onboardingPinExtensionDescription3')}
              </Text>
              <img
                src="/images/onboarding-pin-browser.svg"
                width="799"
                height="320"
                alt=""
              />
            </div>
          </Carousel>
          <div className="onboarding-pin-extension__buttons">
            <Button
              data-testid={
                selectedIndex === 0
                  ? 'pin-extension-next'
                  : 'pin-extension-done'
              }
              type="primary"
              onClick={handleClick}
            >
              {selectedIndex === 0 ? t('next') : t('done')}
            </Button>
          </div>
        </>
        ///: END:ONLY_INCLUDE_IF
      }
    </div>
  );
}
