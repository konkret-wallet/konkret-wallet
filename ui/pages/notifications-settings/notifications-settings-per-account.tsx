import React, { useState, useCallback } from 'react';
import { useSwitchAccountNotificationsChange } from '../../hooks/metamask-notifications/useSwitchNotifications';
import {
  NotificationsSettingsBox,
  NotificationsSettingsAccount,
} from '../../components/multichain';
import { useListNotifications } from '../../hooks/metamask-notifications/useNotifications';

type NotificationsSettingsPerAccountProps = {
  address: string;
  name: string;

  isEnabled: boolean;
  isLoading?: boolean;
  disabledSwitch?: boolean;
  refetchAccountSettings: () => Promise<void>;
};

function useUpdateAccountSetting(
  address: string,
  refetchAccountSettings: () => Promise<void>,
) {
  const { onChange: switchAccountNotifications, error } =
    useSwitchAccountNotificationsChange();
  const { listNotifications: refetch } = useListNotifications();

  // Local states
  const [loading, setLoading] = useState(false);

  const toggleAccount = useCallback(
    async (state: boolean) => {
      setLoading(true);
      try {
        await switchAccountNotifications([address], state);
        await refetchAccountSettings();
        refetch();
      } catch {
        // Do nothing (we don't need to propagate this)
      }
      setLoading(false);
    },
    [address, refetch, refetchAccountSettings, switchAccountNotifications],
  );

  return { toggleAccount, loading, error };
}

export const NotificationsSettingsPerAccount = ({
  address,
  name,
  isEnabled,
  isLoading,
  disabledSwitch,
  refetchAccountSettings,
}: NotificationsSettingsPerAccountProps) => {
  const {
    toggleAccount,
    loading: isUpdatingAccount,
    error: accountError,
  } = useUpdateAccountSetting(address, refetchAccountSettings);

  const loading = isLoading || isUpdatingAccount;
  const error = accountError;

  const handleToggleAccountNotifications = useCallback(async () => {
    await toggleAccount(!isEnabled);
  }, [address, isEnabled, toggleAccount]);

  return (
    <>
      <NotificationsSettingsBox
        value={isEnabled ?? false}
        onToggle={handleToggleAccountNotifications}
        key={address}
        disabled={disabledSwitch}
        loading={loading}
        error={error}
      >
        <NotificationsSettingsAccount address={address} name={name} />
      </NotificationsSettingsBox>
    </>
  );
};
