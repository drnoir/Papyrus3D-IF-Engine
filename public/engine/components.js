// Papyrus component system
// Components for papyrus engine VR / AR
// Dependency tree - A-Frame / A-Frame Extras / Papyrus
// ENGINE CORE IMPORTS
import { nextScene, loadData, populateDiag,
    // nextPassageForChar, 
    populateInteractions,populateMessage, shootAt, gotKey,getPlayerKeysInfo, enemyCombatAttack, getPlayerHealth,    setPlayerHealth,clearScene, loadNewLevel } from "./papyrus.js";
// CURSOR 
AFRAME.registerComponent('cursor-listener', {
    init: function () {
        let lastIndex = -1;
        // const COLORS = ['red', 'green'];
        this.el.addEventListener('click', function (evt) {
            nextScene();
        });
    }
});

// HEALTH UI WITH UPDATES FOR UPDATING UI OF PLAYER HEALTH 
AFRAME.registerComponent('playerhealth', {
    schema: {
        color: { type: 'color', default: 'white' },
        visible: { type: 'boolean', default: true },
    },
    init: function () {
        const data = this.data;
        const el = this.el;
        const visible = data.visible;
        const elHeight = el.height;
        let health = getPlayerHealth();
        el.setAttribute('value', 'Health ' + health)
    },
    updated: function () {
        let health = getPlayerHealth();
        el.setAttribute('value', 'Health ' + health)
    },
    remove: function () {
        // Do something the component or its entity is detached.
        this.el.destroy();
    },
});
// START GAME BUTTON FOR INIT OF NEW GAME 
AFRAME.registerComponent('startgamebtn', {
    schema: {
        color: { default: 'red' }
    },
    init: function () {
        const data = this.data;
        const el = this.el;
        const defaultColor = el.getAttribute('material').color;

        el.addEventListener('mouseenter', function () {
            el.setAttribute('color', data.color);
            loadData(1);
            el.remove();
        });

        el.addEventListener('mouseleave', function () {
            el.setAttribute('color', defaultColor);
        });
    },
    remove: function () {
        this.el.destroy();
    },
});
// ADD GLOW FX 
AFRAME.registerComponent('glowfx', {
    schema: {
        color: { type: 'color', default: 'yellow' },
        visible: { type: 'boolean', default: true }
    },
    init: function () {
        const data = this.data;
        const el = this.el;
        const visible = data.visible;
        const elHeight = this.el.height;
        // Do something when component first attached.
        const aImage = document.createElement('a-image');
        aImage.setAttribute('src', '#glow');
        aImage.setAttribute('look-at', '#player');
        aImage.setAttribute('material', 'transparent: true; opacity: 0.8; alphaTest: 0.01;');
        aImage.setAttribute('color', data.color);
        aImage.setAttribute('position', '0 0 0');
        aImage.setAttribute('rotation', '-90 0 0');
        aImage.setAttribute('scale', '0.3 0.3 0.3');
        aImage.setAttribute('geometry', 'primitive: circle;');
        aImage.setAttribute('visible', visible);
        aImage.setAttribute('animation__pulse', 'property: material.opacity; from: 1.0; to: 0.0; dur: 4000; loop: true; dir: alternate; easing: linear;');
        el.appendChild(aImage);
    },
    remove: function () {
        this.el.destroy();
    },
});
// PLAYER CAM componenet
AFRAME.registerComponent('playercam', {
    schema: {
        color: { type: 'color', default: 'white' },
        position: { type: 'string', default: '0 0 -3' },
        rotation: { type: 'string', default: '0 0 0' },
        scale: { type: 'string', default: '1 1 1' },
        camNum: { type: 'number', default: 1 },
        camTestMode: { type: 'boolean', default: false },
        facePathID: { type: 'string', default: '#playerFace' },
        facePathMtl: { type: 'string', default: '#playerFaceMat' }
    },
    init: function () {
        const data = this.data;
        const el = this.el;
        let scale = data.scale; let pos = data.position; let rot = data.rotation;
        let camnum = data.camNum;
        const elScale = this.el.scale;
        const facePathID = data.facePathID;
        const newCursor = document.createElement('a-entity');
        const newDialogueUI = document.createElement('a-entity');
        const newCam = document.createElement('a-entity');
        const playerFace = document.createElement('a-entity');
        // create cam
        newCam.setAttribute('position', pos);
        newCam.setAttribute('id', 'player');
        newCam.setAttribute('class', 'cam' + camnum);
        // testing mode allows for wasd for wondering around
        if (data.camTestMode) {
            newCam.setAttribute('wasd-controls', '');
        }
        newCam.setAttribute('look-controls', '');
        newCam.setAttribute('camera', '');
        scene.appendChild(newCam);
        // create cursor
        newCursor.setAttribute('position', '0 0 -1');
        newCursor.setAttribute('cursor', 'fuse: true; fiseTimeout:500');
        newCursor.setAttribute('geometry', 'primitive: ring; radiusInner: 0.02; radiusOuter: 0.03');
        newCursor.setAttribute('material', 'color: black; shader: flat');
     
        // function to load player face
        // check if model GLB or Obj - create func for this
        if (format === "glb") {
            playerFace.setAttribute('gltf-model', facePathID);
        } else {
            playerFace.setAttribute('obj-model', 'obj:#' + facePathID + ';' + 'mtl:#' + playerFaceMat + ';');
        }
        // create playerFace
        playerFace.setAttribute('position', '-1 0 -1');
        playerFace.setAttribute('geometry', 'primitive: ring; radiusInner: 0.02; radiusOuter: 0.03');
        playerFace.setAttribute('material', 'color: black; shader: flat');
        // create dialogue box
        newDialogueUI.setAttribute('id', 'dialogueID');
        newDialogueUI.setAttribute('position', '0 -0.45 -1');
        newDialogueUI.setAttribute('geometry:', "primitive: plane; width: auto; height: auto");
        newDialogueUI.setAttribute('material:', 'alphaTest:0.4; opacity: 0.8; transparent:true; color:black');
        newCam.appendChild(newCursor);
    },
    remove: function () {
        this.el.destroy();
    },
});

