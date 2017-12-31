import Runner from './runner.js'

declare const canvas: HTMLCanvasElement;

function fixLandscapeBug() {
  if (canvas.width < canvas.height) {
    let tmp = canvas.width;
    canvas.width = canvas.height;
    canvas.height = tmp;
  }
}

export default class Main {
  constructor() {
    fixLandscapeBug();
    Runner.start(canvas);
  }
}
