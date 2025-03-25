import React from 'react';
import configureMockStore from 'redux-mock-store';
import { fireEvent, waitFor } from '@testing-library/react';
import thunk from 'redux-thunk';
import { renderWithProvider } from '../../../test/lib/render-helpers';
import mockState from '../../../test/data/mock-state.json';
import { Modal } from '../../components/app/modals';
import configureStore from '../../store/store';
import RevealSeedPage from './reveal-seed';

const mockRequestRevealSeedWords = jest.fn();
const mockShowModal = jest.fn();

jest.mock('../../store/actions.ts', () => ({
  ...jest.requireActual('../../store/actions.ts'),
  requestRevealSeedWords: () => mockRequestRevealSeedWords,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn(),
  }),
}));

const mockStateWithModal = {
  ...mockState,
  appState: {
    ...mockState.appState,
    modal: {
      open: true,
      modalState: {
        name: 'HOLD_TO_REVEAL_SRP',
        props: {
          onLongPressed: jest.fn(),
        },
      },
    },
  },
};

describe('Reveal Seed Page', () => {
  const mockStore = configureMockStore([thunk])(mockStateWithModal);

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('should match snapshot', () => {
    const { container } = renderWithProvider(<RevealSeedPage />, mockStore);

    expect(container).toMatchSnapshot();
  });

  it('form submit', async () => {
    mockRequestRevealSeedWords.mockResolvedValueOnce('test srp');
    const { queryByTestId, queryByText } = renderWithProvider(
      <RevealSeedPage />,
      mockStore,
    );

    fireEvent.change(queryByTestId('input-password'), {
      target: { value: 'password' },
    });

    fireEvent.click(queryByText('Next'));

    await waitFor(() => {
      expect(mockRequestRevealSeedWords).toHaveBeenCalled();
    });
  });

  it('shows hold to reveal', async () => {
    mockRequestRevealSeedWords.mockResolvedValueOnce('test srp');
    const { queryByTestId, queryByText } = renderWithProvider(
      <RevealSeedPage />,
      mockStore,
    );

    fireEvent.change(queryByTestId('input-password'), {
      target: { value: 'password' },
    });

    fireEvent.click(queryByText('Next'));

    await waitFor(() => {
      expect(mockRequestRevealSeedWords).toHaveBeenCalled();
    });
  });

  it('does not show modal on bad password', async () => {
    mockRequestRevealSeedWords.mockRejectedValueOnce('incorrect password');

    const { queryByTestId, queryByText } = renderWithProvider(
      <RevealSeedPage />,
      mockStore,
    );

    fireEvent.change(queryByTestId('input-password'), {
      target: { value: 'bad password' },
    });

    fireEvent.click(queryByText('Next'));

    await waitFor(() => {
      expect(mockShowModal).not.toHaveBeenCalled();
    });
  });

  it('should show srp after hold to reveal', async () => {
    // need to use actual store because redux-mock-store does not execute actions
    const store = configureStore(mockState);
    mockRequestRevealSeedWords.mockResolvedValueOnce('test srp');
    const { queryByTestId, queryByText } = renderWithProvider(
      <div>
        <Modal />
        <RevealSeedPage />
      </div>,
      store,
    );

    const nextButton = queryByText('Next');

    fireEvent.change(queryByTestId('input-password'), {
      target: { value: 'password' },
    });

    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockRequestRevealSeedWords).toHaveBeenCalled();
      expect(queryByText('Keep your SRP safe')).toBeInTheDocument();
    });
  });

  it('recognizes when correct password is entered', async () => {
    const store = configureStore(mockState);
    mockRequestRevealSeedWords
      .mockRejectedValueOnce('incorrect password')
      .mockResolvedValueOnce('test srp');

    const { queryByTestId, queryByText, getByText, queryByLabelText } =
      renderWithProvider(
        <div>
          <Modal />
          <RevealSeedPage />
        </div>,
        store,
      );

    fireEvent.change(queryByTestId('input-password'), {
      target: { value: 'bad-password' },
    });

    fireEvent.click(queryByText('Next'));

    await waitFor(() => {
      expect(mockRequestRevealSeedWords).toHaveBeenCalled();
    });

    fireEvent.change(queryByTestId('input-password'), {
      target: { value: 'password' },
    });

    fireEvent.click(queryByText('Next'));

    await waitFor(() => {
      expect(queryByText('Keep your SRP safe')).toBeInTheDocument();
    });

    const holdButton = getByText('Hold to reveal SRP');
    const circleLocked = queryByLabelText('hold to reveal circle locked');

    fireEvent.pointerDown(holdButton);
    fireEvent.transitionEnd(circleLocked);

    const circleUnlocked = queryByLabelText('hold to reveal circle unlocked');
    fireEvent.animationEnd(circleUnlocked);

    await waitFor(() => {
      expect(holdButton.firstChild).toHaveClass(
        'hold-to-reveal-button__icon-container',
      );
      // tests that the mock srp is now shown.
      expect(getByText('test srp')).toBeInTheDocument();
    });

    // completed hold click
    const qrTab = getByText('QR');
    const textTab = getByText('Text');
  });

  it('can click cancel', async () => {
    mockRequestRevealSeedWords
      .mockRejectedValueOnce('incorrect password')
      .mockResolvedValueOnce('test srp');
    const { queryByText } = renderWithProvider(<RevealSeedPage />, mockStore);

    const cancelButton = queryByText('Cancel');
    fireEvent.click(cancelButton);
  });
});
