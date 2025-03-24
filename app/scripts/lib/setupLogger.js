// custom: this is standing in for setupSentry.js
import { createModuleLogger, createProjectLogger } from '@metamask/utils';

const projectLogger = createProjectLogger('sentry');

export const log = createModuleLogger(
  projectLogger,
  globalThis.document ? 'ui' : 'background',
);
