'use strict';

let botkit = require('botkit');
let controller = botkit.slackbot();
let bot;

module.exports = (playlist, emojiPicker, credentials) => {
    let slack = {
        init: () => {
            return new Promise((resolve, reject) => {
                bot = controller.spawn({
                    token: credentials.slackToken
                });

                // "What is the next song?"
                controller.hears([/what.*next.*(list|song|queue)/], ['direct_message', 'direct_mention', 'mention', 'ambient'], (bot, message) => {
                    console.log(JSON.stringify(message));
                    let res = `It doesn't look like there are any songs in the queue`;
                    if (playlist.queue && playlist.queue.length > 1) {
                        res = `The next song will be "${playlist.queue[1].name}"`;
                    }
                    bot.reply(message, res);
                });

                // "What songs are in the playlist?"
                controller.hears([/what.*(list|song|queue)/], ['direct_message', 'direct_mention', 'mention', 'ambient'], (bot, message) => {
                    console.log(JSON.stringify(message));
                    let res = 'Playlist: ';
                    if (!playlist.queue || playlist.queue.length <= 0) {
                        res = 'The playlist appears to be empty\n' +
                                'You can be the first ' + emojiPicker('happy') + ' just send me a link';
                    } else {
                        for (let i = 0; i < playlist.queue.length && i < 5; i++) {
                            res += `\n  #${i + 1} "${playlist.queue[i].name}"`;
                        }
                    }
                    bot.reply(message, res);
                });

                // "How much time is left on the current song?"
                controller.hears([/time.*left.*song/], ['direct_message', 'direct_mention', 'mention', 'ambient'], (bot, message) => {
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
                controller.hears([/((https?):\/\/)?([a-zA-Z0-9]+\.[a-zA-Z0-9])[a-zA-Z0-9\/\\?&#.=]*\w/g], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
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
                controller.hears(['thank'], ['direct_message', 'direct_mention'], (bot, message) => {
                    console.log(JSON.stringify(message));
                    bot.reply(message, 'You\'re welcome!');
                });

                resolve();
            });
        },
        start: () => {
            return new Promise((resolve, reject) => {
                bot.startRTM((err, bot, payload) => {
                    if (err) {
                        throw new Error('Could not connect to Slack');
                        reject();
                    } else {
                        console.log('Connected to Slack');
                        resolve();
                    }
                });
            });
        },
        stop: () => {
            return new Promise((resolve, reject) => {
                resolve();
            });
        }
    };

    return slack;
};
