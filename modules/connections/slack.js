'use strict';

let botkit = require('botkit');

module.exports = (playlist, emojiPicker, credentials) => {
    let controller = botkit.slackbot();
    let bot;
    let admins = [];

    let slack = {
        init: () => {
            return new Promise((resolve) => {
                bot = controller.spawn({
                    token: credentials.get('slackToken')
                });

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
                            res += `\n  #${i + 1} "${playlist.queue[i].name}"`;
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
                    let responded = false;
                    admins.forEach((admin) => {
                        if (message.user === admin.id) {
                            console.log(message.match);
                            message.match.forEach((match) => {
                                bot.reply(message, `I've ${match}`);
                            });
                            responded = true;
                        }
                    });
                });

                resolve();
            });
        },
        start: () => {
            return new Promise((resolve, reject) => {
                bot.startRTM((err, bot, payload) => {
                    if (err) {
                        reject(new Error('Could not connect to Slack'));
                    } else {
                        console.log('Connected to Slack');
                        payload.users.forEach((user) => {
                            if (user.is_admin) {
                                admins.push(user);
                            }
                        });
                        resolve();
                    }
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
