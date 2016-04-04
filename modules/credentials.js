var localCredentials = require('./local_credentials') || {};

module.exports = {
    youtubeKey: localCredentials.youtubeKey || process.env.YOUTUBEKEY,
    slackToken: localCredentials.slackToken || process.env.SLACKTOKEN
};
