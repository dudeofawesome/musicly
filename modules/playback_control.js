'use strict';

var child_process = require('child_process');

module.exports = {
    start: (service, id) => {
        let script;
        switch (service) {
            case 'youtube':
                script = `tell application "Google Chrome"
                                set myTab to make new tab at end of tabs of window 1
                                set URL of myTab to "https://youtu.be/${id}"
                            end tell`;
                return child_process.exec(`osascript -e '${script.split('\n').join(`' -e '`)}'`);
            case 'spotify':
                script = `tell application "Spotify"
                                play track "spotify:track:${id}"
                            end tell`;
                console.log(script);
                return child_process.exec(`osascript -e '${script.split('\n').join(`' -e '`)}'`);
        }
    },
    stop: (service, id) => {
        let script;
        switch (service) {
            case 'youtube':
                script = `tell application "Google Chrome"
                                set windowList to every tab of window 1 whose URL contains "${id}"
                                    repeat with tabList in windowList
                                        set tabList to tabList as any
                                        repeat with tabItr in tabList
                                            set tabItr to tabItr as any
                                        delete tabItr
                                    end repeat
                                end repeat
                            end tell`;
                return child_process.exec(`osascript -e '${script.split('\n').join(`' -e '`)}'`);
            case 'spotify':
                script = `tell application "Spotify"
                                pause
                            end tell`;
                return child_process.exec(`osascript -e '${script.split('\n').join(`' -e '`)}'`);
        }
    }
};
