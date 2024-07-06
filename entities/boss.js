class Boss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setScale(0.4);
        this.setVelocityX(0);
        this.setCollideWorldBounds(true);
        scene.physics.add.collider(this, ground);
        scene.physics.add.overlap(dog, this, (dog, boss) => {
            boss.takeDamage(10); // Example damage value
            dog.takeDamage(1);
       
        });
        this.boss_health = 80; // Example health value

        // Reference to the scene and projectiles
        this.scene = scene;
        this.projectiles = this.scene.physics.add.group({
            classType: Projectile,
           // maxSize: 10, limit the number of projectiles to 10
            runChildUpdate: true
        });

        // Start the timer to spawn projectiles
        this.projectileTimer = this.scene.time.addEvent({
            delay: Phaser.Math.Between(800, 1500), // time in ms between projectiles
            callback: this.spawnProjectile,
            callbackScope: this,
            loop: true
        });
    }

    spawnProjectile() {
        if (!this.active) return; // Do not spawn if the boss is not active

        // Get a projectile from the pool (group)
        const projectile = this.projectiles.get(this.x, this.y);

        if (projectile) {
            projectile.setActive(true);
            projectile.setVisible(true);
            projectile.setScale(0.13)
            projectile.fire(this.x, this.y);
        }
    }

    takeDamage(amount) {
        this.boss_health -= amount;
        console.log(amount)
        console.log(this.boss_health)
        if (this.boss_health <= 0) {
            this.die();
            
          
        }
    }

    die() {
        this.disableBody(true, true);
        if (this.projectileTimer) {
            this.projectileTimer.remove();
        }
    }
}