var localCredentials;
try {
    localCredentials = require('./local_credentials');
} catch (err) {}
var remoteCredentials = require('./remote_credentials');

module.exports = {
    get: (key) => {
        return new Promise((resolve, reject) => {
            if (localCredentials && localCredentials[key]) {
                resolve(localCredentials[key]);
            } else if (process.env[key.toUpperCase()]) {
                resolve(process.env[key.toUpperCase()]);
            } else {
                remoteCredentials.get(key).then((value) => {
                    resolve(value);
                }).catch(() => {
                    reject();
                });
            }
        });
    },
    set: (key, value) => {
        return new Promise((resolve, reject) => {
            if (localCredentials || process.env[key.toUpperCase()]) {
                if (localCredentials) {
                    localCredentials[key] = value;
                } else {
                    process.env[key.toUpperCase()] = value;
                }
                resolve();
            } else {
                remoteCredentials.set(key, value).then(() => {
                    resolve();
                }).catch(() => {
                    reject();
                });
            }
        });
    }
};
