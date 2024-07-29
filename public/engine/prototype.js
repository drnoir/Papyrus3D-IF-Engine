async function loadEnemies() {
    const res = await fetch('enemies.json')
    enemies = await res.json();
    console.log(enemies);
}

AFRAME.registerComponent('enemy',
    {
        multiple: true,
        schema: {
            color: { type: 'color', default: 'white' },
            modelPath: { type: 'string', default: './models/grunt.glb' },
            modelID: { type: 'string', default: 'enemy1' },
            modelMat: { type: 'string', default: 'demonMat' },
            format: { type: 'string', default: 'glb' },
            position: { type: 'string', default: '0 0.1 0' },
            rotation: { type: 'string', default: '0 0 0' },
            scale: { type: 'string', default: '1.0 1.0 1.0' },
            animated: { type: 'boolean', default: false },
            glowOn: { type: 'boolean', default: false },
            id: { type: 'number', default: 0 },
            constitution: { type: 'number', default: 10 },
            strength: { type: 'number', default: 5 },
            health: { type: 'number', default: 15 },
            status: { type: 'string', default: 'alive' },
            speed: { type: 'number', default: 0.010 },
            patrol: { type: 'boolean', default: true }
        },
        init: function () {
            this.patrolPoints = [
                { x: 3, y: 1, z: -3 },
                { x: 5, y: 1, z: -5 },
                { x: 8, y: 1, z: -8 },
                { x: 10, y: 1, z: -10 },

            ];
            let data = this.data;
            this.attackDistance = 2;
            this.deathThreshold = 0; // Placeholder for health points
            let lifeStatus = data.status;
            // Start random movement behavior
            lifeStatus === 'alive' ? this.randomMovementInterval = setInterval(this.randomMovement.bind(this), 3000) : null;
            this.lastRotationTime = 0;

            const el = this.el;
            // this is super important for combat - don't delete it
            const id = data.id;
            const modelID = data.modelID;
            const modelMat = data.modelID;
            let scale = data.scale;
            let pos = data.position;
            let rot = data.rotation;
            let format = data.format;
            let animated = data.animated;
            let glowOn = data.glowOn;
            let health = data.health;

            // create a char based on attributes
            const newEnemy = document.createElement('a-entity');
            // newEnemy.setAttribute('position', pos);
            newEnemy.object3D.position.set(pos);
            newEnemy.setAttribute('glowFX', 'visible:' + glowOn);

            // health bar UI
            const healthBar = document.createElement('a-box');
            const healthBarTracker = document.createElement('a-box');
            let healthBarVal = health / 10 * 3;
            healthBar.setAttribute('height', 0.8);
            healthBar.setAttribute('position', '0 3 0');
            healthBar.setAttribute('width', 1);
            healthBar.setAttribute('depth', 0.1);
            healthBar.setAttribute('material', 'color:white');
            healthBarTracker.setAttribute('height', 0.8);
            healthBarTracker.setAttribute('width', 1);
            healthBarTracker.setAttribute('depth', 0.15);
            healthBarTracker.setAttribute('position', '0 0 0');
            healthBarTracker.setAttribute('material', 'color:red');
            healthBarTracker.setAttribute('HealthBarid', 'healthbar' + id);
            healthBar.appendChild(healthBarTracker);
            newEnemy.appendChild(healthBar);
            // check if model GLB or Obj - this can probably be made into a util function and put into papyrus core
            if (format === "glb") {
                newEnemy.setAttribute('gltf-model', '#' + modelID);
            } else {
                newEnemy.setAttribute('obj-model', 'obj:#' + modelID + ';' + 'mtl:#' + modelMat + ';');
            }
            //check for scale and animation
            newEnemy.setAttribute('scale', scale);
            if (animated) {
                newEnemy.setAttribute('animation-mixer', 'clip:Walking; loop: repeat;'); // change this
            }
            newEnemy.setAttribute('rotation', rot);
            el.appendChild(newEnemy);
            el.appendChild(healthBar);
            // on gaze cursor interaction
            el.addEventListener('click', function (evt) {
                // console.log('click detect', newEnemy);
                let newMeleeAttack = shootAt(0);
                console.log('melle attack' + newMeleeAttack)
                if (newMeleeAttack > 0 && lifeStatus === 'alive') {
                    // new health is for UI , health is the enemies health
                    console.log('work out health called')
                    let data = this.data;
                    health = health = -newMeleeAttack;
                    console.log('newhealth' + health)
                    // healthBarVal = health / 10 * 3;
                    // console.log('enemy health reassigned to ' + health)
                    healthBarTracker.setAttribute('width', healthBarVal);
                    const enemyHealthBar = 'healthbar' + id
                    const healthbarComp = document.querySelector(enemyHealthBar).components.healthbar;
                    healthbarComp.reduceHealthBar(newMeleeAttack);
                    if (health <= 0) {
                        lifeStatus = 'dead';
                        console.log('enemy dead triggered' + '+health' + health + 'lifeStatus' + lifeStatus)
                        let deathAudio = document.querySelector("#death");
                        deathAudio.play();
                        console.log('Enemy is dead');
                        el.emit(`enemydead`, null, false);
                        this.die();
                    } else {
                        // after being shot at move to player and attack
                        const playerPosition = document.querySelector('#playercam').getAttribute('position');
                        let moveToPos = { x: playerPosition.x, y: 0.1, x: playerPosition.z }
                        moveTo(moveToPos);
                        console.log('move towards player')
                    }
                }
            });
        },

        randomMovement: function () {
            if (!this.el.isPlaying) return;
            const randomPoint = this.getRandomPatrolPoint();
            this.el.setAttribute('animation-mixer', 'clip:Walking; loop: repeat;');
            this.moveTo(randomPoint);
            this.rotate();
        },

        moveTo: function (position) {
            this.el.setAttribute('animation', {
                property: 'position',
                dur: 2000,
                to: position,
                easing: 'linear'
            });
        },

        rotate: function () {
            const rotation = { x: 0, y: Math.random() * 360, z: 0 };
            this.el.setAttribute('animation__rotation', {
                property: 'rotation',
                dur: 6000,
                to: rotation
            });
        },

        getRandomPatrolPoint: function () {
            return this.patrolPoints[Math.floor(Math.random() * this.patrolPoints.length)];
        },

        tick: function (time, delta) {
            const playerPosition = document.querySelector('#playercam').getAttribute('position');
            const currentPosition = this.el.getAttribute('position');
            const distanceToPlayer = this.calculateDistance(playerPosition, currentPosition);
            let data = this.data;
            let lifeStatus = data.status;

            if (distanceToPlayer <= this.attackDistance && lifeStatus === "alive") {
                this.attack();
                this.moveTo(playerPosition);
            } else if (this.detectWall() && lifeStatus === "alive") {
                this.avoidWall();
            } else if (time - this.lastRotationTime > this.rotationInterval && lifeStatus === "alive") {
                this.rotate();
                this.lastRotationTime = time;
            }

        },

        calculateDistance: function (pos1, pos2) {
            const dx = pos1.x - pos2.x;
            const dy = pos1.y - pos2.y;
            const dz = pos1.z - pos2.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        },

        detectWall: function () {
            const wallPosition = document.querySelector('.wall').getAttribute('position');
            const enemyPosition = this.el.getAttribute('position');
            const distanceToWall = this.calculateDistance(wallPosition, enemyPosition);
            return distanceToWall < 2; // Assume wall detection within 2 units
        },

        avoidWall: function () {
            const currentPosition = this.el.getAttribute('position');
            const newTarget = { x: currentPosition.x + 2, y: currentPosition.y, z: currentPosition.z }; // Move away from the wall
            this.moveTo(newTarget);
        },

        die: function () {
            clearInterval(this.randomMovementInterval);
            // Other death logic here, e.g., remove entity, play death animation, etc.
            console.log("Enemy died!");
            this.el.setAttribute('animation-mixer', 'clip:DeathAni;  loop: once; clampWhenFinished: true;');
        },

        attack: function (targetPosition) {
            // Implement your attack logic here
            console.log('Attacking the target!');
            this.el.setAttribute('animation-mixer', 'clip:Attack;  loop: once; clampWhenFinished: true;');
            // this.el.setAttribute('animation-mixer', { clip: 'Attack' }, {loop:once},{clampWhenFinished: true});
            this.el.setAttribute('animation-mixer', { timeScale: 1 });
            let dmgAmount = enemyCombatAttack();
            const healthbarComp = document.querySelector('[healthbar]').components.healthbar;
            healthbarComp.reduceHealthBar(dmgAmount);
        },

        remove: function () {
            const el = this.el;
            el.destroy();
        },
    });

            // enemies
            // if (mapData[i] === 9) {
            //     let enemy1 = addEnemy(0, i);
            //     enemy1.setAttribute('id', i);
            //     enemy1.setAttribute('status', 'alive');
            //     enemy1.setAttribute('position', charPos);
            //     enemy1.setAttribute('enemy', 'modelID:' + enemy1.model + ';' +
            //         'format:glb; animated:true;' + 'health:' + enemy1.health + 'scale:' + enemy1.scale +
            //         'id:' + i + 'constitution:' + enemy1.constitution);
            //     const floor = createFloor(floorPos);
            //     el.appendChild(floor);
            //     el.appendChild(enemy1);
            // }
