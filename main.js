
window.addEventListener("load", () => {
    /**@type {HTMLCanvasElement}*/
    const canva = document.getElementById("canvas");
    const ctx = canva.getContext("2d");
    canva.height = 720;
    canva.width = 1500;
    let obstacleArray = [];
    let score = 0;
    let gameOver = false;

    class InputHandler {
        constructor() {
            this.key = [];

            window.addEventListener("keydown", (e) => {
                if (
                    (
                        e.key === "ArrowUp" ||
                        e.key === "ArrowLeft" ||
                        e.key === "ArrowDown" ||
                        e.key === "ArrowRight"
                    ) && this.key.indexOf(e.key) === -1
                ) {
                    this.key.push(e.key);
                }
            });


            window.addEventListener("keyup", (e) => {
                if (
                    e.key === "ArrowUp" ||
                    e.key === "ArrowLeft" ||
                    e.key === "ArrowDown" ||
                    e.key === "ArrowRight"
                ) {
                    this.key.splice(this.key.indexOf(e.key), 1);
                }
                // console.log(this.key, e.key);
            });
        }
    }

    class Player {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.height = 200;
            this.width = 200;
            this.x = 100;
            this.y = this.gameHeight / 2 - this.height / 2;

            this.vy = 0;
            this.gravity = 0.5;

            this.frameTimer = 0;
            this.Interval = 100;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrameY = 2;

            this.image = new Image();
            this.image.src = "player_fish.png";
        }

        update(input, deltaTime, obstacle, coin) {

            if (input.key.indexOf("ArrowUp") > -1) {
                this.vy = -10;
            }

            this.vy += this.gravity;
            this.y += this.vy;

            if (this.y < 0) this.y = 0;
            if (this.y > this.gameHeight - this.height) {
                this.y = this.gameHeight - this.height;
                this.vy = 0;
            }

            if (this.onground()) {
                this.frameY = 3;
            }

            //collision detection 
            obstacle.forEach(enemy => {
                const enemyW = enemy.spriteWidth;
                const enemyH = enemy.spriteHeight;

                const dx = (enemy.x + enemyW / 2) - (this.x + this.width / 2);
                const dy = (enemy.y + enemyH / 2) - (this.y + this.height / 2);

                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < enemyW / 2 + this.width / 2 - 20) {
                    gameOver = true;
                }
            });

            coinArray.forEach(coin => {
                const coinW = coin.width;
                const coinH = coin.height;

                const dx = (coin.x + coinW / 2) - (this.x + this.width / 2);
                const dy = (coin.y + coinH / 2) - (this.y + this.height / 2);

                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < coinW / 2 + this.width / 2 - 20) {
                    coin.markedForDeletion = true;
                    score += 1;
                }
            });
        }
        onground() {
            return this.y >= this.gameHeight - this.height;

        }
        FrameChange(deltaTime) {
            if (this.frameTimer > this.Interval) {
                this.frameY++;
                if (this.frameY > this.maxFrameY) this.frameY = 0;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
        }


        draw(ctx) {
            ctx.drawImage(
                this.image,
                this.frameX * this.width, this.frameY * this.height,
                this.width, this.height,
                this.x, this.y,
                this.width, this.height
            );
        }
    }


    class Background {
        constructor(image, gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.x = 0;
            this.y = 0;
            this.width = 2400;
            this.height = 720;
            this.speed = 8;
            this.image = image;
        }

        update(input, player, deltaTime, obstacleArray) {
            this.x -= this.speed;
            if (this.x < -this.width) this.x = 0;

            if (input.key.indexOf("ArrowRight") > -1) {
                this.speed = 12;
                player.frameY = 3;      // static fast animation frame
                player.gravity = 0.2;
                obstacleArray.forEach(obstacle => {
                    obstacle.speed = 15;
                    obstacle.angleSpeed = 0.045;
                })
            } else {
                this.speed = 8;
                player.gravity = 0.5;
                obstacleArray.forEach(obstacle => {
                    obstacle.angleSpeed = 0.030;
                    obstacle.speed = 5;
                })
                player.FrameChange(deltaTime);   // animate normally
            }
        }


        draw(ctx) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            ctx.drawImage(this.image, this.x + this.width - this.speed, this.y, this.width, this.height);
        }
    }


    class Obstacle {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;

            this.spriteWidth = 120;
            this.spriteHeight = 120;

            this.frameY = 0;
            this.frameX = Math.floor(Math.random() * 4);

            this.x = this.gameWidth;
            this.y = Math.random() * (this.gameHeight - this.spriteHeight);

            this.speed = 5;
            this.angle = 0;
            this.angleSpeed = 0.030;

            this.image = new Image();
            this.image.src = "smallGears.png";
        }

        update() {
            this.x -= this.speed;

            // Slower & smaller vertical movement
            this.angle += this.angleSpeed;
            this.y += Math.sin(this.angle) * 4;

            // Don't leave screen vertically
            if (this.y < 0) this.y = 0;
            if (this.y > this.gameHeight - this.spriteHeight)
                this.y = this.gameHeight - this.spriteHeight;

        }


        draw(ctx) {
            ctx.drawImage(
                this.image,
                this.frameX * this.spriteWidth,
                this.frameY,
                this.spriteWidth,
                this.spriteHeight,
                this.x,
                this.y,
                this.spriteWidth,
                this.spriteHeight
            );
        }
    }

    class Coin {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;

            this.spriteHeight = 586;
            this.spriteWidth = 600;

            this.width = this.spriteWidth / 11;
            this.height = this.spriteHeight / 11;

            this.x = this.gameWidth + 100;
            this.y = Math.random() * (this.gameHeight - this.height);

            this.speed = 10; // <--- fixed
            this.image = new Image();
            this.image.src = "coin.png";

            this.markedForDeletion = false;
        }

        update() {
            this.x -= this.speed;
            if (this.x < -this.width) this.markedForDeletion = true;


        }
        draw(ctx) {
            ctx.drawImage(
                this.image,
                0, 0,                   // entire sprite
                this.spriteWidth, this.spriteHeight,
                this.x, this.y,
                this.width, this.height // scaled down version
            );
        }

    }

    function HandelObstacles(deltaTime) {
        if (timer > Interval) {
            obstacleArray.push(new Obstacle(canva.width, canva.height));
            timer = 0;
            Interval = Math.random() * 1000 + 2000;
        } else {
            timer += deltaTime;
        }

    }

    let timer = 0;
    let Interval = Math.random() * 1000 + 1000;
    const backgroundImageOne = new Image();
    backgroundImageOne.src = "background_single.png";


    let coinArray = [];
    let coinTimer = 0;
    let coinIntarval = Math.random() * 1000 + 500;


    function coinsHadelor(deltaTime) {
        if (coinTimer > coinIntarval) {
            coinArray.push(new Coin(canva.width, canva.height));
            coinTimer = 0;
            coinIntarval = Math.random() * 1000 + 500;
        } else {
            coinTimer += deltaTime;
        }

    }

    const backgroundImageSecond = new Image();
    backgroundImageSecond.src = "background_single2.png";


    // const enemy = new Obstacle(canva.width , canva.height);

    const bgOne = new Background(backgroundImageOne, canva.width, canva.height, obstacleArray);

    function showGameOver(ctx) {
        ctx.font = "90px Arial";
        ctx.fillStyle = "yellow";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canva.width / 2, canva.height / 2 - 40);

        ctx.font = "40px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("Final Score: " + Math.floor(score), canva.width / 2, canva.height / 2 + 40);
    }



    function drawScore(ctx, score) {
        ctx.textAlign = 'left';
        ctx.font = "40px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("Score: " + score, 20, 50);
    }

    window.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && gameOver) {
            restartGame();
        }
    });

    function restartGame() {
        score = 0;
        obstacleArray = [];
        coinArray = [];
        gameOver = false;

        // reset player
        player.x = 100;
        player.y = canva.height / 2 - player.height / 2;
        player.vy = 0;
        player.gravity = 0.5;

        // reset input
        input.key = [];

        // reset timers
        timer = 0;
        Interval = Math.random() * 1000 + 1000;
        coinTimer = 0;
        coinIntarval = Math.random() * 1000 + 500;

        // reset background
        bgOne.speed = 8;

        lastTime = 0;
        requestAnimationFrame(animate);
    }

    const input = new InputHandler();
    let lastTime = 0
    const player = new Player(canva.width, canva.height);
    function animate(timeStamp) {
        ctx.clearRect(0, 0, canva.width, canva.height);
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        bgOne.update(input, player, deltaTime, obstacleArray);
        bgOne.draw(ctx);
        HandelObstacles(deltaTime)
        obstacleArray.forEach(obstacle => {
            obstacle.update();
            obstacle.draw(ctx);
        });
        player.update(input, deltaTime, obstacleArray, coinArray);
        player.draw(ctx);

        coinsHadelor(deltaTime)
        coinArray.forEach(coin => {
            coin.update();
            coin.draw(ctx)
        });
        
        coinArray = coinArray.filter(c => !c.markedForDeletion);


        drawScore(ctx, score);  // increase slowly over time

        // console.log(deltaTime);
        if (!gameOver) requestAnimationFrame(animate);
        else {
            showGameOver(ctx);
            return;
        }

    }
    animate(0);
});