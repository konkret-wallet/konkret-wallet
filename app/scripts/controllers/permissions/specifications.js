import {
  caveatSpecifications as snapsCaveatsSpecifications,
  endowmentCaveatSpecifications as snapsEndowmentCaveatSpecifications,
} from '@metamask/snaps-rpc-methods';
import {
  createCaip25Caveat,
  Caip25CaveatType,
  caip25EndowmentBuilder,
  caip25CaveatBuilder,
} from '@metamask/multichain';
import {
  EndowmentTypes,
  RestrictedMethods,
} from '../../../../shared/constants/permissions';

/**
 * This file contains the specifications of the permissions and caveats
 * that are recognized by our permission system. See the PermissionController
 * README in @metamask/controllers for details.
 */

/**
 * The "keys" of all of permissions recognized by the PermissionController.
 * Permission keys and names have distinct meanings in the permission system.
 */
export const PermissionNames = Object.freeze({
  ...RestrictedMethods,
  ...EndowmentTypes,
});

/**
 * Factory functions for all caveat types recognized by the
 * PermissionController.
 */
export const CaveatFactories = Object.freeze({
  [Caip25CaveatType]: createCaip25Caveat,
});

/**
 * Gets the specifications for all caveats that will be recognized by the
 * PermissionController.
 *
 * @param options - The options object.
 * @param options.listAccounts - A function that returns the
 * `AccountsController` internalAccount objects for all evm accounts.
 * @param options.findNetworkClientIdByChainId - A function that
 * returns the networkClientId given a chainId.
 * @returns the caveat specifications to construct the PermissionController.
 */
export const getCaveatSpecifications = ({
  listAccounts,
  findNetworkClientIdByChainId,
}) => {
  return {
    [Caip25CaveatType]: caip25CaveatBuilder({
      listAccounts,
      findNetworkClientIdByChainId,
    }),
    ...snapsCaveatsSpecifications,
    ...snapsEndowmentCaveatSpecifications,
  };
};

/**
 * Gets the specifications for all permissions that will be recognized by the
 * PermissionController.
 *
 * @returns the permission specifications to construct the PermissionController.
 */
export const getPermissionSpecifications = () => {
  return {
    [caip25EndowmentBuilder.targetName]:
      caip25EndowmentBuilder.specificationBuilder({}),
  };
};

/**
 * Unrestricted methods for Ethereum, see {@link unrestrictedMethods} for more details.
 */
export const unrestrictedEthSigningMethods = Object.freeze([
  'eth_sendRawTransaction',
  'eth_sendTransaction',
  'eth_signTypedData',
  'eth_signTypedData_v1',
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',
]);

/**
 * All unrestricted methods recognized by the PermissionController.
 * Unrestricted methods are ignored by the permission system, but every
 * JSON-RPC request seen by the permission system must correspond to a
 * restricted or unrestricted method, or the request will be rejected with a
 * "method not found" error.
 */
