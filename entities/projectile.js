let isHitCooldown = false;
let hitCooldownDuration = 500; // Cooldown duration in milliseconds 
class Projectile extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {
        super(scene, x, y, 'projectile1');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.allowGravity = false;
        this.setActive(false);
        this.setVisible(false);
        scene.physics.add.overlap(dog, this, (dog, projectile) => {
            if (!isHitCooldown) {
                projectile.setActive(false);
                projectile.setVisible(false);
    
                dog.takeDamage(3);
    
                isHitCooldown = true;
                scene.time.delayedCall(hitCooldownDuration, () => {
                    isHitCooldown = false;
                });
            }
            
        });
    }

    fire(x, y) {
        this.body.reset(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.setVelocityX(-850); // Adjust the speed as needed
    }

    update() {
        if (this.x < 0) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}