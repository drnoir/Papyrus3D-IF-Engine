import {nextScene, loadData} from "./papyrus.js";

AFRAME.registerComponent('cursor-listener', {
    init: function () {
        let lastIndex = -1;
        const COLORS = ['red', 'green', 'blue'];
        this.el.addEventListener('click', function (evt) {
            lastIndex = (lastIndex + 1) % COLORS.length;
            this.setAttribute('material', 'color', COLORS[lastIndex]);
            console.log('I was clicked at: ', evt.detail.intersection.point);
            // nextScene();
        });
    }
});

AFRAME.registerComponent('turnmonitor', {
    schema: {
        color: {type: 'color', default: 'white'},
        visible: {type: 'boolean', default:  true},
        turnNumber: {type: 'number', default:  1},
        turnType: {type: 'array', default:  ['player','enemy']}
    },
    init: function () {
        const data = this.data;
        const el = this.el;
        const visible = data.visible;
        const elHeight = this.el.height;
        let turnNumber = this.data.turnNumber;
        let turnType = this.data.turnType[0];
        el.setAttribute('value', 'Turn '+ turnNumber)

    },
    nextTurn: function () {
        this.turnNumber++;
        el.setAttribute('value', 'Turn '+ this.turnNumber + this.turnType )
        // Do something the component or its entity is detached.
    },
    remove: function () {
        // Do something the component or its entity is detached.
    },
});

AFRAME.registerComponent('startgamebtn', {
    schema: {
        color: {default: 'red'}
    },

    init: function () {
        var data = this.data;
        var el = this.el;  // <a-box>
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

        el.destroy();
        // Do something the component or its entity is detached.
    },
});

AFRAME.registerComponent('glowfx', {
    schema: {
        color: {type: 'color', default: 'white'},
        visible: {type: 'boolean', default:  true}
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
        aImage.setAttribute('color',data.color);
        aImage.setAttribute('position','0 0.1 0');
        aImage.setAttribute('rotation','-90 0 0');
        aImage.setAttribute('scale','0.5 0.5 0.5');
        aImage.setAttribute('geometry','primitive: circle;' );
        aImage.setAttribute('visible',visible);
        aImage.setAttribute('animation__pulse', 'property: material.opacity; from: 1.0; to: 0.0; dur: 6000; loop: true; dir: alternate; easing: linear;');
        el.appendChild(aImage);
    },
    remove: function () {
        // Do something the component or its entity is detached.
    },
});

// player componenet
AFRAME.registerComponent('playercam', {
    schema: {
        color: {type: 'color', default: 'white'},
        position:{type: 'string', default: '0 0 -3'},
        rotation:{type: 'string', default: '0 0 0'},
        scale:{type: 'string', default: '1 1 1'},
        camNum: {type: 'number', default: 1},
        camTestMode:{type: 'boolean', default:  false}
    },
    init: function () {
        const data = this.data;
        const el = this.el;
        let scale = data.scale;
        let pos = data.position;
        let rot = data.rotation;
        let camnum = data.camNum;
        const elScale = this.el.scale;

        const newCursor= document.createElement('a-entity');
        const newDialogueUI = document.createElement('a-entity');
        const newCam = document.createElement('a-entity');
        // create cam
        newCam.setAttribute('position',pos);
        newCam.setAttribute('id','player');
        newCam.setAttribute('class','cam'+camnum);
        // testing mode allows for wasd for wondering around
        if (data.camTestMode) {
            newCam.setAttribute('wasd-controls', '');
        }
        newCam.setAttribute('look-controls', '');
        newCam.setAttribute('camera', '');
        const scene = document.getElementsByName('a-scene');
        scene.appendChild(newCam);

        // create cursor
        newCursor.setAttribute('position','0 0 -1');
        newCursor.setAttribute('cursor','fuse: true; fiseTimeout:500');
        newCursor.setAttribute('geometry', 'primitive: ring; radiusInner: 0.02; radiusOuter: 0.03');
        newCursor.setAttribute('material', 'color: black; shader: flat');
       // create dialogue box
        newDialogueUI.setAttribute('id','dialogueID');
        newDialogueUI.setAttribute('position','0 -0.45 -1');
        newDialogueUI.setAttribute('geometry:', "primitive: plane; width: auto; height: auto");
        newDialogueUI.setAttribute('material:', 'alphaTest:0.4; opacity: 0.8; transparent:true; color:black');

        newCam.appendChild(newCursor);
        newCam.appendChild( newDialogueUI);
    },

    remove: function () {
        // Do something the component or its entity is detached.
    },

});

