module.exports = {
    ISO8601: (val) => {
        var reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
        var hours = 0;
        var minutes = 0;
        var seconds = 0;
        var totalseconds;

        if (reptms.test(val)) {
            var matches = reptms.exec(val);
            if (matches[1]) {
                hours = Number(matches[1]);
            }
            if (matches[2]) {
                minutes = Number(matches[2]);
            }
            if (matches[3]) {
                seconds = Number(matches[3]);
            }
            totalseconds = hours * 3600  + minutes * 60 + seconds;
        }

        return totalseconds;
    }
};