// CHAR 
AFRAME.registerComponent('character', {
    schema: {
        color: { type: 'color', default: 'white' },
        modelPath: { type: 'string', default: 'models/model.glb' },
        position: { type: 'string', default: '0 0.5 -3' },
        rotation: { type: 'string', default: '0 0 0' },
        scale: { type: 'string', default: '1 1 1' },
        animated: { type: 'boolean', default: false },
        patrol: { type: 'boolean', default: false},
        glowOn: { type: 'boolean', default: false },
        charID: { type: 'number', default: 0 },
        numDiag:  { type: 'number', default: 0 },
        Char :  { type: 'string', default: 'clickableChar' },
    },
    multiple: true,
    init: function () {
        const data = this.data;
        const el = this.el;
        const modelPath = data.modelPath;
        let scale = data.scale;
        let pos = data.position;
        let rot = data.rotation;
        let animated = data.animated;
        let patrol = data.patrol;
        let glowOn = data.glowOn;
        const elScale = this.el.scale;
        let numDiag = data.numDiag;
        if (animated) {
            newCharacter.setAttribute('animation-mixer', 'clip: *; loop: repeat; ');
        }
        const charID = data.charID;

        this.el.addEventListener('click', function (evt) {
            populateInteractions(interactionNum);
        })
            // this.el.addEventListener('click', function (evt) {
            // const nextId = this.el.getAttribute('next-id');
            // console.log('clicked char');
            // if (nextId !== null) {
            //   this.el.sceneEl.components.dialogue.currentId = nextId;
            //   this.el.sceneEl.components.dialogue.loadDialogue();
            // }
        //   })
        this.el.addEventListener('click', function (evt) {
            if ( numDiag === 0){
            console.log(charID, numDiag)
            populateDiag(charID,numDiag);
            numDiag=1; 
            }
            else{
            populateDiag(charID,numDiag);
            numDiag++;
            }
        //     const nextId = this.el.getAttribute('next-id');
        //     console.log('clicked char');
        //     if (nextId !== null) {
        //       this.el.sceneEl.components.dialogue.currentId = nextId;
        //       this.el.sceneEl.components.dialogue.loadDialogue();
        //     }   
        })
    },
    tick: function (time, timeDelta) {
        const data = this.data;
        let patrol = data.patrol;
        // let wallDistance = this.distanceCheck();
        // if ( !wallDistance && patrol){
        //     this.patrol();
        // }
    },
    patrol: function () {
        const el = this.el;
        let speed = 0.006;
        el.setAttribute('animation-mixer', 'clip: *; loop: repeat; '); //  NEEDS A TEST WITH MODEL WITH ANIMATION
        let randomDirection = Math.floor(Math.random() * 3);
        let randRot = Math.floor(Math.random() *10);
        let randomRotChance = Math.floor(Math.random() * 2000);
        let randomUpDown = randomUporDown();
    
        // random direction and movement check if ant is on the floor
        // if (randomRotChance >= 1500) {
        //     if (randomUpDown === 'plus' && randomRotChance >= 1500){
        //     el.object3D.rotation.y += randRot;
        //     }
        //     if (randomUpDown === 'minus'  && randomRotChance >=1500){
        //         el.object3D.rotation.y -= randRot;
        //         }
        // }
        if (randomDirection < 1) {
            if (randomUpDown=== 'plus'){
            el.object3D.position.x+=speed;
            el.object3D.position.z+=speed;
            }
            if (randomUpDown === 'minus'){
                el.object3D.position.x-=speed;
                el.object3D.position.z-=speed;
            }
        }
        if (randomDirection < 2) {
            if (randomUpDown=== 'plus'){
                el.object3D.position.x+=speed;
                el.object3D.position.z+=speed;
                }
                if (randomUpDown === 'minus'){
                    el.object3D.position.x-=speed;
                    el.object3D.position.z-=speed;
                }
            // if (randomRotChance >750) {
            //     el.object3D.rotation.y -= randRot;
            // }
        }
        if (randomDirection > 2 && randomDirection < 3) {
            if (randomUpDown=== 'plus'){
                el.object3D.position.x+=speed;
                el.object3D.position.z+=speed;
                }
                if (randomUpDown === 'minus'){
                    el.object3D.position.x-=speed;
                    el.object3D.position.z-=speed;
                }
        }
        if (randomDirection > 3 && randomDirection < 4) {
            if (randomUpDown=== 'plus'){
                el.object3D.position.x+=speed;
                el.object3D.position.z+=speed;
                }
                if (randomUpDown === 'minus'){
                    el.object3D.position.x-=speed;
                    el.object3D.position.z-=speed;
                }
        }
    },

    distanceCheck: function (dt) {
        const el = this.el;
        const wall = document.getElementsByClassName('wall')[0];
        let speed = 0.006;
        // console.log(wall);
        let wallPos = wall.object3D.position;
        let distanceToWall = el.object3D.position.distanceTo(wallPos);
        // move away if a wall    
        if (distanceToWall <6) {
            // let floorPos = floor.getAttribute(position);
          el.object3D.position.x=wallPos.x-=speed;
          el.object3D.position.z=wallPos.z-=speed;
        }

        let goAwayFromWall =  distanceToWall <1 ? true : false;
        console.log('move away from wall'+goAwayFromWall);
        return goAwayFromWall;
      
    },
    remove: function () {
        this.el.destroy();
    },

});

