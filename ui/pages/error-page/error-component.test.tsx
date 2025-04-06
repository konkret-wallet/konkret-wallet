import React from 'react';
import { useSelector } from 'react-redux';
import '@testing-library/jest-dom/extend-expect';
import browser from 'webextension-polyfill';
import { fireEvent } from '@testing-library/react';
import { renderWithProvider } from '../../../test/lib/render-helpers';
import { useI18nContext } from '../../hooks/useI18nContext';
import { getMessage } from '../../helpers/utils/i18n-helper';
// eslint-disable-next-line import/no-restricted-paths
import messages from '../../../app/_locales/en/messages.json';
import ErrorPage from './error-page.component';

jest.mock('../../hooks/useI18nContext', () => ({
  useI18nContext: jest.fn(),
}));

jest.mock('webextension-polyfill', () => ({
  runtime: {
    reload: jest.fn(),
  },
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

describe('ErrorPage', () => {
  const useSelectorMock = useSelector as jest.Mock;
  const MockError = new Error(
    "Cannot read properties of undefined (reading 'message')",
  ) as Error & { code?: string };
  MockError.code = '500';

  const mockI18nContext = jest
    .fn()
    .mockReturnValue((key: string, variables: string[]) =>
      getMessage('en', messages, key, variables),
    );

  beforeEach(() => {
    useSelectorMock.mockImplementation(() => {
      return undefined;
    });
    (useI18nContext as jest.Mock).mockImplementation(mockI18nContext);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render the error message, code, and name if provided', () => {
    const { getByTestId } = renderWithProvider(<ErrorPage error={MockError} />);

    expect(
      getByTestId('error-page-error-message').textContent,
    ).toMatchInlineSnapshot(
      `"Message: Cannot read properties of undefined (reading 'message')"`,
    );
    expect(
      getByTestId('error-page-error-code').textContent,
    ).toMatchInlineSnapshot(`"Code: 500"`);
    expect(
      getByTestId('error-page-error-name').textContent,
    ).toMatchInlineSnapshot(`"Code: Error"`);
  });

  it('should not render error details if no error information is provided', () => {
    const error = {};

    const { queryByTestId } = renderWithProvider(<ErrorPage error={error} />);

    expect(queryByTestId('error-page-error-message')).toBeNull();
    expect(queryByTestId('error-page-error-code')).toBeNull();
    expect(queryByTestId('error-page-error-name')).toBeNull();
    expect(queryByTestId('error-page-error-stack')).toBeNull();
  });

  it('should reload the extension when the "Try Again" button is clicked', () => {
    const { getByTestId } = renderWithProvider(<ErrorPage error={MockError} />);
    const tryAgainButton = getByTestId('error-page-try-again-button');
    fireEvent.click(tryAgainButton);
    expect(browser.runtime.reload).toHaveBeenCalled();
  });
});
