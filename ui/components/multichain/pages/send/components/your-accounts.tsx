import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { EthAccountType, KeyringAccountType } from '@metamask/keyring-api';
import { InternalAccount } from '@metamask/keyring-internal-api';
import {
  getUpdatedAndSortedAccounts,
  getSelectedInternalAccount,
} from '../../../../../selectors';
import { AccountListItem } from '../../..';
import {
  addHistoryEntry,
  updateRecipient,
  updateRecipientUserInput,
} from '../../../../../ducks/send';
import { SendPageRow } from './send-page-row';

type SendPageYourAccountsProps = {
  allowedAccountTypes?: KeyringAccountType[];
};

const defaultAllowedAccountTypes = [EthAccountType.Eoa, EthAccountType.Erc4337];

export const SendPageYourAccounts = ({
  allowedAccountTypes = defaultAllowedAccountTypes,
}: SendPageYourAccountsProps) => {
  const dispatch = useDispatch();

  // Your Accounts
  const accounts = useSelector(getUpdatedAndSortedAccounts);
  const filteredAccounts = useMemo(() => {
    return accounts.filter((account: InternalAccount) =>
      allowedAccountTypes.includes(account.type),
    );
  }, [accounts]);
  const selectedAccount = useSelector(getSelectedInternalAccount);

  return (
    <SendPageRow>
      {/* TODO: Replace `any` with type */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {filteredAccounts.map((account: any) => (
        <AccountListItem
          account={account}
          selected={selectedAccount.address === account.address}
          key={account.address}
          isPinned={Boolean(account.pinned)}
          shouldScrollToWhenSelected={false}
          onClick={() => {
            dispatch(
              addHistoryEntry(
                `sendFlow - User clicked recipient from my accounts. address: ${account.address}, nickname ${account.name}`,
              ),
            );
            dispatch(
              updateRecipient({
                address: account.address,
                nickname: account.name,
              }),
            );
            dispatch(updateRecipientUserInput(account.address));
          }}
        />
      ))}
    </SendPageRow>
  );
};
