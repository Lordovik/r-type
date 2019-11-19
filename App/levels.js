"use strict";

const TICKS_PER_SEC = 30;

const w = 1920;//window.innerWidth;
const h = 1080; //window.innerHeight;
const scale = window.devicePixelRatio;
const w2 = w/2;
const h2 = h/2;

const defaultMenuEnemy = {
    "design": {
        width: 300,
        height: 50,
        font: "20px sans-serif",
        color: "101010",
        textColor: "0xffffff",
    },
    "ai": {
        tick: function() {},
        check: function() {},
        fire: function() {},
        init: function(){
            this.type = "ME";
        },
        activateMenu: function(){},
    },
    "params": {},
}

const defaultExplosion = {
    "design": {
        tileSet: {
            src: "./images/explosions/explosion1.png",
            width: 48, 
            height: 48,
            tiles: [
                [0, 0],
                [49, 0],
                [97, 0],
                [146, 0],
                [0, 49],
                [49, 49],
                [97, 49],
                [146, 49],
            ],
        },
        animationOptions: {
            maxSteps: 8,
            animationRate: 8,
            offsetX: -10,
            offsetY: 10,
            width: 70,
            height: 70
        }
    },

    "ai": {
        init: function(){
            this.animationStep = 0;
        },

        check: function(){

        },

        tick: function(){
            if( this.tileSet && this.animationOptions
                && this.animationStep < this.animationOptions.maxSteps - 1
                && this.ticksPassed() % this.animationOptions.animationRate === 0 ) 
            {

                this.animationStep++;

            }
            else if (this.animationStep == this.animationOptions.maxSteps - 1){
                this.die();
            }
        },

    },

    "params": {
        dmg: 0,
        speed: { x: 0, y: 0 },
        hp: 1,
    }
}

const defaultEnemy = {
    "design": {
        width: 35,
        height: 70, 
        sprite: { imgSrc: "./images/enemies/enemy.png", width: 71, height: 69, offsetX: -30 },
        deathExplosion: { design: "explosion1" },
        hitExplosion: { design: "smallExplosion" },
    },
    "ai": {
        check: function(point) {
            switch(point.type){
                case 'S':
                    this.attack(point);
                    break;
            }
        },
        tick: function() {

            if(this.ticksPassed() === 0) this.direction = { x: -1, y: 0 };
            
            if(this.y + this.direction.y * this.speed.y + this.sprite.height >= game.MAP_HEIGHT - 1){
                this.direction.y = -1;
            } else if(this.y + this.direction.y * this.speed.y < 0) {
                this.direction.y = 1;
            }
            
            this.moveToDir();

            if( this.ticksPassed() % this.fireRate == 0 ){
                this.fire();
            }

        },
        fire: function() {
            for(let i = 0; i < this.bullets.length; i++){
                let bullet = new Bullet( { 
                    x: this.x, 
                    y: this.y + this.height / 2,
                    ...this.bullets[i],
                } );
                bullet.y -= bullet.height / 2;
                game.objects.push( bullet );
            }
        },
        takeDmg(dmg){
            this.hp -= dmg;

            if(this.hp <= 0){
                if(this.deathExplosion){
                    let deathExplosion = new Decoration( { x: this.x, y: this.y, ...this.deathExplosion } );
                    game.objects.push( deathExplosion );
                }
                this.die();
                return;
            }
        }
    },
    "params": {
        dmg: 1,
        speed: { x: 10, y: 5 },
        hp: 1,
        bullets: [{design: "enemyBullet1"}],
        fireRate: 50
    },
}

const defaultShip = {
    "design": {
        width: 20,
        height: 60,
        sprite: { imgSrc: "images/ships/mainShip.png", width: 71, height: 69, offsetX: -10 },
    },
    "ai": {
        tick: function() {
            this.invulnerable--;
            this.reload--;
            if(this.reload < 0) this.reload = 0;
            if(this.invulnerable < 0) this.invulnerable = 0;
        },

        fire: function() {
            if(this.reload) return;

            if(this.bullets){
                for(let i = 0; i < this.bullets.length; i++){
                    let bullet = new Bullet( { 
                        x: this.x + this.width, 
                        y: this.y + i * 30, 
                        ...this.bullets[i],
                    } );
                    bullet.y -= bullet.height / 2;
                    game.objects.push( bullet );
                    this.reload = this.fireRate;
                }
                return;
            }

            let bullet = new Bullet( { 
                x: this.x + this.width, 
                y: this.y + this.height / 2, 
                ...this.bullet,
            } );
            bullet.y -= bullet.height / 2;
            game.objects.push( bullet );
            this.reload = this.fireRate;


        },

        check: function(point){
            switch(point.type){
                case "E":
                    this.attack(point);
                    break;
                case "U":
                    if(!point.isDead()){
                        for(let key in point.newParams){
                            this[key] = point.newParams[key];
                        }
                    }
                    this.attack(point);
                    break;
            }
        },

        takeDmg: function(dmg){
            if(this.invulnerable !== 0) return;

            this.hp -= dmg;
    
            if(this.hp > 0){
                this.invulnerable = 60;
            }
        },

        keyHandler: function(key){
            switch(key){
                case 'ArrowDown':
                    this.move(0, this.speed.y);
                    break;
                
                case 'ArrowUp':
                    this.move(0, -this.speed.y);
                    break;
                
                case 'ArrowRight':
                    this.move(this.speed.x, 0);
                    break;
                
                case 'ArrowLeft':
                    this.move(-this.speed.x, 0);
                    break;
    
                case ' ':
                    if(!this.reload) this.fire();
                    break;
            }
        }
    },
    "params": {
        dmg: 1,
        speed: { x: 15, y: 20 },
        hp: 500,
        bullet: { design: "shipBullet1" },
        fireRate: 10,
    },
}

