import * as React from 'react';
import { useSelector } from 'react-redux';
import { fireEvent } from '@testing-library/react';
import configureMockState from 'redux-mock-store';
import thunk from 'redux-thunk';
import { openWindow } from '../../../../helpers/utils/window';
import { SUPPORT_LINK } from '../../../../../shared/lib/ui-utils';
import { renderWithProvider } from '../../../../../test/lib/render-helpers';
import mockState from '../../../../../test/data/mock-state.json';
import VisitSupportDataConsentModal from './visit-support-data-consent-modal';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

jest.mock('../../../../helpers/utils/window', () => ({
  openWindow: jest.fn(),
}));

describe('VisitSupportDataConsentModal', () => {
  const store = configureMockState([thunk])(mockState);
  const mockOnClose = jest.fn();

  const useSelectorMock = useSelector as jest.Mock;

  beforeEach(() => {
    useSelectorMock.mockImplementation((_selector) => {
      return undefined;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderModal = (props = {}) => {
    const defaultProps = {
      isOpen: true,
      onClose: mockOnClose,
      ...props,
    };

    return renderWithProvider(
      <VisitSupportDataConsentModal {...defaultProps} />,
      store,
    );
  };

  it('renders the modal correctly when open', () => {
    const { getByTestId } = renderModal();
    const modal = getByTestId('visit-support-data-consent-modal');
    expect(modal).toMatchSnapshot();
  });

  it('handles clicking the accept button correctly', () => {
    const { getByTestId } = renderModal();

    fireEvent.click(
      getByTestId('visit-support-data-consent-modal-accept-button'),
    );

    const expectedUrl = `${SUPPORT_LINK}`;

    expect(openWindow).toHaveBeenCalledWith(expectedUrl);
  });

  it('handles clicking the reject button correctly', () => {
    const { getByTestId } = renderModal();

    fireEvent.click(
      getByTestId('visit-support-data-consent-modal-reject-button'),
    );

    expect(mockOnClose).toHaveBeenCalled();
    expect(openWindow).toHaveBeenCalledWith(SUPPORT_LINK);
  });

  it('handles clicking the accept button with undefined parameters', () => {
    useSelectorMock.mockImplementation(() => undefined);
    const { getByTestId } = renderModal();

    fireEvent.click(
      getByTestId('visit-support-data-consent-modal-accept-button'),
    );

    const expectedUrl = `${SUPPORT_LINK}?metamask_version=MOCK_VERSION`;

    expect(openWindow).toHaveBeenCalledWith(expectedUrl);
  });
});
