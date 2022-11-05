// map editor js - main js scrupt for the map editor for creating maps

// global map editor vars
let sceneMetadata;
let textures;
let mapTemplate;

let chars;

// dialogueUI Elements
const scene = document.querySelector('a-scene');
const assets = document.querySelector('a-assets');

//create the blank map scene
init();

async function init() {
    await loadChars();
    await loadMapTemplateData(25);
    await createRooms();
}

async function loadMapTemplateData(templateSize){
        let fetchURL = '/mapTemplates/map'+templateSize+templateSize+'.json';
        const res = await fetch(fetchURL)
        mapTemplate= await res.json();
}

async function loadChars() {
    const res = await fetch('Game/charecters.json')
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
    let floor = document.createElement('a-plane');
    let floorArea = (mapTemplate.width*mapTemplate.height);
    floor.setAttribute('width', floorArea*2);
    floor.setAttribute('height', floorArea*2);
    floor.setAttribute('rotation', '-90 0 0');
    floor.setAttribute('position', '0 -4 0');
    floor.setAttribute('scale', '0.2 0.2 0.2');
    floor.setAttribute('material', 'src: #grunge; repeat: 1 2');
    el.appendChild(floor);


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
            const position = `${((x - (mapTemplate.width / 2)) * WALL_SIZE)} 1.5 ${(y - (mapTemplate.height / 2)) * WALL_SIZE}`;
            const halfYposition = `${((x - (mapTemplate.width / 2)) * WALL_SIZE)} -3 ${(y - (mapTemplate.height / 2)) * WALL_SIZE}`;
            const charPos = `${((x - (mapTemplate.width / 2)) * WALL_SIZE)} -4 ${(y - (mapTemplate.height / 2)) * WALL_SIZE}`;
            // console.log(mapData[i].charAt(0));
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
                door.setAttribute('material', 'src: #door; repeat: 20 20');
                // create component for door / lock
                door.setAttribute('locked', 'false');

            }

            // if the number is 1 - 4, create a wall
            if (mapData[i] === 1 || mapData[i] == 2 || mapData[i] === 3 || mapData[i] === 4) {
                wall = document.createElement('a-box');
                wall.setAttribute('width', WALL_SIZE);
                wall.setAttribute('height', WALL_HEIGHT);
                wall.setAttribute('depth', WALL_SIZE);
                wall.setAttribute('position', position);
                console.log(el, wall)
                el.appendChild(wall);

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
                    wall.setAttribute('material', 'src: #brick;; repeat: 1 20');
                }
                // brick wall
                else if (mapData[i] === 4) {
                    wall.setAttribute('color', '#fff');
                    wall.setAttribute('material', 'src: #brick; repeat: 20 20');
                    wall.setAttribute('static-body', '');
                } else { // normal walls
                    wall.setAttribute('color', '#fff');
                    wall.setAttribute('material', 'src: #brick; repeat: 0.2 0.25');
                    wall.setAttribute('static-body', '');
                }
            }
        }
    }
}
