'use strict';

module.exports = (express, app, credentials) => {
    let admin = {
        init: () => {
            return new Promise((resolve, reject) => {
                app.use(express.static(`${__dirname}/pages`));

                // "@musicly https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                app.post('/api/admin/credentials', (req, res) => {
                    credentials.set(req.body.service.toLowerCase(), req.body.token).then((res) => {
                        res.send(res);
                    }).catch((err) => {
                        res.send(err);
                    });
                });

                resolve();
            });
        },
        start: () => {
            return new Promise((resolve, reject) => {
                console.log('Admin web app ready');
                resolve();
            });
        },
        stop: () => {
            return new Promise((resolve, reject) => {
                resolve();
            });
        }
    };

    return admin;
};
