const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
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
let movement_upgrades_collected = 0;
let temporary_boost = 1;
let score = 0;
let scoreText;
let jumpCount = 0; // Track the number of jumps
let is_alive = true;
let number_of_lives = 3;
let livesText;
let gameTime = 0; // Track the elapsed game time
let background;
let ground;
let floating_ground;
let groundSpeed = -200; // Speed at which the ground moves to the left

// Initial spawn intervals (in milliseconds)
let beeSpawnInterval = Phaser.Math.Between(1600, 3800);
let enemyBeeSpawnInterval = Phaser.Math.Between(5000, 12000);
let enemyChocolateSpawnInterval = Phaser.Math.Between(8000, 16000);
const spawnDecreaseRate = 50; // Rate at which the spawn intervals decrease (in milliseconds)
const minBeeSpawnInterval = 800;
const minEnemyBeeSpawnInterval = 1500;
const minEnemyChocolateSpawnInterval = 2000;

function preload() {
    this.load.image('dog', 'assets/dog.png');
    this.load.image('dog_jump', 'assets/dog_jump.png');
    this.load.image('dog_dead', 'assets/dog_dead.png');
    this.load.image('bee', 'assets/bee.png');
    this.load.image('ground', 'assets/ground.png'); // Optional: load a ground image
    this.load.image('background', 'assets/background.jpg'); // Load a background image
    this.load.image('hoover', 'assets/hoover.png'); // Load the hoover object
    this.load.image('upgrade', 'assets/upgrade.png'); // Load the upgrade object
    this.load.image('enemybee', 'assets/enemy1.png'); // Load the hungry bee object
    this.load.image('enemychocolate', 'assets/enemy2.png'); // Load the enemychocolate object
    this.load.image('extrascore', 'assets/extrascore.png'); // Load the extrascore object
}

function create() {
    // Add background image
    background = this.add.tileSprite(600, 400, 1200, 800, 'background').setScale(2); // Use tileSprite for a scrolling background
    
    // Create the ground as a static physics object
    ground = this.physics.add.group({immovable: true, allowGravity: false});
    ground.create(200, 848, 'ground').setScale(0.4).refreshBody(); // Using an image for the ground
    
    floating_ground = this.physics.add.group({immovable: true, allowGravity: false});
    floating_ground.create(610, 528, 'ground').setScale(0.09).refreshBody(); // Using an image for the ground
    
    dog = this.physics.add.sprite(100, 640, 'dog');
    dog.setCollideWorldBounds(true);
    dog.setScale(0.16); // Adjust the scale of the dog (0.5 means 50% of the original size)
    
    // Add collision between dog and ground
    this.physics.add.collider(dog, ground);
    this.physics.add.collider(dog, floating_ground);
    // Ensure the dog has a physics body
    dog.body.setGravityY(300);

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
  
    cursors = this.input.keyboard.createCursorKeys();
    spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

    livesText = this.add.text(1000, 16, 'Lives: ' + number_of_lives, { 
        fontSize: '32px', 
        fill: '#EE4B2B',
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
        delay: Phaser.Math.Between(1300, 2200), // Random delay between 13 to 22 seconds
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
        beenewSpawnRate=Math.max(beeSpawnInterval - spawnDecreaseRate, minBeeSpawnInterval);
        enemyBeenewSpawnRate=Math.max(enemyBeeSpawnInterval - spawnDecreaseRate, minEnemyBeeSpawnInterval);
        enemyChocolatenewSpawnRate= Math.max(enemyChocolateSpawnInterval - spawnDecreaseRate, minEnemyChocolateSpawnInterval);
        beeSpawnInterval = Phaser.Math.Between(beenewSpawnRate, beenewSpawnRate*1.5);
        enemyBeeSpawnInterval = Phaser.Math.Between(enemyBeenewSpawnRate,enemyBeenewSpawnRate*1.5);
        enemyChocolateSpawnInterval =Phaser.Math.Between(enemyChocolatenewSpawnRate,enemyChocolatenewSpawnRate*2);
    }

    if (is_alive) {
        if (dog.body.touching.down) {
            jumpCount = 0;
            dog.setTexture('dog');
        }
        if (cursors.left.isDown) {
            dog.setVelocityX((-160 - (movement_upgrades_collected * 51))*temporary_boost);
            dog.flipX = true; // Flip the sprite horizontally
        } else if (cursors.right.isDown) {
            dog.setVelocityX((160 + (movement_upgrades_collected * 51))*temporary_boost);
            dog.flipX = false; // Do not flip the sprite (facing right)
        } else {
            dog.setVelocityX(160 + (movement_upgrades_collected * 51)); // Constant forward movement
            dog.flipX = false; // Ensure dog is facing right
        }

        if ((cursors.up.isDown || spacebar.isDown) && (dog.body.touching.down || jumpCount < 10)) {
            dog.setVelocityY(-390 - (movement_upgrades_collected * 25));
            jumpCount++;
            dog.setTexture('dog_jump');
        }

        // Move the background and ground to the left
      
        ground.children.iterate(function (child) {
            child.setVelocityX(groundSpeed);
            if (child.x < -child.width) {
                child.destroy();
            }
        });
        floating_ground.children.iterate(function (child) {
            child.setVelocityX(groundSpeed);
            if (child.x < -child.width) {
                child.destroy();
            }
        });
    } else {
        dog.setTexture('dog_dead');
        dog.setVelocityX(0);
    }
}

function damage(enemy) {
    number_of_lives--;
    livesText.setText('Lives: ' + number_of_lives);
    score -= 95;
    scoreText.setText('Score: ' + score);
    enemy.disableBody(true, true);
    if (number_of_lives <= 0) {
        is_alive = false;
    }
}

function spawnEnemyChocolates() {
    const x = Phaser.Math.Between(100, 700);
    const enemychocolate = enemychocolates.create(x, 16, 'enemychocolate');
    enemychocolate.setScale(0.12); // Adjust the scale of the spawned bee (0.5 means 50% of the original size)
    enemychocolate.setVelocity(Phaser.Math.Between(-250, 250), 20);
   
    this.physics.add.overlap(dog, enemychocolate, function (dog, enemychocolate) {
        damage(enemychocolate);
    });
}

function spawnEnemyBee() {
    const x = Phaser.Math.Between(100, 700);
    const bee = enemybees.create(x, 16, 'enemybee');
    bee.setScale(0.12); // Adjust the scale of the spawned bee (0.5 means 50% of the original size)
    bee.setVelocity(Phaser.Math.Between(-250, 250), 20);
   
    this.physics.add.overlap(dog, bee, function (dog, bee) {
        damage(bee);
    });
}

function spawnBee() {
    const x = Phaser.Math.Between(0, 800);
    const bee = bees.create(x, 16, 'bee');
    bee.setScale(0.09); // Adjust the scale of the spawned bee (0.5 means 50% of the original size)

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
        scoreText.setText('Score: ' + score);
    });
}