function randomUporDown(){
    let randomChance =  Math.random()*350;
    // console.log('RANDOMNUM FOR DIR'+randomChance);

    if(randomChance<50){
        return 'minus'
    }
    else{
        return 'plus'
    }

}

// ENEMY AI - Pathing and behaviours - BUGGY MOVEMENT
// REFACTOR THIS SO THAT ENEMY MOVEMENT CHECKS FOR 0 (FLOOR) INSTEAD OF CHECKING A BUNCH OF OTHER SHITE
AFRAME.registerComponent('enemy', {
    schema: {
        color: { type: 'color', default: 'white' },
        modelPath: { type: 'string', default: './models/deadcop.glb' },
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
        health: { type: 'number', default: 5 },
        status: { type: 'string', default: 'alive' },
        speed: { type: 'number', default: 0.015 },
        patrol: { type: 'boolean', default: true }
    },
    multiple: true,
    init: function () {
        let data = this.data;
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
        let lifeStatus = data.status;
        // create a char based on attributes
        const newEnemy = document.createElement('a-entity');
        // newEnemy.setAttribute('position', pos);
        newEnemy.object3D.position.set(pos);
        newEnemy.setAttribute('glowFX', 'visible:' + glowOn);

        // health bar UI
        const healthBar = document.createElement('a-box');
        const healthBarTracker = document.createElement('a-box');
        let healthBarVal = health / 10 * 3;
        healthBar.setAttribute('height', 0.2);
        healthBar.setAttribute('position', '0 1.5 0');
        healthBar.setAttribute('width', 1);
        healthBar.setAttribute('depth', 0.1);
        healthBar.setAttribute('material', 'color:white');
        healthBarTracker.setAttribute('height', 0.2);
        healthBarTracker.setAttribute('width', 1);
        healthBarTracker.setAttribute('depth', 0.15);
        healthBarTracker.setAttribute('position', '0 0 0');
        healthBarTracker.setAttribute('material', 'color:red');
        healthBarTracker.setAttribute('HealthBarid', id);
        healthBar.appendChild(healthBarTracker);

        // check if model GLB or Obj - this can probably be made into a util function and put into papyrus core
        if (format === "glb") {
            newEnemy.setAttribute('gltf-model', '#' + modelID);
        } else {
            newEnemy.setAttribute('obj-model', 'obj:#' + modelID + ';' + 'mtl:#' + modelMat + ';');
        }
        //check for scale and animation
        newEnemy.setAttribute('scale', scale);
        if (animated) {
            newEnemy.setAttribute('animation-mixer', 'clip: *; loop: repeat; ');
        }
        newEnemy.setAttribute('rotation', rot);
        el.appendChild(newEnemy);
        el.appendChild(healthBar);
        // on gaze cursor interaction
        el.addEventListener('click', function (evt) {
            // console.log('click detect', newEnemy);
            let newMeleeAttack = shootAt(0);
            if (newMeleeAttack > 0 && lifeStatus === 'alive') {
                // new health is for UI , health is the enemies health
                health = -newMeleeAttack;
                // healthBarVal = health / 10 * 3;
                // console.log('enemy health reassigned to ' + health)
                healthBarTracker.setAttribute('width', healthBarVal);
                if (lifeStatus === 'alive' && health >1) {
                    let player = document.getElementById('playercam');
                    let distanceToPlayerCheck = this.el.object3D.position.distanceTo(target)<5;
                    // move away if a wall    
                    if (distanceToPlayerCheck < 0.2) {
                        console.log(distanceToPlayerCheck)
                        enemyCombatAttack();
                    }
                } else {
                    // enemy dies
                    lifeStatus = 'dead';
                    let deathAudio = document.querySelector("#death");
                    deathAudio.play();
                    console.log('Enemy is dead');
                    el.emit(`enemydead`, null, false);
                    // create death effect - explode?

                    // delay removal then remove
                    this.remove();
                }
            }
        });
    },
    tick: function (time, timeDelta) {
        let playerDistance = this.distanceToPlayer();
        let wallDistance = this.distanceCheck();
        // console.log('enemy distance checks'+playerDistance, wallDistance)
        if (playerDistance || !wallDistance){
            this.moveRandom();
        }
    },
    moveRandom: function () {
        const el = this.el;
        let data = this.data;
        let speed = data.speed;
        el.setAttribute('animation-mixer', 'clip: Run; loop: repeat; '); //  NEEDS A TEST WITH MODEL WITH ANIMATION
        let randomDirection = Math.floor(Math.random() * 5);
        let randRot = Math.floor(Math.random() * 1);
        let randomRotChance = Math.floor(Math.random() * 1000);
        // random direction and movement check if ant is on the floor
        if (randomDirection < 1) {
            el.object3D.position.x += speed ;
            el.object3D.position.z += speed ;
            if (randomRotChance > 850) {
                el.object3D.rotation.y += randRot;
            }
        }
        if (randomDirection < 2) {
            el.object3D.position.x -= speed;
            el.object3D.position.z -= speed;
            if (randomRotChance >750) {
                el.object3D.rotation.y -= randRot;
            }
        }
        if (randomDirection > 2 && randomDirection < 3) {
            el.object3D.position.z -= speed;
        }
        if (randomDirection > 3 && randomDirection < 4) {
            el.object3D.position.z += speed;
        }
    },
    distanceToPlayer: function () {
        // console.log('distanceToPlayerCheck');
        const target = document.getElementById('playercam');
        let distanceToPlayerCheck = this.el.object3D.position.distanceTo(target)<=3;
        // console.log(distanceToPlayerCheck);
        // move towards player and attack or move randomly (Patrol later?)
        if (distanceToPlayerCheck) {
            console.log('enemy is close to player, attack!');
            this.moveToPlayer();
            this.enemyCombatAttack();
        }
        let goAwayFromPlayer =  distanceToPlayerCheck <=3 ? true : false;
        console.log('move from player check'+goAwayFromPlayer)
        return  goAwayFromPlayer;
    },
    distanceCheck: function (dt) {
        // const wall = document.querySelector('a-box');
        const wall = document.getElementsByClassName('wall')[0];
        // console.log(wall);
        let wallPos = wall.object3D.position
        let distanceToWall = this.el.getAttribute("position").distanceTo(wallPos)
    //    console.log(distanceToWall
        // console.log(distanceToWall);
        // move away if a wall    
        if (distanceToWall <5) {
            // let floorPos = floor.getAttribute(position);
           this.el.object3D.position.x+= 0.1;
            this.el.object3D.position.z+= 0.1;
        }

        let goAwayFromWall =  distanceToWall <1 ? true : false;
        // console.log('move away from wall'+goAwayFromWall);
        return goAwayFromWall;
      
    },
    moveToPlayer: function () {
            const el = this.el;
            const target = document.getElementById('playercam');
            let vec3 = new THREE.Vector3();
            const currentPosition = el.getAttribute("position");
            vec3 = this.el.object3D.worldToLocal(target.object3D.position.clone());
            var camFromOrca = currentPosition.distanceTo(target.object3D.position);
            if (camFromOrca<=3) {
                // console.log('enemy move player triggered - player is close - move towards player');
                // console.log(distanceBetween);
                this.el.object3D.position.x += 1;
                this.el.object3D.position.multiplyScalar(2);
                this.el.object3D.position.sub(vec3);

                this.el.object3D.position.z += 1;
                this.el.object3D.position.multiplyScalar(2);
                this.el.object3D.position.sub(vec3);
            }
            let goToPlayer = camFromOrca <=3 ? true : false;
            return goToPlayer;
   
    },
    remove: function () {
        const el = this.el;
        el.destroy();
    },
});

