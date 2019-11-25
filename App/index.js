//ejecta.include("pixi-legacy.min.js");
//ejecta.include("jquery-3.4.1.js");
if(!devMode) ejecta.include("levels.js");

const canvas = document.getElementById("canvas");

let ctx = canvas.getContext('experimental-webgl');

canvas.width = w * scale;
canvas.height = h * scale;
canvas.style.width = w;
canvas.style.height = h;

// create shaders
let vertexShaderSrc = 
"attribute vec2 aVertex;" +
"attribute vec2 aUV;" + 
"varying vec2 vTex;" +
"uniform vec2 pos;" +
"void main(void) {" +
"  gl_Position = vec4(aVertex + pos, 0.0, 1.0);" +
"  vTex = aUV;" +
"}";

let fragmentShaderSrc =
"precision highp float;" +
"varying vec2 vTex;" +
"uniform sampler2D sampler0;" +
"void main(void){" +
"  gl_FragColor = texture2D(sampler0, vTex);"+
"}";

let fragmentShaderRectSrc = 
	`#ifdef GL_ES
	precision highp float;
	#endif

	uniform vec4 uColor;

	void main() {
	gl_FragColor = vec4(1, 1, 1, 1);
	}`;

let vertShaderObj = ctx.createShader(ctx.VERTEX_SHADER);
let fragShaderObj = ctx.createShader(ctx.FRAGMENT_SHADER);
let fragShaderRectObj = ctx.createShader(ctx.FRAGMENT_SHADER);
ctx.shaderSource(vertShaderObj, vertexShaderSrc);
ctx.shaderSource(fragShaderObj, fragmentShaderSrc);
ctx.shaderSource(fragShaderRectObj, fragmentShaderRectSrc);
ctx.compileShader(vertShaderObj);
ctx.compileShader(fragShaderObj);
ctx.compileShader(fragShaderRectObj);

let progObj = ctx.createProgram();
ctx.attachShader(progObj, vertShaderObj);
ctx.attachShader(progObj, fragShaderObj);

ctx.linkProgram(progObj);

let progRectObj = ctx.createProgram();
ctx.attachShader(progRectObj, vertShaderObj);
ctx.attachShader(progRectObj, fragShaderRectObj);

ctx.linkProgram(progRectObj);

ctx.useProgram(progObj);

ctx.viewport(0, 0, canvas.width, canvas.height);

ctx.clearColor(0, 0, 0, 1);
ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA);
ctx.enable(ctx.BLEND);

let vertexBuff = ctx.createBuffer();
ctx.bindBuffer(ctx.ARRAY_BUFFER, vertexBuff);
ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, -1, 1, 1]), ctx.STATIC_DRAW);

let texBuff = ctx.createBuffer();
ctx.bindBuffer(ctx.ARRAY_BUFFER, texBuff);
ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([0, 0, 0, 1, 1, 1, 1, 0]), ctx.STATIC_DRAW);

let vloc = ctx.getAttribLocation(progObj, "aVertex"); 
let tloc = ctx.getAttribLocation(progObj, "aUV");
let uLoc = ctx.getUniformLocation(progObj, "pos");

// image1 = new Image();
// // image1.crossOrigin = "anonymous";
// image1.src = "images/ship1.png";
// image1.onerror = function() {
// 	console.log("err");
// }

// let image2 = new Image();
// // image2.crossOrigin = "anonymous";
// image2.src = "images/ship2.png";
// image2.onerror = function() {
// 	console.log("err");
// }

// image1.onload = function(){
// 	drawImage(this, 100, 100, 100, 100);
// };

// image2.onload = function() {
// 	drawImage(image1, 100, 100, 100, 100);
// 	drawImage(this, 200, 100, 100, 100);
// }



tex = ctx.createTexture();

ctx.bindTexture(ctx.TEXTURE_2D, tex);
ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);

ctx.enableVertexAttribArray(tloc);
ctx.bindBuffer(ctx.ARRAY_BUFFER, texBuff);
ctx.bindTexture(ctx.TEXTURE_2D, tex);
ctx.vertexAttribPointer(tloc, 2, ctx.FLOAT, false, 0, 0);

ctx.enableVertexAttribArray(vloc);
ctx.bindBuffer(ctx.ARRAY_BUFFER, vertexBuff);


