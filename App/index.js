

class Game {
    constructor(){
        this.canvas = document.querySelector("canvas");

        this.MAP_WIDTH  = w;
        this.MAP_HEIGHT = h;

        this.tickIntervalId = -1;

        document.addEventListener('keydown', e => {
            this.keysDown[e.key] = true;
        });

        document.addEventListener('keyup', e => {
            this.keysDown[e.key] = false;
        });

        document.addEventListener('keypress', e => {
            if(e.key === 'p') this.togglePause();
		});

		this.canvas.width = w * scale;
		this.canvas.height = h * scale;
		this.canvas.style.width = w;
		this.canvas.style.height = h;

		this.ctx = this.canvas.getContext('2d');
		let ctx = this.ctx;
		ctx.scale(scale, scale);

		ctx.fillStyle = '#000000';
		ctx.fillRect( 0, 0, w, h );

		ctx.globalAlpha = 1;
		ctx.lineWidth = 2;

		//this.level = LEVELS["level1"];
		this.level = LEVELS["menu"];

		// this.currentBackgroundID = 0;
		// this.currentBackground = { ...LEVELS.backgrounds[ this.level.background[0] ], offset: 0 };
		// this.nextBackground = { ...LEVELS.backgrounds[ this.level.background[1] ], offset: 0 };
		// this.levelLength = this.level.background.reduce((prev, curr) => {
		// 	return prev + LEVELS.backgrounds[curr].width;
		// }, 0);
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
			if(point.explosionTile){
				let explosion = new Decoration( { x: point.x, y: point.y, ...point.explosionTile } );
				this.objects.push( explosion );
			}


			this.objects.splice(i, 1);
			i--;
		}
    }
    render() {
		let ctx = this.ctx;

		ctx.globalCompositeOperation = 'source-over';
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, w, h);

		for(let i = 0; i < this.objects.length; i++){
			let point = this.objects[i];

			if(point.color){
				ctx.fillStyle = point.color;
				ctx.fillRect(point.x, point.y, point.width, point.height);
			}

			if(point.text){

				this.renderText(point);

			} else if(point.sprite && point.sprite.imgSrc){

				this.renderSprite(point);

			} else if(point.tileSet) {

				this.renderTileSet(point);

			}

			//render hitbox
			// ctx.strokeStyle = "red";
			// ctx.strokeRect(point.x, point.y, point.width, point.height);

		}

		//render hp
		if(this.ship){
			this.renderShipHp();
		}
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
    tick(){
        this.handleKeys();
		
		while( this.currentEnemy && this.currentEnemy.tick == this.tickCount){
			this.genEnemy(this.currentEnemy);
			this.currentEnemy = this.level.enemies[++this.currentEnemyID];
		}

        for(let i = 0; i < this.objects.length; i++){
            this.checkObjectsFor(this.objects[i]);
            this.objects[i].tick();
            this.checkObjectsFor(this.objects[i]);
        }
        this.checkDeadObjects();

        this.tickCount++;
    }
    // genRandomEnemy(){
	// 	const enemyType = Math.random() > 0.5 ? SuperEnemy : Enemy;
    //     const rndY = Math.floor( Math.random() * this.MAP_HEIGHT );
    //     const rndYDir = Math.random() >= 0.5 ? 1 : -1;
	// 	this.objects.push( new enemyType( { 
	// 		x: this.MAP_WIDTH - 1, 
	// 		y: rndY, hp: 1, 
	// 		direction: { x: -1, y: rndYDir }, 
	// 		speed: 18, 
	// 		fireRate:36 
	// 	} ) );
	// }
	// enemy: from LEVELS
	genEnemy(enemy){
		this.objects.push( new Enemy(enemy) );
	}
    start(){

		this.loadLevel("menu");

        this.render();
        
        this.setGameInterval();

	}
	loadLevel(level){

		this.level = LEVELS[level];

        this.tickCount = 0;

		this.keysDown = {};

		this.currentEnemyID = 0;
		this.currentEnemy = this.level.enemies[this.currentEnemyID];

		this.objects = [];

		if(this.level.ship){
			this.ship = new Ship(this.level.ship);
		
			this.objects.push(this.ship);
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
	renderSprite(point){
		let ctx = this.ctx;
		let img = document.createElement("img");
		img.src = point.sprite.imgSrc;
		let spriteX = point.x + (point.sprite.offsetX || 0);
		let spriteY = point.y + (point.sprite.offsetY || 0);
		ctx.drawImage(
			img,
			spriteX,
			spriteY,
			point.sprite.width,
			point.sprite.height);
	}
	renderText(point){
		let ctx = this.ctx;

		ctx.fillStyle = point.textColor;
		ctx.font = point.font;

		let x = Math.abs( (ctx.measureText(point.text).width - point.width) ) / 2 + point.x;

		let fontHeight = parseInt(ctx.font.match(/\d+/), 10)
		let y = point.y + point.height - Math.abs( (fontHeight - point.height) ) / 2;

		ctx.fillText(point.text, x, y);
	}
	renderShipHp(){
		let ctx = this.ctx;
		ctx.fillStyle = "#ffffff";
		ctx.font = "30px sans-serif";
		ctx.fillText(`Health: ${this.ship && this.ship.hp}`, 10, 40);
	}
	discardKeys(){
		this.keysDown = {};
	}
	renderTileSet(point){
		let ctx = this.ctx;
		let img = document.createElement("img");
		img.src = point.tileSet.src;

		let tileX = point.x + point.tileSet.width / 2;
		let tileY = point.y + point.tileSet.height / 2;

		let tileSet = point.tileSet;

		ctx.drawImage(
			img,
			...tileSet.tiles[point.animationStep],
			tileSet.width,
			tileSet.height,
			tileX,
			tileY,
			tileSet.width,
			tileSet.height
		);
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
		}

		let currParams = {
			...LEVELS.presets[preset].params[params],
			...LEVELS.presets[preset].design[design],
			...LEVELS.presets[preset].ai[ai]
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
		ai = design
	 } ){
		super( { 
			x,
			y, 
			type: "S", 
			design,
			params,
			ai
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
	constructor( {
		tick,
		x,
		y,
		design = "enemy1",
		params = design,
		ai = design,
		haveUpgrade,
	 } ) {
		super( { 
			x, 
			y, 
			type: "E", 
			ai,
			design,
			params
		} );
		this.startTicks = tick;
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
		params = design
	}) {

		super({
			x,
			y,
			type: "B", 
			ai, 
			params,
			design
		});

	}
}

class Decoration extends Point {
	constructor({
		x,
		y,
		design = "explosion1",
		ai = design,
		params = design
	}) {

		super({
			x,
			y,
			type: "D",
			ai, 
			params,
			design
		});

	}
}

let game = new Game;
game.start();