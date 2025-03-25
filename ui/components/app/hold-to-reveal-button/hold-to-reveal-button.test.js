import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import configureMockState from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithProvider } from '../../../../test/lib/render-helpers';
import mockState from '../../../../test/data/mock-state.json';
import HoldToRevealButton from './hold-to-reveal-button';

describe('HoldToRevealButton', () => {
  const mockStore = configureMockState([thunk])(mockState);
  let props = {};

  beforeEach(() => {
    const mockOnLongPressed = jest.fn();

    props = {
      onLongPressed: mockOnLongPressed,
      buttonText: 'Hold to reveal SRP',
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render a button with label', () => {
    const { getByText } = render(<HoldToRevealButton {...props} />);

    expect(getByText('Hold to reveal SRP')).toBeInTheDocument();
  });

  it('should render a button when mouse is down and up', () => {
    const { getByText } = render(<HoldToRevealButton {...props} />);

    const button = getByText('Hold to reveal SRP');

    fireEvent.mouseDown(button);

    expect(button).toBeDefined();

    fireEvent.mouseUp(button);

    expect(button).toBeDefined();
  });

  it('should show the locked padlock when a button is long pressed and then should show it after it was lifted off before the animation concludes', async () => {
    const { getByText, queryByLabelText } = renderWithProvider(
      <HoldToRevealButton {...props} />,
      mockStore,
    );

    const button = getByText('Hold to reveal SRP');

    fireEvent.mouseDown(button);
    const circleLocked = queryByLabelText('hold to reveal circle locked');

    await waitFor(() => {
      expect(circleLocked).toBeInTheDocument();
    });

    fireEvent.mouseUp(button);
    const circleUnlocked = queryByLabelText('hold to reveal circle unlocked');

    await waitFor(() => {
      expect(circleUnlocked).not.toBeInTheDocument();
    });
  });

  it('should show the unlocked padlock when a button is long pressed for the duration of the animation', async () => {
    const { getByText, queryByLabelText, getByLabelText } = renderWithProvider(
      <HoldToRevealButton {...props} />,
      mockStore,
    );

    const button = getByText('Hold to reveal SRP');

    fireEvent.pointerDown(button);

    const circleLocked = getByLabelText('hold to reveal circle locked');
    fireEvent.transitionEnd(circleLocked);

    const circleUnlocked = queryByLabelText('hold to reveal circle unlocked');
    fireEvent.animationEnd(circleUnlocked);

    await waitFor(() => {
      expect(circleUnlocked).toBeInTheDocument();
    });
  });
});
