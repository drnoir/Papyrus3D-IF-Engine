// map editor js - main js scrupt for the map editor for creating maps

// global map editor vars

let sceneMetadata;
let textures;
let mapTemplate = [];
let chars;
const mapNumTypes =[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,'char','t','cam']

// dialogueUI Elements
const scene = document.querySelector('a-scene');
const assets = document.querySelector('a-assets');

AFRAME.registerComponent('editor-listener', {
    schema: {
        parse: AFRAME.utils.styleParser.parse,
        visible: {type: 'boolean', default:  true},
        colors: {type: 'array', default: ['red', 'white']}
    },
    init: function () {
        const data = this.data;
        this.el.addEventListener('mouseover', function (evt) {
                let lastHoverIndex = (lastHoverIndex + 1) % data.colors.length;
                this.el.setAttribute('material', 'color', data.colors[lastHoverIndex]);
        });

        this.el.addEventListener('mouseout', function (evt) {
            let lastHoverIndex = (lastHoverIndex - 1) % data.colors.length;
            this.el.setAttribute('material', 'color', data.colors[lastHoverIndex]);
        });

        this.el.addEventListener('click', function (evt) {
            let lastIndex = -1;
                lastIndex = (lastIndex + 1) % mapTemplate.length;
                this.setAttribute('material', 'color', 'red');
                console.log('I was clicked at: ', evt.detail.intersection.point);
                // this.updateMap(indexToReplace,1);
           //  const el = this.el;
           //  const data = this.data;
           //  // Create element.
           //  const wall = document.createElement('a-box');
           //  wall.setAttribute('width', 5);
           //  wall.setAttribute('height',10);
           //  wall.setAttribute('depth', 5);
           //  // Snap intersection point to grid and offset from center.
           //  wall.setAttribute('position', evt.detail.intersection.point);
           //  // Set components and properties.
           //  mapTemplate.keys(data).forEach(name => {
           //      if (name === 'event') { return; }
           //      AFRAME.utils.entity.setComponentProperty(wall, name, data[name]);
           //  });
           //  // Append to scene.
           // this.el.appendChild(wall);
            // REPLACE WITH MAP NUM TYPE WHEN READY TO PASS DOWN PARAM SETUP T
            this.updateMap(indexToReplace,1);
        });
    },
    updateMap :function(indexToReplace,mapNumType){
        mapTemplate.splice(indexToReplace, 1, mapNumType);
    }

});

//create the blank map scene
init();

async function init() {
    await loadChars();
    await loadMapTemplateData(25);
    await createRooms();

}

async function loadMapTemplateData(templateSize){
        let fetchURL = './mapTemplates/map'+templateSize+templateSize+'.json';
        const res = await fetch(fetchURL)
        mapTemplate= await res.json();
}

async function loadChars() {
    const res = await fetch('../../DemoGame/charecters.json')
    chars = await res.json();
}


function createRooms() {
    const mapData = mapTemplate.data;
    console.log(mapData, mapTemplate.height);
    let roomType = "Indoors";
    // char info
    const chars = mapTemplate.chars;
    const charNum = mapTemplate.charnumber;
    let charLoopIndex =0;

    const WALL_SIZE = 5;
    const WALL_HEIGHT = 10;
    const el = document.getElementById('room')
    // let playerPos;
    let wall;

    // let floor = document.createElement('a-plane');
    // let floorArea = (mapTemplate.width*mapTemplate.height);
    // floor.setAttribute('width', floorArea*2);
    // floor.setAttribute('height', floorArea*2);
    // floor.setAttribute('rotation', '-90 0 0');
    // floor.setAttribute('position', '0 -4 0');
    // floor.setAttribute('scale', '0.2 0.2 0.2');
    // floor.setAttribute('material', 'src: #grunge; repeat: 1 2');
    // el.appendChild(floor);

    if (roomType === "Indoor") {
        let ceil = document.createElement('a-box');
        let ceilArea = (mapTemplate.width * mapTemplate.height);
        ceil.setAttribute('width', ceilArea * 2);
        ceil.setAttribute('height', ceilArea * 2);
        ceil.setAttribute('rotation', '-90 0 0');
        ceil.setAttribute('position', '0 6 0');
        ceil.setAttribute('scale', '0.2 0.2 0.2');
        ceil.setAttribute('material', 'src: #grunge; repeat: 1 2');
        el.appendChild(ceil);
    }

    for (let x = 0; x <  mapTemplate.height; x++) {
        for (let y = 0; y < mapTemplate.width; y++) {
            const i = (y * mapTemplate.width) + x;
            const position = `${((x - (mapTemplate.width / 2)) * WALL_SIZE)} 0 ${(y - (mapTemplate.height / 2)) * WALL_SIZE}`;
            const halfYposition = `${((x - (mapTemplate.width / 2)) * WALL_SIZE)} -3 ${(y - (mapTemplate.height / 2)) * WALL_SIZE}`;
            const charPos = `${((x - (mapTemplate.width / 2)) * WALL_SIZE)} -4 ${(y - (mapTemplate.height / 2)) * WALL_SIZE}`;

            // char
            if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "c"){
                console.log("its a char!")
                let char = addChar(charLoopIndex);
                console.log('char ran and char is' + char)
                char.setAttribute('position', charPos);
                el.appendChild(char);
                charLoopIndex++;
            }

            if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "d"){
                console.log("its a door!")
                const door = document.createElement('a-box');
                door.setAttribute('width', WALL_SIZE);
                door.setAttribute('height', WALL_HEIGHT);
                door.setAttribute('depth', WALL_SIZE);
                door.setAttribute('position', position);
                door.setAttribute('material', 'src: #door; repeat: 1 1');
                // create component for door / lock
                door.setAttribute('locked', 'false');
            }

            // if the number is 1 - 4, create a wall
            if (mapData[i] === 0  || mapData[i] === 1 || mapData[i] == 2 || mapData[i] === 3 || mapData[i] === 4) {
                wall = document.createElement('a-box');
                wall.setAttribute('width', WALL_SIZE);
                wall.setAttribute('height', WALL_HEIGHT);
                wall.setAttribute('depth', WALL_SIZE);
                wall.setAttribute('position', position);
                el.appendChild(wall);

                // floor
                if (mapData[i] === 0) {
                    // wall.setAttribute('color', '#000');
                    wall.setAttribute('class', 'floor');
                    wall.setAttribute('height', WALL_HEIGHT / 20);
                    wall.setAttribute('static-body', '');
                    wall.setAttribute('position', position);
                    wall.setAttribute('editor-listener', '');
                }


                // 1/2 wall
                if (mapData[i] === 2) {
                    // wall.setAttribute('color', '#000');
                    wall.setAttribute('height', WALL_HEIGHT/2);
                    wall.setAttribute('static-body', '');
                    wall.setAttribute('position', halfYposition);
                }
                // secretwall
                else if (mapData[i] === 3) {
                    wall.setAttribute('color', '#fff');
                    wall.setAttribute('material', 'src: #brick;; repeat: 1 1');
                }
                // brick wall
                else if (mapData[i] === 4) {
                    wall.setAttribute('color', '#fff');
                    wall.setAttribute('material', 'src: #brick; repeat: 1 1');
                    wall.setAttribute('static-body', '');
                } else { // normal walls
                    wall.setAttribute('color', '#fff');
                    wall.setAttribute('material', 'src: #brick; repeat: 1 1');
                    wall.setAttribute('static-body', '');
                }
            }
        }
    }
}