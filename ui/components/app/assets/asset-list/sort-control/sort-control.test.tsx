import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { setTokenSortConfig } from '../../../../../store/actions';
import { renderWithProvider } from '../../../../../../test/lib/render-helpers';
import { MetaMetricsContext } from '../../../../../contexts/metametrics';
import { getPreferences } from '../../../../../selectors';
import { getCurrentCurrency } from '../../../../../ducks/metamask/metamask';
import SortControl from './sort-control';

// Mock the sortAssets utility
jest.mock('../../util/sort', () => ({
  sortAssets: jest.fn(() => []), // mock sorting implementation
}));

// Mock the setTokenSortConfig action creator
jest.mock('../../../../../store/actions', () => ({
  setTokenSortConfig: jest.fn(),
}));

// Mock the dispatch function
const mockDispatch = jest.fn();

jest.mock('react-redux', () => {
  const actual = jest.requireActual('react-redux');
  return {
    ...actual,
    useSelector: jest.fn(),
    useDispatch: () => mockDispatch,
  };
});

const mockHandleClose = jest.fn();

describe('SortControl', () => {
  const renderComponent = () => {
    (useSelector as jest.Mock).mockImplementation((selector) => {
      if (selector === getPreferences) {
        return {
          key: 'tokenFiatAmount',
          sortCallback: 'stringNumeric',
          order: 'dsc',
        };
      }
      if (selector === getCurrentCurrency) {
        return 'usd';
      }
      return undefined;
    });

    return renderWithProvider(<SortControl handleClose={mockHandleClose} />);
  };

  beforeEach(() => {
    mockDispatch.mockClear();
    (setTokenSortConfig as jest.Mock).mockClear();
  });

  it('renders correctly', () => {
    renderComponent();

    expect(screen.getByTestId('sortByAlphabetically')).toBeInTheDocument();
    expect(screen.getByTestId('sortByDecliningBalance')).toBeInTheDocument();
  });

  it('dispatches setTokenSortConfig with expected config when Alphabetically is clicked', () => {
    renderComponent();

    const alphabeticallyButton = screen.getByTestId(
      'sortByAlphabetically__button',
    );
    fireEvent.click(alphabeticallyButton);

    expect(mockDispatch).toHaveBeenCalled();
    expect(setTokenSortConfig).toHaveBeenCalledWith({
      key: 'symbol',
      sortCallback: 'alphaNumeric',
      order: 'asc',
    });
  });

  it('dispatches setTokenSortConfig with expected config when Declining balance is clicked', () => {
    renderComponent();

    const decliningBalanceButton = screen.getByTestId(
      'sortByDecliningBalance__button',
    );
    fireEvent.click(decliningBalanceButton);

    expect(mockDispatch).toHaveBeenCalled();
    expect(setTokenSortConfig).toHaveBeenCalledWith({
      key: 'tokenFiatAmount',
      sortCallback: 'stringNumeric',
      order: 'dsc',
    });
  });
});