AFRAME.registerComponent('intersection-spawn', {
    schema: {
        default: '',
        parse: AFRAME.utils.styleParser.parse
    },
    init: function () {
        const data = this.data;
        const el = this.el;
        el.addEventListener(data.event, evt => {
            // Create element.
            console.log(data.evt);
            const spawnEl = document.createElement('a-entity');
            // Snap intersection point to grid and offset from center.
            spawnEl.setAttribute('position', evt.detail.intersection.point);
            // Set components and properties.
            Object.keys(data).forEach(name => {
                if (name === 'event') {
                    return;
                }
                AFRAME.utils.entity.setComponentProperty(spawnEl, name, data[name]);
            });
            // Append to scene.
            el.sceneEl.appendChild(spawnEl);
        });
    }
});

// Positioning component
AFRAME.registerComponent('playermovement', {
    schema: {
        default: '',
    },
    init: function () {
        this.el.addEventListener('click', function (evt) {
            let newPos = this.object3D.position;
            const playercam = document.getElementById('playercam')
            const playercamPos = document.getElementById('playercam').object3D.position;
            // distance checking
            // console.log(newPos.x, newPos.z);
            let distanceCheck = playercamPos.distanceTo(newPos);
            console.log(distanceCheck);
            if (distanceCheck <=3.5) {
                playercam.object3D.position.set(newPos.x, 1.5, newPos.z);
            }
            })
    }
});

