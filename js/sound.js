"use strict";
exports.__esModule = true;
var instance = null;
var SoundId;
(function (SoundId) {
    SoundId["BGM"] = "bgm";
    SoundId["CRASH"] = "crash";
    SoundId["JUMP"] = "jump";
    SoundId["SCORE_REACHED"] = "score-reached";
})(SoundId = exports.SoundId || (exports.SoundId = {}));
var soundEntries = [
    { id: SoundId.BGM, loop: true },
    { id: SoundId.CRASH },
    { id: SoundId.JUMP },
    { id: SoundId.SCORE_REACHED }
];
var Sound = /** @class */ (function () {
    function Sound() {
        var _this = this;
        this.sounds = {};
        if (instance) {
            return instance;
        }
        instance = this;
        soundEntries.forEach(function (s) {
            var sound = new Audio();
            sound.src = "asset/" + s.id + ".mp3";
            sound.loop = !!s.loop;
            _this.sounds[s.id] = sound;
        });
        this.play(SoundId.BGM);
    }
    Sound.prototype.play = function (id) {
        console.log(id);
        var sound = this.sounds[id];
        sound.currentTime = 0;
        sound.play();
    };
    return Sound;
}());
exports["default"] = Sound;
