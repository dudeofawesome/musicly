'use strict';

module.exports = (express, app, emojiPicker, playlist) => {
    let web = {
        init: () => {
            return new Promise((resolve, reject) => {
                app.use(express.static('./pages'));

                // "What is the next song?"
                app.get('/api/next', (req, res) => {
                    let text = `It doesn't look like there are any songs in the queue`;
                    if (playlist.queue && playlist.queue.length > 1) {
                        text = `The next song will be "${playlist.queue[1].name}"`;
                    }
                    res.send(text);
                });

                // "What songs are in the playlist?"
                app.get('/api/queue', (req, res) => {
                    let text = `Playlist: `;
                    if (!playlist.queue || playlist.queue.length <= 0) {
                        text = 'The playlist appears to be empty\n' +
                                'You can be the first ' + emojiPicker('happy', true) + ' just send me a link';
                    } else {
                        for (let i = 0; i < playlist.queue.length && i < 5; i++) {
                            text += `\n  #${i + 1} "${playlist.queue[i].name}"`;
                        }
                    }
                    res.send(text);
                });

                // "How much time is left on the current song?"
                app.get('/api/time-left', (req, res) => {
                    let timeLeft = new Date(playlist.getRemainingTime());
                    let minutes = Math.round(timeLeft.getMinutes() + (timeLeft.getSeconds() / 60));
                    let text = `The current song has ${minutes} minutes left`;
                    if (playlist.queue.length === 0) {
                        text = 'It does\'t look like a song is playing right now!';
                    }
                    res.send(text);
                });

                // "@musicly https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                app.post('/api/url', (req, res) => {
                    playlist.interpretLink(req.body.url).then((res) => {
                        playlist.addSong(res.link);
                        console.log('RESPONSE: ' + res.response);
                        res.send(res.response);
                    }).catch((text) => {
                        res.send(text);
                    });
                });

                // "@musicly Thank you"
                app.get('/api/thanks', (req, res) => {
                    res.send('You\'re welcome!');
                });

                resolve();
            });
        },
        start: () => {
            return new Promise((resolve, reject) => {
                console.log('Web API ready');
                resolve();
            });
        },
        stop: () => {
            return new Promise((resolve, reject) => {
                resolve();
            });
        }
    };

    return web;
};
