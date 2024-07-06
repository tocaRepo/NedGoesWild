

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth * 0.98, // 80% of the window width
    height: window.innerHeight* 0.98 , // 80% of the window height
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let dog;
let bees;
let hoover;
let cursors;
let upgrades;
let extrascores;
let enemybees;
let enemychocolates;
let bosses;
let movement_upgrades_collected = 0;
let temporary_boost = 1;
let score = 0;
let scoreText;
let jumpCount = 0; // Track the number of jumps
let is_alive = true;
let health = 3;
let livesText;
let gameTime = 0; // Track the elapsed game time
let groundSpeed = -30;
let isBossActive = false;
// Initial spawn intervals (in milliseconds)
let beeSpawnInterval = Phaser.Math.Between(1200, 3200);
let enemyBeeSpawnInterval = Phaser.Math.Between(4000, 10000);
let enemyChocolateSpawnInterval = Phaser.Math.Between(6000, 13000);
const spawnDecreaseRate = 280; // Rate at which the spawn intervals decrease (in milliseconds)
const minBeeSpawnInterval = 300;
const minEnemyBeeSpawnInterval = 900;
const minEnemyChocolateSpawnInterval = 1000;

function preload() {

    this.load.image('dog_jump', 'assets/dog_jump2.png');
    this.load.image('dog_dead', 'assets/dog_dead2.png');
    this.load.image('bee', 'assets/bee.png');
    this.load.image('ground', 'assets/ground.png'); // Optional: load a ground image
    this.load.image('background', 'assets/background_alt.jpg'); // Load a background image
    this.load.image('hoover', 'assets/hoover.png'); // Load the hoover object
    this.load.image('upgrade', 'assets/upgrade.png'); // Load the upgrade object
    this.load.image('enemybee', 'assets/enemy1.png'); // Load the hungry bee object
    this.load.image('enemychocolate', 'assets/enemy2.png'); // Load the enemychocolate object
    this.load.image('extrascore', 'assets/extrascore.png'); // Load the extrascore object
    this.load.image('boss1', 'assets/boss1.png'); // Load the upgrade object
    this.load.image('projectile1', 'assets/projectile1.png'); // Load the upgrade object

    this.load.spritesheet('dog_walk', 'assets/dog_walk.png', {
        frameWidth: 328,  // width of each frame
        frameHeight: 380  // height of each frame
    });
}

function create() {
    // Add background image
    this.add.image(config.width / 2, config.height/1.4, 'background').setScale(0.95); // Adjust the scale to fit the game dimensions

    // Create the ground as a static physics object
    ground = this.physics.add.group({ immovable: true, allowGravity: false });
    
    // Create multiple ground segments to cover the initial width of the game
    for (let i = 0; i < 3; i++) {
        let groundSegment = ground.create(config.width * (0.1 + (i * 0.4)), config.height, 'ground').setScale(0.2).refreshBody(); // Adjust the initial position
        groundSegment.setVelocityX(groundSpeed);
        groundSegment.body.checkCollision.left = false;
        groundSegment.body.checkCollision.right = false;
    }

    // Create floating ground segments similarly
    floating_ground = this.physics.add.group({ immovable: true, allowGravity: false });
    for (let i = 0; i < 3; i++) {
        let floatingSegment = floating_ground.create(config.width * (0.305 + (i * 0.6)), config.height * 0.66, 'ground').setScale(Phaser.Math.FloatBetween(0.09, 0.04)).refreshBody(); // Adjust the initial position
        floatingSegment.setVelocityX(groundSpeed);
        // Optionally, disable collisions completely on the sides
        floatingSegment.body.checkCollision.left = false;
        floatingSegment.body.checkCollision.right = false;
    }


     // Define the walking animation for the llama
     this.anims.create({
        key: 'dog_walk',
        frames: this.anims.generateFrameNumbers('dog_walk', { start: 0, end: 1 }),  // Adjust start and end based on your sprite sheet
        frameRate: 4,  // frames per second
        repeat: -1      // loop the animation
    });

    

    dog = this.physics.add.sprite(config.width * 0.1, config.height * 0.58, 'dog_walk');
    dog.setCollideWorldBounds(true);
    // dog.setScale(0.11 ); // Adjust the scale of the dog
    dog.setScale(0.25 ); // Adjust the scale of the dog 
    dog.flipX = true;
    dog.play('dog_walk');

    // Add collision between dog and ground
    this.physics.add.collider(dog, ground);
    this.physics.add.collider(dog, floating_ground);
    // Ensure the dog has a physics body
    dog.body.setGravityY(300);
    this.physics.world.createDebugGraphic();
    hoover = this.physics.add.group({
        key: 'hoover',
        visible: false, // Initially hide the group
        active: false // Initially deactivate the group
    });
    bees = this.physics.add.group({
        key: 'bee',
        visible: false, // Initially hide the group
        active: false // Initially deactivate the group
    });
    enemybees = this.physics.add.group({
        key: 'enemybee',
        visible: false, // Initially hide the group
        active: false // Initially deactivate the group
    });
    enemychocolates = this.physics.add.group({
        key: 'enemychocolate',
        visible: false, // Initially hide the group
        active: false // Initially deactivate the group
    });
    upgrades = this.physics.add.group({
        key: 'upgrade',
        visible: false, // Initially hide the group
        active: false // Initially deactivate the group
    });
    extrascores = this.physics.add.group({
        key: 'extrascore',
        visible: false, // Initially hide the group
        active: false // Initially deactivate the group
    });
    bosses = this.physics.add.group({ classType: Boss, runChildUpdate: true });

    cursors = this.input.keyboard.createCursorKeys();
    spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    scoreText = this.add.text(config.width * 0.01, config.height * 0.01, 'Score: 0', {
        fontSize: '32px',
        fill: '#fff',
        backgroundColor: '#000', // Set background color to black
        padding: {
            x: 10, // Horizontal padding
            y: 5  // Vertical padding
        }
    });
    
    livesText = this.add.text(config.width * 0.8, config.height * 0.01, 'Lives: ' + health, {
        fontSize: '32px',
        fill: '#EE4B2B',
        backgroundColor: '#000', // Set background color to black
        padding: {
            x: 10, // Horizontal padding
            y: 5  // Vertical padding
        },
        fontWeight: 'bold' // Make the text bold
    });
    this.time.addEvent({
        delay: enemyChocolateSpawnInterval,
        callback: spawnEnemyChocolates,
        callbackScope: this,
        loop: true
    });
    this.time.addEvent({
        delay: enemyBeeSpawnInterval,
        callback: spawnEnemyBee,
        callbackScope: this,
        loop: true
    });
    this.time.addEvent({
        delay: beeSpawnInterval,
        callback: spawnBee,
        callbackScope: this,
        loop: true
    });

    // Create timer event to spawn hoover every 10-15 seconds
    this.time.addEvent({
        delay: Phaser.Math.Between(10000, 20000), // Random delay between 10 to 20 seconds
        callback: spawnHoover,
        callbackScope: this,
        loop: true
    });
    this.time.addEvent({
        delay: Phaser.Math.Between(1000, 2000), // Random delay between 10 to 20 seconds
        callback: spawnBosses,
        callbackScope: this,
        loop: true
    });
    this.time.addEvent({
        delay: Phaser.Math.Between(11000, 24000), // Random delay between 13 to 22 seconds
        callback: spawnUpgrades,
        callbackScope: this,
        loop: true
    });
    this.time.addEvent({
        delay: Phaser.Math.Between(10000, 21000), // Random delay between 10 to 21 seconds
        callback: spawnExtraScores,
        callbackScope: this,
        loop: true
    });
}

