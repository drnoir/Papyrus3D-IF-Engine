// Papyrus componenet system
// Componenents for papyrus engine VR / AR 
// Dependency - A-Frame / A-Frame Extras

// ENGINE CORE IMPORTS
import {nextScene, loadData, startMeleeCombatAttack, enemyCombatAttack, getPlayerHealth} from "./papyrus.js";

// CURSOR 
AFRAME.registerComponent('cursor-listener', {
    init: function () {
        let lastIndex = -1;
    }
});

// TURN MONITORING
AFRAME.registerComponent('turnmonitor', {
    schema: {
        color: {type: 'color', default: 'white'},
        visible: {type: 'boolean', default: true},
        turnNumber: {type: 'number', default: 1},
        turnType: {type: 'array', default: ['player', 'enemy']}
    },
    init: function () {
        const data = this.data;
        const el = this.el;
        const visible = data.visible;
        const elHeight = this.el.height;
        let turnNumber = this.data.turnNumber;
        let turnType = this.data.turnType[0];
        el.setAttribute('value', 'Turn ' + turnNumber)
    },
    nextTurn: function () {
        this.turnNumber++;
        el.setAttribute('value', 'Turn ' + this.turnNumber + this.turnType)
        // Do something the component or its entity is detached.
    },
    remove: function () {
        // Do something the component or its entity is detached.
    },
});

// HEALTH UI WITH UPDATES FOR UPDATING UI OF PLAYER HEALTH 
AFRAME.registerComponent('playerhealth', {
    schema: {
        color: {type: 'color', default: 'white'},
        visible: {type: 'boolean', default: true},
    },
    init: function () {
        const data = this.data;
        const el = this.el;
        const visible = data.visible;
        const elHeight = this.el.height;
        let health = getPlayerHealth();
        el.setAttribute('value', 'Health ' + health)
    },
    updated: function () {
        let health = getPlayerHealth;
        el.setAttribute('value', 'Health ' + health)
    },
    remove: function () {
        // Do something the component or its entity is detached.
    },
});

