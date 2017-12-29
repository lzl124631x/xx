import Runner from './runner.js'
import Resources from "./resources";
let ctx   = canvas.getContext('2d')
let image = new Image()
image.src = Resources["1x-trex"];
export default class Main {
  constructor() {
    new Runner().start(canvas)
    // window.requestAnimationFrame(() => {
    //     ctx.drawImage(image, 0, 0, 100, 100, 0, 0, 100, 100);
    // },
    // canvas
    // )
        // this.loop();
    }
  loop() {
    ctx.drawImage(image, 0, 0, 100, 100, 0, 0, 100, 100);
    window.requestAnimationFrame(
      this.loop.bind(this),
      canvas
    )
  }
}
