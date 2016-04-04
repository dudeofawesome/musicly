'use strict';

var request = require('request');

module.exports = (emojiPicker, convert, credentials) => {
    let playlist = {
        queue: [],

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
                                if (convert.ISO8601(body.items[0].contentDetails.duration) / 60 < 10) {
                                    link.name = body.items[0].snippet.title;
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
                    reject(`Sorry, I can't handle those kidns of linked quite yet! ${emojiPicker('sorry')}`);
                }
            });
        }
    };

    return playlist;
};