function drawImage(image, x, y, width, height){
	ctx.useProgram(progObj);
	let bufferLeft, bufferRight, bufferUp, bufferDown;

	let kx = 2 / canvas.width;
	let ky = 2 / canvas.height;
	bufferLeft = kx * x - 1;
	bufferRight = kx * (x + width) - 1;
	bufferUp = -(ky * y - 1);
	bufferDown = -(ky * (y + height) - 1);

	// console.log(`Left: ${bufferLeft}, right: ${bufferRight}, up: ${bufferUp}, down: ${bufferDown}`);


	// ctx.bindTexture(ctx.TEXTURE_2D, tex);
	// ctx.texImage2D(ctx.TEXTURE_2D, 0,  ctx.RGBA,  ctx.RGBA, ctx.UNSIGNED_BYTE, image);

	// ctx.enableVertexAttribArray(vloc);
	// ctx.bindBuffer(ctx.ARRAY_BUFFER, vertexBuff);
	ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([

		bufferLeft,   bufferUp,
		bufferLeft,   bufferDown, 
		bufferRight,  bufferDown, 
		bufferRight,  bufferUp
		
	]), ctx.DYNAMIC_DRAW);

	ctx.vertexAttribPointer(vloc, 2, ctx.FLOAT, false, 0, 0);

	// ctx.enableVertexAttribArray(tloc);
	// ctx.bindBuffer(ctx.ARRAY_BUFFER, texBuff);
	// ctx.bindTexture(ctx.TEXTURE_2D, tex);
	// ctx.vertexAttribPointer(tloc, 2, ctx.FLOAT, false, 0, 0);

	ctx.drawArrays(ctx.TRIANGLE_FAN, 0, 4);
}

function drawRect(x, y, width, height, color, border = 3){
	ctx.useProgram(progRectObj);
	let bufferLeft, bufferRight, bufferUp, bufferDown;

	let kx = 2 / canvas.width;
	let ky = 2 / canvas.height;
	bufferLeft = kx * x - 1;
	bufferRight = kx * (x + width) - 1;
	bufferUp = -(ky * y - 1);
	bufferDown = -(ky * (y + height) - 1);

	ctx.enableVertexAttribArray(vloc);
	ctx.bindBuffer(ctx.ARRAY_BUFFER, vertexBuff);
	ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([

		bufferLeft,   bufferUp,
		bufferLeft,   bufferDown, 
		bufferRight,  bufferDown, 
		bufferRight,  bufferUp
		
	]), ctx.STATIC_DRAW);

	ctx.vertexAttribPointer(vloc, 2, ctx.FLOAT, false, 0, 0);

	ctx.drawArrays(ctx.LINE_LOOP, 0, 4);
}


function tick(){
	// let date = new Date();
	this.handleKeys();
	
	while( this.currentEnemy && this.currentEnemy.tick == this.tickCount){
		this.genEnemy(this.currentEnemy);
		this.currentEnemy = this.level.enemies[++this.currentEnemyID];
	}

	for(let i = 0; i < this.objects.length; i++){
		// this.checkObjectsFor(this.objects[i]);
		this.objects[i].tick();
		this.checkObjectsFor(this.objects[i]);
	}
	this.checkDeadObjects();

	this.tickCount++;

	// console.log("Tick time =", new Date() - date);
}

class Game {
    constructor(){

        this.MAP_WIDTH  = w;
        this.MAP_HEIGHT = h;

		this.tickIntervalId = -1;
		

		this.tick = tick;
    }

