///: BEGIN:ONLY_INCLUDE_IF(build-flask)
// TODO: Remove restricted import
// eslint-disable-next-line import/no-restricted-paths
import flaskJson from '../../../app/build-types/flask/images/flask-mascot.json';
///: END:ONLY_INCLUDE_IF

const assetList = {
  main: {
    foxMeshJson: undefined,
  },
  ///: BEGIN:ONLY_INCLUDE_IF(build-beta)
  beta: {
    foxMeshJson: undefined,
  },
  ///: END:ONLY_INCLUDE_IF
  ///: BEGIN:ONLY_INCLUDE_IF(build-flask)
  flask: {
    foxMeshJson: flaskJson,
  },
  ///: END:ONLY_INCLUDE_IF
};

export function isBeta() {
  return process.env.METAMASK_BUILD_TYPE === 'beta';
}

export function isFlask() {
  return process.env.METAMASK_BUILD_TYPE === 'flask';
}

// Returns a specific version of an asset based on
// the current metamask version (i.e. main, beta, etc.)
export function getBuildSpecificAsset(assetName) {
  const buildType = process.env.METAMASK_BUILD_TYPE;
  if (
    !assetList[buildType] ||
    !Object.keys(assetList[buildType]).includes(assetName)
  ) {
    console.error(
      `Cannot find asset "${assetName}" for build "${buildType}", returning main build asset.`,
    );
    return assetList.main[assetName];
  }
  return assetList[buildType][assetName];
}
