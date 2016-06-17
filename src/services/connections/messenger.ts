'use strict';

let botkit = require('botkit');

module.exports = (playlist, emojiPicker, credentials) => {
    let controller = botkit.facebookbot({
        debug: true,
        access_token: 'asdf',
        verify_token: 'asdf'
    });
    let bot;
    let admins = [];

    let slack = {
        init: () => {
            return new Promise((resolve) => {
                // "What is the next song?"
                controller.hears([/what.*next.*(list|song|queue)/i], ['direct_message', 'direct_mention', 'mention', 'mention', 'ambient'], (bot, message) => {
                    console.log(JSON.stringify(message));
                    let res = `It doesn't look like there are any songs in the queue`;
                    if (playlist.queue && playlist.queue.length > 1) {
                        res = `The next song will be "${playlist.queue[1].name}"`;
                    }
                    bot.reply(message, res);
                });

                // "What songs are in the playlist?"
                controller.hears([/what.*(list|song|queue)/i], ['direct_message', 'direct_mention', 'mention', 'mention', 'ambient'], (bot, message) => {
                    console.log(JSON.stringify(message));
                    let res = 'Playlist: ';
                    if (!playlist.queue || playlist.queue.length <= 0) {
                        res = 'The playlist appears to be empty\n' +
                                'You can be the first ' + emojiPicker('happy') + ' just send me a link';
                    } else {
                        for (let i = 0; i < playlist.queue.length && i < 5; i++) {
                            res += `
  #${i + 1} "${playlist.queue[i].name}"`;
                        }
                    }
                    bot.reply(message, res);
                });

                // "How much time is left on the current song?"
                controller.hears([/time.*left.*song/i], ['direct_message', 'direct_mention', 'mention', 'mention', 'ambient'], (bot, message) => {
                    console.log(JSON.stringify(message));
                    let timeLeft = new Date(playlist.getRemainingTime());
                    let minutes = Math.round(timeLeft.getMinutes() + (timeLeft.getSeconds() / 60));
                    let res = `The current song has ${minutes} minutes left`;
                    if (playlist.queue.length === 0) {
                        res = 'It does\'t look like a song is playing right now!';
                    }
                    bot.reply(message, res);
                });

                // "@musicly https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                controller.hears([/((https?):\/\/)?([a-zA-Z0-9]+\.[a-zA-Z0-9])[a-zA-Z0-9\/\\?&_\-#.=]*\w/ig], ['direct_message', 'direct_mention', 'mention', 'mention'], (bot, message) => {
                    console.log(JSON.stringify(message));
                    playlist.interpretLink(message.match[0]).then((res) => {
                        playlist.addSong(res.link);
                        console.log('RESPONSE: ' + res.response);
                        bot.reply(message, res.response);
                    }).catch((response) => {
                        bot.reply(message, response);
                    });
                });

                // "@musicly Thank you"
                controller.hears(['thank'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
                    console.log(JSON.stringify(message));
                    bot.reply(message, 'You\'re welcome!');
                });

                // "@musicly set this to that"
                controller.hears([/set.*to.*/i, /turn.*(on|off)/i], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
                    console.log(JSON.stringify(message));
                    admins.forEach((admin) => {
                        if (message.user === admin.id) {
                            console.log(message.match);
                            message.match.forEach((match) => {
                                let key = '';
                                let value = '';
                                if (match.includes('to')) {
                                    let splitMatch = match.split(' to ');
                                    key = splitMatch[0];
                                    let splitKey = key.split(' ');
                                    key = splitKey[splitKey.length - 1];
                                    value = splitMatch[1].split(' ')[0];
                                } else if (match.includes('turn')) {
                                    let splitMatch = match.split('turn ');
                                    key = splitMatch[splitMatch.length - 1];
                                    value = match.includes('on');
                                }
                                credentials.set(key, value).then(() => {
                                    bot.reply(message, `I've set ${key} to ${value}`);
                                });
                            });
                        }
                    });
                });

                // "@musicly set this to that"
                controller.hears([/skip.*song/i], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
                    console.log(JSON.stringify(message));
                    admins.forEach((admin) => {
                        if (message.user === admin.id) {
                            playlist.skipSong();
                            bot.reply(message, 'Alright, skipped!');
                        }
                    });
                });

                resolve();
            });
        },
        start: () => {
            return new Promise((resolve, reject) => {
                credentials.get('slack').then(() => {
                    bot = controller.spawn({});

                    controller.setupWebserver(process.env.PORT || 3000, function (err, webserver) {
                        controller.createWebhookEndpoints(webserver, bot, function () {
                            console.log('ONLINE!');
                            // if (ops.lt) {
                            //     var tunnel = localtunnel(process.env.port || 3000, {subdomain: ops.ltsubdomain}, function (err, tunnel) {
                            //         if (err) {
                            //             console.log(err);
                            //             process.exit();
                            //         }
                            //         console.log('Your bot is available on the web at the following URL: ' + tunnel.url + '/facebook/receive');
                            //     });
                            //
                            //     tunnel.on('close', function () {
                            //         console.log('Your bot is no longer available on the web at the localtunnnel.me URL.');
                            //         process.exit();
                            //     });
                            // }

                            resolve();
                        });
                    });
                });
            });
        },
        stop: () => {
            return new Promise((resolve) => {
                bot.closeRTM();
                resolve();
            });
        }
    };

    return slack;
};