// START GAME BUTTON FOR INIT OF NEW GAME 
AFRAME.registerComponent('startgamebtn', {
    schema: {
        color: {default: 'red'}
    },
    init: function () {
        var data = this.data;
        var el = this.el;
        var defaultColor = el.getAttribute('material').color;

        el.addEventListener('mouseenter', function () {
            el.setAttribute('color', data.color);
            loadData();
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
        color: {type: 'color', default: 'white'},
        visible: {type: 'boolean', default: true}
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
        aImage.setAttribute('material', 'transparent: true; opacity: 1.0; alphaTest: 0.01;');
        aImage.setAttribute('color', data.color);
        aImage.setAttribute('position', '0 0.1 0');
        aImage.setAttribute('rotation', '-90 0 0');
        aImage.setAttribute('scale', '0.5 0.5 0.5');
        aImage.setAttribute('geometry', 'primitive: circle;');
        aImage.setAttribute('visible', visible);
        aImage.setAttribute('animation__pulse', 'property: material.opacity; from: 1.0; to: 0.0; dur: 6000; loop: true; dir: alternate; easing: linear;');
        el.appendChild(aImage);
    },
    remove: function () {
        this.el.destroy();
    },
});


// PLAYER CAM componenet
AFRAME.registerComponent('playercam', {
    schema: {
        color: {type: 'color', default: 'white'},
        position: {type: 'string', default: '0 0 -3'},
        rotation: {type: 'string', default: '0 0 0'},
        scale: {type: 'string', default: '1 1 1'},
        camNum: {type: 'number', default: 1},
        camTestMode: {type: 'boolean', default: false},
        facePathID: {type: 'string', default: '#playerFace'},
        facePathMtl: {type: 'string', default: '#playerFaceMat'}
    },
    init: function () {
        const data = this.data;
        const el = this.el;
        let scale = data.scale; let pos = data.position;let rot = data.rotation;
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
        const scene = document.getElementsByName('a-scene');
        scene.appendChild(newCam);
        // create cursor
        newCursor.setAttribute('position', '0 0 -1');
        newCursor.setAttribute('cursor', 'fuse: true; fiseTimeout:500');
        newCursor.setAttribute('geometry', 'primitive: ring; radiusInner: 0.02; radiusOuter: 0.03');
        newCursor.setAttribute('material', 'color: black; shader: flat');
        // create healthbar

        // health bar UI
        const playerHealthBar = document.createElement('a-box');
        const playerhealthBarTracker = document.createElement('a-box');
        this.playerhealthBarTracker = playerhealthBarTracker;
        let playerhealthBarVal = 100;
        playerHealthBar.setAttribute('height', 0.5);
        playerHealthBar.setAttribute('position', '0 8 -0.5');
        playerHealthBar.setAttribute('width', 3);
        playerHealthBar.setAttribute('depth', 0.1);
        playerHealthBar.setAttribute('material', 'color:white');
        playerhealthBarTracker.setAttribute('height', 0.4);
        playerhealthBarTracker.setAttribute('width', playerhealthBarVal.toString());
        playerhealthBarTracker.setAttribute('depth', 0.1);
        playerhealthBarTracker.setAttribute('position', '0 0 0.1');
        playerhealthBarTracker.setAttribute('material', 'color:red');
        playerhealthBarTracker.setAttribute('HealthBarid', 'playerHealthBar');
        playerhealthBar.appendChild(playerhealthBarTracker);
        newCam.appendChild(playerhealthBar);

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
        color: {type: 'color', default: 'white'},
        modelPath: {type: 'string', default: 'models/model.glb'},
        position: {type: 'string', default: '0 0.5 -3'},
        rotation: {type: 'string', default: '0 0 0'},
        scale: {type: 'string', default: '1 1 1'},
        animated: {type: 'boolean', default: false},
        glowOn: {type: 'boolean', default: false}
    },
    init: function () {
        const data = this.data;
        const el = this.el;
        const modelPath = data.modelPath;
        let scale = data.scale;
        let pos = data.position;
        let rot = data.rotation;
        let animated = data.animated;
        let glowOn = data.glowOn;
        const elScale = this.el.scale;
        const charContainer = document.getElementById('characters');
        // create a char based on attributes
        const newCharacter = document.createElement('a-entity');
        newCharacter.setAttribute('position', pos);
        newCharacter.setAttribute('glowFX', 'visible:' + glowOn);
        newCharacter.setAttribute('gltf-model', modelPath);
        newCharacter.setAttribute('scale', scale);
        if (animated) {
            newCharacter.setAttribute('animation-mixer', 'clip: *; loop: repeat; ');
        }
        newCharacter.setAttribute('rotation', rot);
        charContainer.appendChild(newCharacter);
    },
    remove: function () {
        this.el.destroy();
    },

});

// ENEMY 
AFRAME.registerComponent('enemy', {
    schema: {
        color: {type: 'color', default: 'white'},
        modelPath: {type: 'string', default: './models/demon.glb'},
        modelID: {type: 'string', default: 'demon'},
        modelMat: {type: 'string', default: 'demonMat'},
        format: {type: 'string', default: 'glb'},
        position: {type: 'string', default: '0 0.1 0'},
        rotation: {type: 'string', default: '0 0 0'},
        scale: {type: 'string', default: '1 1 1'},
        animated: {type: 'boolean', default: false},
        glowOn: {type: 'boolean', default: false},
        id: {type: 'number', default: 0},
        constitution: {type: 'number', default: 10},
        strength: {type: 'number', default: 5},
        health: {type: 'number', default: 5},
        status: {type: 'string', default: 'alive'}
    },
    init: function () {
        let data = this.data;
        const el = this.el;
        // this is super important for combat - don't delete it
        const id = data.id;
        const modelPath = data.modelPath;
        const modelID = data.modelID;
        const modelMat = data.modelID;
        let scale = data.scale;
        let pos = data.position;
        let rot = data.rotation;
        let format = data.format;
        let animated = data.animated;
        let glowOn = data.glowOn;
        let health = data.health;
        let constitution = data.constitution;
        let strength = data.strength;
        const elScale = this.el.scale;
        let lifeStatus = data.status;

        // create a char based on attributes
        const newEnemy = document.createElement('a-entity');
        newEnemy.setAttribute('position', pos);
        newEnemy.setAttribute('glowFX', 'visible:' + glowOn);

        // health bar UI
        const healthBar = document.createElement('a-box');
        const healthBarTracker = document.createElement('a-box');
        this.healthBarTracker = healthBarTracker;
        let healthBarVal = health / 10 * 3;
        healthBar.setAttribute('height', 0.5);
        healthBar.setAttribute('position', '0 8 0');
        healthBar.setAttribute('width', 3);
        healthBar.setAttribute('depth', 0.1);
        healthBar.setAttribute('material', 'color:white');
        healthBarTracker.setAttribute('height', 0.4);
        healthBarTracker.setAttribute('width', healthBarVal.toString());
        healthBarTracker.setAttribute('depth', 0.1);
        healthBarTracker.setAttribute('position', '0 0 0.1');
        healthBarTracker.setAttribute('material', 'color:red');
        healthBarTracker.setAttribute('HealthBarid', id);
        healthBar.appendChild(healthBarTracker);
        newEnemy.appendChild(healthBar);

        // check if model GLB or Obj - this can probably be made into a util function and put into papyrus core
        if (format === "glb") {
            newEnemy.setAttribute('gltf-model', modelPath);
        } else {
            newEnemy.setAttribute('obj-model', 'obj:#' + modelID + ';' + 'mtl:#' + modelMat + ';');
        }

        newEnemy.setAttribute('scale', scale);
        if (animated) {
            newEnemy.setAttribute('animation-mixer', 'clip: *; loop: repeat; ');
        }

        newEnemy.setAttribute('rotation', rot);
        el.appendChild(newEnemy);

    
        newEnemy.addEventListener('click', function (evt) {
            let newMeleeAttack = startMeleeCombatAttack(0);
            if (newMeleeAttack > 0 && lifeStatus === 'alive') {
                // new health is for UI , health is the enemies health
                health = -newMeleeAttack;
                healthBarVal = health / 10 * 3;
                console.log('enemy health reassigned to ' + health)
                healthBarTracker.setAttribute('width', healthBarVal);

                // const playercam = document.getElementById('playercam');
                // let playercamPos = playercam.getAttribute('position');
                //
                // let distanceCheck = playercam.position.x - pos.x;
                // // if player in range -
                // console.log('playerdistancecheck'+playercam.position.x, pos.x,distanceCheck);
                enemyCombatAttack();
                if (lifeStatus === 'alive'
                    // && distanceCheck <= 50
                ) {
                    // attack player back - ADD RANGE CHECKS LATER
                    enemyCombatAttack();
                } else {
                    lifeStatus = 'dead';
                    let deathAudio = document.querySelector("#death");
                    deathAudio.play();
                    console.log('Enemy is dead');
                    el.emit(`enemydead`, null, false);
                    el.remove();
                }
            }
            // enemy gets killed
        });
    },
    enemyTurn: function () {
        const el = this.el;
    },

    // 
    tick: function () {
        const el = this.el;
        // get elements of player for distance checks 
        // const playercam = document.getElementById('playercam');
        // let playercamPos = playercam.getAttribute('position');
        moveRandom();

        // // Basic AI pathfinding 
        // if (playerCamPos - enemyPos < 5)
        // {
        //     // init attack 
        //     enemyCombatAttack();
        //     // move 
        //     // test val for now no idea what this will do in execution 
        //     enemyPos.x ++;
        //     //retreat 
        //     enemyPos.z ++;
        // } 
    },
    moveRandom: function () {
        const el = this.el;
        // get elements of player for distance checks 
        // const playercam = document.getElementById('playercam');
        // let playercamPos = playercam.getAttribute('position');

        // walk in x + or - random direction?
    
        let randomChance = Math.random() * 2;
        let randomMovemement =  Math.random() * 1;
        console.log(randomChance,randomMovemement);

        if (randomChance>1){
            el.setAttribute('position', { x: pos.x+randomMovemement, y: pos.y, z: pos.z });
        }
        else{
            el.setAttribute('position', { x: pos.x+randomMovemement, y: pos.y, z: pos.z });
        }
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

AFRAME.registerComponent('playermovement', {
    schema: {
        default: '',
    },
    init: function () {
        this.el.addEventListener('click', function (evt) {
            const checkExit = document.getElementById('exit');
            if (checkExit) {
                nextScene();
            }
            else{
            let newPos = this.getAttribute('position');
            const playercam = document.getElementById('playercam');
            playercam.setAttribute('position', newPos);
            playercam.object3D.position.y = 1.5;
            }
        });
    }
});

AFRAME.registerComponent("load-texture", {
    schema: {
        src: {type: 'string', default: 'textures/structures/rocky.JPG'},
    },
    init: function () {
        const data = this.data;
        const el = this.el;
        let src = data.src;
        var textureLoader = new THREE.TextureLoader();
        textureLoader.load(src,
            // onLoad
            function (tex) {
                let mesh = el.getObject3D('mesh')
                mesh.material.map = tex;
                console.log(tex);
            },
            // onProgress
            undefined,
            //onError
            function (err) {
                console.error('An error happened.');
            });
    }
})

AFRAME.registerComponent('exit', {
    schema: {
        color: {type: 'color', default: 'red'},
        modelPath: {type: 'string', default: './models/exit.glb'},
        modelID: {type: 'string', default: 'exit'},
        modelMat: {type: 'string', default: 'exit'},
        position: {type: 'string', default: '0 0.1 0'},
        rotation: {type: 'string', default: '0 0 0'},
        scale: {type: 'string', default: '0.3 0.3 0.3'},
        status: {type: 'string', default: 'false'}
    },

    init: function () {
        const data = this.data; let src = data.src;
        const textureLoader = new THREE.TextureLoader();
        const exit = document.createElement('a-entity');
        
        exit.setAttribute('geometry', 'primitive: box;');
        exit.setAttribute('position', pos); exit.setAttribute('color', color);
        exit.setAttribute('glowFX', 'visible:' + glowOn);
        exit.setAttribute('scale', scale);

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
                console.error('texture load error on exit texture - check texture config and folder');
            });
    },
    remove: function () {
        const el = this.el;
        el.destroy();
    },
});



