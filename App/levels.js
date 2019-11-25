"use strict";

const TICKS_PER_SEC = 30;

const devMode = 1;

const w = 1920;//window.innerWidth;
const h = 1080; //window.innerHeight;
const scale = window.devicePixelRatio;
const w2 = w/2;
const h2 = h/2;

/**
 * Function: ajaj
 * Parameters:
 *		url typeof String		- URL по которому будет происходить запрос
 *		data typeof Object		- Объект ключ/значение что мы передаем
 *		success typeof Function	- Функция которую вызвать при успехе, параметр Object который вернется запросом
 */
function ajaj(url,data,success)
{
    if(devMode){
        $.ajax({
            url:"http://rtype.pronetcom.ru"+url,
            method:"POST",
            data:data,
            success:function(ret) {
                if (typeof ret=="string") ret=JSON.parse(ret);
                if (ret.ok) success(ret); else alert("Что-то пошло не так "+(ret.error||JSON.stringify(ret)));
            }
        });
        return;
    }

    // fetch("http://rtype.pronetcom.ru"+url)
    // .then( (res) => {
    //     return res.json();
    // } )
    // .then ( (ret) => {
	// 	if (typeof ret=="string") ret=JSON.parse(ret);
	// 	if (ret.ok) success(ret); else alert("Что-то пошло не так "+(ret.error||JSON.stringify(ret)));
    // } );

    
	 let xhr = new XMLHttpRequest();
	 xhr.open('POST', "http://rtype.pronetcom.ru"+url, true);
	 xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
//	 let fdata = new FormData();
//	 for (let k in data) fdata.append(k,data[k]);
	 xhr.onreadystatechange = function() {//Вызывает функцию при смене состояния.
	 	// console.log(xhr.readyState, xhr.status, XMLHttpRequest.DONE);
	 	if(xhr.readyState == xhr.DONE && xhr.status == 200) {
	 		// console.log(xhr);
             // Запрос завершен. Здесь можно обрабатывать результат.
            let ret = xhr.responseText;
	 		if (typeof ret == "string") ret=JSON.parse(xhr.responseText);
	 		if (ret.ok) success(ret); else alert("Что-то пошло не так "+(ret.error||JSON.stringify(ret)));
	 	}
	 	// TODO обработать статус не 200 (404, 500)
	 };
	 xhr.send();
}

if (!window.localStorage.getItem("deviceid")) {
	// Делается запрос к http://rtype.pronetcom.ru/api/user_create/
	ajaj("/api/user_create/",{},function(ret) {
		window.localStorage.setItem("deviceid",ret.login);
	});
}

// TODO добавить результат в переменную levels (ну и campaigns и так далее)
// ajaj("/api/load_levels",{},function(ret) { console.log(ret); })
//
//ajaj("/api/register/",{a:"hello"})



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
        showLevels: function(ai) {
            for(let i = 0; i < game.objects.length; i++){
                let curr = game.objects[i];
                if(curr.type != "ME") continue;

                curr.die();
            }

            let finalLevelList = [...levelList];
            if(ai === 'menuLevelEdit'){
                finalLevelList.unshift('empty');
            }

            for(let i = 0; i < finalLevelList.length; i++){
                let x = "center";
                let y = 100 * (i + 1);
                let menuLevelItem = { x, y, design: "menuLevel", text: finalLevelList[i] };

                if(ai) menuLevelItem.ai = ai;

                game.genEnemy( menuLevelItem );
            }

            if(game.ship.isDead()){
                game.ship = new Ship( {design: "menuShip"} );
                game.objects.push(game.ship);
            }
            game.ship.currMenuID = 0;
        }
    },
    "params": {},
}

