import React from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithProvider } from '../../../../test/jest/rendering';
import mockState from '../../../../test/data/mock-state.json';
import InfoTab from '.';

describe('InfoTab', () => {
  const mockStore = configureMockStore([thunk])(mockState);
  describe('validate links', () => {
    let getByText: (text: string) => HTMLElement;
    let getByTestId: (testId: string) => HTMLElement;

    beforeEach(() => {
      const renderResult = renderWithProvider(<InfoTab />, mockStore);
      getByText = renderResult.getByText;
      getByTestId = renderResult.getByTestId;
    });

    it('should have correct href for "Attributions" link', () => {
      const attributionsLink = getByText('Attributions');
      expect(attributionsLink).toHaveAttribute(
        'href',
        `https://raw.githubusercontent.com/MetaMask/metamask-extension/vMOCK_VERSION/attribution.txt`,
      );
    });
  });
});
