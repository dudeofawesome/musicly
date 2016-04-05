'use strict';

function random (max, min) {
    if (!min) {
        min = 0;
    }
    return Math.floor((Math.random() * (max - min)) + min);
}

module.exports = (expression, unicode) => {
    let choices = [];
    switch (expression) {
        case 'sorry':
            choices = (!unicode) ? [':disappointed:', ':cry:', ':sob:'] : ['😞', '😢', '😭'];
            return choices[random(choices.length)];
        case 'happy':
            choices = (!unicode) ? [':smile:', ':smiley:', ':grinning:', ':simple_smile:'] : ['😀', '😃', '😄', '🙂', '🙃'];
            return choices[random(choices.length)];
        case 'good':
            choices = (!unicode) ? [':thumbsup:', ':ok_hand:'] : ['👍', '👌'];
            return choices[random(choices.length)];
        case 'music':
            choices = (!unicode) ? [':musical_note:'] : ['🎵', '🎶'];
            return choices[random(choices.length)];
        case 'heart':
            choices = (!unicode) ? [':heart:'] : ['♥️'];
            return choices[random(choices.length)];
        case 'love':
            choices = (!unicode) ? [':heart:', ':heartbeat:', ':hearpulse:', ':heart_eyes:', ':heart_eyes_cat:'] : ['♥️', '💓', '💗', '😍', '😻', '💝'];
            return choices[random(choices.length)];
        default:
            return expression;
    }
};