const defaultExplosion = {
    "design": {
        tileSet: {
            src: "images/explosions/explosion1.png",
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
        width: 40,
        height: 25, 
        sprite: { imgSrc: "images/enemies/enemy1.png", width: 64, height: 64, },
        deathExplosion: { design: "explosion1" },
        hitExplosion: { design: "smallExplosion" },
    },
    "ai": {
        init(){
            this.direction = { x: -1, y: 0 };
            this.direction.x = this.directionX || -1;
            this.direction.y = this.directionY || 0;
        },

        check: function(point) {
            switch(point.type){
                case 'S':
                    this.attack(point);
                    break;
            }
        },
        tick: function() {

            // if(this.ticksPassed() === 0) this.direction = { x: -1, y: 0 };
            
            // if(this.y + this.direction.y * this.speed.y + this.sprite.height >= game.MAP_HEIGHT - 1){
            //     this.direction.y = -1;
            // } else if(this.y + this.direction.y * this.speed.y < 0) {
            //     this.direction.y = 1;
            // }
            
            this.moveToDir();

            if( this.ticksPassed() && this.ticksPassed() % this.fireRate == 0 ){
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
        fireRate: 30
    },
}

const defaultShip = {
    "design": {
        width: 80,
        height: 20,
        sprite: { imgSrc: "images/ships/mainShip.png", width: 128, height: 128, offsetX: -20 },
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
        width: 72,
        height: 72,
        sprite: {
            imgSrc: "images/walls/wall1.png",
            width: 72,
            height: 72,
        }
    },
    "ai":{
        init: function(){
            this.direction = { x: -1, y: 0 };
            this.type = "W";
            this.speed.x = game.level.speed || this.speed.x || 5;
            this.height = game.MAP_HEIGHT - this.y;
            this.sprite.height = game.MAP_HEIGHT - this.y - (this.sprite.offsetY || 0);
            this.width = +this.width;
            this.sprite.width = +this.width;
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
        sprite: { imgSrc: "images/upgrades/upgrade1.png", width: 30, height: 30 },
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

const levelList = [];

ajaj("/api/load_levels/", {}, function(ret){
    if(!ret.ok) console.log( "Can't load ", ret.error);

    console.log("Loaded levels: ", ret.levels);

    let levels = ret.levels;
    levels.map( ( {name} ) => {
        levelList.push(name);
    });

});

const invisiblePresets = {
    "menuStart": true,
    "menuHighscore": true,
    "menuEdit": true,
    "menuLevel": true,
    "menuLevelEdit": true,
}

const LEVELS={
    "menu": {
        enemies: [
//            { tick: 0, x: "center", y: 300, design: "menuEdit" },
            { tick: 0, x: "center", y: 400, design: "menuStart", },
            { tick: 0, x: 1500, y: 100, },
            // { tick: 0, x: "center", y: 700, design: "menuHighscore" },
        ],
        ship: { design: "menuShip", },
    },
    "editor": {
        enemies: [
            { tick: 1, x: 1500,y: 100, },
        ],
        tick: function(){
            let slider = document.querySelector(".slider");
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
                        document.querySelector(this.focusButton).onclick();
                        break;
                }
            }
        },
        init: function(editedLevel){
            
            let levelLength = 4000;

            this.tickCount = 0;
    
            this.keysDown = {};

            this.objects = [];

            let currLevel = editedLevel;

            document.querySelector(".level-name").value = currLevel == "empty" ? '' : currLevel;

            this.level.enemies = LEVELS[currLevel].enemies;

            this.level.speed = LEVELS[currLevel].speed;

            $(".time-line").css({
                top: h + 30 + 'px',
                display: "block",
            });

            $(".slider").css({
                width: w + 'px',
            }).attr({
                max: levelLength,
                min: 0,
                value: 0,
            });

            let slider = document.querySelector(".slider");

            $(".enemy-design, .enemy-ai, .enemy-params").css("width", w + 'px');

            let enemyDesigns = LEVELS.presets.enemies.design;
            let enemyAis = LEVELS.presets.enemies.ai;
            let enemyParams = LEVELS.presets.enemies.params;

            let createPresetsView = (presets, selector, className) => {
                for(let key in presets){
                    if(invisiblePresets[key]) continue;

                    let item = presets[key];
                    
                    let enemyBlock;

                    if_st: if(item.sprite){

                        enemyBlock = document.createElement("div");
                        let image = document.createElement("img");
                        image.src = item.sprite.imgSrc;
                        image.style.width = "100px";
                        image.style.height = "100px";
                        enemyBlock.appendChild(image);

                    } else if(presets === enemyAis){

                        enemyBlock = document.createElement("div");
                        let desc = document.createElement("p");
                        desc.classList.add("description");
                        desc.innerHTML = item.description || key;
                        enemyBlock.appendChild(desc);

                        if(!item.addons || item.addons.length == 0) break if_st;

                        let addonsContainer = document.createElement("div");
                        addonsContainer.classList.add("addons");
                        let addonList = item.addons;

                        for(let i = 0; i < addonList.length; i++){
                            let addonContainer = document.createElement("div");
                            addonContainer.classList.add("addon");
                            addonContainer.dataset.property = addonList[i];

                            let addonDesc = document.createElement("span");
                            addonDesc.classList.add("addon-description");
                            addonDesc.innerHTML = addonList[i];
                            addonContainer.appendChild(addonDesc);

                            let addonInput = document.createElement("input");
                            addonInput.type = "text";
                            addonInput.classList.add("addon-value");
                            addonContainer.appendChild(addonInput);

                            addonsContainer.appendChild(addonContainer);
                        }

                        enemyBlock.appendChild(addonsContainer);

                    } else {

                        enemyBlock = document.createElement("div");
                        for(let itemKey in item){
                            let property = document.createElement("p");
                            property.className = itemKey;
                            property.innerHTML = itemKey + ": " + JSON.stringify(item[itemKey]);
                            enemyBlock.appendChild(property);
                        }

                    }
                    
                    enemyBlock.classList.add(className);
                    enemyBlock.setAttribute("data-origin", key);
    
                    enemyBlock.onclick = function() {
                        let enemyDesignInput = document.querySelector(game.focusBlockSelector + ">." + className);
                        enemyDesignInput.value = this.getAttribute("data-origin");

                        this.focusButton = game.focusBlockSelector + ">.submit";
    
                        let active = document.querySelector(selector + ">.active");
    
                        if(active) active.classList.remove("active");
    
                        this.classList.add("active");
                    }
    
                    document.querySelector(selector).appendChild(enemyBlock);
                }
            }

            createPresetsView(enemyDesigns, ".enemy-design", "design");
            createPresetsView(enemyAis, ".enemy-ai", "ai");
            createPresetsView(enemyParams, ".enemy-params", "params");

            const changeSlider = () => {
                this.changeTick(slider.value);
            }

            document.querySelector(".slider").onchange = (changeSlider);

            this.changeTick = (tickCount) => {

                this.clearLevel();

                let tickFunc = tick.bind(this);
                for(let i = 0; i < tickCount; i++){
                    tickFunc();
                }
                document.querySelector(".count").value = this.tickCount;
            }

            this.focusBlockSelector = ".add-enemy";

            const pickEnemy = (e) => {
                if(e.target != canvas) return;

                let x = e.layerX;
                let y = e.layerY;
                let xInput = document.querySelector(".picked-point>.x");
                let yInput = document.querySelector(".picked-point>.y");
                let designInput = document.querySelector(".picked-point>.design");
                let aiInput = document.querySelector(".picked-point>.ai");
                let paramsInput = document.querySelector(".picked-point>.params");


                for(let i = 0; i < this.objects.length; i++){
                    let curr = this.objects[i];
                    if(!(curr instanceof Enemy)) continue;

                    let width = curr.width;
                    let height = curr.height;

                    if( !(x > curr.x && x < curr.x + width) ||
                        !(y > curr.y && y < curr.y + height) ) {
                            continue;
                    }

                    this.focusBlockSelector = ".picked-point";
                    this.focusButton = ".picked-point>.submit";

                    xInput.value = curr.origin.x;
                    yInput.value = curr.origin.y;
                    designInput.value = curr.origin.design || curr.design;
                    aiInput.value = curr.origin.ai || curr.ai;
                    paramsInput.value = curr.origin.params || curr.params;

                    $(".templates .active").removeClass("active");
                    
                    $(`.templates .design[data-origin=${curr.origin.design || "enemy1"}],
                    .templates .ai[data-origin=${curr.origin.ai || "enemy1"}],
                    .templates .params[data-origin=${curr.origin.params || "enemy1"}]`)
                    .addClass("active");

                    let addons = $(`.ai[data-origin=${curr.origin.ai}] .addon`);
                    for(let j = 0; j < addons.length; j++){
                        let addon = addons[j];
                        let addonProperty = addon.dataset.property;
                        let addonValue = $(addon).children(".addon-value");

                        if(curr[addonProperty]) addonValue.val( curr[addonProperty] );
                        else addonValue.val('');
                    }


                    this.pickedOrigin = curr.origin;

                    return;
                }

                $(".templates .active").removeClass("active");
                $('.addon-value').val('');
                this.focusBlockSelector = ".add-enemy";
                this.focusButton = ".add-enemy>.submit";
                xInput.value = null;
                yInput.value = null;
                designInput.value = null;
                aiInput.value = null;
                paramsInput.value = null;
                this.pickedOrigin = null;
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

                    let enemy = { tick: this.tickCount <= 0 ? 0 : this.tickCount - 1, x: +x, y: +y, };
                    if(design) enemy.design = design;
                    if(ai) enemy.ai = ai;
                    if(params) enemy.params = params;

                    let addons = $(".ai+.active .addon");
                    for(let i = 0; i < addons.length; i++){
                        let addon = addons[i];
                        let value = $(addon).children(".addon-value").val();
                        let property = addon.dataset.property;
                        enemy[property] = value;
                    }

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

            let addEnemyButton = document.querySelector(".add-enemy>button");
            addEnemyButton.onclick = onAddClick(".add-enemy", addEnemy);

            let changeEnemyButton = document.querySelector(".picked-point>.change");
            changeEnemyButton.onclick = (e) => {
                if(!this.pickedOrigin) return;
                let enemy = this.pickedOrigin;

                enemy.x = +document.querySelector(".picked-point>.x").value;
                enemy.y = +document.querySelector(".picked-point>.y").value;
                enemy.design = document.querySelector(".picked-point>.design").value;
                enemy.ai = document.querySelector(".picked-point>.ai").value;
                enemy.params = document.querySelector(".picked-point>.params").value;

                let addons = $(".ai+.active .addon");
                for(let i = 0; i < addons.length; i++){
                    let addon = addons[i];
                    let value = $(addon).children(".addon-value").val();
                    let property = addon.dataset.property;
                    enemy[property] = value;
                }
            }

            let deleteEnemyButton = document.querySelector(".picked-point>.delete");
            deleteEnemyButton.onclick = (e) => {
                for(let i = 0; i < this.level.enemies.length; i++){
                    if(this.level.enemies[i] !== this.pickedOrigin) continue;
                    this.level.enemies.splice(i, 1);
                    this.pickedOrigin = null;
                    this.changeTick(this.tickCount);

                    

                    return;
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

            let saveButton = document.querySelector(".save");
            saveButton.onclick = (e) => {
                let levelName = document.querySelector(".level-name").value;
                if(!levelName || levelName == "empty") return;

                let req = {data: JSON.stringify(this.level), name: levelName};
                ajaj("/api/save_level/", req, function(ret){
                    console.log(ret);
                });
            }

            let goButton = document.querySelector(".go");
            goButton.onclick = () => {
                let val = document.querySelector(".count").value;
                slider.value = val;
                this.changeTick( val );
            }

            this.focusButton = ".add-enemy>.submit"

            $(".count")
            .mousedown(() => {
                this.focusButton = ".time-line>.submit";
            });

            $(".add-enemy")
            .mousedown(() => {
                this.focusButton = ".add-enemy>.submit";
            })

            $(".picked-point")
            .mousedown(() => {
                this.focusButton = ".picked-point>.submit";
            })

            let exitButton = document.querySelector(".exit");
            exitButton.onclick = (e) => {
                slider.removeEventListener("change", changeSlider);
                document.removeEventListener("click", pickEnemy);
                addEnemyButton.onclick = null;
                changeEnemyButton.onclick = null;
                deleteEnemyButton.onclick = null;
                plusButton.onclick = null;
                minusButton.onclick = null;
                saveButton.onclick = null;
                goButton.onclick = null;
                exitButton.onclick = null;

                $(` .templates .design,
                    .templates .ai,
                    .templates .params`).remove();

                slider.value = 0;
                $(".picked-point").unbind();
                $(".add-enemy").unbind();
                $(".count").unbind();

                this.loadLevel("menu");
            }

            // this.changeTick(slider.value);

            // document.body.appendChild(slider);
        },
        gameOver: function(){

        }
    },

    // "level1":{
    //     enemies:[
    //         { tick:    50,  x: 1900,y: 100, },
    //         { tick:    50,  x: 1900,y: 200, },
    //         { tick:    50,  x: 1900,y: 300, },
    //         { tick:    50,  x: 1900,y: 400, },
    //         { tick:    50,  x: 1900,y: 500, },
    //         { tick:    50,  x: 1900,y: 600, },
    //         { tick:    60,  x: 1900,y: 100, },
    //         { tick:    60,  x: 1900,y: 200, },
    //         { tick:    60,  x: 1900,y: 300, },
    //         { tick:    60,  x: 1900,y: 400, },
    //         { tick:    60,  x: 1900,y: 500, },
    //         { tick:    60,  x: 1900,y: 600, },
    //         { tick:    70,  x: 1900,y: 100, },
    //         { tick:    70,  x: 1900,y: 200, },
    //         { tick:    70,  x: 1900,y: 300, },
    //         { tick:    70,  x: 1900,y: 400, },
    //         { tick:    70,  x: 1900,y: 500, },
    //         { tick:    70,  x: 1900,y: 600, },
    //         { tick:    80,  x: 1900,y: 100, },
    //         { tick:    80,  x: 1900,y: 200, },
    //         { tick:    80,  x: 1900,y: 300, },
    //         { tick:    80,  x: 1900,y: 400, },
    //         { tick:    80,  x: 1900,y: 500, },
    //         { tick:    80,  x: 1900,y: 600, },
    //         { tick:    90,  x: 1900,y: 100, },
    //         { tick:    90,  x: 1900,y: 200, },
    //         { tick:    90,  x: 1900,y: 300, },
    //         { tick:    90,  x: 1900,y: 400, },
    //         { tick:    90,  x: 1900,y: 500, },
    //         { tick:    90,  x: 1900,y: 600, },
    //         { tick:    100, x: 1900,y: 100, },
    //         { tick:    100, x: 1900,y: 200, },
    //         { tick:    100, x: 1900,y: 300, },
    //         { tick:    100, x: 1900,y: 400, },
    //         { tick:    100, x: 1900,y: 500, },
    //         { tick:    100, x: 1900,y: 600, },
    //         { tick:    110, x: 1900,y: 100, },
    //         { tick:    110, x: 1900,y: 200, },
    //         { tick:    110, x: 1900,y: 300, },
    //         { tick:    110, x: 1900,y: 400, },
    //         { tick:    110, x: 1900,y: 500, },
    //         { tick:    110, x: 1900,y: 600, },
    //         { tick:    120, x: 1900,y: 100, },
    //         { tick:    120, x: 1900,y: 200, },
    //         { tick:    120, x: 1900,y: 300, },
    //         { tick:    120, x: 1900,y: 400, },
    //         { tick:    120, x: 1900,y: 500, },
    //         { tick:    120, x: 1900,y: 600, },
    //         { tick:    130, x: 1900,y: 100, },
    //         { tick:    130, x: 1900,y: 200, },
    //         { tick:    130, x: 1900,y: 300, },
    //         { tick:    130, x: 1900,y: 400, },
    //         { tick:    130, x: 1900,y: 500, },
    //         { tick:    130, x: 1900,y: 600, },
    //         { tick:    140, x: 1900,y: 100, },
    //         { tick:    140, x: 1900,y: 200, },
    //         { tick:    140, x: 1900,y: 300, },
    //         { tick:    140, x: 1900,y: 400, },
    //         { tick:    140, x: 1900,y: 500, },
    //         { tick:    140, x: 1900,y: 600, },
    //         { tick:    150, x: 1900,y: 100, },
    //         { tick:    150, x: 1900,y: 200, },
    //         { tick:    150, x: 1900,y: 300, },
    //         { tick:    150, x: 1900,y: 400, },
    //         { tick:    150, x: 1900,y: 500, },
    //         { tick:    150, x: 1900,y: 600, },
    //         { tick:    160, x: 1900,y: 100, },
    //         { tick:    160, x: 1900,y: 200, },
    //         { tick:    160, x: 1900,y: 300, },
    //         { tick:    160, x: 1900,y: 400, },
    //         { tick:    160, x: 1900,y: 500, },
    //         { tick:    160, x: 1900,y: 600, },
    //         { tick:    170, x: 1900,y: 100, },
    //         { tick:    170, x: 1900,y: 200, },
    //         { tick:    170, x: 1900,y: 300, },
    //         { tick:    170, x: 1900,y: 400, },
    //         { tick:    170, x: 1900,y: 500, },
    //         { tick:    170, x: 1900,y: 600, },
    //         { tick:    180, x: 1900,y: 100, },
    //         { tick:    180, x: 1900,y: 200, },
    //         { tick:    180, x: 1900,y: 300, },
    //         { tick:    180, x: 1900,y: 400, },
    //         { tick:    180, x: 1900,y: 500, },
    //         { tick:    180, x: 1900,y: 600, },
    //         { tick:    190, x: 1900,y: 100, },
    //         { tick:    190, x: 1900,y: 200, },
    //         { tick:    190, x: 1900,y: 300, },
    //         { tick:    190, x: 1900,y: 400, },
    //         { tick:    190, x: 1900,y: 500, },
    //         { tick:    190, x: 1900,y: 600, },
    //         { tick:    200, x: 1900,y: 100, },
    //         { tick:    200, x: 1900,y: 200, },
    //         { tick:    200, x: 1900,y: 300, },
    //         { tick:    200, x: 1900,y: 400, },
    //         { tick:    200, x: 1900,y: 500, },
    //         { tick:    200, x: 1900,y: 600, },
    //         { tick:    210, x: 1900,y: 100, },
    //         { tick:    210, x: 1900,y: 200, },
    //         { tick:    210, x: 1900,y: 300, },
    //         { tick:    210, x: 1900,y: 400, },
    //         { tick:    210, x: 1900,y: 500, },
    //         { tick:    210, x: 1900,y: 600, },
    //         { tick:    220, x: 1900,y: 100, },
    //         { tick:    220, x: 1900,y: 200, },
    //         { tick:    220, x: 1900,y: 300, },
    //         { tick:    220, x: 1900,y: 400, },
    //         { tick:    220, x: 1900,y: 500, },
    //         { tick:    220, x: 1900,y: 600, },
    //         // { tick:    70, x:91500,y: 800, ai: "move12",  params: "noob"},
    //         // { tick:    90, x:91500,y: 800, ai: "move12",  params: "noob"},
    //         // { tick:   110, x: 1500,y: 780, ai: "move12",  params: "noob"},
    //         // { tick:   130, x: 1500,y: 760, ai: "move12",  params: "noob"},
    //         // { tick:   150, x: 1500,y: 740, ai: "move12",  params: "noob"},
    //         // { tick:   170, x: 1500,y: 720, ai: "move12",  params: "noob",},
    //         // { tick: 200,x: 1500,y: 200, design: "superEnemy", },
    //         //{ tick: 50,x: 1500,y: 300, ai: "enemy1", design: "enemy1", haveUpgrade: { design:"upgrade1" }, params: "enemy1", },
    //         // { tick: 300,x: 1500,y: 400, },
    //         // { tick: 350,x: 1500,y: 500, },
    //     ],
    //     ship: { x: 100, y: 500, design: "upgrade1" },
    //     background: [
    //         "city1",
    //         "city2",
    //         "city3",
    //     ],
    //     speed: 3,
    //     length: 300
    // },

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

                "enemy2":{
                    ...defaultEnemy.design,
                    width: 70,
                    height: 20,
                    sprite: { imgSrc: "images/enemies/enemy2.png", width: 128, height: 128 }
                },

                "enemy3":{
                    ...defaultEnemy.design,
                    width: 70,
                    height: 25,
                    sprite: { imgSrc: "images/enemies/enemy3.png", width: 128, height: 128 }
                },

                "enemy4":{
                    ...defaultEnemy.design,
                    width: 70,
                    height: 30,
                    sprite: { imgSrc: "images/enemies/enemy4.png", width: 128, height: 128, offsetX: -20, offsetY: -50 }
                },

                "enemy5":{
                    ...defaultEnemy.design,
                    width: 70,
                    height: 20,
                    sprite: { imgSrc: "images/enemies/enemy5.png", width: 128, height: 128 }
                },

                "boss1":{
                    ...defaultEnemy.design,
                    width: 1000,
                    height: 350,
                    sprite: { imgSrc: "images/enemies/enemy4.png", width: 117 * 10, height: 75 * 10, }
                },




                "wall1":{
                    ...defaultWall.design,
                },

                



                "menuStart": {
                    ...defaultMenuEnemy.design,
                    // text: "START",
                    sprite: { imgSrc: "images/menu/start.png", width: 300, height: 50},
                },
                "menuHighscore": {
                    ...defaultMenuEnemy.design,
                    text: "HIGHSCORE",
                },
                "menuEdit": {
                    ...defaultMenuEnemy.design,
                    // text: "EDIT",
                    sprite: { imgSrc: "images/menu/edit.png", width: 300, height: 50},
                },
                "menuLevel":{
                    ...defaultMenuEnemy.design,
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
                    addons: ["directionX", "directionY"]
                },

                // "superEnemy": {
                //     ...defaultEnemy.ai,
                //     tick: function() {

                //         if(this.ticksPassed() === 0) this.direction = { x: -1, y: -1 };

                //         // if(this.y + this.direction.y * this.speed.y + this.sprite.height >= game.MAP_HEIGHT - 1){
                //         //     this.direction.y = -1;
                //         // } else if(this.y + this.direction.y * this.speed.y < 0) {
                //         //     this.direction.y = 1;
                //         // }
                        
                //         this.moveToDir();

                //         if( this.ticksPassed() % this.fireRate == 0 ){
                //             this.fire();
                //         }
                //     },
                //     fire: function() {
                //         if(this.bullets) { 
                //             for(let i = 0; i < this.bullets.length; i++){
                //                 let bullet = new Bullet( { 
                //                     x: this.x, 
                //                     y: this.y + this.height / 2,
                //                     ...this.bullets[i],
                //                 } );
                //                 bullet.y -= bullet.height / 2;
                //                 game.objects.push( bullet );
                //             }
                //         }
                //     },
                // },
                // "superEnemyDown": {
                //     ...defaultEnemy.ai,
                //     tick: function() {

                //         if(this.ticksPassed() === 0) this.direction = { x: -1, y: 1 };

                //         // if(this.y + this.direction.y * this.speed.y + this.sprite.height >= game.MAP_HEIGHT - 1){
                //         //     this.direction.y = -1;
                //         // } else if(this.y + this.direction.y * this.speed.y < 0) {
                //         //     this.direction.y = 1;
                //         // }
                        
                //         this.moveToDir();

                //         if( this.ticksPassed() % this.fireRate == 0 ){
                //             this.fire();
                //         }
                //     },
                //     fire: function() {
                //         for(let i = 0; i < this.bullets.length; i++){
                //             let bullet = new Bullet( { 
                //                 x: this.x, 
                //                 y: this.y + this.height / 2,
                //                 ...this.bullets[i],
                //             } );
                //             bullet.y -= bullet.height / 2;
                //             game.objects.push( bullet );
                //         }
                //     },
                // },
                // "move12": {
                //     ...defaultEnemy.ai,
                //     tick: function() {
                //         if(this.ticksPassed() === 0) {
                //             this.direction = { x: -1, y: 0 };
                //         } else if(this.ticksPassed() === 50) {
                //             this.direction = { x: +1, y: -1 };
                //         } else if(this.ticksPassed() === 100) {
                //             this.direction = { x: -1, y: 0 };
                //         }
                //         this.moveToDir();
     
                //         if( this.ticksPassed() % this.fireRate == 0 ){
                //             this.fire();
                //         }
                //     },
                // },

                "sin":{
                    ...defaultEnemy.ai,
                    addons: ["amplitude", "frequency", "startPoint"],
                    init(){
                        this.direction = { x: -1, y: 0 };
                        this.amplitude = +this.amplitude || 200;
                        this.frequency = +this.frequency || 100;
                        this.startPoint = +this.startPoint || 400;
                    },

                    tick: function(){
                        if( this.ticksPassed() && this.ticksPassed() % this.fireRate === 0 ) this.fire();
                        
                        this.y = (Math.sin(this.x / this.frequency) + 0.5) * this.amplitude + this.startPoint;

                        this.moveToDir();
                    }
                },

                "circle": {
                    ...defaultEnemy.ai,
                    addons: [ "centerX", "centerY", "dr", "speed" ],
                    init: function(){
                        this.centerX = +this.centerX || 500;
                        this.centerY = +this.centerY || 500;
                        this.radius = 100;
                        this.dr = +this.dr || 1;
                        this.speed = +this.speed || 10;
                        this.currSpeed = this.speed;
                    },

                    tick: function(){
                        if( this.ticksPassed() && this.ticksPassed() % this.fireRate === 0 ) this.fire();
                        let alpha = this.ticksPassed() / ( this.radius / this.currSpeed);
                    

                        this.radius += this.dr;
                        this.currSpeed += 0.1;

                        this.x = Math.sin(alpha) * ((this.radius)) + this.centerX;
                        this.y = Math.cos(alpha) * ((this.radius)) + this.centerY;
                    }
                },






                "wall1":{
                    ...defaultWall.ai,
                    addons: ["width"],
                },







                "menuStart": {
                    ...defaultMenuEnemy.ai,
                    activateMenu: function(){

                        this.showLevels();
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
                        this.showLevels("menuLevelEdit");
                    }
                },
                "menuLevel":{
                    ...defaultMenuEnemy.ai,
                    activateMenu: function(){
                        game.loadLevel(this.text);
                    }
                },
                "menuLevelEdit":{
                    ...defaultMenuEnemy.ai,
                    activateMenu: function(){
                        game.loadLevel("editor", this.text);
                    }
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
                // "superEnemy": {
                //     ...defaultEnemy.params,
                //     dmg: 1,
                //     speed: { x: 10, y: 5 },
                //     hp: 3,
                //     fireRate: 50,
                //     bullets: [
                //         { design: "enemyBullet1" },
                //         { design: "enemyBullet1", ai: "enemyBulletUp" },
                //         { design: "enemyBullet1", ai: "enemyBulletDown" },
                //     ]
                // },
                "boss1":{
                    ...defaultEnemy.params,
                    hp: 50,
                    bullets: [
                        { design: "bossBullet1", ai: "enemyBullet1", params: "enemyBullet1" },
                    ],
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
                },
                "menuLevel":{
                    ...defaultMenuEnemy.params,
                },
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
                        this.currMenuID = 0;
                    },

                    tick: function(){
                        this.createMenuItemsArray();

                        let currMenuItem = this.menuItems[this.currMenuID];
                        if(!currMenuItem || currMenuItem.type !== "ME"){
                            this.moveToPrevMenu();
                        }
                        this.moveToCurrentMenu();
                    },

                    createMenuItemsArray(){
                        this.menuItems = [];
                        for(let i = 0; i < game.objects.length; i++){
                            let curr = game.objects[i];
                            if(curr.type == "ME") this.menuItems.push(curr);
                        }
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
                        let currMenuItem = this.menuItems[this.currMenuID];
                        if(!currMenuItem) return;

                        let distance = 60;
                        this.moveTo(currMenuItem.x - this.sprite.width - distance, currMenuItem.y);
                    },

                    fire: function(){

                        this.createMenuItemsArray();
                        if(this.menuItems[this.currMenuID]) this.menuItems[this.currMenuID].activateMenu();
                    },

                    moveToNextMenu: function(){
                        let newId = this.currMenuID + 1;

                        for(; newId < this.menuItems.length; newId++){

                            if(this.menuItems[newId].type === 'ME'){
                                this.currMenuID = newId;
                                return;
                            }
                        }

                    },

                    moveToPrevMenu: function(){
                        let newId = this.currMenuID - 1;

                        for(; newId >= 0; newId--){

                            if(this.menuItems[newId].type === 'ME'){
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
                    width: 32,
                    height: 7,
                    sprite: { imgSrc: "images/bullets/enemy_bullet1.png", width: 32, height: 32, },
                },

                "shipBullet1":{
                    width: 50,
                    height: 15,
                    sprite: { imgSrc: "images/bullets/bullet1.png", width: 128, height: 128, offsetY: -57, offsetX: -45 },
                },

                "bossBullet1":{
                    width: 20,
                    height: 20,
                    sprite: { imgSrc: "images/bullets/boss_bullet1.png", width: 256, height: 256, offsetX: -139, offsetY: -117 }
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
                },

                "bossBullet1": {
                    init: function(){
                        this.axis = (this.axis || Math.PI) % Math.PI * 2;
                        this.vSpeed = this.vSpeed || this.speed.x;
                    },

                    tick: function(){
                        this.speed.x = Math.sin(this.axis) * this.vSpeed;
                        this.speed.x = Math.cos(this.axis) * this.vSpeed;
                        this.direction.x = this.axis > Math.PI / 2 ;
                    }
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
            src: "images/backgrounds/city1.png",
            width: 4267,
            height: 2133,
            speed: 5
        },
        "city2": {
            src: "images/backgrounds/city2.png",
            width: 1280,
            height: 720,
            speed: 5
        },
        "city1": {
            src: "images/backgrounds/city3.png",
            width: 1920,
            height: 960,
            speed: 5
        }

    }
}

ajaj("/api/load_levels/", {}, function(ret){
    if(!ret.ok) console.log("Can't load", ret.error);

    console.log("Loaded levels", ret.levels);

    let levels = ret.levels;
    for(let i = 0; i < levels.length; i++){
        let curr = levels[i];

        LEVELS[curr.name] = curr.data;
        LEVELS[curr.name].ship = { x: 100, y: 500, design: "upgrade1", hp: 3, };
    }
})
