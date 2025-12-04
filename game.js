const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 800,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);


let pelurus = []; 
let pistol, musuh;
let keyW, keyA, keyS, keyD;
let keySpace;
let cursors;
let canShoot = true; 
let enemySpeed = 3;
let gameOver = false;
let gameOverText;
let restartKey;
let score = 0;
let scoreText;


function preload() {
  
  this.load.setPath('./');

  this.load.on('loaderror', (file) => {
    console.error('Phaser load error:', file);
  });
  this.load.on('filecomplete', (key, type) => {
    console.log('Loaded asset:', key, 'type:', type);
  });

  this.load.image('pistol', './pistol.png');
  this.load.image('peluru', './peluru.png');
  this.load.image('musuh', './kepalaHilmi.png');
}


function create() {
  pistol = this.add.image(100, 400, 'pistol');
  pistol.setScale(0.6);
  musuh = this.add.image(1000, 400, 'musuh');
  musuh.setScale(0.6);

  keyA = this.input.keyboard.addKey('A');
  keyW = this.input.keyboard.addKey('W');
  keyS = this.input.keyboard.addKey('S');
  keyD = this.input.keyboard.addKey('D');
  keySpace = this.input.keyboard.addKey('SPACE');
  cursors = this.input.keyboard.createCursorKeys();
  restartKey = this.input.keyboard.addKey('R');

  gameOverText = this.add
    .text(600, 400, 'GAME OVER\nTekan "R" untuk restart', {
      fontSize: '32px',
      color: '#ffffff',
      align: 'center',
    })
    .setOrigin(0.5)
    .setVisible(false);

  score = 0;
  scoreText = this.add.text(20, 20, 'Score: 0', {
    fontSize: '24px',
    color: '#ffffff',
  });

  respawnEnemy(this);
}


function update() {
  if (gameOver) {
    if (Phaser.Input.Keyboard.JustDown(restartKey)) {
      restartGame(this);
    }
    return;
  }

  const moveLeft = keyA.isDown || (cursors && cursors.left.isDown);
  const moveRight = keyD.isDown || (cursors && cursors.right.isDown);
  const moveUp = keyW.isDown || (cursors && cursors.up.isDown);
  const moveDown = keyS.isDown || (cursors && cursors.down.isDown);

  if (moveLeft) {
    pistol.x -= 10;
  }
  if (moveRight) {
    pistol.x += 10;
  }
  if (moveUp) {
    pistol.y -= 10;
  }
  if (moveDown) {
    pistol.y += 10;
  }


  if (keySpace.isDown && canShoot) {
    let peluru = this.add.image(pistol.x + 40, pistol.y, 'peluru');
    peluru.setScale(0.2);

    pelurus.push(peluru); 
    canShoot = false; 
    setTimeout(() => {
      canShoot = true;
    }, 120);
  }

  // Gerakkan SEMUA peluru
  for (let i = pelurus.length - 1; i >= 0; i--) {
    pelurus[i].x += 18; 

    
    if (checkCollision(pelurus[i], musuh)) {
      pelurus[i].destroy();
      pelurus.splice(i, 1);
      score += 1;
      if (scoreText) scoreText.setText('Score: ' + score);
      respawnEnemy(this);
      continue;
    }

    if (pelurus[i].x > 1250) {
      pelurus[i].destroy();
      pelurus.splice(i, 1);
    }
  }

  moveEnemyTowardsPlayer(this);

  if (checkCollision(pistol, musuh)) {
    triggerGameOver();
  }

  
  pistol.x = Phaser.Math.Clamp(pistol.x, 80, 1120);
  pistol.y = Phaser.Math.Clamp(pistol.y, 60, 740);
}

function moveEnemyTowardsPlayer(scene) {
  if (!musuh || !pistol) {
    return;
  }

  musuh.x -= enemySpeed;
  const deltaY = Phaser.Math.Clamp(pistol.y - musuh.y, -enemySpeed, enemySpeed);
  musuh.y += deltaY;

  if (musuh.x < -50) {
    respawnEnemy(scene);
  }
}

function respawnEnemy(scene) {
  enemySpeed = Phaser.Math.FloatBetween(2.5, 4.5);

  if (!musuh) {
    musuh = scene.add.image(1000, 400, 'musuh');
    musuh.setScale(0.6);
  }

  musuh.setPosition(Phaser.Math.Between(900, 1150), Phaser.Math.Between(120, 680));
}

function triggerGameOver() {
  if (gameOver) {
    return;
  }
  gameOver = true;
  gameOverText.setVisible(true);
}

function restartGame(scene) {
  gameOver = false;
  gameOverText.setVisible(false);

  pelurus.forEach((peluru) => peluru.destroy());
  pelurus = [];
  canShoot = true;

  pistol.setPosition(100, 400);
  respawnEnemy(scene);
  score = 0;
  if (scoreText) scoreText.setText('Score: ' + score);
}

function checkCollision(obj1, obj2) {
 
  let distance = Phaser.Math.Distance.Between(obj1.x, obj1.y, obj2.x, obj2.y);

  return distance < 50;
}
