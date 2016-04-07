'use strict';

var database = require('./modules/database');
var credentials = require('./modules/credentials')(database);
var emojiPicker = require('./modules/emojiPicker');
var convert = require('./modules/convert');
var playbackControl = require('./modules/playback_control');
var playlist = require('./modules/playlist')(emojiPicker, convert, playbackControl, credentials);

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var admin = require('./modules/admin')(express, app, credentials);

var connections = {
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
