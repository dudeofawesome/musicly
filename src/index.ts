'use strict';

const database = require('./modules/database');
const credentials = require('./modules/credentials')(database);
const emojiPicker = require('./modules/emojiPicker');
const convert = require('./modules/convert');
const playbackControl = require('./modules/playback_control');
const playlist = require('./modules/playlist')(emojiPicker, convert, playbackControl, credentials);

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const admin = require('./modules/admin')(express, app, credentials);

const connections = {
    messenger: require('./modules/connections/messenger')(playlist, emojiPicker, credentials),
    slack: require('./modules/connections/slack')(playlist, emojiPicker, credentials),
    web: require('./modules/connections/web')(express, app, emojiPicker, playlist)
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
