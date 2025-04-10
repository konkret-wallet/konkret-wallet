import React from 'react';
import { fireEvent } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithProvider } from '../../../../test/jest/rendering';
import mockState from '../../../../test/data/mock-state.json';
import { FundingMethodModal } from './funding-method-modal';

const mockStore = configureMockStore([thunk]);

describe('FundingMethodModal', () => {
  let store = configureMockStore([thunk])(mockState);

  beforeEach(() => {
    store = mockStore(mockState);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the modal when isOpen is true', () => {
    const { getByTestId, getByText } = renderWithProvider(
      <FundingMethodModal
        isOpen={true}
        onClose={jest.fn()}
        title="Test Modal"
        onClickReceive={jest.fn()}
      />,
      store,
    );

    expect(getByTestId('funding-method-modal')).toBeInTheDocument();
    expect(getByText('Test Modal')).toBeInTheDocument();
  });

  it('should not render the modal when isOpen is false', () => {
    const { queryByTestId } = renderWithProvider(
      <FundingMethodModal
        isOpen={false}
        onClose={jest.fn()}
        title="Test Modal"
        onClickReceive={jest.fn()}
      />,
      store,
    );

    expect(queryByTestId('funding-method-modal')).toBeNull();
  });

  it('should call onClickReceive when the Receive Crypto item is clicked', () => {
    const onClickReceive = jest.fn();
    const { getByText } = renderWithProvider(
      <FundingMethodModal
        isOpen={true}
        onClose={jest.fn()}
        title="Test Modal"
        onClickReceive={onClickReceive}
      />,
      store,
    );

    fireEvent.click(getByText('Receive crypto'));
    expect(onClickReceive).toHaveBeenCalled();
  });

  it('should open a new tab with the correct URL when Transfer Crypto item is clicked', () => {
    global.platform.openTab = jest.fn();

    const { getByText } = renderWithProvider(
      <FundingMethodModal
        isOpen={true}
        onClose={jest.fn()}
        title="Test Modal"
        onClickReceive={jest.fn()}
      />,
      store,
    );

    fireEvent.click(getByText('Transfer crypto'));
    expect(global.platform.openTab).toHaveBeenCalledWith({
      url: expect.stringContaining('transfer'),
    });
  });
});
