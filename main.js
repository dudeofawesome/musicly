'use strict';

var credentials = require('./modules/credentials');
var emojiPicker = require('./modules/emojiPicker');
var convert = require('./modules/convert');
var osascriptCommands = require('./modules/osascript_commands');
var playlist = require('./modules/playlist')(emojiPicker, convert, osascriptCommands, credentials);

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var connections = {
    slack: require('./modules/connections/slack')(playlist, emojiPicker, credentials),
    web: require('./modules/connections/web')(express, app, emojiPicker, playlist)
};

Promise.all([
    connections.slack.init(),
    connections.web.init()
]).then(() => {
    Promise.all([
        connections.slack.start(),
        connections.web.start()
    ]);
    app.listen(process.env.PORT || 8081);
});
