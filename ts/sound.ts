import Resources from "./resources";
import { IHashMap } from "./globals";
let instance: Sound = null;

interface SoundEntry {
  id: string,
  loop?: boolean
}

export enum SoundId {
  BGM = "bgm",
  CRASH = "crash",
  JUMP = "jump",
  SCORE_REACHED = "score-reached"
}

let soundEntries: SoundEntry[] = [
  { id: SoundId.BGM, loop: true },
  { id: SoundId.CRASH },
  { id: SoundId.JUMP },
  { id: SoundId.SCORE_REACHED }
]

export default class Sound {
  private sounds: IHashMap<HTMLAudioElement> = {};

  constructor() {
    if (instance) {
      return instance
    }

    instance = this

    soundEntries.forEach(s => {
      let sound = new Audio();
      sound.src = `asset/${s.id}.mp3`;

      sound.loop = !!s.loop;
      this.sounds[s.id] = sound;
    })
    this.play(SoundId.BGM)
  }

  public play(id: string) {
    let sound = this.sounds[id];
    sound.currentTime = 0;
    sound.play();
  }
}