AFRAME.registerComponent('triggerdiagfloor', {
    schema: {
        default: '',
        selfdestruct: { type: 'boolean', default: false }
    },
    init: function () {
        this.el.addEventListener('click', function (evt) {
            populateDiag(5, 0);
            if (this.data.selfdestruct) {
                this.remove();
            }
        })
    },
    remove: function () {
        const el = this.el;
        el.destroy();
    },
});

//prefab Loading - Works
AFRAME.registerComponent('prefab', {
    schema: {
        triggerDialogue: { type: 'boolean', default: false },
        interactionNum: { type: 'number', default: 0 },
    },
    init: function () {
        const data = this.data;
        const el = this.el;
        const triggerDialogue = this.data.triggerDialogue;
        const interactionNum = this.data.interactionNum;
        if (triggerDialogue) {
            this.el.addEventListener('click', function (evt) {
                populateInteractions(interactionNum);
            })
        }
    },
    remove: function () {
        const el = this.el;
        el.destroy();
    },
});


// door open and shut (Works)
AFRAME.registerComponent('door', {
    schema: {
        locked: { type: 'boolean', default: false },
        doorLockNum: { type: 'number', default: 0 },
        key: {type: 'boolean', default: false},
        keyColor: {type: 'string', default: 'blue'},
    },
    init: function () {
        const el = this.el;
        const data = this.data;
        let locked = data.locked;
        let key = data.key;
        let keyColor= data.keyColor;
        this.closeDoor = AFRAME.utils.bind(this.closeDoor, this);

        if (key){
            el.setAttribute('color', keyColor);
            locked = true;
        }

        const doorPos = el.getAttribute('position');

        this.el.addEventListener('click', function (evt) {
            if (!locked) {
                let x = doorPos.x; let y = doorPos.y; let z = doorPos.z; let newX = x - 1; let newY = y-1;
                el.setAttribute('animation', "property: position; to:" + newX + y + z + "; loop:  false; dur: 5000");
                let doorAudio = document.querySelector("#dooropen");
                doorAudio.play();
            }
            else if (key) {
                const playerKeys = getPlayerKeysInfo();
                if (playerKeys.find((element) => element === 'blue' || 'yellow' || 'red' )){
                let x = doorPos.x; let y = doorPos.y; let z = doorPos.z; let newX = x - 1; let newY = y-1;
                el.setAttribute('animation', "property: position; to:" + newX + y+ z + "; loop:  false; dur: 5000");
                let doorAudio = document.querySelector("#dooropen");
                doorAudio.play();
                populateMessage(keyColor+' door', keyColor+' door opened')
                locked = false;
                }
                else{
                    populateMessage('Locked '+keyColor+' Key Door', 'This door is locked, you need to find a '+keyColor+' key to open it');
                }
            }
            // locked door checks
            else {
                populateMessage('Locked Door', 'This door is locked, you may need to find a matching key for it');
            }
        })
    },
    closeDoor: function () {
        const el = this.el;
        setTimeout(resetAnim(el), 8000);
        function resetAnim(el) {
            let x = doorPos.x; let y = doorPos.y; let z = doorPos.z;
            let newY = y + 3;
            el.setAttribute('animation', "property: position; to:" + x +  newY + z + "; loop:  false; dur: 5000")
        }
    },
    remove: function () {
        const el = this.el;
        el.destroy();
    },
});