function update(time, delta) {
    gameTime += delta; // Increment the game time by the elapsed time since the last frame

    // Gradually decrease the spawn intervals over time
    if (gameTime % 1000 < delta) { // Every 1 second
        beenewSpawnRate = Math.max(beeSpawnInterval - spawnDecreaseRate, minBeeSpawnInterval);
        enemyBeenewSpawnRate = Math.max(enemyBeeSpawnInterval - spawnDecreaseRate, minEnemyBeeSpawnInterval);
        enemyChocolatenewSpawnRate = Math.max(enemyChocolateSpawnInterval - spawnDecreaseRate, minEnemyChocolateSpawnInterval);
        beeSpawnInterval = Phaser.Math.Between(beenewSpawnRate, beenewSpawnRate * 1.5);
        enemyBeeSpawnInterval = Phaser.Math.Between(enemyBeenewSpawnRate, enemyBeenewSpawnRate * 1.5);
        enemyChocolateSpawnInterval = Phaser.Math.Between(enemyChocolatenewSpawnRate, enemyChocolatenewSpawnRate * 2);
    }
    scoreText.setText('Score: ' + score);
    livesText.setText('Lives: ' + health);
    if (health <= 0) {
        is_alive = false;
    }
    if (is_alive) {
        if (dog.body.touching.down) {
            jumpCount = 0;
            //dog.setTexture('dog');
            if(!dog.anims.isPlaying){
              dog.play('dog_walk');
            }
        }
        if (cursors.left.isDown) {
            dog.setVelocityX(((-160 + groundSpeed) - (movement_upgrades_collected * 51)) * temporary_boost);
            dog.flipX = false; // Flip the sprite horizontally
        } else if (cursors.right.isDown) {
            dog.setVelocityX(((160 - groundSpeed) + (movement_upgrades_collected * 51)) * temporary_boost);
            dog.flipX = true; // Do not flip the sprite (facing right)
        } else {
            dog.setVelocityX(0);
        }

        if ((cursors.up.isDown || spacebar.isDown) && (dog.body.touching.down || jumpCount < 10)) {
            dog.setVelocityY(-390 - (movement_upgrades_collected * 25));
            jumpCount++;
            dog.stop();
            dog.setTexture('dog_jump');
            
        }
    } else {
        dog.stop();
        dog.setTexture('dog_dead');
        dog.setScale(0.10 );
        dog.setVelocityX(0);
    }

    // Iterate over each ground segment
    ground.children.iterate(function (child) {
        // Reset the position of the ground segment if it goes off-screen
        if (child.x < 0) {
            child.x = config.width;
        }
    });

    floating_ground.children.iterate(function (child) {
        // Reset the position of the floating ground segment if it goes off-screen
        let randomOffset = Phaser.Math.Between(config.width * 1.5, config.width * 0.3);
        if (child.x < -randomOffset) {
            child.x = Phaser.Math.Between(config.width * 2.5, config.width * 1.25);
            child.y = Phaser.Math.Between(config.height * 0.66, config.height * 0.38);
            child.setScale(Phaser.Math.FloatBetween(0.09, 0.04));
        }
    });
}

