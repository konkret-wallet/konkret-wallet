import { rpcErrors } from '@metamask/rpc-errors';
import { MESSAGE_TYPE } from '../../../../../shared/constants/app';

const requestEthereumAccounts = {
  methodNames: [MESSAGE_TYPE.ETH_REQUEST_ACCOUNTS],
  implementation: requestEthereumAccountsHandler,
  hookNames: {
    getAccounts: true,
    getUnlockPromise: true,
    metamaskState: true,
    requestCaip25ApprovalForOrigin: true,
    grantPermissionsForOrigin: true,
  },
};
export default requestEthereumAccounts;

// Used to rate-limit pending requests to one per origin
const locks = new Set();

/**
 * This method attempts to retrieve the Ethereum accounts available to the
 * requester, or initiate a request for account access if none are currently
 * available. It is essentially a wrapper of wallet_requestPermissions that
 * only errors if the user rejects the request. We maintain the method for
 * backwards compatibility reasons.
 *
 * @param req - The JsonRpcEngine request
 * @param res - The JsonRpcEngine result object
 * @param _next - JsonRpcEngine next() callback - unused
 * @param end - JsonRpcEngine end() callback
 * @param options - Method hooks passed to the method implementation
 * @param options.getAccounts - A hook that returns the permitted eth accounts for the origin sorted by lastSelected.
 * @param options.getUnlockPromise - A hook that resolves when the wallet is unlocked.
 * @param options.metamaskState - The MetaMask app state.
 * @param options.requestCaip25ApprovalForOrigin - A hook that requests approval for the CAIP-25 permission for the origin.
 * @param options.grantPermissionsForOrigin - A hook that grants permission for the approved permissions for the origin.
 * @returns A promise that resolves to nothing
 */
async function requestEthereumAccountsHandler(
  req,
  res,
  _next,
  end,
  {
    getAccounts,
    getUnlockPromise,
    // eslint-disable-next-line no-unused-vars
    metamaskState,
    requestCaip25ApprovalForOrigin,
    grantPermissionsForOrigin,
  },
) {
  const { origin } = req;
  if (locks.has(origin)) {
    res.error = rpcErrors.resourceUnavailable(
      `Already processing ${MESSAGE_TYPE.ETH_REQUEST_ACCOUNTS}. Please wait.`,
    );
    return end();
  }

  let ethAccounts = getAccounts({ ignoreLock: true });
  if (ethAccounts.length > 0) {
    // We wait for the extension to unlock in this case only, because permission
    // requests are handled when the extension is unlocked, regardless of the
    // lock state when they were received.
    try {
      locks.add(origin);
      await getUnlockPromise(true);
      res.result = ethAccounts;
      end();
    } catch (error) {
      end(error);
    } finally {
      locks.delete(origin);
    }
    return undefined;
  }

  try {
    const caip25Approval = await requestCaip25ApprovalForOrigin();
    await grantPermissionsForOrigin(caip25Approval);
  } catch (error) {
    return end(error);
  }

  // We cannot derive ethAccounts directly from the CAIP-25 permission
  // because the accounts will not be in order of lastSelected
  ethAccounts = getAccounts({ ignoreLock: true });

  res.result = ethAccounts;
  return end();
}