// COMBAT SYSTEM -->
// SHOOT
function shootAt(enemyID) {
    const currentEnemy = enemies.enemies[enemyID]; let enemyConst = parseInt(currentEnemy.constitution);
    let playerDicerollDmg = 0; let playerDicerollHit = RandomDiceRoll(1, CombatDiceNumber);
    console.log('player hitroll ' + playerDicerollHit)
    let attackAudio = document.querySelector("#playerattack");
    attackAudio.play();
    triggerMuzzleFX();
    if (playerDicerollHit >= enemyConst) {
        let hitAudio = document.querySelector("#hit");
        hitAudio.play();
        playerDicerollDmg = RandomDiceRoll(1, CombatDMGDiceNumber);
        console.log('You hit! ' + playerDicerollHit / CombatDiceNumber + 'The enemy takes' + playerDicerollDmg);
        return playerDicerollDmg;
    } else {
        console.log(playerDicerollHit / CombatDiceNumber + 'You Missed! and caused ' + playerDicerollDmg + 'damage');
        return playerDicerollDmg;
    }
}
// MELEE ENEMY ATTACK
function enemyCombatAttack(enemyID) {
    const currentEnemy = enemies.enemies[enemyID];
    let playerConst = parseInt(player.constitution);
    let enemyDicerollDmg = 0;
    let enemyDicerollHit = RandomDiceRoll(1, CombatDiceNumber);
    console.log('player hitroll and player const check ' + enemyDicerollHit, playerConst)
    let attackAudio = document.querySelector("#attack");
    attackAudio.play();
    if (enemyDicerollHit >= playerConst) {
        let hitAudio = document.querySelector("#playerhit");
        hitAudio.play();
        enemyDicerollDmg = RandomDiceRoll(1, CombatDMGDiceNumber);
        console.log('The Enemy hit you ' + enemyDicerollHit / CombatDiceNumber + ' you take' + enemyDicerollDmg);
        setPlayerHealth(enemyDicerollDmg);
        console.log('player health' + player.health);
        return enemyDicerollDmg;
    } else {
        console.log(enemyDicerollHit / CombatDiceNumber + 'You Missed! and caused ' + enemyDicerollDmg + 'damage');
        return enemyDicerollDmg;
    }
}

