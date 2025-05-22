// works ???
let gameStart = false;
const contCanvas = document.querySelector('.container');
const contLobbyCanvas = document.querySelector('.lobby-container');
const startGameBtn = document.getElementById('start-game');
startGameBtn.addEventListener('click', () => {
    gameStart = true;
    contCanvas.style.opacity = '1';
    contCanvas.style.pointerEvents = 'auto';
    contLobbyCanvas.style.opacity = '0';
    contLobbyCanvas.style.pointerEvents = 'none';
});

const gameStarted = setInterval(() => {
    if (gameStart) {

        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const textEnd = document.getElementById('textEnd');
        const healthBar = document.getElementById('healthBar');
        const energyBar = document.getElementById('energyBar');
        const timer = document.getElementById('timer');
        const hltFillBar = document.createElement('div');
        const engFillBar = document.createElement('div');

        hltFillBar.style.width = '100%';
        hltFillBar.style.height = '100%';
        engFillBar.style.width = '100%';
        engFillBar.style.height = '100%';

        hltFillBar.style.background = 'lime';
        engFillBar.style.background = 'blue';
        healthBar.appendChild(hltFillBar);
        energyBar.appendChild(engFillBar);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const getRandom = (min, max) => {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        const allObjects = [];
        const allBullets = [];
        const createObject = (radiusPx, speedK, ballType) => {
            const angle = Math.random() * Math.PI * 2;
            const object = {
                x: getRandom(radiusPx, canvas.width - radiusPx),
                y: canvas.height - getRandom(radiusPx, canvas.height - radiusPx),
                radius: radiusPx,
                speed: speedK * 0.25,
                dx: Math.cos(angle) * speedK * 0.25,
                dy: Math.sin(angle) * speedK * 0.25,
                type: ballType,
                color: null,
                shootCooldown: 0
            }

            switch (ballType) {
                case 'normal':
                    object.color = 'grey';
                    break;
                case 'homing':
                    object.color = 'rgb(190, 140, 10)';
                    break;
                case 'sniper':
                    object.color = 'rgb(160, 90, 90)';
                    break;
                case 'dash':
                    object.color = 'rgb(10, 80, 120)';
                    break;
            }
            allObjects.push(object);
            return object;

        }
        const addHealPill = () => {
            const healPill = {
                x: getRandom(0, canvas.width),
                y: getRandom(0, canvas.height),
                radius: 10
            }
            ctx.beginPath();
            ctx.fillStyle = 'lime';
            ctx.arc(healPill.x, healPill.y, healPill.radius, 0, Math.PI * 2);
            ctx.fill();
            return healPill
        }
        const healPill = addHealPill();

        const addPointsPill = () => {
            const pointsPill = {
                x: getRandom(0, canvas.width),
                y: getRandom(0, canvas.height),
                radius: 10
            }
            ctx.beginPath();
            ctx.fillStyle = 'lime';
            ctx.arc(pointsPill.x, pointsPill.y, pointsPill.radius, 0, Math.PI * 2);
            ctx.fill();
            return pointsPill
        }
        const pointsPill = addPointsPill();

        const addMaxEnergyPill = () => {
            const maxEnergyPill = {
                x: getRandom(0, canvas.width),
                y: getRandom(0, canvas.height),
                radius: 10
            }
            ctx.beginPath();
            ctx.fillStyle = 'rgb(0, 0, 255)';
            ctx.arc(maxEnergyPill.x, maxEnergyPill.y, maxEnergyPill.radius, 0, Math.PI * 2);
            ctx.fill();
            return maxEnergyPill
        }
        const maxEnergyPill = addMaxEnergyPill();

        const addEnergyRegenPill = () => {
            const energyRegenPill = {
                x: getRandom(0, canvas.width),
                y: getRandom(0, canvas.height),
                radius: 10
            }
            ctx.beginPath();
            ctx.fillStyle = 'rgb(231, 25, 159)';
            ctx.arc(energyRegenPill.x, energyRegenPill.y, energyRegenPill.radius, 0, Math.PI * 2);
            ctx.fill();
            return energyRegenPill
        }
        const energyRegenPill = addEnergyRegenPill();

        const player = {
            x: canvas.width * 0.5,
            y: canvas.height * 0.5,
            radius: 15,
            speed: 10,
            engAmount: 30,
            energyMax: 30,
            energyRegen: 2,
            hero: 'magmax',
            color: null
        }
        switch (player.hero) {
            case 'magmax':
                player.color = 'rgb(255, 0, 0)';
                break;
        }
        let followMouse = false;
        let mouse = {
            x: player.x,
            y: player.y
        };
        canvas.addEventListener('click', () => {
            followMouse = !followMouse;
        });
        canvas.addEventListener('mousemove', (e) => {
            if (followMouse) {
                mouse.x = e.clientX;
                mouse.y = e.clientY;
            }
        });
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            followMouse = true;
            const touch = e.touches[0];
            mouse.x = touch.clientX;
            mouse.y = touch.clientY;
        }, {
            passive: false
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (followMouse) {
                const touch = e.touches[0];
                mouse.x = touch.clientX;
                mouse.y = touch.clientY;
            }
        }, {
            passive: false
        });
        canvas.addEventListener('touchend', (e) => {
            followMouse = false;
        });
        const movePlayerTowardMouse = () => {
            if (!followMouse || isMagmaxFirstOn) return;

            const dx = mouse.x - player.x;
            const dy = mouse.y - player.y;
            const distance = Math.hypot(dx, dy);
            if (distance > 1) {
                const speed = Math.min(player.speed, distance * 0.05);
                const moveX = (dx / distance) * speed;
                const moveY = (dy / distance) * speed;
                player.x += moveX;
                player.y += moveY;
            }
        };
        const updatePositions = () => {
            allObjects.forEach(obj => {
                if (obj.type === 'homing') {
                    const dxToPlayer = player.x - obj.x;
                    const dyToPlayer = player.y - obj.y;
                    const distance = Math.hypot(dxToPlayer, dyToPlayer);

                    if (distance < 125) {
                        const targetAngle = Math.atan2(dyToPlayer, dxToPlayer);
                        const currentAngle = Math.atan2(obj.dy, obj.dx);
                        let angleDiff = targetAngle - currentAngle;

                        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

                        // angle strength rotate
                        const newAngle = currentAngle + angleDiff * 0.026;
                        obj.dx = Math.cos(newAngle) * obj.speed;
                        obj.dy = Math.sin(newAngle) * obj.speed;
                    }
                }

                if (obj.type === 'sniper') {
                    obj.shootCooldown--;
                    if (obj.shootCooldown <= 0) {
                        const dx = player.x - obj.x;
                        const dy = player.y - obj.y;
                        const distance = Math.hypot(dx, dy);
                        // bullet speed
                        const bulletSpeed = 3.5;
                        allBullets.push({
                            x: obj.x,
                            y: obj.y,
                            dx: (dx / distance) * bulletSpeed,
                            dy: (dy / distance) * bulletSpeed,
                            radius: obj.radius * 0.4,
                            color: obj.color
                        });
                        // Shoot cd
                        obj.shootCooldown = 120;
                    }
                }

                if (obj.type === 'dash') {
                    if (obj.dashPhase === undefined) {
                        obj.dashPhase = 'accelerate';
                        obj.currentSpeed = 0;
                        const norm = Math.hypot(obj.dx, obj.dy);
                        obj.dirX = obj.dx / norm;
                        obj.dirY = obj.dy / norm;
                    }

                    const acceleration = 1;
                    const deceleration = 0.025;

                    if (obj.dashPhase === 'accelerate') {
                        obj.currentSpeed += acceleration;
                        if (obj.currentSpeed >= obj.speed) {
                            obj.currentSpeed = obj.speed;
                            obj.dashPhase = 'decelerate';
                        }
                    } else if (obj.dashPhase === 'decelerate') {
                        obj.currentSpeed -= deceleration;
                        if (obj.currentSpeed <= 0.1) {
                            obj.currentSpeed = obj.speed;
                            obj.dashPhase = 'accelerate';
                        }
                    }

                    obj.dx = obj.dirX * obj.currentSpeed;
                    obj.dy = obj.dirY * obj.currentSpeed;

                    if (obj.x - obj.radius < 0 || obj.x + obj.radius > canvas.width) {
                        obj.dirX *= -1;
                        obj.dx *= -1;
                    }
                    if (obj.y - obj.radius < 0 || obj.y + obj.radius > canvas.height) {
                        obj.dirY *= -1;
                        obj.dy *= -1;
                    }
                }

                obj.x += obj.dx;
                obj.y += obj.dy;

                if (obj.x - obj.radius < 0 || obj.x + obj.radius > canvas.width) {
                    obj.dx *= -1;
                }
                if (obj.y - obj.radius < 0 || obj.y + obj.radius > canvas.height) {
                    obj.dy *= -1;
                }
            });

            allBullets.forEach(b => {
                b.x += b.dx;
                b.y += b.dy;
            });
        };
        let touchesCount = 0;
        let healthPrc = 100;
        let animationId;
        let invulnerability = false;
        let isMagmaxFirstOn = false;
        window.addEventListener('keydown', ev => {
            if (ev.code === 'KeyZ') {
                isMagmaxFirstOn = !isMagmaxFirstOn;
                invulnerability = isMagmaxFirstOn;
                if (isMagmaxFirstOn) {
                    followMouse = false;
                } else {
                    followMouse = true;
                }
            }
        });

        const magmaxAbilityFirst = () => {
            if (isMagmaxFirstOn && player.engAmount > 1) {
                player.engAmount -= 0.25;
                invulnerability = true;
                player.color = 'rgb(175, 0, 0)';
                followMouse = false;
                if (player.engAmount <= 1) {
                    isMagmaxFirstOn = false;
                    invulnerability = false;
                    followMouse = true;
                }
            } else if (!isMagmaxFirstOn) {
                player.engAmount += player.energyRegen * 0.025;
                player.color = 'rgb(255, 0, 0)';
            }
        };

        const checkCollisions = () => {
            for (const enemy of allObjects) {
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                const distance = Math.hypot(dx, dy);
                if ((distance < enemy.radius + player.radius) && !invulnerability) {
                    touchesCount++;
                    healthPrc--;
                    break;
                }
            }
            for (const bullet of allBullets) {
                const dx = bullet.x - player.x;
                const dy = bullet.y - player.y;
                const distance = Math.hypot(dx, dy);
                if ((distance < bullet.radius + player.radius) && !invulnerability) {
                    // bullet dmg
                    touchesCount += 15;
                    healthPrc -= 15;

                    bullet.x = -1000;
                    bullet.y = -1000;
                }
            }

            const dxHeal = healPill.x - player.x;
            const dyHeal = healPill.y - player.y;
            const distHeal = Math.hypot(dxHeal, dyHeal);
            if (distHeal < healPill.radius + player.radius) {
                healPill.x = getRandom(0, canvas.width);
                healPill.y = getRandom(0, canvas.height);
                healthPrc += 20;
                touchesCount -= 20;
            }

            const dxPoints = pointsPill.x - player.x;
            const dyPoints = pointsPill.y - player.y;
            const distPoints = Math.hypot(dxPoints, dyPoints);
            if (distPoints < pointsPill.radius + player.radius) {
                pointsPill.x = getRandom(0, canvas.width);
                pointsPill.y = getRandom(0, canvas.height);
                timerSeconds += 25;
                timer.textContent = `Points: ${timerSeconds}`;
            }

            const dxMaxEnergy = maxEnergyPill.x - player.x;
            const dyMaxEnergy = maxEnergyPill.y - player.y;
            const distMaxEnergy = Math.hypot(dxMaxEnergy, dyMaxEnergy);
            if (distMaxEnergy < maxEnergyPill.radius + player.radius) {
                maxEnergyPill.x = getRandom(0, canvas.width);
                maxEnergyPill.y = getRandom(0, canvas.height);
                player.energyMax += 4;
            }

            const dxEnergyRegen = energyRegenPill.x - player.x;
            const dyEnergyRegen = energyRegenPill.y - player.y;
            const distEnergyRegen = Math.hypot(dxEnergyRegen, dyEnergyRegen);
            if (distEnergyRegen < energyRegenPill.radius + player.radius) {
                energyRegenPill.x = getRandom(0, canvas.width);
                energyRegenPill.y = getRandom(0, canvas.height);
                player.energyRegen += 0.4;
            }

            hltFillBar.style.width = `${healthPrc}%`;
            engFillBar.style.width = `${(player.engAmount / player.energyMax) * 100}%`;
            if (touchesCount >= 100) {
                cancelAnimationFrame(animationId);
                textEnd.style.opacity = '1';
            }
        };
        const drawGame = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.beginPath();
            ctx.fillStyle = 'orange';
            ctx.arc(pointsPill.x, pointsPill.y, pointsPill.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = 'lime';
            ctx.arc(healPill.x, healPill.y, healPill.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = 'rgb(0, 0, 255)';
            ctx.arc(maxEnergyPill.x, maxEnergyPill.y, maxEnergyPill.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = 'rgb(231, 25, 159)';
            ctx.arc(energyRegenPill.x, energyRegenPill.y, energyRegenPill.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = player.color;
            ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fill();

            allObjects.forEach(obj => {
                ctx.beginPath();
                ctx.fillStyle = obj.color;
                ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 3.5;
                ctx.stroke();
                ctx.fill();
            });
            allBullets.forEach(b => {
                ctx.beginPath();
                ctx.fillStyle = b.color;
                ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                ctx.fill();
            });
            healthBar.style.left = `${player.x - 23}px`;
            healthBar.style.top = `${player.y + 20}px`;
            energyBar.style.left = `${player.x - 23}px`;
            energyBar.style.top = `${player.y + 30}px`;

            if (healthPrc > 100) {
                healthPrc = 100;
                touchesCount = 0;
            }
            if (player.engAmount > player.energyMax) {
                player.engAmount = player.energyMax;
            } else if (player.engAmount < 0) {
                player.engAmount = 0;
            }
        }
        const animate = () => {
            animationId = requestAnimationFrame(() => {
                animate();
            });
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            updatePositions();
            movePlayerTowardMouse();
            setTimeout(() => {
                checkCollisions();
            }, 2000);
            drawGame();
            magmaxAbilityFirst();
        };

        let timerSeconds = 0;
        setTimeout(() => {
            const timeSurvival = setInterval(() => {
                timerSeconds++;
                timer.textContent = `Points: ${timerSeconds}`;
                if (touchesCount >= 100) {
                    clearInterval(timeSurvival);
                    timerSeconds--;
                    timer.textContent = `Points: ${timerSeconds}`;
                }
            }, 1000);
        }, 1000);


        fetch('enemies.json')
            .then(res => res.json())
            .then(enData => {
                for (g = 0; g < enData.length; g++) {
                    for (n = 0; n < enData[g].amount; n++) {
                        createObject(enData[g].radius, enData[g].speed, enData[g].type);
                    }
                }

            })


        animate();

        clearInterval(gameStarted);
    }
}, 1);
