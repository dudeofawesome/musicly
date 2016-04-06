var request = require('request');

let remote = 'https://musicly.herokuapp.com';
let credentialCache = {};

module.exports = (app_token) => {
    let remoteCredentials = {
        get: (key) => {
            return new Promise((resolve, reject) => {
                if (app_token) {
                    if (credentialCache[key]) {
                        resolve(credentialCache[key]);
                    } else {
                        request.get(`${remote}/credentials?key=${key}&app=${app_token}`, (err, res, body) => {
                            if (!err) {
                                credentialCache[key] = body;
                                resolve(body);
                            } else {
                                reject(err);
                            }
                        });
                    }
                } else {
                    reject(new Error('app_token not set'));
                }
            });
        },
        set: (key, value) => {
            return new Promise((resolve, reject) => {
                if (app_token) {
                    request.post(`${remote}/credentials`, {form: {key: key, value: value, app: app_token}}, (err, res, body) => {
                        if (!err) {
                            credentialCache[key] = value;
                            resolve();
                        } else {
                            reject(err);
                        }
                    });
                } else {
                    reject(new Error('app_token not set'));
                }
            });
        }
    };

    return remoteCredentials;
};
