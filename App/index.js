
function tick(){
	this.handleKeys();
	
	while( this.currentEnemy && this.currentEnemy.tick == this.tickCount){
		this.genEnemy(this.currentEnemy);
		this.currentEnemy = this.level.enemies[++this.currentEnemyID];
	}
	
	while( this.currentWall && this.currentWall.tick == this.tickCount){
		this.genEnemy(this.currentWall);
		this.currentWall = this.level.walls[++this.currentWallID];
	}

	for(let i = 0; i < this.objects.length; i++){
		this.checkObjectsFor(this.objects[i]);
		this.objects[i].tick();
		this.checkObjectsFor(this.objects[i]);
	}
	this.checkDeadObjects();

	this.tickCount++;
}

class Game {
    constructor(){
		this.canvas = document.querySelector("canvas");

        this.MAP_WIDTH  = w;
        this.MAP_HEIGHT = h;

		this.tickIntervalId = -1;
		

		this.tick = tick;

		// this.canvas.width = w * scale;
		// this.canvas.height = h * scale;
		// this.canvas.style.width = w;
		// this.canvas.style.height = h;
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

		for(let i = 0; i < this.objects.length; i++){
			let point = this.objects[i];
			let alpha = 1;

			if(point.type == "S" && point.invulnerable > 0){
				alpha = point.invulnerable % 4 >= 2 ? 0.4 : 0.8;
			}

			if(point.color){
				let g = new PIXI.Graphics;
				g.beginFill(point.color);
				g.drawRect(point.x, point.y, point.width, point.height);
				g.endFill();
				app.stage.addChild(g);
			}

			if(point.text){

				this.renderText(point);

			} else if(point.sprite && point.sprite.imgSrc){

				this.renderSprite(point, alpha);

			} else if(point.tileSet) {

				this.renderTileSet(point);

			}

		}

		// //render hp
		if(this.ship){
			this.renderShipHp();
		}




		app.render();

		app.stop();

		app.stage.removeChildren();

		// 	//render hitbox
		// 	// ctx.strokeStyle = "red";
		// 	// ctx.strokeRect(point.x, point.y, point.width, point.height);

		// }
    }
    handleKeys(){
        for(let i = 0; i < this.objects.length; i++){
            
            for(let key in this.keysDown){
                if(this.keysDown[key]) {
					this.objects[i].keyHandler(key);
                }
            }

        }
    }
	genEnemy(enemy){
		let e = new Enemy(enemy);
		this.objects.push( e );
	}
    start(){

        document.addEventListener('keydown', e => {
            this.keysDown[e.key] = true;
        });

        document.addEventListener('keyup', e => {
            this.keysDown[e.key] = false;
        });

        document.addEventListener('keypress', e => {
            if(e.key === 'p') this.togglePause();
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
			this.currentWallID = 0;
			this.currentWall = this.level.walls && this.level.walls[this.currentWallID];
		}

		this.objects = [];
	}
	loadLevel(level){
		this.level = LEVELS[level];

		if(!this.level.gameOver) this.level.gameOver = this.loadLevel.bind(this, "menu");
		
		this.tick = this.level.tick || tick;

		if (this.level.init){
			this.init = this.level.init;
			this.init();
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
		let sprite = new PIXI.Sprite.from(point.sprite.imgSrc);

		if(alpha){
			sprite.alpha = alpha;
		}

		sprite.x = point.x + (point.sprite.offsetX || 0);
		sprite.y = point.y + (point.sprite.offsetY || 0);
		sprite.width = point.sprite.width;
		sprite.height = point.sprite.height;

		app.stage.addChild(sprite);

	}
	renderText(point){
		let font = point.font.split(" ");

		let text = new PIXI.Text(point.text, { fill: point.textColor, fontFamily: font[1], fontSize: font[0] });
		text.x = Math.abs( (text.width - point.width) ) / 2 + point.x;
		text.y = Math.abs( (text.height - point.height) ) / 2 + point.y;
		app.stage.addChild(text);
	}
	renderShipHp(){
		// let ctx = this.ctx;
		// ctx.fillStyle = "#ffffff";
		// ctx.font = "30px sans-serif";
		// ctx.fillText(`Health: ${this.ship && this.ship.hp}`, 10, 40);
		let text = new PIXI.Text(`Health: ${this.ship.hp}`, { fill: "0xffffff", fontFamily: "sans-serif", fontSize: "30px" });
		text.x = 1700;
		text.y = 40;
		app.stage.addChild(text);
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

		let tileSet = point.tileSet;
		let animationOptions = point.animationOptions;

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
               || this.x < 0
               || this.x >= game.MAP_WIDTH
               || this.y < 0
               || this.y >= game.MAP_HEIGHT
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



let app = new PIXI.Application({
	width: 1920, 
	height: 1080,
});
document.body.appendChild(app.view);

let game = new Game;
game.start();

// app.loader.add( [
// 		"./images/backgrounds/city1.png",
// 		"./"
// 			] )
// .load( () => {
// 	game.start();
// } );