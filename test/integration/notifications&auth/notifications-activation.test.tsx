import {
  act,
  fireEvent,
  waitFor,
  screen,
  within,
} from '@testing-library/react';
import { integrationTestRender } from '../../lib/render-helpers';
import * as backgroundConnection from '../../../ui/store/background-connection';
import { createMockImplementation } from '../helpers';
import { getMockedNotificationsState } from './data/notification-state';

jest.mock('../../../ui/store/background-connection', () => ({
  ...jest.requireActual('../../../ui/store/background-connection'),
  submitRequestToBackground: jest.fn(),
  callBackgroundMethod: jest.fn(),
}));

const backgroundConnectionMocked = {
  onNotification: jest.fn(),
};

const mockedBackgroundConnection = jest.mocked(backgroundConnection);

const setupSubmitRequestToBackgroundMocks = (
  mockRequests?: Record<string, unknown>,
) => {
  mockedBackgroundConnection.submitRequestToBackground.mockImplementation(
    createMockImplementation({
      ...(mockRequests ?? {}),
    }),
  );
};

describe('Notifications Activation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setupSubmitRequestToBackgroundMocks();
  });

  afterEach(() => {
    window.history.pushState({}, '', '/'); // return to homescreen
  });

  const clickElement = async (testId: string) => {
    await act(async () => {
      fireEvent.click(await screen.findByTestId(testId));
    });
  };

  const waitForElement = async (testId: string) => {
    await waitFor(() => {
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    });
  };

  it('should successfully activate notification for the first time', async () => {
    const mockedState = getMockedNotificationsState();
    await act(async () => {
      await integrationTestRender({
        preloadedState: {
          ...mockedState,
          isProfileSyncingEnabled: false,
          isNotificationServicesEnabled: false,
          isFeatureAnnouncementsEnabled: false,
          isMetamaskNotificationsFeatureSeen: false,
        },
        backgroundConnection: backgroundConnectionMocked,
      });

      await clickElement('account-options-menu-button');
      await waitForElement('notifications-menu-item');
      await clickElement('notifications-menu-item');

      await waitFor(() => {
        expect(
          within(screen.getByRole('dialog')).getByText('Turn on'),
        ).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(await screen.findByText('Turn on'));
      });

      await waitFor(() => {
        const createOnChainTriggersCall =
          mockedBackgroundConnection.submitRequestToBackground.mock.calls?.find(
            (call) => call[0] === 'createOnChainTriggers',
          );

        expect(createOnChainTriggersCall?.[0]).toBe('createOnChainTriggers');
      });
    });
  });
});
