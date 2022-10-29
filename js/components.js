import {nextScene} from "./main.js";

AFRAME.registerComponent('cursor-listener', {
    init: function () {
        var lastIndex = -1;
        var COLORS = ['red', 'green', 'blue'];
        this.el.addEventListener('click', function (evt) {
            lastIndex = (lastIndex + 1) % COLORS.length;
            this.setAttribute('material', 'color', COLORS[lastIndex]);
            console.log('I was clicked at: ', evt.detail.intersection.point);
            nextScene();
        });
    }
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

AFRAME.registerComponent('character', {
    schema: {
        color: {type: 'color', default: 'white'},
        modelPath: {type: 'string', default: 'white'},
        position:{type: 'string', default: '0 0 -3'},
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

AFRAME.registerComponent('hiddencollider', {
    schema: {
        visible: {type: 'boolean', default:  true},
        body: {type: 'string', default:  'static-body'}
    },
    init: function () {
        const data = this.data;
        const el = this.el;
        const visible = data.visible;
        const elHeight = this.el.height; // HEIGHT WIDTH ETC
        // Do something when component first attached

        // not sure if it will work but this in theroy should get the geometry of the shape and clone it
        const sourceGeo =  document.createElement('a-box');
        console.log(sourceGeo)
        const walls = document.querySelectorAll('rw-wall');
        sourceGeo.setAttribute('visible', visible ); // we dont want this dummy geometry to be visisble

// set attributes for 'dummy' collider geomoery
        for (let i = 0; i < walls.length; i++) {
            console.log(walls);
            let wallsH = walls[i].height;
            let wallsW = walls[i].width;
            let wallsD = walls[i].depth;

            console.log(wallsH )
            sourceGeo.setAttribute('class', 'collider');
            // this is static body from a-frame physcis sys attirbute
            // sourceGeo.setAttribute('body', 'static-body');
            sourceGeo.setAttribute('position', '0 0  0');
            // sourceGeo.setAttribute('height','0.5');
            // sourceGeo.setAttribute('width','0.5' );
            // sourceGeo.setAttribute('depth','0.5');
            // sourceGeo.setAttribute('scale','1 1 1');
            walls[i].appendChild(sourceGeo);
        }
    },
});