// FX AND 3D UI 0--0
function triggerMuzzleFX() {
    console.log('triggerMUZZLE FX');
    const muzzle = document.getElementById('muzzleFX');
    console.log(muzzle);
    muzzle.setAttribute('visible', true);
    let shotAudio = document.querySelector("#pistolshot");
    shotAudio.play();
    setTimeout(stopMuzzle, 300);
    function stopMuzzle() {
        muzzle.setAttribute('visible', false);
    }
}


//Add enemy to scene function 
function addEnemy(enemyID, enemyNumber) {
    console.log(enemies.enemies[enemyID].id, enemies.enemies[enemyID].name);
    let modelRef = enemies.enemies[enemyID].id;
    let modelID = '#' + modelRef;
    console.log(modelRef);
    let enemy = document.createElement('a-entity');
    enemy.setAttribute('id', modelID + enemyNumber);
    enemy.setAttribute('name', enemies.enemies[enemyID].name);
    enemy.setAttribute('gltf-model', modelID);
    enemy.setAttribute('scale', enemies.enemies[enemyID].scale);
    enemy.setAttribute('enemy', 'animated:true;' + 'health:' + enemies.enemies[enemyID].health + ';' + 'strength:' + enemies.enemies[enemyID].strength + ';' + 'constitution:' + enemies.enemies[enemyID].constitution + ';');
    enemy.setAttribute('static-body', 'mass: 0');
    enemy.setAttribute('rotation', "0 0 0");
    const enemyBoundingBox = document.createElement('a-entity');
    enemyBoundingBox.setAttribute('scale', { x: 1, y: 1, z: 1 });
    enemyBoundingBox.setAttribute('id', 'enBoundingBox' + enemyNumber);
    enemyBoundingBox.setAttribute('geometry', "primitive: box; width: 1; height: 1; depth:1");
    enemyBoundingBox.setAttribute('material', "transparent: true; opacity: 0");
    enemyBoundingBox.setAttribute('position', "0 2 -5");
    enemyBoundingBox.setAttribute('static-body', 'mass:0.5');
    enemyBoundingBox.setAttribute('aabb-collider', "objects:" + modelID + enemyNumber);
    enemy.appendChild(enemyBoundingBox);
    return enemy;
}