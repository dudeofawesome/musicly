'use strict';

const database = require('./services/database');
const credentials = require('./services/credentials')(database);
const convert = require('./services/convert');
const playbackControl = require('./services/playback_control');
const playlist = require('./services/playlist')(convert, playbackControl, credentials);

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const admin = require('./services/admin')(express, app, credentials);

const connections = {
    messenger: require('./services/connections/messenger')(playlist, credentials),
    slack: require('./services/connections/slack')(playlist, credentials),
    web: require('./services/connections/web')(express, app, playlist)
};

Promise.all([
    database.init(),
    admin.init(),
    playlist.init(),
    connections.slack.init(),
    connections.web.init()
]).then(() => {
    database.start().then(() => {
        Promise.all([
            admin.start(),
            playlist.start(),
            connections.slack.start(),
            connections.web.start()
        ]);
        app.listen(process.env.PORT || 8080);
    });
});
