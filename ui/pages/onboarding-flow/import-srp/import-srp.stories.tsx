import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import type { Meta, StoryObj } from '@storybook/react';
import ImportSRP from './import-srp';

const mockStore = configureStore({
  reducer: {
    metamask: (state = {
      internalAccounts: {
        selectedAccount: '0x0000000000000000000000000000000000000001',
        accounts: {
          '0x0000000000000000000000000000000000000001': {
            address: '0x0000000000000000000000000000000000000001',
            metadata: {
              keyring: {
                type: 'HD Key Tree',
                accounts: ['0x0000000000000000000000000000000000000001'],
              },
            },
          },
        },
      },
      keyrings: [
        {
          type: 'HD Key Tree',
          accounts: ['0x0000000000000000000000000000000000000001'],
        },
      ],
    }) => state,
  },
});

const Wrapper = ({ children }) => (
  <Provider store={mockStore}>
    <MemoryRouter>
      {children}
    </MemoryRouter>
  </Provider>
);

const meta: Meta<typeof ImportSRP> = {
  title: 'Pages/OnboardingFlow/ImportSRP',
  component: ImportSRP,
  decorators: [
    (Story) => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'ImportSRP component allows users to input and submit their Secret Recovery Phrase.',
      },
    },
  },
  argTypes: {
    submitSecretRecoveryPhrase: { action: 'submitSecretRecoveryPhrase' },
  },
};

export default meta;
type Story = StoryObj<typeof ImportSRP>;

export const DefaultStory: Story = {
  args: {
    submitSecretRecoveryPhrase: () => console.log('Secret Recovery Phrase submitted'),
  },
};

DefaultStory.storyName = 'Default';