    checkObjectsFor(point){
        let objects = this.objects;
        for(let j = 0; j < objects.length; j++){
            if (point === objects[j]) continue;

            const curr = point,
				  next = objects[j];

            //проверка на совпадения
			if( !( 
				( curr.x + curr.width >= next.x && curr.x <= next.x + next.width ) &&
				( curr.y + curr.height >= next.y && curr.y <= next.y + next.height )
				) ) {
					continue;
			}

            curr.check(next);
        }
    }
    checkDeadObjects(){
        let objects = this.objects;
        for(let i = 0; i < objects.length; i++){
			this.checkDeath(objects[i], i);
		}
    }
    checkDeath(point, i){
        if(point.isDead()){
			if(point.haveUpgrade){
				this.objects.push( new Upgrade( { x: point.x, y: point.y + point.height / 2, ...point.haveUpgrade } ) )
			}

			this.objects.splice(i, 1);
			i--;
		}
    }
    render() {
		// let background = new PIXI.Sprite(
		// 	app.loader.resources["./images/backgrounds/city1.png"].texture
		// );
		// let background = new PIXI.Sprite.from("./images/backgrounds/city1.png");
		// background.x = -this.tickCount * 4;
		// background.width = w;
		// background.height = h;
		// app.stage.addChild(background);

		// for(let i = 0; i < this.objects.length; i++){
		// 	let point = this.objects[i];
		// 	let alpha = 1;

		// 	if(point.type == "S" && point.invulnerable > 0){
		// 		alpha = point.invulnerable % 4 >= 2 ? 0.4 : 0.8;
		// 	}

		// 	if(point.color){
		// 		let g = new PIXI.Graphics;
		// 		g.beginFill(point.color);
		// 		g.drawRect(point.x, point.y, point.width, point.height);
		// 		g.endFill();
		// 		app.stage.addChild(g);
		// 	}

		// 	if(point.text){

		// 		this.renderText(point);

		// 	} else if(point.sprite && point.sprite.imgSrc){

		// 		this.renderSprite(point, alpha);

		// 	} else if(point.tileSet) {

		// 		this.renderTileSet(point);

		// 	}

		// 	//hitbox
		// 	// let graphics = new PIXI.Graphics();
		// 	// graphics.lineStyle(1, 0xFF0000);
		// 	// graphics.drawRect(point.x, point.y, point.width, point.height);
		// 	// app.stage.addChild(graphics);

		// }

		// //render hp
		// if(this.ship){
		// 	this.renderShipHp();
		// }

		// app.render();

		// app.stop();

		// app.stage.removeChildren();

		ctx.clear(ctx.COLOR_BUFFER_BIT);


		// for(let i = 0; i < this.objects.length; i++){
		// 	let point = this.objects[i];
		// 	let alpha = 1;

		// 	if(point.sprite && point.sprite.imgSrc){

		// 		this.renderSprite(point, alpha);

		// 	}
		// 	if(point.text){

		// 	}

		// 	// drawRect(point.x, point.y, point.width, point.height);

		// }
		// let date = new Date();

		for(let key in images){
			let image = images[key];
			ctx.texImage2D(ctx.TEXTURE_2D, 0,  ctx.RGBA,  ctx.RGBA, ctx.UNSIGNED_BYTE, image);

			for(let i = 0; i < this.objects.length; i++){
				let point = this.objects[i];
				if(point.sprite && point.sprite.imgSrc == key){

					let x = point.x + (point.sprite.offsetX || 0);
					let y = point.y + (point.sprite.offsetY || 0);
			
					drawImage(image, x, y, point.sprite.width, point.sprite.height);

				}
			}
		}

		// console.log("Render time =", new Date() - date);

	}
	gamepadHandleKeys(){
        if (!navigator.getGamepads) return;
        let gamepads=navigator.getGamepads();
        for (let gp=0;gp<gamepads.length;gp++) {
			let gamepad = gamepads[gp];
			if (!gamepad) continue;
			if (!gamepad.buttons) continue;
			for(let i = 0; i < gamepad.buttons.length; i++){
				if(!gamepad.buttons[i].pressed) continue;
				let key;
				// console.log("Pressed button i="+i);
				switch(i) {
					case 12:
						key = "ArrowUp";
						break;
					case 13:
						key = "ArrowDown";
						break;
					case 14:
						key = "ArrowLeft";
						break;
					case 15:
						key = "ArrowRight";
						break;
					case 0:
						key = " ";
						break;
				}
				if(key) this.keysDown[key] = true;
			}
		}
    }
    handleKeys(){
		this.gamepadHandleKeys();

        for(let i = 0; i < this.objects.length; i++){
            
            for(let key in this.keysDown){
                if(this.keysDown[key]) {
					this.objects[i].keyHandler(key);
                }
            }

		}
		
		if(!devMode) this.keysDown = {};
    }
	genEnemy(enemy){
		let e = new Enemy(enemy);
		this.objects.push( e );
	}
    start(){

        document.addEventListener('keydown', e => {
			// this.keysDown[e.key] = true;
			this.keysDown[e.key] = e.target.tagName != "INPUT" || e.key == "Enter";
			switch(e.key){
				case 'ArrowUp':
				case 'ArrowDown':
				case ' ':
					e.preventDefault();
			}
        });

        document.addEventListener('keyup', e => {
            this.keysDown[e.key] = false;
        });

        document.addEventListener('keypress', e => {
			if(e.target.tagName == "INPUT") return;
			if(e.key === 'p') this.togglePause();
			else if(e.key === 'q') this.loadLevel("menu");
		});

		this.loadLevel("menu");

        this.render();
        
        this.setGameInterval();

	}
	clearLevel(){
        this.tickCount = 0;

		this.keysDown = {};

		if(this.level.enemies.length > 0){	
			this.currentEnemyID = 0;
			this.currentEnemy = this.level.enemies[this.currentEnemyID];
		}

		this.objects = [];
	}
	loadLevel(level, editedLevel){
		this.level = LEVELS[level];

		if(!this.level.gameOver) this.level.gameOver = this.loadLevel.bind(this, "menu");
		
		this.tick = this.level.tick || tick;

		if (this.level.init){
			this.init = this.level.init;
			this.init(editedLevel);
		}

        this.clearLevel();

		if(this.level.ship){
			this.ship = new Ship(this.level.ship);
		
			this.objects.push(this.ship);
		}
		
		while( this.currentEnemy && this.currentEnemy.tick == this.tickCount){
			this.genEnemy(this.currentEnemy);
			this.currentEnemy = this.level.enemies[++this.currentEnemyID];
		}
	}
    setGameInterval(){
        this.tickIntervalId = setInterval(()=>{
            this.tick();
            this.render();
        }, 1000/TICKS_PER_SEC);
    }
    togglePause(){
        if(this.tickIntervalId < 0) {
            this.setGameInterval();
        } else {
            clearInterval(this.tickIntervalId);
            this.tickIntervalId = -1;
        }
	}
	renderSprite(point, alpha){
		let x = point.x + (point.sprite.offsetX || 0);
		let y = point.y + (point.sprite.offsetY || 0);

		drawImage(images[point.sprite.imgSrc], x, y, point.sprite.width, point.sprite.height);

	}
	renderText(point){
		// let font = point.font.split(" ");

		// let text = new PIXI.Text(point.text, { fill: point.textColor, fontFamily: font[1], fontSize: font[0] });
		// text.x = Math.abs( (text.width - point.width) ) / 2 + point.x;
		// text.y = Math.abs( (text.height - point.height) ) / 2 + point.y;
		// app.stage.addChild(text);
	}
	renderShipHp(){
		// let ctx = this.ctx;
		// ctx.fillStyle = "#ffffff";
		// ctx.font = "30px sans-serif";
		// ctx.fillText(`Health: ${this.ship && this.ship.hp}`, 10, 40);
		// let text = new PIXI.Text(`Health: ${this.ship.hp}`, { fill: "0xffffff", fontFamily: "sans-serif", fontSize: "30px" });
		// text.x = 1700;
		// text.y = 40;
		// app.stage.addChild(text);
	}
	discardKeys(){
		this.keysDown = {};
	}
	renderTileSet(point){
		// let ctx = this.ctx;
		// let img = document.createElement("img");
		// img.src = point.tileSet.src;

		// let tileSet = point.tileSet;
		// let animationOptions = point.animationOptions;

		// let tileX = point.x + (animationOptions.offsetX || 0);
		// let tileY = point.y + (animationOptions.offsetY || 0);

		// let width = animationOptions.width || tileSet.width;
		// let height = animationOptions.height || tileSet.height;

		// ctx.drawImage(
		// 	img,
		// 	...tileSet.tiles[point.animationStep],
		// 	tileSet.width,
		// 	tileSet.height,
		// 	tileX,
		// 	tileY,
		// 	width,
		// 	height
		// );

		// let tileSet = point.tileSet;
		// let animationOptions = point.animationOptions;

		// let texture = new PIXI.Texture.from(point.tileSet.src);

		// texture.frame = new PIXI.Rectangle(
		// 	...tileSet.tiles[point.animationStep], 
		// 	tileSet.width - 1, 
		// 	tileSet.height - 1 
		// );

		// texture.updateUvs();

		// let sprite = new PIXI.Sprite(texture);

		// let sprite = new PIXI.Sprite.from(point.tileSet.src);
		// sprite.texture.frame = new PIXI.Rectangle(
		// 	...tileSet.tiles[point.animationStep], 
		// 	tileSet.width - 1, 
		// 	tileSet.height - 1 
		// );

		// sprite.texture.updateUvs();

		// sprite.x = point.x + (animationOptions.offsetX || 0);
		// sprite.y = point.y + (animationOptions.offsetY || 0);
		// sprite.width = animationOptions.width || tileSet.width;
		// sprite.height = animationOptions.height || tileSet.height;

		// app.stage.addChild(sprite);
	}
}

