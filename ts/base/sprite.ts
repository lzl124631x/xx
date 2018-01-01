import ImageLoader from "../imageLoader";

export default class Sprite {
  protected image: HTMLImageElement = null;
  private visible: boolean = true;
  constructor(imgId, protected width: number, protected height: number, protected x: number = 0, protected y: number = 0) {
    this.image = ImageLoader.get(imgId);
  }

  drawToCanvas(ctx) {
    if ( !this.visible )
      return

    ctx.drawImage(
      this.image,
      this.x,
      this.y,
      this.width,
      this.height
    )
  }

  /**
   * 简单的碰撞检测定义：
   * 另一个精灵的中心点处于本精灵所在的矩形内即可
   * @param{Sprite} sp: Sptite的实例
   */
  isCollideWith(sp) {
    let spX = sp.x + sp.width / 2
    let spY = sp.y + sp.height / 2

    if ( !this.visible || !sp.visible )
      return false

    return !!(   spX >= this.x
              && spX <= this.x + this.width
              && spY >= this.y
              && spY <= this.y + this.height  )
  }
}
