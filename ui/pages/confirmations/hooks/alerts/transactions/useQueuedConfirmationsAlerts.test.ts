import { renderHook } from '@testing-library/react-hooks';
import { useContext } from 'react';
import { useSelector } from 'react-redux';
import { I18nContext } from '../../../../../contexts/i18n';
import {
  getQueuedRequestCount,
  pendingApprovalsSortedSelector,
} from '../../../../../selectors';
import { useQueuedConfirmationsAlerts } from './useQueuedConfirmationsAlerts';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
}));

jest.mock('../../../../../selectors', () => ({
  ...jest.requireActual('../../../../../selectors'),
  pendingApprovalsSortedSelector: jest.fn(),
}));

const pendingApprovalsMock = [
  {
    id: '741bad30-45b6-11ef-b6ec-870d18dd6c01',
    origin: 'http://127.0.0.1:8080',
    type: 'transaction',
    time: 1721383540624,
    requestData: {
      txId: '741bad30-45b6-11ef-b6ec-870d18dd6c01',
    },
    requestState: null,
    expectsResult: true,
  },
];

describe('useQueuedConfirmationsAlerts', () => {
  const useSelectorMock = useSelector as jest.Mock;
  const useContextMock = jest.mocked(useContext);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns alert and if requests have been queued', () => {
    useSelectorMock.mockImplementation((selector) => {
      if (selector === pendingApprovalsSortedSelector) {
        return pendingApprovalsMock;
      } else if (selector === getQueuedRequestCount) {
        return 5;
      }

      return undefined;
    });

    useContextMock.mockImplementation((context) => {
      if (context === I18nContext) {
        return (translationKey: string) => `[${translationKey}]`;
      }

      return undefined;
    });

    const response = renderHook(() => useQueuedConfirmationsAlerts());

    expect(response.result.current).toEqual([
      {
        isBlocking: false,
        key: 'queuedConfirmations',
        message: '[existingRequestsBannerAlertDesc]',
        severity: 'info',
      },
    ]);
  });

  it("returns no alerts and doesn't send metrics if no requests have been queued", () => {
    useSelectorMock.mockImplementation((selector) => {
      if (selector === pendingApprovalsSortedSelector) {
        return pendingApprovalsMock;
      } else if (selector === getQueuedRequestCount) {
        return 0;
      }

      return undefined;
    });

    useContextMock.mockImplementation((context) => {
      if (context === I18nContext) {
        return (translationKey: string) => `[${translationKey}]`;
      }

      return undefined;
    });

    const response = renderHook(() => useQueuedConfirmationsAlerts());

    expect(response.result.current).toEqual([]);
  });
});
