var localCredentials = {};
try {
    localCredentials = require('./local_credentials');
} catch (err) {}

module.exports = {
    youtubeKey: localCredentials.youtubeKey || process.env.YOUTUBEKEY,
    slackToken: localCredentials.slackToken || process.env.SLACKTOKEN
};
