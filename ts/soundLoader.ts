import { IHashMap } from "./globals";
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

class SoundLoader {
  private sounds: IHashMap<HTMLAudioElement> = {};

  constructor() {

    soundEntries.forEach(s => {
      let sound = new Audio();
      sound.src = `asset/sound/${s.id}.mp3`;

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

export default new SoundLoader();