class Point {
	constructor( { 
			x = 0, 
			y = 0, 
			type = 'Point', 
			direction = { x: 0, y: 0 }, 
			ai = "none",
			design = "none",
			params = "none",
			props
		} ) {
        this.x = x;
		this.y = y;
        this.type = type;
        this.direction = direction;
        this.startTicks = (game && game.tickCount) || 0;
		this.ai = ai;
		this.params = params;
		this.design = design;

		let preset = "none";

		switch(this.type){
			case 'E':
				preset = "enemies";
				break;
			case 'B':
				preset = "bullets";
				break;
			case 'S':
				preset = "ships";
				break;
			case 'D':
				preset = "decorations";
				break;
			case 'U':
				preset = "upgrades";
				break;
		}

		let currParams = JSON.parse(JSON.stringify({
			...LEVELS.presets[preset].params[params],
			...LEVELS.presets[preset].design[design],
		}));

		currParams = { ...currParams, ...LEVELS.presets[preset].ai[ai] }
		for(let key in LEVELS.presets[preset].ai[ai]){
			if(key == "description" || key == "addons") continue;
			currParams[key] = LEVELS.presets[preset].ai[ai][key];
		}

		for(let param in currParams){
			this[param] = currParams[param];
		}

		if(this.x === "center") {
			this.x = w2 - this.width / 2;
		}

		if(this.y === "center") {
			this.y = h2 - this.height / 2;
		}

		for(let key in props){
			this[key] = props[key];
		}

		this.init();
    }

