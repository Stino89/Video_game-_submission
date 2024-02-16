window.addEventListener('load', function() {
    //canvas setup
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 500;

    class InputHandler {
        constructor(game){
            this.game = game;
            window.addEventListener('keydown', e => {
                if ((  (e.key === 'ArrowUp') ||
                       (e.key === 'ArrowDown')
                       )  && this.game.keys.indexOf(e.key) === -1){
                    this.game.keys.push(e.key);
                } else if ( e.key === ' '){
                    this.game.player.shootTop();
                }
               
            });
            window.addEventListener('keyup', e => {
                if(this.game.keys.indexOf(e.key) > -1){
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
                
             });
        }

    }
    class Projectile {
        constructor(game,x, y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 3;
            this.markedForDeletion = false;
        }
        update(){
            this.x += this.speed;
            if(this.x > this.game.width * 0.8) this.markedForDeletion = true;
        }
        draw(context){
            context.fillRect = 'yellow';
            fillRect(this.x, this.y, this.width, this.height);
        }

    }
    class Particle {

    }
    class Player {
        constructor(game){
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 20;
            this.y = 100;
            this.speedY = 0;
            this.maxSpeed = 3;
        }
        update(){
            if(this.game.keys.includes('ArrowUp')) this.speedY =  -this.maxSpeed;
            else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
            else this.speedY = 0;
            this.y += this.speedY;
        // handle projectiles
        this.projectiles.forEach(projectile => {
            projectile.update();
        });
        this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
        }
        draw(context){
            context.fillStyle = 'black';
            context.fillRect(this.x, this.y, this.width, this.height);
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
        }
        shootTop(){
            if (this.game.ammo > 0){
            this.projectiles.push(new Projectile(this.game,this.x + 80, this.y + 30));
            this.game.ammo--;
            }    
        }
    }

     class Enemy {
        constructor(game){
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 - 0.5;
            this.markedForDeletion = false;
            this.lives = 5;
            this.score = this.lives;
        }
        update(){
            this.x += this.speedX;
            if (this.x + this.width < 0) this.markedForDeletion = true;
        }
        draw(context){
            context.fillStyle = 'red';
            context.fillRect(this.x, this.y, this.width, this.height);
            context.fillStyle = 'black';
            context.font = '20px Helvetica';
            context.fillText(this.lives, this.x, this.y);

        }
    }
    class Angler1 extends Enemy {
        constructor(game){
            super(game);
            this.width = 228 * 0.2;
            this.height = 169 * 0.2;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);

        }
    }

    class Layer {

    }
    class Background {

    }
    class UI {
        constructor(game){
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Helvetica';
            this.color = 'yellow';
        }
        draw(context){
            // ammo
            context.fillStyle = this.color;
            for (let i = 0; i < this.game.ammo; i++){
                context.fillRect(20 + 5 * i, 50, 3, 20);  
            }
        }
    }
    class Game {
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.keys = [];
            this.enemies = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammoTimer = 0;
            this.ammoInterval = 500;
            this.gameOver = false;
        }
        update(deltaTime){
            this.player.update();
            if (this.ammoTimer > this.ammoInterval) {
                if (this.ammo < this.maxAmmo) this.ammo++;
                this.ammoTimer = 0;
                } else {
                    this.ammoTimer += deltaTime;
                }
                this.enemies.forEach(enemy => {
                    enemy.update();
                  if (this.checkCollision(this.player, enemy)){
                      enemy.markedForDeletion = true;
                  }  
                  this.player.projectiles.forEach(projectile => {
                        if (this.checkCollision(projectile, enemy)){
                            enemy.lives--;
                            projectile.markedForDeletion = true;
                            if (enemy.lives <= 0) {
                                enemy.markedForDeletion = true;
                                this.score += enemy.score;
                        }
                  }
                })
                });
                this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
                if (this.enemyTimer > this.enemyInterval && !this.gameOver){
                    this.addEnemy();
                    this.enemyTimer = 0;
                } else {
                    this.enemyTimer += deltaTime;
                }
            }
        draw(context) {
            this.player.draw(context);
            this.ui.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            }); 
        }
        addEnemy(){
            this.enemies.push(new Angler1(this));
        }
        checkCollision(rect1, rect2){
            return(      rect1.x < rect2.x + rect2.width &&
                        rect1.x + rect1.width > rect2.x &&
                        rect1.y < rect2.y + rect2.height &&
                        rect1.y + rect1.height > rect2.y)
        }
    }
    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;
    // animation loop
    function animate(timeStamp){
        const deltaTime = timestamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate(0);
});