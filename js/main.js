import Runner from './runner.js'
// let ctx   = canvas.getContext('2d')
// import Resources from "./resources";
// let image = new Image()
// image.src = Resources["1x-trex"];

export default class Main {
  constructor() {
    if (canvas.width < canvas.height) {
      let tmp = canvas.width;
      canvas.width = canvas.height;
      canvas.height = tmp;
    }
    new Runner().start(canvas)
    // this.loop();
    }
  loop() {
    // console.log(canvas.style.width, canvas.style.height, canvas.width, canvas.height);
    // ctx.fillStyle = "#f00";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    // ctx.drawImage(image, 0, 0, 200, 100, 0, 0, 200, 100);
    // ctx.fillStyle = "#0f0";
    // ctx.fillRect(0, 100, 100, 100);
    window.requestAnimationFrame(
      this.loop.bind(this),
      canvas
    )
  }
}
