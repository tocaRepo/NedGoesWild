class Dog extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'dog_walk');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.physics.add.collider(this, ground);
        scene.physics.add.collider(this, floating_ground);
        this.setCollideWorldBounds(true);
        this.setScale(0.25); // Adjust the scale of the dog
        this.flipX = true;
        this.createAnimations(scene);
        this.play('dog_walk');
        this.setGravityY(300);
        this.player_projectiles = this.scene.physics.add.group({
            classType: PlayerProjectile,
            //maxSize: 10,
            runChildUpdate: true
        });
        this.health = 10;
        this.score = 0;
        this.jumpCount = 0;
        this.movement_upgrades_collected = 0;
        this.temporary_boost = 1;
        this.isAlive = true;
        this.playerprojectile=null;

        
    }

    createAnimations(scene) {
        // Define the walking animation for the dog
        scene.anims.create({
            key: 'dog_walk',
            frames: scene.anims.generateFrameNumbers('dog_walk', { start: 0, end: 1 }),
            frameRate: 4, // frames per second
            repeat: -1    // loop the animation
        });
    }

    update(cursors, spacebar,a, groundSpeed) {

        if (this.isAlive) {
            if (this.body.touching.down) {
                this.jumpCount = 0;
    
                if (!this.anims.isPlaying) {
                    this.play('dog_walk');
                }
            }

            if (cursors.left.isDown) {
             
                this.setVelocityX(((-160 + groundSpeed) - (this.movement_upgrades_collected * 51)) * this.temporary_boost);
                this.flipX = false; // Flip the sprite horizontally
            } else if (cursors.right.isDown) {
  
            
                this.setVelocityX(((160 - groundSpeed) + (this.movement_upgrades_collected * 51)) * this.temporary_boost);
                this.flipX = true; // Do not flip the sprite (facing right)
            } else {
                this.setVelocityX(0);
            }
            if (a.isDown) {
             
                if( this.playerprojectile==null||! this.playerprojectile.active){
                    this.stop();
                    this.setTexture('dog_attack1');
                this.spawnProjectile();
            }
             
            }
            if ((cursors.up.isDown || spacebar.isDown) && (this.body.touching.down || this.jumpCount < 10)) {
                this.setVelocityY(-390 - (this.movement_upgrades_collected * 25));
                this.jumpCount++;
             
                this.stop();
                this.setTexture('dog_jump');
            }
        } else {
            this.stop();
            this.setTexture('dog_dead');
            this.setScale(0.10);
            this.setVelocityX(0);
        }
    }

    takeDamage(damage) {
        this.health-=damage;
        this.isAlive = this.health > 0;
    }

    collectUpgrade() {
        this.movementUpgradesCollected++;
    }

    applyTemporaryBoost(scene) {
        this.temporaryBoost = 2;
        scene.time.delayedCall(4000, () => {
            this.temporaryBoost = 1;
        });
    }

    increaseScore(points) {
        this.score += points;
    }

    increaseHealth() {
        this.health++;
    }

    spawnProjectile() {
       

        // Get a projectile from the pool (group)
        this.playerprojectile = this.player_projectiles.get(this.x, this.y);

        if ( this.playerprojectile) {
            this.playerprojectile.setActive(true);
            this.playerprojectile.setVisible(true);
            this.playerprojectile.setScale(0.13)
            this.playerprojectile.fire(this.x, this.y);
        }
    }
}