const defaultBullet = {
    "design":{

    },
    "ai":{
        tick: function() {
            this.moveToDir();
        },
        attack: function(point){
            point.takeDmg(this.dmg);
            if( point.hitExplosion && point.hp > 0 ){
                let hitExplosion = new Decoration( { x: this.x + this.width/2, y: this.y - this.height/2, ...point.hitExplosion } );
                game.objects.push(hitExplosion);
            }
        },
    },
    "params": {
        
    }
}

const defaultWall = {
    "design": {
        width: 90,
        height: 90,
        sprite: {
            imgSrc: "./images/walls/wall1.png",
            width: 100,
            height: 100,
        }
    },
    "ai":{
        init: function(){
            this.direction = { x: -1, y: 0 };
            this.type = "W";
            this.speed.x = game.level.speed || this.speed.x || 5;
            this.height = game.MAP_HEIGHT - this.y;
            this.sprite.height = game.MAP_HEIGHT - this.y - (this.sprite.offsetY || 0);
        },
        tick: function(){
            this.moveToDir();
        },
        check: defaultEnemy.ai.check,
    },
    "params":{
        hp: 1,
        dmg: 1,
        speed: { x: 10, y: 10}
    }
}

const defaultUpgrade = {
    "design": {
        width: 30,
        height: 30,
        sprite: { imgSrc: "./images/upgrades/upgrade1.png", width: 30, height: 30 },
    },
    "ai": {
        init: function(){
            this.direction = { x: -1, y: 0 };
        },
        tick: function(){
            this.moveToDir();
        },
    },
    "params": {
        hp: 1,
        dmg: 0,
        speed: { x: 10, y: 0 },
        newParams: {
            bullets: [
                { design: "shipBullet1" },
                { design: "shipBullet1" },
                { design: "shipBullet1" },
            ]
        }
    }
}

const levelList = [
    "level1",
    "level2",
]

const invisiblePresets = {
    "menuStart": true,
    "menuHighscore": true,
    "menuEdit": true,
}