    isDead(){
        return    this.hp <= 0
               || this.x < -this.width - 50
               || this.x >= game.MAP_WIDTH + 100
               || this.y < -100
               || this.y >= game.MAP_HEIGHT + this.height + 50;
	}
	ticksPassed(){
		return game.tickCount-this.startTicks;
	}
    die(){
        this.hp = 0;
    }
    move(x = 0, y = 0) {
        this.x += x;
        this.y += y;
	}
	moveToDir(){
		this.x += this.direction.x * this.speed.x;
		this.y += this.direction.y * this.speed.y;
	}
    moveTo(x = this.x, y = this.y) {
        this.x = x;
        this.y = y;
    }
    attack(point){
        point.takeDmg(this.dmg);
    }
    takeDmg(dmg){
		this.hp -= dmg;

		if(this.hp <= 0){
			if(this.deathExplosion){
				let deathExplosion = new Decoration( { x: this.x, y: this.y, ...this.deathExplosion } );
				game.objects.push( deathExplosion );
			}
			return;
		}
    }
    keyHandler(){}
    tick(){}
	check(){}
	keyUpHandler(){}
	init(){}
}

class Ship extends Point {
	constructor( { 
		x, 
		y, 
		design = "upgrade1",
		params = design,
		ai = design,
		...props
	 } ){
		super( { 
			x,
			y, 
			type: "S", 
			design,
			params,
			ai,
			props
		 } );
		this.reload = 0;
		this.invulnerable = 0;
		this.sprite.offsetY = this.sprite.offsetY || - (this.sprite.height - this.height) / 2;
    }

