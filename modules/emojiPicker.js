'use strict';

function random (max, min) {
    if (!min) {
        min = 0;
    }
    return Math.floor((Math.random() * (max - min)) + min);
}

module.exports = (expression) => {
    let choices = [];
    switch (expression) {
        case 'sorry':
            choices = [':disappointed:', ':cry:', ':sob:'];
            return choices[random(choices.length)];
        case 'happy':
            choices = [':smile:', ':smiley:', ':grinning:', ':simple_smile:'];
            return choices[random(choices.length)];
        case 'good':
            choices = [':thumbsup:', ':ok_hand:'];
            return choices[random(choices.length)];
        case 'music':
            choices = [':musical_note:'];
            return choices[random(choices.length)];
        case 'heart':
            choices = [':heart:'];
            return choices[random(choices.length)];
        case 'love':
            choices = [':heart:', ':heartbeat:', ':hearpulse:', ':heart_eyes:', ':heart_eyes_cat:'];
            return choices[random(choices.length)];
        default:
            return expression;
    }
};