const LEVELS={
    "menu": {
        enemies: [
            { tick: 0, x: "center", y: 300, design: "menuEdit" },
            { tick: 0, x: "center", y: "center", design: "menuStart", },
            { tick: 0, x: 1500, y: 100, },
            { tick: 0, x: "center", y: 700, design: "menuHighscore" },
        ],
        ship: { design: "menuShip", },
    },
    "editor": {
        enemies: [
            { tick: 1, x: 1500,y: 100, },
        ],
        tick: function(){
            for(let key in this.keysDown){
                if(!this.keysDown[key]) continue;
                switch(key){
                    case 'ArrowRight':
                        slider.value++;
                        this.changeTick(slider.value);
                        break;
                    case 'ArrowLeft':
                        slider.value--;
                        this.changeTick(slider.value);
                        break;
                    case "Enter":
                        document.querySelector(this.focusBlockSelector + ">.submit").onclick();
                        break;
                }
            }
        },
        init: function(){
            
            let levelLength = 1600;

            this.tickCount = 0;
    
            this.keysDown = {};

            this.objects = [];

            let currLevel = "custom";

            this.level.enemies = LEVELS[currLevel].enemies;

            this.level.speed = LEVELS[currLevel].speed;

            let slider = document.querySelector("#slider");
            slider.style.top = h + 30 + 'px';
            slider.style.width = w + "px";
            slider.max = levelLength;
            slider.min = 0;
            slider.value = 0;

            let enemyDesignsBlock = document.querySelector("#add-enemy-design");
            enemyDesignsBlock.style.width = w + "px";

            let enemyAisBlock = document.querySelector("#add-enemy-ai");
            enemyAisBlock.style.width = w + "px";
            
            let enemyParamsBlock = document.querySelector("#add-enemy-params");
            enemyParamsBlock.style.width = w + "px";

            let enemyDesigns = LEVELS.presets.enemies.design;
            let enemyAis = LEVELS.presets.enemies.ai;
            let enemyParams = LEVELS.presets.enemies.params;

            let createPresetsView = (presets, selector, className) => {
                for(let key in presets){
                    if(invisiblePresets[key]) continue;

                    let item = presets[key];
                    
                    let enemyBlock;

                    if(item.sprite){
                        enemyBlock = document.createElement("div");
                        let image = document.createElement("img");
                        image.src = item.sprite.imgSrc;
                        image.style.width = "100px";
                        image.style.height = "100px";
                        enemyBlock.appendChild(image);
                    } else if(presets === enemyAis){
                        enemyBlock = document.createElement("div");
                        enemyBlock.innerHTML = item.description || key;
                    } else {
                        enemyBlock = document.createElement("div");
                        for(let itemKey in item){
                            let property = document.createElement("p");
                            property.className = itemKey;
                            property.innerHTML = itemKey + ": " + JSON.stringify(item[itemKey]);
                            enemyBlock.appendChild(property);
                        }
                    }
                    enemyBlock.origin = key;
                    enemyBlock.classList.add(className);
    
                    enemyBlock.onclick = function() {
                        let enemyDesignInput = document.querySelector(game.focusBlockSelector + ">." + className);
                        enemyDesignInput.value = this.origin;
    
                        let active = document.querySelector(selector + ">.active");
    
                        if(active) active.classList.remove("active");
    
                        this.classList.add("active");
                    }
    
                    document.querySelector(selector).appendChild(enemyBlock);
                }
            }

            createPresetsView(enemyDesigns, "#add-enemy-design", "design");
            createPresetsView(enemyAis, "#add-enemy-ai", "ai");
            createPresetsView(enemyParams, "#add-enemy-params", "params");

            const changeSlider = () => {
                this.changeTick(slider.value);
            }

            slider.addEventListener("change", changeSlider);

            this.changeTick = (tickCount) => {

                this.clearLevel();

                let tickFunc = tick.bind(this);
                for(let i = 0; i < tickCount; i++){
                    tickFunc();
                }
            }

            this.focusBlockSelector = "#add-enemy";

            const pickEnemy = (e) => {
                if(e.target != this.canvas) return;

                let x = e.layerX;
                let y = e.layerY;
                let xInput = document.querySelector("#picked-point>.x");
                let yInput = document.querySelector("#picked-point>.y");
                let designInput = document.querySelector("#picked-point>.design");
                let aiInput = document.querySelector("#picked-point>.ai");
                let paramsInput = document.querySelector("#picked-point>.params");


                for(let i = 0; i < this.objects.length; i++){
                    let curr = this.objects[i];
                    if(!(curr instanceof Enemy)) continue;

                    let width = curr.sprite.width || curr.width;
                    let height = curr.sprite.height || curr.height;

                    if( !(x > curr.x && x < curr.x + width) ||
                        !(y > curr.y && y < curr.y + height) ) {
                            continue;
                    }

                    this.focusBlockSelector = "#picked-point";

                    xInput.value = curr.origin.x;
                    yInput.value = curr.origin.y;
                    designInput.value = curr.origin.design || curr.design;
                    aiInput.value = curr.origin.ai || curr.ai;
                    paramsInput.value = curr.origin.params || curr.params;

                    // let currActive = document.querySelectorAll("#templates .active");
                    // for(let i = 0; i < currActive.length; i++)
                    //     currActive[i].classList.remove("active");

                    // let templates = document.querySelectorAll("#templates>div>div");
                    // for(let i = 0; i < templates.length; i++){
                    //     let currOriginDesign = curr.origin.design || "enemy1";
                    //     let currOriginAi = curr.origin.ai || "enemy1";
                    //     let currOriginParams = curr.origin.params || "enemy1";
                        
                    //     if( templates[i].origin !== currOriginDesign
                    //         && templates[i].origin !== currOriginAi
                    //         && templates[i].origin !== currOriginParams ) continue;

                    //     templates[i].classList.add("active");
                    // }


                    this.pickedOrigin = curr.origin;

                    return;
                }

                this.focusBlockSelector = "#add-enemy";
                xInput.value = null;
                yInput.value = null;
                designInput.value = null;
                aiInput.value = null;
                paramsInput.value = null;
            }
            document.addEventListener("click", pickEnemy);

            // add enemy
            let onAddClick = (selector, addFunc) => {
                return function(e){
                    let x = document.querySelector(selector + ">.x").value;
                    let y = document.querySelector(selector + ">.y").value;
                    let design = document.querySelector(selector + ">.design").value;
                    let ai = document.querySelector(selector + ">.ai").value;
                    let params = document.querySelector(selector + ">.params").value;
                    if(!x) x = w;
                    if(!y) y = h;

                    let enemy = { tick: this.tickCount, x: +x, y: +y, };
                    if(design) enemy.design = design;
                    if(ai) enemy.ai = ai;
                    if(params) enemy.params = params;
                    addFunc(enemy);
                    this.changeTick(slider.value);
                }.bind(this);
            }

            let addEnemy = (enemy) => {
                this.level.enemies.push(enemy);
                this.level.enemies.sort((a, b) => {
                    return a.tick -  b.tick;
                });
            }

            let addEnemyButton = document.querySelector("#add-enemy>button");
            addEnemyButton.onclick = onAddClick("#add-enemy", addEnemy);

            let changeEnemyButton = document.querySelector("#picked-point>#change");
            changeEnemyButton.onclick = (e) => {
                this.pickedOrigin.x = +document.querySelector("#picked-point>.x").value;
                this.pickedOrigin.y = +document.querySelector("#picked-point>.y").value;
                this.pickedOrigin.design = document.querySelector("#picked-point>.design").value;
                this.pickedOrigin.ai = document.querySelector("#picked-point>.ai").value;
                this.pickedOrigin.params = document.querySelector("#picked-point>.params").value;
            }

            let deleteEnemyButton = document.querySelector("#picked-point>#delete");
            deleteEnemyButton.onclick = (e) => {
                for(let i = 0; i < this.level.enemies.length; i++){
                    if(this.level.enemies[i] !== this.pickedOrigin) continue;
                    this.level.enemies.splice(i, 1);
                }
            }

            let plusButton = document.querySelector(".plus");
            plusButton.onclick = (e) => {
                slider.value++;
                this.changeTick(slider.value);
            }

            let minusButton = document.querySelector(".minus");
            minusButton.onclick = (e) => {
                slider.value--;
                this.changeTick(slider.value);
            }

            let saveButton = document.querySelector("#save");
            saveButton.onclick = (e) => {
                console.log(JSON.stringify(this.level));
            }

            let exitButton = document.querySelector("#exit");
            exitButton.onclick = (e) => {
                slider.removeEventListener("change", changeSlider);
                document.removeEventListener("click", pickEnemy);
                addEnemyButton.onclick = null;
                changeEnemyButton.onclick = null;
                deleteEnemyButton.onclick = null;
                plusButton.onclick = null;
                minusButton.onclick = null;
                saveButton.onclick = null;
                exitButton.onclick = null;

                this.loadLevel("menu");
            }

            this.changeTick(slider.value);

            document.body.appendChild(slider);
        },
        gameOver: function(){

        }
    },

    "level1":{
        enemies:[
            { tick:    50,  x: 1900,y: 100, },
            { tick:    50,  x: 1900,y: 200, },
            { tick:    50,  x: 1900,y: 300, },
            { tick:    50,  x: 1900,y: 400, },
            { tick:    50,  x: 1900,y: 500, },
            { tick:    50,  x: 1900,y: 600, },
            { tick:    60,  x: 1900,y: 100, },
            { tick:    60,  x: 1900,y: 200, },
            { tick:    60,  x: 1900,y: 300, },
            { tick:    60,  x: 1900,y: 400, },
            { tick:    60,  x: 1900,y: 500, },
            { tick:    60,  x: 1900,y: 600, },
            { tick:    70,  x: 1900,y: 100, },
            { tick:    70,  x: 1900,y: 200, },
            { tick:    70,  x: 1900,y: 300, },
            { tick:    70,  x: 1900,y: 400, },
            { tick:    70,  x: 1900,y: 500, },
            { tick:    70,  x: 1900,y: 600, },
            { tick:    80,  x: 1900,y: 100, },
            { tick:    80,  x: 1900,y: 200, },
            { tick:    80,  x: 1900,y: 300, },
            { tick:    80,  x: 1900,y: 400, },
            { tick:    80,  x: 1900,y: 500, },
            { tick:    80,  x: 1900,y: 600, },
            { tick:    90,  x: 1900,y: 100, },
            { tick:    90,  x: 1900,y: 200, },
            { tick:    90,  x: 1900,y: 300, },
            { tick:    90,  x: 1900,y: 400, },
            { tick:    90,  x: 1900,y: 500, },
            { tick:    90,  x: 1900,y: 600, },
            { tick:    100, x: 1900,y: 100, },
            { tick:    100, x: 1900,y: 200, },
            { tick:    100, x: 1900,y: 300, },
            { tick:    100, x: 1900,y: 400, },
            { tick:    100, x: 1900,y: 500, },
            { tick:    100, x: 1900,y: 600, },
            { tick:    110, x: 1900,y: 100, },
            { tick:    110, x: 1900,y: 200, },
            { tick:    110, x: 1900,y: 300, },
            { tick:    110, x: 1900,y: 400, },
            { tick:    110, x: 1900,y: 500, },
            { tick:    110, x: 1900,y: 600, },
            { tick:    120, x: 1900,y: 100, },
            { tick:    120, x: 1900,y: 200, },
            { tick:    120, x: 1900,y: 300, },
            { tick:    120, x: 1900,y: 400, },
            { tick:    120, x: 1900,y: 500, },
            { tick:    120, x: 1900,y: 600, },
            { tick:    130, x: 1900,y: 100, },
            { tick:    130, x: 1900,y: 200, },
            { tick:    130, x: 1900,y: 300, },
            { tick:    130, x: 1900,y: 400, },
            { tick:    130, x: 1900,y: 500, },
            { tick:    130, x: 1900,y: 600, },
            { tick:    140, x: 1900,y: 100, },
            { tick:    140, x: 1900,y: 200, },
            { tick:    140, x: 1900,y: 300, },
            { tick:    140, x: 1900,y: 400, },
            { tick:    140, x: 1900,y: 500, },
            { tick:    140, x: 1900,y: 600, },
            { tick:    150, x: 1900,y: 100, },
            { tick:    150, x: 1900,y: 200, },
            { tick:    150, x: 1900,y: 300, },
            { tick:    150, x: 1900,y: 400, },
            { tick:    150, x: 1900,y: 500, },
            { tick:    150, x: 1900,y: 600, },
            { tick:    160, x: 1900,y: 100, },
            { tick:    160, x: 1900,y: 200, },
            { tick:    160, x: 1900,y: 300, },
            { tick:    160, x: 1900,y: 400, },
            { tick:    160, x: 1900,y: 500, },
            { tick:    160, x: 1900,y: 600, },
            { tick:    170, x: 1900,y: 100, },
            { tick:    170, x: 1900,y: 200, },
            { tick:    170, x: 1900,y: 300, },
            { tick:    170, x: 1900,y: 400, },
            { tick:    170, x: 1900,y: 500, },
            { tick:    170, x: 1900,y: 600, },
            { tick:    180, x: 1900,y: 100, },
            { tick:    180, x: 1900,y: 200, },
            { tick:    180, x: 1900,y: 300, },
            { tick:    180, x: 1900,y: 400, },
            { tick:    180, x: 1900,y: 500, },
            { tick:    180, x: 1900,y: 600, },
            { tick:    190, x: 1900,y: 100, },
            { tick:    190, x: 1900,y: 200, },
            { tick:    190, x: 1900,y: 300, },
            { tick:    190, x: 1900,y: 400, },
            { tick:    190, x: 1900,y: 500, },
            { tick:    190, x: 1900,y: 600, },
            { tick:    200, x: 1900,y: 100, },
            { tick:    200, x: 1900,y: 200, },
            { tick:    200, x: 1900,y: 300, },
            { tick:    200, x: 1900,y: 400, },
            { tick:    200, x: 1900,y: 500, },
            { tick:    200, x: 1900,y: 600, },
            { tick:    210, x: 1900,y: 100, },
            { tick:    210, x: 1900,y: 200, },
            { tick:    210, x: 1900,y: 300, },
            { tick:    210, x: 1900,y: 400, },
            { tick:    210, x: 1900,y: 500, },
            { tick:    210, x: 1900,y: 600, },
            { tick:    220, x: 1900,y: 100, },
            { tick:    220, x: 1900,y: 200, },
            { tick:    220, x: 1900,y: 300, },
            { tick:    220, x: 1900,y: 400, },
            { tick:    220, x: 1900,y: 500, },
            { tick:    220, x: 1900,y: 600, },
            // { tick:    70, x:91500,y: 800, ai: "move12",  params: "noob"},
            // { tick:    90, x:91500,y: 800, ai: "move12",  params: "noob"},
            // { tick:   110, x: 1500,y: 780, ai: "move12",  params: "noob"},
            // { tick:   130, x: 1500,y: 760, ai: "move12",  params: "noob"},
            // { tick:   150, x: 1500,y: 740, ai: "move12",  params: "noob"},
            // { tick:   170, x: 1500,y: 720, ai: "move12",  params: "noob",},
            // { tick: 200,x: 1500,y: 200, design: "superEnemy", },
            //{ tick: 50,x: 1500,y: 300, ai: "enemy1", design: "enemy1", haveUpgrade: { design:"upgrade1" }, params: "enemy1", },
            // { tick: 300,x: 1500,y: 400, },
            // { tick: 350,x: 1500,y: 500, },
        ],
        ship: { x: 100, y: 500, design: "upgrade1" },
        background: [
            "city1",
            "city2",
            "city3",
        ],
        speed: 3
    },

    "empty":{
        enemies:[],
        speed: 3
    },

    "presets": {
        "enemies":{

            "design":{
                "enemy1":{
                    ...defaultEnemy.design,
                }, 
                "superEnemy":{
                    ...defaultEnemy.design,
                    width: 35,
                    height: 55,
                    sprite: { imgSrc: "images/enemies/enemy2.png", width: 48, height: 69 }
                },
                "menuStart": {
                    ...defaultMenuEnemy.design,
                    text: "START",
                },
                "menuHighscore": {
                    ...defaultMenuEnemy.design,
                    text: "HIGHSCORE",
                },
                "menuEdit": {
                    ...defaultMenuEnemy.design,
                    text: "EDIT"
                },
                "wall1":{
                    ...defaultWall.design,
                },
            },

            "ai":{
                "none": { 
                    tick: function() {},
                    check: function(point) {},
                    fire: function() {}
                },
                "enemy1": {
                    ...defaultEnemy.ai,
                },
                "superEnemy": {
                    ...defaultEnemy.ai,
                    tick: function() {

                        if(this.ticksPassed() === 0) this.direction = { x: -1, y: -1 };

                        // if(this.y + this.direction.y * this.speed.y + this.sprite.height >= game.MAP_HEIGHT - 1){
                        //     this.direction.y = -1;
                        // } else if(this.y + this.direction.y * this.speed.y < 0) {
                        //     this.direction.y = 1;
                        // }
                        
                        this.moveToDir();

                        if( this.ticksPassed() % this.fireRate == 0 ){
                            this.fire();
                        }
                    },
                    fire: function() {
                        if(this.bullets) { 
                            for(let i = 0; i < this.bullets.length; i++){
                                let bullet = new Bullet( { 
                                    x: this.x, 
                                    y: this.y + this.height / 2,
                                    ...this.bullets[i],
                                } );
                                bullet.y -= bullet.height / 2;
                                game.objects.push( bullet );
                            }
                        }
                    },
                },
                "superEnemyDown": {
                    ...defaultEnemy.ai,
                    tick: function() {

                        if(this.ticksPassed() === 0) this.direction = { x: -1, y: 1 };

                        // if(this.y + this.direction.y * this.speed.y + this.sprite.height >= game.MAP_HEIGHT - 1){
                        //     this.direction.y = -1;
                        // } else if(this.y + this.direction.y * this.speed.y < 0) {
                        //     this.direction.y = 1;
                        // }
                        
                        this.moveToDir();

                        if( this.ticksPassed() % this.fireRate == 0 ){
                            this.fire();
                        }
                    },
                    fire: function() {
                        for(let i = 0; i < this.bullets.length; i++){
                            let bullet = new Bullet( { 
                                x: this.x, 
                                y: this.y + this.height / 2,
                                ...this.bullets[i],
                            } );
                            bullet.y -= bullet.height / 2;
                            game.objects.push( bullet );
                        }
                    },
                },
                "move12": {
                    ...defaultEnemy.ai,
                    tick: function() {
                        if(this.ticksPassed() === 0) {
                            this.direction = { x: -1, y: 0 };
                        } else if(this.ticksPassed() === 50) {
                            this.direction = { x: +1, y: -1 };
                        } else if(this.ticksPassed() === 100) {
                            this.direction = { x: -1, y: 0 };
                        }
                        this.moveToDir();
     
                        if( this.ticksPassed() % this.fireRate == 0 ){
                            this.fire();
                        }
                    },
                },
                "menuStart": {
                    ...defaultMenuEnemy.ai,
                    activateMenu: function(){
                        game.ship.die();
                        for(let i = 0; i < game.objects.length; i++){
                            let currObj = game.objects[i];
                            if(currObj.type === "ME"){
                                currObj.die();
                            }
                        }

                        

                        game.loadLevel("custom");
                    }
                },
                "menuHighscore": {
                    ...defaultMenuEnemy.ai,
                    activateMenu: function(){
                        console.log("Activated highscore");
                    }
                },
                "menuEdit": {
                    ...defaultMenuEnemy.ai,
                    activateMenu: function(){
                        game.loadLevel("editor"); 
                    }
                },
                "wall1":{
                    ...defaultWall.ai,
                }
            },

            "params": {
                "noob":{
                    dmg: 1,
                    speed: { x: 5, y: 5 },
                    hp: 1,
                    fireRate: 20,
                    bullets: [
                    ]
                },
                "enemy1":{
                    ...defaultEnemy.params,
                },
                "superEnemy": {
                    ...defaultEnemy.params,
                    dmg: 1,
                    speed: { x: 10, y: 5 },
                    hp: 3,
                    fireRate: 50,
                    bullets: [
                        { design: "enemyBullet1" },
                        { design: "enemyBullet1", ai: "enemyBulletUp" },
                        { design: "enemyBullet1", ai: "enemyBulletDown" },
                    ]
                },
                "menuStart": {
                    ...defaultMenuEnemy.params,
                },
                "menuHighscore": {
                    ...defaultMenuEnemy.params,
                },
                "menuEdit": {
                    ...defaultMenuEnemy.params,
                },
                "wall1":{
                    ...defaultWall.params,
                }
            },

        },

        "ships": {

            "design": {
                "upgrade1": {
                    ...defaultShip.design,
                },
                "menuShip": {
                    ...defaultShip.design,
                },
            },

            "ai":{
                "none": { 
                    tick: function() {},
                    check: function(point) {},
                    fire: function() {}
                },

                "upgrade1": {
                    ...defaultShip.ai,
                },

                "menuShip": {
                    init: function(){
                        this.type = "MS";
                        this.currMenuID = 1;
                    },

                    tick: function(){
                        let currMenuItem = game.objects[this.currMenuID];
                        if(!currMenuItem || currMenuItem.type !== "ME"){
                            this.moveToPrevMenu();
                        }
                        this.moveToCurrentMenu();
                    },

                    keyHandler: function(key){
                        switch(key){
                            case 'ArrowDown':
                                this.moveToNextMenu();
                                break;
                            
                            case 'ArrowUp':
                                this.moveToPrevMenu();
                                break;
                
                            case ' ':
                                if(!this.reload) this.fire();
                                break;
                        }
                        game.keysDown[key] = false;
                    },

                    moveToCurrentMenu: function(){
                        let currMenuItem = game.objects[this.currMenuID];
                        if(!currMenuItem) return;

                        let distance = 60;
                        this.moveTo(currMenuItem.x - this.sprite.width - distance, currMenuItem.y);
                    },

                    fire: function(){
                        game.objects[this.currMenuID].activateMenu();
                    },

                    moveToNextMenu: function(){
                        let newId = this.currMenuID + 1;

                        for(; newId < game.objects.length; newId++){

                            if(game.objects[newId].type === 'ME'){
                                this.currMenuID = newId;
                                return;
                            }
                        }

                    },

                    moveToPrevMenu: function(){
                        let newId = this.currMenuID - 1;

                        for(; newId >= 0; newId--){

                            if(game.objects[newId].type === 'ME'){
                                this.currMenuID = newId;
                                return;
                            }
                        }

                    },
                },
            },

            "params": {
                "upgrade1":{
                    ...defaultShip.params,
                },
                "menuShip": {
                    ...defaultShip.params
                },
                "menuShip": {
                    ...defaultShip.params,
                },
            },

        },

        "bullets": {

            "design": {
                "enemyBullet1": {
                    width:54,
                    height:18,
                    sprite:{ imgSrc: "images/bullets/enemy_bullet1.png", width: 54, height: 18 },
                },

                "shipBullet1":{
                    width:54,
                    height:18,
                    sprite:{ imgSrc: "images/bullets/bullet1.png", width: 54, height: 18 },
                }
            },

            "ai":{
                "none": { 
                    tick: function() {},
                    fire: function() {},
                    check: function(point) {}
                },

                "enemyBullet1": {
                    ...defaultBullet.ai,
                    init: function(){
                        this.direction = { x: -1, y: 0 };
                    },
                    check: function(point) {
                        switch(point.type){
                            case 'S':
                                if(!this.isDead()) this.attack(point);
                                this.die();
                                break;
                            }
                    },
                },

                "enemyBulletUp": {
                    ...defaultBullet.ai,
                    init: function(){
                        this.direction = { x: -1, y: -1 };
                    },
                    check: function(point) {
                        switch(point.type){
                            case 'S':
                                if(!this.isDead()) this.attack(point);
                                this.die();
                                break;
                            }
                    }
                },

                "enemyBulletDown": {
                    ...defaultBullet.ai,
                    init: function(){
                        this.direction = { x: -1, y: 1 };
                    },
                    check: function(point) {
                        switch(point.type){
                            case 'S':
                                if(!this.isDead()) this.attack(point);
                                this.die();
                                break;
                            }
                    }
                },

                "shipBullet1": {
                    ...defaultBullet.ai,
                    init: function(){
                        this.direction = { x: 1, y: 0 };
                    },
                    check: function(point) {
                        switch(point.type){
                            case 'E':
                                if(!this.isDead()) {
                                    this.attack(point);
                                }
                                this.die();
                                break;
                            case 'W':
                                this.die();
                                break;
                            }
                    },
                }

            },

            "params": {
                "enemyBullet1": {
                    width:57,
                    height:103,
                    speed: { x: 15, y: 5 },
                    dmg: 1
                },
                "shipBullet1": {
                    width:57,
                    height:103,
                    speed: { x: 20, y: 0 },
                    dmg: 1
                },
            }

        },

        "decorations": {
            "design": {
                "explosion1": {
                    ...defaultExplosion.design,
                },
                "smallExplosion": {
                    ...defaultExplosion.design,
                    animationOptions: {
                        maxSteps: 8,
                        animationRate: 3,
                        offsetX: -20,
                        offsetY: 20,
                        width: 20,
                        height: 20,
                    }
                },
                "pointer":{
                    color: "000000",
                    width: 10,
                    height: 50
                }
            },

            "ai": {
                "explosion1": {
                    ...defaultExplosion.ai,
                },
                "smallExplosion": {
                    ...defaultExplosion.ai,

                },
                "pointer": {}
            },

            "params": {
                "explosion1": {
                    ...defaultExplosion.params,
                },
                "smallExplosion": {
                    ...defaultExplosion.params,
                },
                "pointer":{

                }
            }
        },

        "upgrades": {
            "design": {
                "upgrade1":{
                    ...defaultUpgrade.design,
                }
            },
            "ai": {
                "upgrade1":{
                    ...defaultUpgrade.ai,
                }
            },
            "params": {
                "upgrade1":{
                    ...defaultUpgrade.params,
                }
            }
        }

    },

    "backgrounds":
    {
        "city3": {
            src: "./images/backgrounds/city1.png",
            width: 4267,
            height: 2133,
            speed: 5
        },
        "city2": {
            src: "./images/backgrounds/city2.png",
            width: 1280,
            height: 720,
            speed: 5
        },
        "city1": {
            src: "./images/backgrounds/city3.png",
            width: 1920,
            height: 960,
            speed: 5
        }

    }
}

