const menuUI = document.getElementById('openEditor')
const closeUI = document.getElementById('closebtn');

menuUI.addEventListener('mousedown', (event) => {
    openNav();
});

closeUI.addEventListener('mousedown', (event) => {
    closeNav();
});

function openNav() {
    document.getElementById("mySidenav").style.width = "500px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

const menuUI2 = document.getElementById('openEditor2');
const closeUI2 = document.getElementById('closebtn2');

menuUI2.addEventListener('mousedown', (event) => {
    openNav2();
});

closeUI2.addEventListener('mousedown', (event) => {
    closeNav2();
});

function openNav2() {
    document.getElementById("mySidenav2").style.width = "500px";
}

function closeNav2() {
    document.getElementById("mySidenav2").style.width = "0";
}


const menuUI3 =  document.getElementById('openEditor3');
const closeUI3 = document.getElementById('closebtn3');

menuUI3.addEventListener('mousedown', (event) => {
    openNav3();
});

closeUI3.addEventListener('mousedown', (event) => {
    closeNav3();
});

function openNav3() {
    document.getElementById("mySidenav3").style.width = "500px";
}

function closeNav3() {
    document.getElementById("mySidenav3").style.width = "0";
};


