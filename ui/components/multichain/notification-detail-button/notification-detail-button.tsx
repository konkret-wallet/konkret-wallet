import React, { useState } from 'react';
import {
  Button,
  ButtonVariant,
  ButtonSize,
  IconName,
} from '../../component-library';
import { BlockSize } from '../../../helpers/constants/design-system';
import { TRIGGER_TYPES } from '../../../pages/notifications/notification-components';
import useSnapNavigation from '../../../hooks/snaps/useSnapNavigation';
import { type Notification } from '../../../pages/notifications/notification-components/types/notifications/notifications';
import SnapLinkWarning from '../../app/snaps/snap-link-warning';

type NotificationDetailButtonProps = {
  notification: Notification;
  variant: ButtonVariant;
  text: string;
  href: string;
  id: string;
  isExternal?: boolean;
  endIconName?: boolean;
};

export const NotificationDetailButton = ({
  notification,
  variant = ButtonVariant.Secondary,
  text,
  href,
  id,
  isExternal = false,
  endIconName = true,
}: NotificationDetailButtonProps) => {
  const { navigate } = useSnapNavigation();
  const isMetaMaskUrl = href.startsWith('metamask:');
  const [isOpen, setIsOpen] = useState(false);

  const isSnapNotification = notification.type === TRIGGER_TYPES.SNAP;

  const handleModalClose = () => {
    setIsOpen(false);
  };

  const onClick = () => {
    if (isSnapNotification) {
      if (isMetaMaskUrl) {
        navigate(href);
      } else {
        setIsOpen(true);
      }
    }
  };

  return (
    <>
      {isSnapNotification && (
        <SnapLinkWarning
          isOpen={isOpen}
          onClose={handleModalClose}
          url={href}
        />
      )}
      <Button
        key={id}
        href={!isSnapNotification && href ? href : undefined}
        variant={variant}
        externalLink={isExternal || !isMetaMaskUrl}
        size={ButtonSize.Lg}
        width={BlockSize.Full}
        endIconName={endIconName ? IconName.Arrow2UpRight : undefined}
        onClick={onClick}
      >
        {text}
      </Button>
    </>
  );
};
