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
            child_process.exec(osascriptCommands.openTab(url));
            songStartTime = Date.now();
            // TODO: This will cut the video short if it buffers for more than 5 seconds...
            setTimeout(() => {
                playlist.queue.splice(0, 1);
                child_process.exec(osascriptCommands.closeTab(url));
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
                    url: url
                };
                if (lowURL.includes('youtube')) {
                    let splitURL = url.split('v=');
                    let id = splitURL[splitURL.length - 1];
                    id = id.split('?')[0];
                    request.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${id}&key=${credentials.youtubeKey}`, (err, res, body) => {
                        if (res.statusCode === 200) {
                            body = JSON.parse(body);
                            if (body.items[0]) {
                                let seconds = convert.ISO8601(body.items[0].contentDetails.duration);
                                if (seconds / 60 < 10) {
                                    link.name = body.items[0].snippet.title;
                                    link.seconds = seconds;
                                    resolve({link: link, response: `Added "${link.name}" to the queue ${emojiPicker('good')}`});
                                } else {
                                    reject(`Whoa there! That video is too darn long!`);
                                }
                            } else {
                                reject(`Sorry, I couldn't find that song ${emojiPicker('sorry')}`);
                            }
                        } else {
                            reject(`Sorry, I couldn't find that song ${emojiPicker('sorry')}`);
                        }
                    });
                } else {
                    reject(`Sorry, I can't handle those kinds of linked quite yet! ${emojiPicker('sorry')}`);
                }
            });
        },

        getRemainingTime: () => {
            console.log(`(${songStartTime} + ${(playlist.queue[0].seconds * 1000)}) - ${Date.now()}`);
            return (songStartTime + (playlist.queue[0].seconds * 1000)) - Date.now();
        }
    };

    return playlist;
};
