import isString from 'lodash/isString';
import { Client as CoreClient, KinveyError, isDefined, Log } from 'kinvey-js-sdk/dist/export';
let storage = Ti.App.Properties;

class ActiveUserStorage {
  get(key) {
    if (!isString(key)) {
      throw new KinveyError('ActiveUserStorage key must be a string.');
    }

    try {
      return JSON.parse(storage.getString(key));
    } catch (e) {
      Log.debug('Unable to parse stored active user.', e);
      return null;
    }
  }

  set(key, value) {
    if (!isString(key)) {
      throw new KinveyError('ActiveUserStorage key must be a string.');
    }

    if (isDefined(value)) {
      storage.setString(key, JSON.stringify(value));
    } else {
      storage.removeProperty(key);
    }

    return value;
  }
}

export class Client extends CoreClient {
  static init(config) {
    const client = CoreClient.init(config);

    if (isDefined(client.encryptionKey)) {
      try {
        // eslint-disable-next-line
        const securely = require('bencoding.securely');
        storage = securely.createProperties({
          secret: client.encryptionKey
        });
      } catch (e) {
        Log.debug('Unable to require the bencoding.securely module.', e);
      }
    }

    client.activeUserStorage = new ActiveUserStorage();
    return client;
  }
}
