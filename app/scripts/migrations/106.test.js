import { migrate } from './106';

describe('migration #106', () => {
  it('should update the version metadata', async () => {
    const oldStorage = {
      meta: {
        version: 105,
      },
      data: {},
    };

    const newStorage = await migrate(oldStorage);
    expect(newStorage.meta).toStrictEqual({
      version: 106,
    });
  });

  it('should preserve other PreferencesController state', async () => {
    const oldStorage = {
      meta: {
        version: 105,
      },
      data: {
        PreferencesController: {
          currentLocale: 'en',
          dismissSeedBackUpReminder: false,
          ipfsGateway: 'dweb.link',
          openSeaEnabled: false,
          useTokenDetection: false,
        },
      },
    };

    const newStorage = await migrate(oldStorage);
    expect(newStorage).toStrictEqual({
      meta: {
        version: 106,
      },
      data: {
        PreferencesController: {
          currentLocale: 'en',
          dismissSeedBackUpReminder: false,
          ipfsGateway: 'dweb.link',
          openSeaEnabled: false,
          useTokenDetection: false,
        },
      },
    });
  });

  it('should not change state in controllers other than PreferencesController', async () => {
    const oldStorage = {
      meta: {
        version: 105,
      },
      data: {
        PreferencesController: {
          ipfsGateway: 'foo.local',
        },
        data: {
          FooController: { a: 'b' },
        },
      },
    };

    const newStorage = await migrate(oldStorage);
    expect(newStorage).toStrictEqual({
      meta: {
        version: 106,
      },
      data: {
        PreferencesController: {
          ipfsGateway: 'foo.local',
        },
        data: {
          FooController: { a: 'b' },
        },
      },
    });
  });
});
