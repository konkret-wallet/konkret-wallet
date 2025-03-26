// Disabled to allow setting up initial state hooks first

// This import sets up safe intrinsics required for LavaDome to function securely.
// It must be run before any less trusted code so that no such code can undermine it.
import '@lavamoat/lavadome-react';

import '../../development/wdyr';

import PortStream from 'extension-port-stream';
import browser from 'webextension-polyfill';

import { StreamProvider } from '@metamask/providers';
import { createIdRemapMiddleware } from '@metamask/json-rpc-engine';
import log from 'loglevel';
// TODO: Remove restricted import
// eslint-disable-next-line import/no-restricted-paths
import launchMetaMaskUi, { updateBackgroundConnection } from '../../ui';
import {
  ENVIRONMENT_TYPE_FULLSCREEN,
  ENVIRONMENT_TYPE_POPUP,
} from '../../shared/constants/app';
import { isManifestV3 } from '../../shared/modules/mv3.utils';
import { checkForLastErrorAndLog } from '../../shared/modules/browser-runtime.utils';
import { SUPPORT_LINK } from '../../shared/lib/ui-utils';
import { getErrorHtml } from '../../shared/lib/error-utils';
import { endTrace, trace, TraceName } from '../../shared/lib/trace';
import ExtensionPlatform from './platforms/extension';
import { setupMultiplex } from './lib/stream-utils';
import { getEnvironmentType } from './lib/util';
import metaRPCClientFactory from './lib/metaRPCClientFactory';

const METHOD_START_UI_SYNC = 'startUISync';

const container = document.getElementById('app-content');

let extensionPort;
let isUIInitialised = false;

start().catch(log.error);

async function start() {
  const startTime = performance.now();

  const traceContext = trace({
    name: TraceName.UIStartup,
    startTime: performance.timeOrigin,
  });

  trace({
    name: TraceName.LoadScripts,
    startTime: performance.timeOrigin,
    parentContext: traceContext,
  });

  endTrace({
    name: TraceName.LoadScripts,
    timestamp: performance.timeOrigin + startTime,
  });

  // create platform global
  global.platform = new ExtensionPlatform();

  // identify window type (popup, notification)
  const windowType = getEnvironmentType();

  // setup stream to background
  extensionPort = browser.runtime.connect({ name: windowType });

  let connectionStream = new PortStream(extensionPort);

  const activeTab = await queryCurrentActiveTab(windowType);

  /*
   * In case of MV3 the issue of blank screen was very frequent, it is caused by UI initialising before background is ready to send state.
   * Code below ensures that UI is rendered only after "CONNECTION_READY" or "startUISync"
   * messages are received thus the background is ready, and ensures that streams and
   * phishing warning page load only after the "startUISync" message is received.
   * In case the UI is already rendered, only update the streams.
   */
  const messageListener = async (message) => {
    const method = message?.data?.method;

    if (method !== METHOD_START_UI_SYNC) {
      return;
    }

    endTrace({ name: TraceName.BackgroundConnect });

    if (isManifestV3 && isUIInitialised) {
      // Currently when service worker is revived we create new streams
      // in later version we might try to improve it by reviving same streams.
      updateUiStreams(connectionStream);
    } else {
      await initializeUiWithTab(
        activeTab,
        connectionStream,
        windowType,
        traceContext,
      );
    }

    if (!isManifestV3) {
      extensionPort.onMessage.removeListener(messageListener);
    }
  };

  if (isManifestV3) {
    // resetExtensionStreamAndListeners takes care to remove listeners from closed streams
    // it also creates new streams and attaches event listeners to them
    const resetExtensionStreamAndListeners = () => {
      extensionPort.onMessage.removeListener(messageListener);
      extensionPort.onDisconnect.removeListener(
        resetExtensionStreamAndListeners,
      );

      extensionPort = browser.runtime.connect({ name: windowType });
      connectionStream = new PortStream(extensionPort);
      extensionPort.onMessage.addListener(messageListener);
      extensionPort.onDisconnect.addListener(resetExtensionStreamAndListeners);
    };

    extensionPort.onDisconnect.addListener(resetExtensionStreamAndListeners);
  }

  trace({
    name: TraceName.BackgroundConnect,
    parentContext: traceContext,
  });

  extensionPort.onMessage.addListener(messageListener);
}

