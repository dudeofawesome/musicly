'use strict';

module.exports = {
    openTab: (url) => {
        let script = `tell application "Google Chrome"
                        set myTab to make new tab at end of tabs of window 1
                        set URL of myTab to "${url}"
                    end tell`;
        return `osascript -e '${script.split('\n').join(`' -e '`)}'`;
    },
    closeTab: (url) => {
        let script = `tell application "Google Chrome"
                        set windowList to every tab of every window whose URL starts with "${url}"
                            repeat with tabList in windowList
                                set tabList to tabList as any
                                repeat with tabItr in tabList
                                    set tabItr to tabItr as any
                                delete tabItr
                            end repeat
                        end repeat
                    end tell`;
        return `osascript -e '${script.split('\n').join(' -e ')}'`;
    }
};