export const unrestrictedMethods = Object.freeze([
  'eth_blockNumber',
  'eth_call',
  'eth_chainId',
  'eth_coinbase',
  'eth_decrypt',
  'eth_estimateGas',
  'eth_feeHistory',
  'eth_gasPrice',
  'eth_getBalance',
  'eth_getBlockByHash',
  'eth_getBlockByNumber',
  'eth_getBlockTransactionCountByHash',
  'eth_getBlockTransactionCountByNumber',
  'eth_getCode',
  'eth_getEncryptionPublicKey',
  'eth_getFilterChanges',
  'eth_getFilterLogs',
  'eth_getLogs',
  'eth_getProof',
  'eth_getStorageAt',
  'eth_getTransactionByBlockHashAndIndex',
  'eth_getTransactionByBlockNumberAndIndex',
  'eth_getTransactionByHash',
  'eth_getTransactionCount',
  'eth_getTransactionReceipt',
  'eth_getUncleByBlockHashAndIndex',
  'eth_getUncleByBlockNumberAndIndex',
  'eth_getUncleCountByBlockHash',
  'eth_getUncleCountByBlockNumber',
  'eth_getWork',
  'eth_hashrate',
  'eth_mining',
  'eth_newBlockFilter',
  'eth_newFilter',
  'eth_newPendingTransactionFilter',
  'eth_protocolVersion',
  'eth_requestAccounts',
  'eth_sendRawTransaction',
  'eth_sendTransaction',
  'eth_signTypedData',
  'eth_signTypedData_v1',
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',
  'eth_submitHashrate',
  'eth_submitWork',
  'eth_subscribe',
  'eth_syncing',
  'eth_uninstallFilter',
  'eth_unsubscribe',
  'metamask_getProviderState',
  'metamask_logWeb3ShimUsage',
  'metamask_sendDomainMetadata',
  'metamask_watchAsset',
  'net_listening',
  'net_peerCount',
  'net_version',
  'personal_ecRecover',
  'personal_sign',
  'wallet_addEthereumChain',
  'wallet_getPermissions',
  'wallet_requestPermissions',
  'wallet_revokePermissions',
  'wallet_registerOnboarding',
  'wallet_switchEthereumChain',
  'wallet_watchAsset',
  'web3_clientVersion',
  'web3_sha3',
  'wallet_getAllSnaps',
  'wallet_getSnaps',
  'wallet_requestSnaps',
  'wallet_invokeSnap',
  'wallet_invokeKeyring',
  'snap_getClientStatus',
  'snap_getCurrencyRate',
  'snap_clearState',
  'snap_getFile',
  'snap_getState',
  'snap_listEntropySources',
  'snap_createInterface',
  'snap_updateInterface',
  'snap_getInterfaceState',
  'snap_getInterfaceContext',
  'snap_resolveInterface',
  'snap_setState',
  'snap_scheduleBackgroundEvent',
  'snap_cancelBackgroundEvent',
  'snap_getBackgroundEvents',
  'snap_experimentalProviderRequest',
]);

/**
 * Validates the accounts associated with a caveat. In essence, ensures that
 * the accounts value is an array of non-empty strings, and that each string
 * corresponds to a PreferencesController identity.
 *
 * @param {string[]} accounts - The accounts associated with the caveat.
 * @param {() => Record<string, import('@metamask/keyring-internal-api').InternalAccount>} getInternalAccounts -
 * Gets all AccountsController InternalAccounts.
 * TODO: Remove this function once the CAIP-25 permission refactor/factory differ work is merged into main
 */
export function validateCaveatAccounts(accounts, getInternalAccounts) {
  if (!Array.isArray(accounts) || accounts.length === 0) {
    throw new Error(
      `${PermissionNames.eth_accounts} error: Expected non-empty array of Ethereum addresses.`,
    );
  }

  const internalAccounts = getInternalAccounts();
  accounts.forEach((address) => {
    if (!address || typeof address !== 'string') {
      throw new Error(
        `${PermissionNames.eth_accounts} error: Expected an array of Ethereum addresses. Received: "${address}".`,
      );
    }

    if (
      !internalAccounts.some(
        (internalAccount) =>
          internalAccount.address.toLowerCase() === address.toLowerCase(),
      )
    ) {
      throw new Error(
        `${PermissionNames.eth_accounts} error: Received unrecognized address: "${address}".`,
      );
    }
  });
}

/**
 * Validates the networks associated with a caveat. Ensures that
 * the networks value is an array of valid chain IDs.
 *
 * @param {string[]} chainIdsForCaveat - The list of chain IDs to validate.
 * @param {function(string): string} findNetworkClientIdByChainId - Function to find network client ID by chain ID.
 * @throws {Error} If the chainIdsForCaveat is not a non-empty array of valid chain IDs.
 * TODO: Remove this function once the CAIP-25 permission refactor/factory differ work is merged into main
 */
export function validateCaveatNetworks(
  chainIdsForCaveat,
  findNetworkClientIdByChainId,
) {
  if (!Array.isArray(chainIdsForCaveat) || chainIdsForCaveat.length === 0) {
    throw new Error(
      `${PermissionNames.permittedChains} error: Expected non-empty array of chainIds.`,
    );
  }

  chainIdsForCaveat.forEach((chainId) => {
    try {
      findNetworkClientIdByChainId(chainId);
    } catch (e) {
      console.error(e);
      throw new Error(
        `${PermissionNames.permittedChains} error: Received unrecognized chainId: "${chainId}". Please try adding the network first via wallet_addEthereumChain.`,
      );
    }
  });
}