async function initializeUiWithTab(
  tab,
  connectionStream,
  windowType,
  traceContext,
) {
  try {
    const store = await initializeUi(tab, connectionStream, traceContext);

    endTrace({ name: TraceName.UIStartup });

    isUIInitialised = true;

    if (process.env.IN_TEST) {
      window.document?.documentElement?.classList.add('controller-loaded');
    }

    const state = store.getState();
    const { metamask: { completedOnboarding } = {} } = state;

    if (!completedOnboarding && windowType !== ENVIRONMENT_TYPE_FULLSCREEN) {
      global.platform.openExtensionInBrowser();
    }
  } catch (err) {
    displayCriticalError('troubleStarting', err);
  }
}

// Function to update new backgroundConnection in the UI
function updateUiStreams(connectionStream) {
  const backgroundConnection = connectToAccountManager(connectionStream);
  updateBackgroundConnection(backgroundConnection);
}

async function queryCurrentActiveTab(windowType) {
  // Shims the activeTab for E2E test runs only if the
  // "activeTabOrigin" querystring key=value is set
  if (process.env.IN_TEST) {
    const searchParams = new URLSearchParams(window.location.search);
    const mockUrl = searchParams.get('activeTabOrigin');
    if (mockUrl) {
      const { origin, protocol } = new URL(mockUrl);
      const returnUrl = {
        id: 'mock-site',
        title: 'Mock Site',
        url: mockUrl,
        origin,
        protocol,
      };
      return returnUrl;
    }
  }

  // At the time of writing we only have the `activeTab` permission which means
  // that this query will only succeed in the popup context (i.e. after a "browserAction")
  if (windowType !== ENVIRONMENT_TYPE_POPUP) {
    return {};
  }

  const tabs = await browser.tabs
    .query({ active: true, currentWindow: true })
    .catch((e) => {
      checkForLastErrorAndLog() || log.error(e);
    });

  const [activeTab] = tabs;
  const { id, title, url } = activeTab;
  const { origin, protocol } = url ? new URL(url) : {};

  if (!origin || origin === 'null') {
    return {};
  }

  return { id, title, origin, protocol, url };
}

async function initializeUi(activeTab, connectionStream, traceContext) {
  const backgroundConnection = connectToAccountManager(connectionStream);

  return await launchMetaMaskUi({
    activeTab,
    container,
    backgroundConnection,
    traceContext,
  });
}

async function displayCriticalError(errorKey, err, metamaskState) {
  const html = await getErrorHtml(errorKey, SUPPORT_LINK, metamaskState);

  container.innerHTML = html;

  const button = document.getElementById('critical-error-button');

  button?.addEventListener('click', (_) => {
    browser.runtime.reload();
  });

  log.error(err.stack);
  throw err;
}

/**
 * Establishes a connection to the background and a Web3 provider
 *
 * @param {PortDuplexStream} connectionStream - PortStream instance establishing a background connection
 */
function connectToAccountManager(connectionStream) {
  const mx = setupMultiplex(connectionStream);
  const controllerConnectionStream = mx.createStream('controller');

  const backgroundConnection = setupControllerConnection(
    controllerConnectionStream,
  );

  setupWeb3Connection(mx.createStream('provider'));

  return backgroundConnection;
}

/**
 * Establishes a streamed connection to a Web3 provider
 *
 * @param {PortDuplexStream} connectionStream - PortStream instance establishing a background connection
 */
function setupWeb3Connection(connectionStream) {
  const providerStream = new StreamProvider(connectionStream, {
    rpcMiddleware: [createIdRemapMiddleware()],
  });
  connectionStream.on('error', console.error.bind(console));
  providerStream.on('error', console.error.bind(console));
  providerStream.initialize().then(() => {
    global.ethereumProvider = providerStream;
  });
}

/**
 * Establishes a streamed connection to the background account manager
 *
 * @param {PortDuplexStream} controllerConnectionStream - PortStream instance establishing a background connection
 */
function setupControllerConnection(controllerConnectionStream) {
  return metaRPCClientFactory(controllerConnectionStream);
}
