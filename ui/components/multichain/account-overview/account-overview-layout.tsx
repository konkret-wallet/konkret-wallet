import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
import { isEqual } from 'lodash';
///: END:ONLY_INCLUDE_IF
import { removeSlide, updateSlides } from '../../../store/actions';
import { Carousel } from '..';
import {
  getSelectedAccountCachedBalance,
  getAppIsLoading,
  getSlides,
  ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
  getSwapsDefaultToken,
  ///: END:ONLY_INCLUDE_IF
} from '../../../selectors';
///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
import useBridging from '../../../hooks/bridge/useBridging';
///: END:ONLY_INCLUDE_IF
import {
  AccountOverviewTabsProps,
  AccountOverviewTabs,
} from './account-overview-tabs';
import {
  FUND_SLIDE,
  ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
  BRIDGE_SLIDE,
  ///: END:ONLY_INCLUDE_IF
  CARD_SLIDE,
  CASH_SLIDE,
  ZERO_BALANCE,
} from './constants';

export type AccountOverviewLayoutProps = AccountOverviewTabsProps & {
  children: React.ReactElement;
};

export const AccountOverviewLayout = ({
  children,
  ...tabsProps
}: AccountOverviewLayoutProps) => {
  const dispatch = useDispatch();
  const slides = useSelector(getSlides);
  const totalBalance = useSelector(getSelectedAccountCachedBalance);
  const isLoading = useSelector(getAppIsLoading);
  const [hasRendered, setHasRendered] = useState(false);

  ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
  const defaultSwapsToken = useSelector(getSwapsDefaultToken, isEqual);
  ///: END:ONLY_INCLUDE_IF

  const hasZeroBalance = totalBalance === ZERO_BALANCE;

  ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
  const { openBridgeExperience } = useBridging();
  ///: END:ONLY_INCLUDE_IF

  useEffect(() => {
    const fundSlide = {
      ...FUND_SLIDE,
      undismissable: hasZeroBalance,
    };

    const defaultSlides = [
      ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
      BRIDGE_SLIDE,
      ///: END:ONLY_INCLUDE_IF
      CARD_SLIDE,
      CASH_SLIDE,
    ];

    if (hasZeroBalance) {
      defaultSlides.unshift(fundSlide);
    } else {
      defaultSlides.splice(2, 0, fundSlide);
    }

    dispatch(updateSlides(defaultSlides));
  }, [hasZeroBalance]);

  const handleCarouselClick = (id: string) => {
    ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
    if (id === 'bridge') {
      openBridgeExperience(
        'Carousel',
        defaultSwapsToken,
        location.pathname.includes('asset') ? '&token=native' : '',
      );
    }
    ///: END:ONLY_INCLUDE_IF
  };

  const handleRemoveSlide = (_isLastSlide: boolean, id: string) => {
    if (id === 'fund' && hasZeroBalance) {
      return;
    }
    dispatch(removeSlide(id));
  };

  const handleRenderSlides = useCallback(() => {
    if (!hasRendered) {
      setHasRendered(true);
    }
  }, [hasRendered]);

  return (
    <>
      <div className="account-overview__balance-wrapper">{children}</div>
      <Carousel
        slides={slides}
        isLoading={isLoading}
        onClick={handleCarouselClick}
        onClose={handleRemoveSlide}
        onRenderSlides={handleRenderSlides}
      />
      <AccountOverviewTabs {...tabsProps}></AccountOverviewTabs>
    </>
  );
};