    keyHandler(key){
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
    move(x, y){
        super.move(x, y);
        if(this.x < 0) this.x = 0;
        if(this.x >= game.MAP_WIDTH) this.x = game.MAP_WIDTH - 1;
        if(this.y < 0) this.y = 0;
        if(this.y >= game.MAP_HEIGHT - 50) this.y = game.MAP_HEIGHT - 50;
    }
    takeDmg(dmg){
        super.takeDmg(dmg);

        if(this.hp > 0){
            this.moveTo(0, h2);
        }
	}
}

class Enemy extends Point {
	constructor( constructor ) {
		let tick, x, y, design, params, ai, haveUpgrade, props;
		({
			tick,
			x,
			y,
			design = "enemy1",
			params = design,
			ai = design,
			haveUpgrade,
			...props
		} = constructor);
		super( { 
			x, 
			y, 
			type: "E", 
			ai,
			design,
			params,
			props
		} );
		this.origin = constructor;
		this.haveUpgrade = haveUpgrade;
		if(this.sprite) this.sprite.offsetX = this.sprite.offsetX || -(this.sprite.width - this.width) / 2;
		if(this.sprite) this.sprite.offsetY = this.sprite.offsetY || -(this.sprite.height - this.height) / 2;
    }
}

class Bullet extends Point {
	constructor({
		x,
		y,
		design = "enemyBullet1",
		ai = design,
		params = design,
		...props
	}) {

		super({
			x,
			y,
			type: "B", 
			ai, 
			params,
			design,
			props
		});

	}
}

class Decoration extends Point {
	constructor({
		x,
		y,
		design = "explosion1",
		ai = design,
		params = design,
		...props
	}) {

		super({
			x,
			y,
			type: "D",
			ai, 
			params,
			design,
			props
		});

	}
}

class Upgrade extends Point {
	constructor({
		x,
		y,
		design = "upgrade1",
		ai = design,
		params = design,
		...props
	}) {

		super({
			x,
			y,
			type: "U",
			ai, 
			params,
			design,
			props
		});

	}
}



// let app = new PIXI.Application({
// 	width: 1920, 
// 	height: 1080,
// });
// document.body.appendChild(app.view);

let game = new Game;

let loadingProgress = 0;
let images = {};

let files=["images/bullets/boss_bullet1.png","images/bullets/bullet1.png","images/bullets/enemy_bullet1.png","images/enemies/enemy1.png","images/enemies/enemy2.png","images/enemies/enemy3.png","images/enemies/enemy4.png","images/enemies/enemy5.png","images/explosions/explosion1.png","images/menu/edit.png","images/menu/start.png","images/ship1.png","images/ship2.png","images/ship3.png","images/ships/mainShip.png","images/upgrades/upgrade1.png","images/walls/wall1.png"];
/*$.ajax({
	url: "http://localhost:3030/pics",
	method: "GET",
	success: function(ret) {
		
		let files = JSON.parse(ret);*/

		// loadingProgress = files.length;
for(let i = 0; i < files.length; i++){
	let fileName = files[i];
	if( !fileName.match(/\.png$/) ) continue;

	loadingProgress++;

	let img = new Image();
	img.crossOrigin="anonymous";
	img.src = "http://rtype.pronetcom.ru/pics/"+fileName;
	img.onload = () => {
		loadingProgress--;
		checkLoading();
	}
	img.onerror=function(err) { console.log("image load error",err); }

	images[fileName] = img;
}

//	}
//});

// fetch("http://localhost:3030/pics")
// .then( (res) => {
// 	return res.json();
// } )
// .then ( (ret) => {
// 	let files = ret;

// 		// loadingProgress = files.length;
// 		for(let i = 0; i < files.length; i++){
// 			let fileName = files[i];
// 			if( !fileName.match(/\.png$/) ) continue;

// 			loadingProgress++;

// 			let img = new Image();
// 			img.src = fileName;
// 			img.onload = () => {
// 				loadingProgress--;
// 				checkLoading();
// 			}

// 			images[fileName] = img;
// 		}
// } );

// let xhr = new XMLHttpRequest();
// xhr.open('POST', "http://localhost:3030/pics", true);
// xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
// // let fdata = new FormData();
// // for (let k in data) fdata.append(k,data[k]);
// xhr.onreadystatechange = function() {//Вызывает функцию при смене состояния.
// 	//console.log(xhr);
// 	if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
// 		// console.log(xhr);
// 		// Запрос завершен. Здесь можно обрабатывать результат.
// 		let ret=JSON.parse(xhr.responseText);
		
// 		let files = ret;

// 		// loadingProgress = files.length;
// 		for(let i = 0; i < files.length; i++){
// 			let fileName = files[i];
// 			if( !fileName.match(/\.png$/) ) continue;

// 			loadingProgress++;

// 			let img = new Image();
// 			img.src = fileName;
// 			img.onload = () => {
// 				loadingProgress--;
// 				checkLoading();
// 			}

// 			images[fileName] = img;
// 		}


// 	}
// 	// TODO обработать статус не 200 (404, 500)
// };
// xhr.send();

function checkLoading() {
	if (loadingProgress === 0){
		game.start();
	}
}

// app.loader.add( [
// 		"./images/backgrounds/city1.png",
// 		"./"
// 			] )
// .load( () => {
// 	game.start();
// } );