function spawnHoover() {
    const x = 1200; // Spawn hoover on the right side of the screen
    const y = 500; // Random Y position between 500 to 700
    const hooverObject = hoover.create(x, y, 'hoover');
    hooverObject.setScale(0.16); // Adjust the scale of the hoover object
    hooverObject.setVelocityX(-100);
    hooverObject.setSize(hooverObject.displayWidth * 0.9, hooverObject.displayHeight * 0.9); // Example adjustment

    this.physics.add.collider(hooverObject, ground);
    this.physics.add.collider(hooverObject, floating_ground);
   
    this.physics.add.overlap(dog, hooverObject, function (dog, hooverObject) {
        damage(hooverObject);
    });
}

function spawnUpgrades() {
    const x = Phaser.Math.Between(0, 800);
    const upgradeObject = upgrades.create(x, 16, 'upgrade');
    upgradeObject.setScale(0.16); // Adjust the scale of the hoover object
    upgradeObject.setVelocity(Phaser.Math.Between(-200, 200), 20);
    
    this.physics.add.overlap(dog, upgradeObject, function (dog, upgrade) {
        upgrade.disableBody(true, true); // Disable and hide the upgrade object
        movement_upgrades_collected++; // Increment the count of collected upgrades
        score += 50;
        scoreText.setText('Score: ' + score);
        applyPowerUpEffect.call(this, 'speedBoost');
    }, null, this);
}

function applyPowerUpEffect(type) {
    if (type === 'speedBoost') {
        temporary_boost = 2
        this.time.delayedCall(5000, () => {
            temporary_boost = 1
        });
    }
    // Implement other power-up effects similarly
}

function spawnExtraScores() {
    const x = Phaser.Math.Between(0, 800);
    const extrascore = extrascores.create(x, 16, 'extrascore');
    extrascore.setScale(0.16); // Adjust the scale of the hoover object
    extrascore.setVelocity(Phaser.Math.Between(-200, 200), 20);
    
    this.physics.add.overlap(dog, extrascore, function (dog, extrascoreObject) {
        extrascoreObject.disableBody(true, true); // Disable and hide the upgrade object
        score += 100;
        scoreText.setText('Score: ' + score);
        number_of_lives++;
        livesText.setText('Lives: ' + number_of_lives);
    });
}
