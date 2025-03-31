export function getPortfolioUrl(endpoint = '', accountAddress, tab) {
  const baseUrl = process.env.PORTFOLIO_URL || '';
  const url = new URL(endpoint, baseUrl);

  url.searchParams.append('metamaskEntry', '');
  url.searchParams.append('metametricsId', '');

  // Append privacy preferences for metrics + marketing on user navigation to Portfolio
  url.searchParams.append('metricsEnabled', 'false');
  url.searchParams.append('marketingEnabled', 'false');

  if (accountAddress) {
    url.searchParams.append('accountAddress', accountAddress);
  }

  if (tab) {
    url.searchParams.append('tab', tab);
  }

  return url.href;
}