// player componenet
AFRAME.registerComponent('playermap', {
    schema: {
        color: {type: 'color', default: 'white'},
        position:{type: 'string', default: '0 0 -3'},
        rotation:{type: 'string', default: '0 0 0'},
        scale:{type: 'string', default: '1 1 1'},
        mapNum: {type: 'number', default: 1},
    },
    init: function () {
        const data = this.data;
        const el = this.el;
        let scale = data.scale;
        let pos = data.position;
        let rot = data.rotation;
        let mapNum = data.mapNum;
        const elScale = this.el.scale;

        //fetch map JSOn
        const mapSource = loadMap(mapNum);
        console.log(mapSource);
        console.log(mapSource, mapSource.height);
        // let roomType = sceneMetadata.roomtype;


        const WALL_SIZE = 2;
        const WALL_HEIGHT = 8;
        const WALL_MAP_SIZE = mapSource.height * mapSource.width / mapSource.length;
        const mapContainer =  document.createElement('a-plane');
        mapContainer.setAttribute('height', 10);
        mapContainer.setAttribute('width', 10);
        el.appendChild(mapContainer);
        // let playerPos;
        let mapWall;
        for (let x = 0; x < mapSource.height; x++) {
            for (let y = 0; y < mapSource.width; y++) {
                const i = (y * mapSource.width) + x;
                const position = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 0 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;

                // if the number is 1 - 4, create a wall
                if (mapSource[i] === 0 || mapSource[i] === 1 ||mapSource[i] == 2 || mapSource[i] === 3) {
                    // floor
                    if (mapSource[i] === 0) {
                        mapWall = document.createElement('a-entity');
                        mapWall.setAttribute('geometry','primitive: box; width:'+WALL_MAP_SIZE+'height:'+WALL_MAP_SIZE+'depth:'+WALL_MAP_SIZE);
                        mapWall.setAttribute('position', position);
                        mapWall.setAttribute('color', 'yellow');
                        mapWall.setAttribute('color', 'yellow');
                        mapWall.setAttribute('scale', WALL_MAP_SIZE);
                        mapContainer.appendChild(mapWall);
                    }
                    // 1/2 height wall
                    if (mapSource[i] === 2) {
                        mapWall = document.createElement('a-entity');
                        mapWall.setAttribute('geometry','primitive: box; width:'+WALL_MAP_SIZE+'height:'+WALL_MAP_SIZE+'depth:'+WALL_MAP_SIZE);
                        mapWall.setAttribute('position', position);
                        mapWall.setAttribute('color', 'blue');
                        mapWall.setAttribute('scale', WALL_MAP_SIZE);
                        mapContainer.appendChild(mapWall);
                    }
                    // door
                    if (mapSource[i] === 3) {
                        mapWall = document.createElement('a-entity');
                        mapWall.setAttribute('geometry','primitive: box; width:'+WALL_MAP_SIZE+'height:'+WALL_MAP_SIZE+'depth:'+WALL_MAP_SIZE);
                        mapWall.setAttribute('position', position);
                        mapWall.setAttribute('color', 'brown');
                        mapWall.setAttribute('scale', WALL_MAP_SIZE);
                        mapContainer.appendChild(mapWall);
                    }
                    // play pos
                    // else if (mapData === 8) {
                    //     const playerStart = document.createElement('a-entity');
                    //
                    // }
                    else { // normal walls
                        mapWall = document.createElement('a-entity');
                        mapWall.setAttribute('geometry','primitive: box; width:'+WALL_MAP_SIZE+'height:'+WALL_MAP_SIZE+'depth:'+WALL_MAP_SIZE);
                        mapWall.setAttribute('position', position);
                        mapWall.setAttribute('color', 'blue');
                        mapWall.setAttribute('scale', WALL_MAP_SIZE);
                        mapContainer.appendChild(mapWall);
                    }
                }
            }
        }
    },

    remove: function () {
        // Do something the component or its entity is detached.
    },

});