LEVELS["custom"] = JSON.parse(`{"enemies":[{"tick":10,"x":1900,"y":500},{"tick":20,"x":1900,"y":400},{"tick":20,"x":1900,"y":600},{"tick":28,"x":1900,"y":700},{"tick":28,"x":1900,"y":300},{"tick":36,"x":1900,"y":200},{"tick":36,"x":1900,"y":800},{"tick":44,"x":1900,"y":900},{"tick":44,"x":1900,"y":100},{"tick":197,"x":1500,"y":500,"design":"superEnemy"},{"tick":200,"x":1500,"y":500,"design":"superEnemy","ai":"superEnemyDown"},{"tick":205,"x":1500,"y":500,"design":"superEnemy"},{"tick":211,"x":1500,"y":500,"design":"superEnemy","ai":"superEnemyDown"},{"tick":218,"x":1500,"y":500,"design":"superEnemy"},{"tick":225,"x":1500,"y":500,"design":"superEnemy","ai":"superEnemyDown"},{"tick":235,"x":1500,"y":500,"design":"superEnemy"},{"tick":244,"x":1500,"y":500,"design":"superEnemy","ai":"superEnemyDown"},{"tick":252,"x":1500,"y":500,"design":"superEnemy"},{"tick":263,"x":1500,"y":500,"design":"superEnemy","ai":"superEnemyDown"},{"tick":273,"x":1500,"y":500,"design":"superEnemy"},{"tick":284,"x":1500,"y":500,"design":"superEnemy","ai":"superEnemyDown"},{"tick":386,"x":1800,"y":700,"ai":"move12","design":"enemy1","params":"enemy1"},{"tick":392,"x":1800,"y":700,"ai":"move12"},{"tick":399,"x":1800,"y":700,"ai":"move12"},{"tick":403,"x":1800,"y":700,"ai":"move12"},{"tick":408,"x":1800,"y":700,"ai":"move12"},{"tick":416,"x":1800,"y":700,"ai":"move12"},{"tick":424,"x":1800,"y":700,"ai":"move12"},{"tick":430,"x":1800,"y":700,"ai":"move12"},{"tick":437,"x":1800,"y":700,"ai":"move12"},{"tick":446,"x":1800,"y":700,"ai":"move12"},{"tick":451,"x":1800,"y":700,"ai":"move12"}],"speed":3}`);
LEVELS["custom"].ship = { x: 100, y: 500, design: "upgrade1", hp: 3, };