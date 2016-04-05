var localCredentials = {};
try {
    localCredentials = require('./local_credentials');
} catch (err) {}

module.exports = {
    youtubeKey: localCredentials.youtubeKey || process.env.YOUTUBEKEY,
    spotifyToken: localCredentials.spotifyToken || process.env.SPOTIFYTOKEN,
    slackToken: localCredentials.slackToken || process.env.SLACKTOKEN
};
