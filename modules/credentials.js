'use strict';

var localCredentials;
try {
    localCredentials = require('./local_credentials');
} catch (err) {}

module.exports = (database) => {
    let credentials = {
        get: (service) => {
            return new Promise((resolve, reject) => {
                if (localCredentials && localCredentials[service]) {
                    resolve(localCredentials[service]);
                } else if (process.env[service.toUpperCase()]) {
                    resolve(process.env[service.toUpperCase()]);
                } else {
                    database.getToken(service).then((token) => {
                        resolve(token);
                    }).catch(() => {
                        reject();
                    });
                }
            });
        },
        set: (service, token) => {
            return new Promise((resolve, reject) => {
                if (localCredentials || process.env[service.toUpperCase()]) {
                    if (localCredentials) {
                        localCredentials[service] = token;
                    } else {
                        process.env[service.toUpperCase()] = token;
                    }
                    resolve();
                } else {
                    database.setToken(service, token).then(() => {
                        console.log(`Stored token for ${service}`);
                        resolve(`Stored token for ${service}`);
                    }).catch(() => {
                        reject();
                    });
                }
            });
        }
    };

    return credentials;
};