function damage(enemy) {
    health--;
    score -= 95;
    enemy.disableBody(true, true);
  
}

function spawnEnemyChocolates() {
    const x = Phaser.Math.Between(config.width * 0.1, config.width * 0.7);
    const enemychocolate = enemychocolates.create(x, config.height * 0.02, 'enemychocolate');
    enemychocolate.setScale(0.10); // Adjust the scale of the spawned bee (0.5 means 50% of the original size)
    enemychocolate.setVelocity(Phaser.Math.Between(-250, 250), 20);
   
    this.physics.add.overlap(dog, enemychocolate, function (dog, enemychocolate) {
        damage(enemychocolate);
    });
}

function spawnEnemyBee() {
    const x = Phaser.Math.Between(config.width * 0.1, config.width * 0.7);
    const bee = enemybees.create(x, config.height * 0.02, 'enemybee');
    bee.setScale(0.10); // Adjust the scale of the spawned bee (0.5 means 50% of the original size)
    bee.setVelocity(Phaser.Math.Between(-250, 250), 20);
   
    this.physics.add.overlap(dog, bee, function (dog, bee) {
        damage(bee);
    });
}

function spawnBee() {
    const x = Phaser.Math.Between(0, config.width);
    const bee = bees.create(x, config.height * 0.02, 'bee');
    bee.setScale(0.05); // Adjust the scale of the spawned bee (0.5 means 50% of the original size)

    bee.setBounce(1);
    bee.setCollideWorldBounds(true);
    bee.setVelocity(Phaser.Math.Between(-200, 200), 20);
    // Add collision between dog and ground
    this.physics.add.collider(bee, ground);
    this.physics.add.collider(bee, floating_ground);
    bee.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    this.physics.add.overlap(dog, bee, function (dog, bee) {
        bee.disableBody(true, true); // Disable and hide the upgrade object
        score += 5;
    });
}

function spawnHoover() {
    const x = config.width * 1.025; // Spawn hoover on the right side of the screen
    const y = config.height * 0.875; // Random Y position between 500 to 700
    const hooverObject = hoover.create(x, y, 'hoover');
    hooverObject.setScale(0.16); // Adjust the scale of the hoover object
    hooverObject.setVelocityX(-150);
    hooverObject.setSize(hooverObject.displayWidth * 0.9, hooverObject.displayHeight * 0.9); // Example adjustment

    this.physics.add.collider(hooverObject, ground);
    this.physics.add.collider(hooverObject, floating_ground);
   
    this.physics.add.overlap(dog, hooverObject, function (dog, hooverObject) {
        damage(hooverObject);
    });
}
function spawnBosses() {
    if(!isBossActive){
        const x = this.scale.width * 0.9;
        const y = this.scale.height * 0.375;
        const boss = new Boss(this, x, y, 'boss1');
    
        bosses.add(boss);
    }
    
}
function spawnUpgrades() {
    const x = Phaser.Math.Between(config.width*0.1, config.width*0.7);
    const upgradeObject = upgrades.create(x, config.height * 0.02, 'upgrade');
    upgradeObject.setScale(0.12); // Adjust the scale of the hoover object
    upgradeObject.setVelocity(Phaser.Math.Between(-200, 200), 20);
    
    this.physics.add.overlap(dog, upgradeObject, function (dog, upgrade) {
        upgrade.disableBody(true, true); // Disable and hide the upgrade object
        movement_upgrades_collected++; // Increment the count of collected upgrades
        score += 50;
        
        applyPowerUpEffect.call(this, 'speedBoost');
    }, null, this);
}

function applyPowerUpEffect(type) {
    if (type === 'speedBoost') {
        temporary_boost = 2;
        this.time.delayedCall(4000, () => {
            temporary_boost = 1;
        });
    }
    // Implement other power-up effects similarly
}

function spawnExtraScores() {
    const x = Phaser.Math.Between(config.width*0.1, config.width*0.7);
    const extrascore = extrascores.create(x, config.height * 0.02, 'extrascore');
    extrascore.setScale(0.13); // Adjust the scale of the hoover object
    extrascore.setVelocity(Phaser.Math.Between(-200, 200), 20);
    
    this.physics.add.overlap(dog, extrascore, function (dog, extrascoreObject) {
        extrascoreObject.disableBody(true, true); // Disable and hide the upgrade object
        score += 100;
        health++;
  
    });
}
