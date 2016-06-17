function random (max: number, min?: number): number {
    if (!min) {
        min = 0;
    }
    return Math.floor((Math.random() * (max - min)) + min);
}

export function EmojiPicker (expression: string, unicode: boolean = false) {
    let choices: Array<string> = [];
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
            choices = (!unicode) ? [':heart:', ':heartbeat:'] : ['♥️', '💓'];
            return choices[random(choices.length)];
        case 'love':
            choices = (!unicode) ? [':heart:', ':heartbeat:', ':hearpulse:', ':heart_eyes:', ':heart_eyes_cat:'] : ['♥️', '💓', '💗', '😍', '😻', '💝'];
            return choices[random(choices.length)];
        default:
            return expression;
    }
};
