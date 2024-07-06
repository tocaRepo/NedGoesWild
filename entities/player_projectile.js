let isHitCooldownPlayer = false;
let hitCooldownDurationPlayer = 500; // Cooldown duration in milliseconds 
class PlayerProjectile extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {
        super(scene, x, y, 'dogprojectile1');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.allowGravity = false;
        this.setActive(false);
        this.setVisible(false);
   
            scene.physics.add.overlap(bosses, this, (projectile,temp_boss ) => {
                if (!isHitCooldownPlayer) {
                    projectile.setActive(false);
                    projectile.setVisible(false);
                    let children = bosses.getChildren();
                    bosses.children.entries[children.length - 1].takeDamage(10);
        
                    isHitCooldownPlayer = true;
                    scene.time.delayedCall(hitCooldownDurationPlayer, () => {
                        isHitCooldownPlayer = false;
                    });
                }
                
            });
        
    }

    fire(x, y) {
        this.body.reset(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.setVelocityX(1050); // Adjust the speed as needed
    }

    update() {
        if (this.x > 7800 || this.y>700) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
   
}