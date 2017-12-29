/**
* Collision box object.
*/
export default class CollisionBox {
   constructor(public x: number, public y: number, public width: number, public height: number) {   }
   public collideWith(target: CollisionBox): boolean {
        return (this.x < target.x + target.width &&
        this.x + this.width > target.x &&
        this.y < target.y + target.height &&
        this.height + this.y > target.y);
   }
}