// key pickup componenet
AFRAME.registerComponent("key", {
    schema: {
        color: {type: 'string', default: 'blue'},
        keyNumber: {type: 'number', default: 1},
    },
    init: function () {
        const data = this.data;
        const el = this.el;
        const keyNumber = data.keyNumber;
        const color = data.color;
        this.el.addEventListener('click', function (evt) {
            gotKey(color);
            let keyPickAudio = document.querySelector("#keypickup");
            keyPickAudio.play();
            this.remove();
            populateMessage('Blue Key', 'You have collected the '+color+' key')
        })
    
    
    },
    remove: function () {
        const el = this.el;
        el.destroy();
    },
}
)

AFRAME.registerComponent("load-texture", {
    schema: {
        src: { type: 'string', default: 'textures/structures/rocky.JPG' },
    },
    init: function () {
        const data = this.data;
        const el = this.el;
        let src = data.src;
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(src,
            // onLoad
            function (tex) {
                let mesh = el.getObject3D('mesh')
                mesh.material.map = tex;

            },
            // onProgress
            undefined,
            //onError
            function (err) {
                console.error('An error happened.');
            });
    }
})


AFRAME.registerComponent("triggerdmg", {
    schema: {
        dmgAmount : {type: 'number', default: 20}
    },
    init: function () {
        const data = this.data;
        const el = this.el;
        let dmgAmount = data.dmgAmount;
        const healthbarComp  = document.querySelector('[healthbar]').components.healthbar;
    
        this.el.addEventListener('click', function (evt) {
            healthbarComp.reduceHealthBar(dmgAmount)
        })
    },
    remove: function () {
        const el = this.el;
        el.destroy();
    },
})
// component for triggering an exit event
AFRAME.registerComponent('exit', {
    schema: {
        color: { type: 'string', default: 'green' },
        modelID: { type: 'string', default: 'exit' },
        modelMat: { type: 'string', default: 'exit' },
        position: { type: 'string', default: '0 0.1 0' },
        rotation: { type: 'string', default: '0 0 0' },
        scale: { type: 'string', default: '0.1 0.1 0.1' },
        status: { type: 'string', default: 'false' },
        toLoad: { type: 'number', default: 1 }
    },

    init: function () {
        const data = this.data; let src = data.src;
        const textureLoader = new THREE.TextureLoader();
        const exit = document.createElement('a-entity');
        let position = data.position;
        let color = data.color;
        let toLoad = data.toLoad;
        let scale = data.scale;

        exit.setAttribute('geometry', 'primitive: box;');
        exit.setAttribute('position', position);
        exit.setAttribute('color', color);
        exit.setAttribute('glowFX', 'visible:' + true);
        exit.setAttribute('scale', scale);

        this.el.addEventListener('click', function (evt) {
            loadNewLevel(toLoad);
            // createOutdoorFloor
        })
    },
    remove: function () {
        const el = this.el;
        el.destroy();
    },
});