AFRAME.registerComponent('character', {
    schema: {
        color: {type: 'color', default: 'white'},
        modelPath: {type: 'string', default: 'models/model.glb'},
        position:{type: 'string', default: '0 0.5 -3'},
        rotation:{type: 'string', default: '0 0 0'},
        scale:{type: 'string', default: '1 1 1'},
        animated: {type: 'boolean', default:  false},
        glowOn: {type: 'boolean', default:  false}
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
        newCharacter.setAttribute('position',pos);
        newCharacter.setAttribute('glowFX','visible:'+glowOn);
        newCharacter.setAttribute('gltf-model', modelPath);
        newCharacter.setAttribute('scale', scale);
        if (animated) {
            newCharacter.setAttribute('animation-mixer', 'clip: *; loop: repeat; ');
        }
        newCharacter.setAttribute('rotation',rot);
        charContainer.appendChild(newCharacter);
    },

    remove: function () {
        // Do something the component or its entity is detached.
    },

});


AFRAME.registerComponent('enemy', {
    schema: {
        color: {type: 'color', default: 'white'},
        modelPath: {type: 'string', default: './models/demon.glb'},
        modelID: {type: 'string', default: 'demon'},
        modelMat: {type: 'string', default: 'demonMat'},
        format: {type: 'string', default: 'glb'},
        position:{type: 'string', default: '0 0.1 0'},
        rotation:{type: 'string', default: '0 0 0'},
        scale:{type: 'string', default: '0.2 0.2 0.2'},
        animated: {type: 'boolean', default:  false},
        glowOn: {type: 'boolean', default:  false}
    },
    init: function () {
        const data = this.data;
        const el = this.el;
        const modelPath = data.modelPath;
        const modelID = data.modelID;
        const modelMat = data.modelID;
        let scale = data.scale;
        let pos = data.position;
        let rot = data.rotation;
        let format = data.format;
        let animated = data.animated;
        let glowOn = data.glowOn;
        const elScale = this.el.scale;
        // create a char based on attributes
        const newEnemy = document.createElement('a-entity');
        newEnemy.setAttribute('position',pos);
        newEnemy.setAttribute('glowFX','visible:'+glowOn);
        if (format === "glb") {
            newEnemy.setAttribute('gltf-model', modelPath);
        }
        else{
            newEnemy.setAttribute('obj-model', 'obj:#'+modelID+';'+'mtl:#'+modelMat+';');
        }
        newEnemy.setAttribute('scale', scale);
        if (animated) {
            newEnemy.setAttribute('animation-mixer', 'clip: *; loop: repeat; ');
        }
        newEnemy.setAttribute('rotation',rot);
        el.appendChild( newEnemy);

        el.addEventListener('click', function (evt) {
            this.setAttribute('material', 'color', 'red');
            console.log('enemy clicked at: ', evt.detail.intersection.point);
            // nextScene();
        });
    },

    remove: function () {
        // Do something the component or its entity is detached.
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
                if (name === 'event') { return; }
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
            console.log(evt.detail.intersection.object.material.color);
            this.setAttribute('material', 'color', 'red');
            let newPos =  this.getAttribute('position');
            const playercam = document.getElementById('playercam');
            playercam.setAttribute('position', newPos);
            playercam.object3D.position.y = 1.5;
            console.log('I was clicked at: ', evt.detail.intersection.point);
            // nextScene();
        });
    }
});

async function loadMap(mapToLoad) {
    let fetchURL = './scenes/scene' + mapToLoad + '/map-old.json';
    const res = await fetch(fetchURL)
    let mapSource = await res.json();
    return mapSource;
}

AFRAME.registerComponent("load-texture", {
    schema: {
        src:{type: 'string', default: 'textures/structures/rocky.JPG'},
    },
    init: function() {
        const data = this.data;
        const el = this.el;
        let src = data.src;
        var textureLoader = new THREE.TextureLoader();

        textureLoader.load(src,
            // onLoad
            function(tex) {
                let mesh = el.getObject3D('mesh')
                mesh.material.map = tex;
                console.log(tex);
            },
            // onProgress
            undefined,
            //onError
            function(err) {
                console.error('An error happened.');
            });
    }
})
