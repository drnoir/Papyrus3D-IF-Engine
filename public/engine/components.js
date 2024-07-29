// Papyrus component system
// Components for papyrus engine VR / AR
// Dependency tree - A-Frame / A-Frame Extras / Papyrus
// ENGINE CORE IMPORTS
import {
    nextScene, loadData, populateDiag, addButton,
    // nextPassageForChar, 
    populateInteractions, populateMessage, gotKey, getPlayerKeysInfo, getPlayerHealth, setPlayerHealth, clearScene, loadNewLevel
} from "./papyrus.js";

// CURSOR 
AFRAME.registerComponent('cursor-listener', {
    init: function () {
        this.el.addEventListener('mouseenter', function (evt) {
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
        let pos = data.position;
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
        newCursor.setAttribute('cursor', 'fuse: true; fuseTimeout:500');
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

AFRAME.registerComponent('btnNext', {
    schema: {
        numDiag: { type: 'number', default: 2 },
    },
    init: function () {
        const data = this.data;
        let numDiag = data.numDiag;
        this.el.addEventListener('mouseenter', function (evt) {
            numDiag++;
            populateDiag(charID, numDiag);
        })
    }
});

// CHAR 
AFRAME.registerComponent('character', {
    multiple: true,
    schema: {
        color: { type: 'color', default: 'white' },
        modelPath: { type: 'string', default: 'models/model.glb' },
        position: { type: 'string', default: '0 0.5 -3' },
        rotation: { type: 'string', default: '0 0 0' },
        scale: { type: 'string', default: '1 1 1' },
        animated: { type: 'boolean', default: false },
        patrol: { type: 'boolean', default: false },
        glowOn: { type: 'boolean', default: false },
        charID: { type: 'number', default: 1 },
        numDiag: { type: 'number', default: 1 },
    },

    init: function () {
        const data = this.data;
        let animated = data.animated;
        let numDiag = data.numDiag;
        const charID = data.charID;
        const el = this.el;
        this.el.addEventListener('mouseenter', function (evt) {
            console.log('dialog triggered');
            // populate dialog UI
            populateDiag(charID, numDiag);
            // add next / continue button for passage nav
            let choiceBtn = document.getElementById('nextPassageBtn');
            if (choiceBtn == null) {
                let newChoiceBtn = addButton(numDiag,  charID);
                el.appendChild(newChoiceBtn);
            }
            // increment 
            numDiag++;

        })
        if (animated) {
            newCharacter.setAttribute('animation-mixer', 'clip: *; loop: repeat; ');
        }
    },
    tick: function (time, timeDelta) {
        const data = this.data;
        let patrol = data.patrol;
    },
    remove: function () {
        this.el.destroy();
    },

});

function randomUporDown() {
    let randomChance = Math.random() * 350;
    if (randomChance < 50) {
        return 'minus'
    }
    else {
        return 'plus'
    }
}

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
        this.el.addEventListener('mouseenter', function (evt) {
            let newPos = this.getAttribute('position');
            const playercam = document.getElementById('playercam')
            const playercamPos = document.getElementById('playercam').getAttribute('position');
            const floors = document.querySelectorAll('.floor');
            const thresholdDistance = 1.5; // Distance within which color change happens
            const resetTime = 1200;
            // distance checking
            console.log(newPos.x, newPos.z);
            let distanceCheck = playercamPos.distanceTo(newPos);
            console.log(distanceCheck);
            if (distanceCheck <= 3) {
                // playercam.object3D.position.set(newPos.x, 1.5, newPos.z);
                setTimeout(() => {
                    playercam.setAttribute('position', {
                        x: newPos.x,
                        y: 1.5,
                        z: newPos.z
                    });
                    // 500ms delay before the click action
                    // Iterate over each 'floor' element and check distance
                    floors.forEach(floor => {
                        const floorPosition = floor.object3D.position;
                        const distance = newPos.distanceTo(floorPosition);

                        if (distance <= thresholdDistance) {
                            // Change color if within the threshold distance
                            floor.setAttribute('material', 'color', 'lightblue');
                            // Reset color after a specified time
                            setTimeout(() => {
                                floor.setAttribute('material', 'color', '#fff'); // Original color
                            }, resetTime);
                        }
                    });
                }, 1200); // to prevent the player from moving too fast
            }
        });
    }
});

AFRAME.registerComponent('triggerdiagfloor', {
    schema: {
        default: '',
        selfdestruct: { type: 'boolean', default: false },
        numDiag: { type: 'number', default: 1 },
    },
    init: function () {
        const data = this.data;
        // const numDiag = data.numDiag
        this.el.addEventListener('mouseenter', function (evt) {
            populateInteractions(data.numDiag);
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
            this.el.addEventListener('mouseenter', function (evt) {
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
        key: { type: 'boolean', default: false },
        keyColor: { type: 'string', default: 'blue' },
    },
    init: function () {
        const el = this.el;
        const data = this.data;
        let locked = data.locked;
        let key = data.key;
        let keyColor = data.keyColor;
        this.closeDoor = AFRAME.utils.bind(this.closeDoor, this);
        let playercamPos = document.getElementById('playercam').getAttribute('position');
        const thresholdDistance = 1.5;
        let distance = playercamPos.distanceTo(el.getAttribute('position'));

        if (key) {
            el.setAttribute('color', keyColor);
            locked = true;
        }

        const doorPos = el.getAttribute('position');
        this.el.addEventListener('mouseenter', function (evt) {
            if (!locked) {
                let x = doorPos.x; let y = doorPos.y; let z = doorPos.z; let newX = x - 1; let newY = y - 1;
                el.setAttribute('animation', "property: position; to:" + newX + y + z + "; loop:  false; dur: 5000");
                let doorAudio = document.querySelector("#dooropen");
                doorAudio.play();
            }
            else if (key) {
                const playerKeys = getPlayerKeysInfo();
                if (playerKeys.find((element) => element === 'blue' || 'yellow' || 'red')) {
                    let x = doorPos.x; let y = doorPos.y; let z = doorPos.z; let newX = x - 1; let newY = y - 1;
                    el.setAttribute('animation', "property: position; to:" + newX + y + z + "; loop:  false; dur: 5000");
                    let doorAudio = document.querySelector("#dooropen");
                    doorAudio.play();
                    populateMessage(keyColor + ' door', keyColor + ' door opened')
                    locked = false;
                }
                else {
                    populateMessage('Locked ' + keyColor + ' Key Door', 'This door is locked, you need to find a ' + keyColor + ' key to open it');
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
            el.setAttribute('animation', "property: position; to:" + x + newY + z + "; loop:  false; dur: 5000")
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
        color: { type: 'string', default: 'blue' },
        keyNumber: { type: 'number', default: 1 },
    },
    init: function () {
        const data = this.data;
        const color = data.color;
        this.el.addEventListener('mouseenter', function (evt) {
            gotKey(color);
            let keyPickAudio = document.querySelector("#keypickup");
            keyPickAudio.play();
            this.remove();
            let keyGraphic = document.getElementById(color + 'Key');
            console.log(keyGraphic);
            keyGraphic.setAttribute('visible', 'true')
            populateMessage('Blue Key', 'You have collected the ' + color + ' key')
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
        dmgAmount: { type: 'number', default: 20 }
    },
    init: function () {
        const data = this.data;
        const el = this.el;
        let dmgAmount = data.dmgAmount;
        const healthbarComp = document.querySelector('[healthbar]').components.healthbar;

        this.el.addEventListener('mouseenter', function (evt) {
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
        toLoad: { type: 'number', default: 1 },
        endGame: { type: 'boolean', default: false },
    },

    init: function () {
        const data = this.data;
        const exit = document.createElement('a-entity');
        let position = data.position;
        let color = data.color;
        let toLoad = data.toLoad;
        let scale = data.scale;
        let endGame = data.endGame;
        const el = this.el;

        exit.setAttribute('geometry', 'primitive: box;');
        exit.setAttribute('position', position);
        exit.setAttribute('color', color);
        exit.setAttribute('glowFX', 'visible:' + true);
        exit.setAttribute('scale', scale)

        const doorPos = el.getAttribute('position');

        this.el.addEventListener('mouseenter', function (evt) {
            let playercamPos = document.getElementById('playercam').getAttribute('position');
            const thresholdDistance = 3;
            let distance = playercamPos.distanceTo(playercamPos);
            if (distance < thresholdDistance) {
                let x = doorPos.x; let y = doorPos.y; let z = doorPos.z; let newX = x - 1; let newY = y - 1;
                el.setAttribute('animation', "property: position; to:" + newX + y + z + "; loop:  false; dur: 5000");
                let doorAudio = document.querySelector("#dooropen");
                doorAudio.play();
                switch (endGame) {
                    case true:
                        window.location.href = 'end.html';
                        console.log('You won the game!');
                        break;
                    default:
                        loadNewLevel(toLoad);
                        break;
                }
            }
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
        healthBar.setAttribute('width', health / 250);
        healthBar.setAttribute('depth', 0.01);
        healthBar.setAttribute('material', 'color:white');
        healthBarTracker.setAttribute('id', 'healthBarTracker');
        healthBarTracker.setAttribute('height', 0.1);
        healthBarTracker.setAttribute('width', health / 250);
        healthBarTracker.setAttribute('depth', 0.015);
        healthBarTracker.setAttribute('position', '0 0 0');
        healthBarTracker.setAttribute('material', 'color:green');
        healthBar.appendChild(healthBarTracker);
        healthBarContainer.appendChild(healthBar);
    },
    reduceHealthBar: function (amount, health) {
        let healthUpdate = getPlayerHealth();
        const healthBarTracker = document.getElementById('healthBarTracker');
        // play player pain audio
        let painAudio = document.querySelector("#playerpain");
        painAudio.play();
        // set new player health and update UI
        setPlayerHealth(amount);
        const healthBarVal100 = (healthUpdate - amount) / 250;
        healthBarTracker.setAttribute('width', healthBarVal100);

    },
    remove: function () {
        const el = this.el;
        el.destroy();
    },
});

// component for  healthbar 
AFRAME.registerComponent('Enemyhealthbar', {
    schema: {
        health: { type: 'number', default: 20 },
    },

    init: function () {
        const data = this.data;
        let health = data.health;
        const el = this.el;
        // health bar UI
        const enemyhealthBar = document.createElement('a-box');
        const enemyHealthBarTracker = document.createElement('a-box');
        const pos = el.getAttribute('position');
        enemyhealthBar.setAttribute('height', 0.1);
        enemyhealthBar.setAttribute('id', 'healthBar');
        enemyhealthBar.setAttribute('position', { x: 1, y: 2, z: 3 });
        enemyhealthBar.setAttribute('width', health / 250);
        enemyhealthBar.setAttribute('depth', 0.01);
        enemyhealthBar.setAttribute('material', 'color:white');
        enemyHealthBarTracker.setAttribute('id', 'healthBarTracker');
        enemyHealthBarTracker.setAttribute('height', 0.1);
        enemyHealthBarTracker.setAttribute('width', health / 250);
        enemyHealthBarTracker.setAttribute('depth', 0.015);
        enemyHealthBarTracker.setAttribute('position', '0 0 0');
        enemyHealthBarTracker.setAttribute('material', 'color:green');
        enemyhealthBar.appendChild(healthBarTracker);
        el.appendChild(healthBar);
    },
    reduceHealthBar: function (amount, health) {
        const healthBarTracker = document.getElementById(' enemyHealthBarTracker');
        // play player pain audio
        let painAudio = document.querySelector("#playerpain");
        painAudio.play();
        // set new player health and update UI
        setPlayerHealth(amount);
        const healthBarVal100 = (healthUpdate - amount) / 250;
        healthBarTracker.setAttribute('width', healthBarVal100);

    },
    remove: function () {
        const el = this.el;
        el.destroy();
    },
});

// chat GPT generated dialogue system 
AFRAME.registerComponent("dialogue-trigger", {
    schema: {
        dialogueTarget: { type: "selector" },
    },
    init: function () {
        const npc = this.el;
        npc.addEventListener("mouseenter", () => {
            this.data.dialogueTarget.setAttribute("visible", true);
            this.startDialogue();
        });
    },
    startDialogue: function () {
        const dialogue = JSON.parse(document.getElementById("dialogue").textContent);
        this.displayMessage(dialogue.dialogues[0]);
    },
    displayMessage: function (messageData) {
        const dialogueBox = document.getElementById('dialogueContent');
        dialogueBox.setAttribute("text", "value", messageData.message);
        if (messageData.choices.length > 0) {
            const choicesContainer = document.getElementById("choices");
            choicesContainer.setAttribute("visible", true);
            choicesContainer.innerHTML = "";
            messageData.choices.forEach((choice, index) => {
                const choiceEl = document.createElement("a-entity");
                choiceEl.setAttribute("text", {
                    value: `${index + 1}. ${choice.text}`,
                    align: "center",
                    width: 4,
                    wrapCount: 25,
                    color: "black",
                });
                choiceEl.setAttribute("position", `0 ${-index / 2} 0`);
                choiceEl.setAttribute("clickable", "");
                choiceEl.setAttribute("choice-id", choice.next);
                choicesContainer.appendChild(choiceEl);
            });
        } else {
            const continueText = document.getElementById("continue");
            continueText.setAttribute("visible", true);
            continueText.addEventListener("mouseenter", () => {
                this.data.dialogueTarget.setAttribute("visible", false);
            });
        }
    },
});

AFRAME.registerComponent("clickable", {
    init: function () {
        const el = this.el;
        el.addEventListener("mouseenter", () => {
            const nextDialogueId = el.getAttribute("choice-id");
            const dialogue = JSON.parse(document.getElementById("dialogue").textContent);
            const nextDialogue = dialogue.dialogues.find((d) => d.id === nextDialogueId);
            this.displayMessage(nextDialogue);
        });
    },
});