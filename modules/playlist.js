'use strict';

var request = require('request');
var child_process = require('child_process');

module.exports = (emojiPicker, convert, osascriptCommands, credentials) => {
    let songStartTime = 0;

    let playlist = {
        queue: [],
        addSong: (link) => {
            playlist.queue.push(link);
            if (playlist.queue.length === 1) {
                playlist.startPlayback();
            }
        },
        startPlayback: () => {
            console.log('playing song ' + playlist.queue[0].name);
            let url = playlist.queue[0].url;
            let id = playlist.queue[0].id;
            child_process.exec(osascriptCommands.openTab(url));
            songStartTime = Date.now();
            // TODO: This will cut the video short if it buffers for more than 5 seconds...
            setTimeout(() => {
                playlist.queue.splice(0, 1);
                child_process.exec(osascriptCommands.closeTab(id));
                if (playlist.queue.length > 0) {
                    playlist.startPlayback();
                }
            }, playlist.queue[0].seconds * 1000 + 5000);
        },

        interpretLink: (url) => {
            return new Promise((resolve, reject) => {
                let lowURL = url.toLocaleLowerCase();
                let link = {
                    name: url,
                    url: url,
                    source: url,
                    id: url
                };
                if (lowURL.includes('youtube')) {
                    link.source = 'youtube';
                    // https://www.youtube.com/watch?v=dQw4w9WgXcQ
                    let splitURL = url.split('v=');
                    link.id = splitURL[splitURL.length - 1];
                    link.id = link.id.split('&')[0];
                } else if (lowURL.includes('youtu.be')) {
                    link.source = 'youtube';
                    // https://youtu.be/dQw4w9WgXcQ
                    let splitURL = url.split('/');
                    link.id = splitURL[splitURL.length - 1];
                    link.id = link.id.split('?')[0];
                } else if (lowURL.includes('spotify')) {
                    link.source = 'spotify';
                    // https://play.spotify.com/track/7GhIk7Il098yCjg4BQjzvb
                    let splitURL = url.split('track/');
                    link.id = splitURL[splitURL.length - 1];
                    link.id = link.id.split('?')[0];
                    // TODO: maybe use this for playback: https://developer.spotify.com/technologies/widgets/spotify-play-button/
                } else {
                    return reject(`Sorry, I can't handle those kinds of linked quite yet! ${emojiPicker('sorry')}`);
                }

                switch (link.source) {
                    case 'youtube':
                        request.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${link.id}&key=${credentials.get('youtubeKey')}`, (err, res, body) => {
                            if (res.statusCode === 200) {
                                body = JSON.parse(body);
                                if (body.items[0]) {
                                    let seconds = convert.ISO8601(body.items[0].contentDetails.duration);
                                    if (seconds / 60 < 10) {
                                        link.name = body.items[0].snippet.title;
                                        link.seconds = seconds;
                                        return resolve({link: link, response: `Added "${link.name}" to the queue ${emojiPicker('good')}`});
                                    } else {
                                        return reject(`Whoa there! That video is too darn long!`);
                                    }
                                } else {
                                    return reject(`Sorry, I couldn't find that song ${emojiPicker('sorry')}`);
                                }
                            } else {
                                return reject(`Sorry, I couldn't find that song ${emojiPicker('sorry')}`);
                            }
                        });
                        break;
                    case 'spotify':
                        request.get(`https://api.spotify.com/v1/tracks/${link.id}`, (err, res, body) => {
                            if (res.statusCode === 200) {
                                body = JSON.parse(body);
                                if (!body.error) {
                                    let seconds = body.duration_ms / 1000;
                                    if (seconds / 60 < 10) {
                                        link.name = body.name;
                                        link.url = `${body.external_urls.spotify}?play=true`;
                                        link.id = body.album.id;
                                        link.seconds = seconds;
                                        return resolve({link: link, response: `Added "${link.name}" to the queue ${emojiPicker('good')}`});
                                    } else {
                                        return reject(`Whoa there! That video is too darn long!`);
                                    }
                                } else {
                                    return reject(`Sorry, I couldn't find that song ${emojiPicker('sorry')}`);
                                }
                            } else {
                                return reject(`Sorry, I couldn't find that song ${emojiPicker('sorry')}`);
                            }
                        });
                        break;
                }
            });
        },

        getRemainingTime: () => {
            return (songStartTime + (playlist.queue[0].seconds * 1000)) - Date.now();
        }
    };

    return playlist;
};