// component for  healthbar 
AFRAME.registerComponent('healthbar', {
    schema: {
        health: { type: 'number', default: 100 },
    },

    init: function () {
        const data = this.data; 
        let health = data.health;
        
         // health bar UI
         const healthBarContainer = document.getElementById('healthbarUI');
         const healthBar = document.createElement('a-box');
         const healthBarTracker = document.createElement('a-box');

         healthBar.setAttribute('height', 0.1);
         healthBar.setAttribute('id', 'healthBar');
         healthBar.setAttribute('position', '-1.8 -0.38 0');
         healthBar.setAttribute('width', health/250);
         healthBar.setAttribute('depth', 0.01);
         healthBar.setAttribute('material', 'color:white');
         healthBarTracker.setAttribute('id', 'healthBarTracker');
         healthBarTracker.setAttribute('height', 0.1);
         healthBarTracker.setAttribute('width', health/250);
         healthBarTracker.setAttribute('depth', 0.015);
         healthBarTracker.setAttribute('position', '0 0 0');
         healthBarTracker.setAttribute('material', 'color:green');
         healthBar.appendChild(healthBarTracker);
         healthBarContainer.appendChild(healthBar);
    },
    reduceHealthBar: function (amount, health) {
        const el = this.el;
        const data = this.data; 
        let healthUpdate = getPlayerHealth();
        const healthBarTracker = document.getElementById('healthBarTracker');
        // play player pain audio
        let painAudio = document.querySelector("#playerpain");
        painAudio.play();
        // set new player health and update UI
        setPlayerHealth(amount);
        const healthBarVal100 =  (healthUpdate-amount)/250;
        healthBarTracker.setAttribute('width', healthBarVal100 );
      
    },
    remove: function () {
        const el = this.el;
        el.destroy();
    },
});