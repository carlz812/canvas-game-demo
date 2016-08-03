var game = new Game();

function init() {
    var fBg=document.getElementById('figbg');
    var oLoad=document.getElementById('loading');
    oLoad.style.display='none';
    fBg.style.display='none';
    if(game.init())
        game.start();
}

var imageRepository = new function(){
    this.empty = null;
    this.zongzi = new Image();
    this.stone = new Image();
    this.monkey = new Image();
    this.enemy = new Image();

    var numImages = 5;
    var numLoaded = 0;
    function imageLoaded() {
        numLoaded++;
        if (numLoaded === numImages) {
            window.init();
        }
    }
    this.zongzi.onload = function() {
        imageLoaded();
    }
    this.stone.onload = function() {
        imageLoaded();
    }
    this.monkey.onload = function() {
        imageLoaded();
    }
    this.enemy.onload = function() {
        imageLoaded();
    }

    this.zongzi.src = "images/zz.png";
    this.stone.src = "images/stone.png";
    this.monkey.src = "images/monkey.png";
    this.enemy.src = "images/monkey.png";
}


/**
 * Create the Monkey object that the player controls. The ship is
 * drawn on the "ship" canvas and uses dirty rectangles to move
 * around the screen.
 */
function Monkey() {
    this.speed = 5;
    var counter = 0;

    this.collidableWith = "";
    this.collidedWith = false;
    this.type = "monkey";

    this.init = function(x, y, width, height) {
        // Defualt variables
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.alive = true;
        this.isColliding = false;
    }

    this.draw = function() {
        this.context.drawImage(imageRepository.monkey, this.x, this.y);
    };
    this.move = function() {
        counter++;
        if(ori){
            this.context.clearRect(this.x-5, this.y-5, this.width+15, this.height+5);
            if(ori>0.05){
                this.x += this.speed
                if (this.x >= this.canvasWidth - this.width)
                    this.x = this.canvasWidth - this.width;
            }else if(ori<-0.05){
                this.x -= this.speed
                if (this.x <= 0) // Keep player within the screen
                    this.x = 0;
            }
            // Redraw the ship
            if (this.isColliding && this.collidedWith) {
                this.alive = false;
                game.gameOver();
            }this.draw();
        }
    };
    /*this.move = function() {
        counter++;
        // Determine if the action is move action
        if (KEY_STATUS.left || KEY_STATUS.right ||
            KEY_STATUS.down || KEY_STATUS.up) {
            // The ship moved, so erase it's current image so it can
            // be redrawn in it's new location
            this.context.clearRect(this.x, this.y, this.width, this.height);

            // Update x and y according to the direction to move and
            // redraw the ship. Change the else if's to if statements
            // to have diagonal movement.
            if (KEY_STATUS.left) {
                this.x -= this.speed
                if (this.x <= 0) // Keep player within the screen
                    this.x = 0;
            } else if (KEY_STATUS.right) {
                this.x += this.speed
                if (this.x >= this.canvasWidth - this.width)
                    this.x = this.canvasWidth - this.width;
            }
            // Redraw the ship
            if (this.isColliding && this.collidedWith) {
                this.alive = false;
                game.gameOver();
            }this.draw();
        }
    };*/
}


Monkey.prototype = new Drawable();


function Drawable() {
    this.init = function(x, y, width, height) {
        // Defualt variables
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    this.speed = 0;
    this.canvasWidth = 0;
    this.canvasHeight = 0;

    this.collidableWith = "";
    this.isColliding = false;
    this.type = "";

    // Define abstract function to be implemented in child objects
    this.draw = function() {
    };
    this.move = function() {
    };

    this.isCollidableWith = function(object) {
        return (this.collidableWith === object.type);
    };
}


function Bullet(object) {
    this.alive = false; // Is true if the bullet is currently in use
    this.collidableWith = "bullet";
    this.type = "bullet";
    var self = object;
    var sacles = (Math.floor(Math.random()*50)+50)/100;
    /*
     * Sets the bullet values
     */
    this.spawn = function(x, y, speed) {
        this.x = x+Math.floor(Math.random()*40+(-20));
        this.y = y;
        this.speed = speed;
        this.alive = true;
    };

    /*
     * Uses a "drity rectangle" to erase the bullet and moves it.
     * Returns true if the bullet moved of the screen, indicating that
     * the bullet is ready to be cleared by the pool, otherwise draws
     * the bullet.
     */
    this.draw = function() {
        this.context.clearRect(this.x, this.y, this.width+1, this.height+1);
        this.y -= this.speed;
        if (this.isColliding) {
            return true;
        }else if ( this.y >= this.canvasHeight) {
            return true;
        }else if ( game.monkey.collidedWith ) {
            return true;
        } else {
            if (self === "zongzi") {
                this.context.drawImage(imageRepository.zongzi, this.x, this.y,this.width *sacles,this.height *sacles);
            }
            else if (self === "stone") {
                this.context.drawImage(imageRepository.stone, this.x, this.y,this.width *sacles,this.height *sacles);
            }
            return false;
        }
    };

    /*
     * Resets the bullet values
     */
    this.clear = function() {
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.alive = false;
        this.isColliding = false;
    };
}
Bullet.prototype = new Drawable();


/**
 * QuadTree object.
 *
 * The quadrant indexes are numbered as below:
 *     |
 *  1  |  0
 * ----+----
 *  2  |  3
 *     |
 */
function QuadTree(boundBox, lvl) {
    var maxObjects = 10;
    this.bounds = boundBox || {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
    var objects = [];
    this.nodes = [];
    var level = lvl || 0;
    var maxLevels = 5;

    /*
     * Clears the quadTree and all nodes of objects
     */
    this.clear = function() {
        objects = [];

        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].clear();
        }

        this.nodes = [];
    };

    /*
     * Get all objects in the quadTree
     */
    this.getAllObjects = function(returnedObjects) {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].getAllObjects(returnedObjects);
        }

        for (var i = 0, len = objects.length; i < len; i++) {
            returnedObjects.push(objects[i]);
        }

        return returnedObjects;
    };

    /*
     * Return all objects that the object could collide with
     */
    this.findObjects = function(returnedObjects, obj) {
        if (typeof obj === "undefined") {
            console.log("UNDEFINED OBJECT");
            return;
        }

        var index = this.getIndex(obj);
        if (index != -1 && this.nodes.length) {
            this.nodes[index].findObjects(returnedObjects, obj);
        }

        for (var i = 0, len = objects.length; i < len; i++) {
            returnedObjects.push(objects[i]);
        }

        return returnedObjects;
    };

    /*
     * Insert the object into the quadTree. If the tree
     * excedes the capacity, it will split and add all
     * objects to their corresponding nodes.
     */
    this.insert = function(obj) {
        if (typeof obj === "undefined") {
            return;
        }

        if (obj instanceof Array) {
            for (var i = 0, len = obj.length; i < len; i++) {
                this.insert(obj[i]);
            }

            return;
        }

        if (this.nodes.length) {
            var index = this.getIndex(obj);
            // Only add the object to a subnode if it can fit completely
            // within one
            if (index != -1) {
                this.nodes[index].insert(obj);

                return;
            }
        }

        objects.push(obj);

        // Prevent infinite splitting
        if (objects.length > maxObjects && level < maxLevels) {
            if (this.nodes[0] == null) {
                this.split();
            }

            var i = 0;
            while (i < objects.length) {

                var index = this.getIndex(objects[i]);
                if (index != -1) {
                    this.nodes[index].insert((objects.splice(i,1))[0]);
                }
                else {
                    i++;
                }
            }
        }
    };

    /*
     * Determine which node the object belongs to. -1 means
     * object cannot completely fit within a node and is part
     * of the current node
     */
    this.getIndex = function(obj) {

        var index = -1;
        var verticalMidpoint = this.bounds.x + this.bounds.width / 2;
        var horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

        // Object can fit completely within the top quadrant
        var topQuadrant = (obj.y < horizontalMidpoint && obj.y + obj.height < horizontalMidpoint);
        // Object can fit completely within the bottom quandrant
        var bottomQuadrant = (obj.y > horizontalMidpoint);

        // Object can fit completely within the left quadrants
        if (obj.x < verticalMidpoint &&
            obj.x + obj.width < verticalMidpoint) {
            if (topQuadrant) {
                index = 1;
            }
            else if (bottomQuadrant) {
                index = 2;
            }
        }
        // Object can fix completely within the right quandrants
        else if (obj.x > verticalMidpoint) {
            if (topQuadrant) {
                index = 0;
            }
            else if (bottomQuadrant) {
                index = 3;
            }
        }

        return index;
    };

    /*
     * Splits the node into 4 subnodes
     */
    this.split = function() {
        // Bitwise or [html5rocks]
        var subWidth = (this.bounds.width / 2) | 0;
        var subHeight = (this.bounds.height / 2) | 0;

        this.nodes[0] = new QuadTree({
            x: this.bounds.x + subWidth,
            y: this.bounds.y,
            width: subWidth,
            height: subHeight
        }, level+1);
        this.nodes[1] = new QuadTree({
            x: this.bounds.x,
            y: this.bounds.y,
            width: subWidth,
            height: subHeight
        }, level+1);
        this.nodes[2] = new QuadTree({
            x: this.bounds.x,
            y: this.bounds.y + subHeight,
            width: subWidth,
            height: subHeight
        }, level+1);
        this.nodes[3] = new QuadTree({
            x: this.bounds.x + subWidth,
            y: this.bounds.y + subHeight,
            width: subWidth,
            height: subHeight
        }, level+1);
    };
}


function Pool(maxSize) {
    var size = maxSize; // Max bullets allowed in the pool
    var pool = [];

    this.getPool = function() {
        var obj = [];
        for (var i = 0; i < size; i++) {
            if (pool[i].alive) {
                obj.push(pool[i]);
            }
        }
        return obj;
    }
    /*
     * Populates the pool array with the given object
     */
    this.init = function(object) {
        if (object == "zongzi") {
            for (var i = 0; i < size; i++) {
                // Initalize the object
                var bullet = new Bullet("zongzi");
                bullet.init(0,-500, imageRepository.zongzi.width, imageRepository.zongzi.height);
                bullet.collidableWith = "monkey";
                bullet.type = "zongzi";
                pool[i] = bullet;
            }
        }
        else if (object == "enemy") {
            for (var i = 0; i < size; i++) {
                var enemy = new Enemy();
                enemy.init(0,-500, imageRepository.enemy.width, imageRepository.enemy.height);
                pool[i] = enemy;
            }
        }
        else if (object == "stone") {
            for (var i = 0; i < size; i++) {
                var bullet = new Bullet("stone");
                bullet.init(0,-500, imageRepository.stone.width, imageRepository.stone.height);
                pool[i] = bullet;
                bullet.collidableWith = "monkey";
                bullet.type = "stone";
            }
        }
    };

    /*
     * Grabs the last item in the list and initializes it and
     * pushes it to the front of the array.
     */
    this.get = function(x, y, speed) {
        if(!pool[size - 1].alive) {
            pool[size - 1].spawn(x, y, speed);
            pool.unshift(pool.pop());
        }
    };


    /*
     * Draws any in use Bullets. If a bullet goes off the screen,
     * clears it and pushes it to the front of the array.
     */
    this.animate = function() {
        for (var i = 0; i < size; i++) {
            // Only draw until we find a bullet that is not alive
            if (pool[i].alive) {
                if (pool[i].draw()) {
                    pool[i].clear();
                    pool.push((pool.splice(i,1))[0]);
                }
            }
            else
                break;
        }
    };
}


function Enemy() {
    var percentFire = .005;
    var chance = 0;
    this.alive = false;

    /*
     * Sets the Enemy values
     */
    this.spawn = function(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.alive = true;
    };

    /*
     * Move the enemy
     */
    this.draw = function() {
        // Enemy has a chance to shoot every movement
        chance = Math.random();
        if (chance < percentFire) {
            this.fire();
        }
    };

    /*
     * Fires a bullet
     */
    this.fire = function() {
        var stoneChance = Math.floor(Math.random()*10);
        if(stoneChance>7){
            game.stonePool.get(this.x+this.width/2, 0, -5);
        }else{
            game.zongziPool.get(this.x+this.width/2, 0, -5);
        }
    }

    /*
     * Resets the enemy values
     */
    this.clear = function() {
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.speedX = 0;
        this.speedY = 0;
        this.alive = false;
    };
}
Enemy.prototype = new Drawable();


function Game(){
    this.init = function () {
        //this.zzCanvas = document.getElementById('zongzi');
        this.stoneCanvas = document.getElementById('stone');
        this.monkeyCanvas = document.getElementById('monkey');
        if(this.stoneCanvas.getContext){

            //this.zzContext = this.zzCanvas.getContext('2d');
            this.stoneContext = this.stoneCanvas.getContext('2d');
            this.monkeyContext = this.monkeyCanvas.getContext('2d');

            Bullet.prototype.context = this.stoneContext;
            Bullet.prototype.canvasWidth = this.stoneCanvas.width;
            Bullet.prototype.canvasHeight = this.stoneCanvas.height;

            Monkey.prototype.context = this.monkeyContext;
            Monkey.prototype.canvasWidth = this.monkeyCanvas.width;
            Monkey.prototype.canvasHeight = this.monkeyCanvas.height;

            Enemy.prototype.context = this.stoneContext;
            Enemy.prototype.canvasWidth = this.stoneCanvas.width;
            Enemy.prototype.canvasHeight = this.stoneCanvas.height;

            this.monkey = new Monkey();

            // Set the ship to start near the bottom middle of the canvas
            this.shipStartX = this.stoneCanvas.width/2 - imageRepository.monkey.width;
            this.shipStartY = this.stoneCanvas.height - imageRepository.monkey.height;
            this.monkey.init(this.shipStartX, this.shipStartY, imageRepository.monkey.width,
                imageRepository.monkey.height);

            this.playerScore = 0;

            this.enemyPool = new Pool(5);
            this.enemyPool.init("enemy");

            var height = 35;
            var width = 35;
            var x = 0;
            var y = -height;
            var spacer = y * 1.5;
            for (var i = 1; i <= 18; i++) {
                this.enemyPool.get(x,y,0);
                x += width + 4;
                if (i % 6 == 0) {
                    x = 0;
                    y += spacer
                }
            }

            this.zongziPool = new Pool(30);
            this.zongziPool.init("zongzi");

            this.stonePool = new Pool(8);
            this.stonePool.init("stone");

            // Start QuadTree
            this.quadTree = new QuadTree({x:0,y:-500,width:this.stoneCanvas.width,height:this.stoneCanvas.height});

            return true;
        }else{
            return false;
        }
    }
    this.start = function() {
        this.monkey.draw();
        animate();
    };
    this.spawnWave = function() {
        var height = 35;
        var width = 35;
        var x = 0;
        var y = -height;
        var spacer = y * 1.5;
        for (var i = 1; i <= 18; i++) {
            this.enemyPool.get(x,y,0);
            x += width + 2;
            if (i % 6 == 0) {
                x = 0;
                y += spacer
            }
        }
    }
    // Restart the game
    this.restart = function() {
        $('.levelup').hide();
        document.getElementById('game-over').style.display = "none";
        this.stoneContext.clearRect(0, 0, this.stoneCanvas.width, this.stoneCanvas.height);
        this.monkeyContext.clearRect(0, 0, this.monkeyCanvas.width, this.monkeyCanvas.height);

        this.quadTree.clear();

        // Set the ship to start near the bottom middle of the canvas
        this.monkey.init(this.shipStartX, this.shipStartY, imageRepository.monkey.width,
            imageRepository.monkey.height);
        this.enemyPool.init("enemy");
        this.spawnWave();

        this.zongziPool.init("zongzi");
        this.stonePool.init("stone");
        this.monkey.collidedWith= false;
        this.playerScore = 0;

        this.start();
    };

    // Game over
    this.gameOver = function() {
        document.getElementById('game-over').style.display = "block";
    };

    // level up
    this.gamelvlup = function() {
        document.getElementById('levelUp').style.display = "block";
    };

}


function animate() {
    document.getElementById('score').innerHTML = game.playerScore;
    document.getElementById('over-score').innerHTML = game.playerScore;
    if(game.playerScore>=200){
        game.monkey.collidedWith=true;
        game.gamelvlup();
    }
    // Insert objects into quadtree
    game.quadTree.clear();
    game.quadTree.insert(game.monkey);
    game.quadTree.insert(game.enemyPool.getPool());
    game.quadTree.insert(game.zongziPool.getPool());
    game.quadTree.insert(game.stonePool.getPool());
    detectCollision();
    if (game.monkey.alive&&!game.monkey.collidedWith) {
        requestAnimFrame( animate );
        game.monkey.move();
        game.enemyPool.animate();
        game.zongziPool.animate();
        game.stonePool.animate();
    }

}


function detectCollision() {
    var objects = [];
    game.quadTree.getAllObjects(objects);

    for (var x = 0, len = objects.length; x < len; x++) {
        game.quadTree.findObjects(obj = [], objects[x]);

        for (y = 0, length = obj.length; y < length; y++) {
            // DETECT COLLISION ALGORITHM
            if (objects[x].collidableWith === obj[y].type &&
                (objects[x].x < obj[y].x + obj[y].width &&
                objects[x].x + objects[x].width > obj[y].x &&
                objects[x].y < obj[y].y + obj[y].height &&
                objects[x].y + objects[x].height > obj[y].y)) {
                objects[x].isColliding = true;
                obj[y].isColliding = true;
                if((objects[x].type=="zongzi")&&(obj[y].type=="monkey")){
                    game.playerScore+=10;
                }else if((objects[x].type=="stone")&&(obj[y].type=="monkey")){
                    obj[y].collidedWith = true;
                    this.alive = false;
                    game.gameOver();
                }
            }else if((objects[x].type==="zongzi"||objects[x].type==="stone")&&
                ( obj[y].type==="zongzi") &&
                ( obj[y].x!=objects[x].x) &&
                (objects[x].x < obj[y].x + obj[y].width &&
                objects[x].x + objects[x].width > obj[y].x &&
                objects[x].y < obj[y].y + obj[y].height &&
                objects[x].y + objects[x].height > obj[y].y)){
                objects[x].isColliding = true;
                obj[y].isColliding = true;
            }
        }
    }
};




/*/!*关闭上下功能*!/
var ori = 0;
if (window.DeviceOrientationEvent) {
    window.addEventListener("devicemotion", orientationHandler, false);
} else {
    document.body.innerHTML = "What user agent u r using???";
}
function orientationHandler(event) {
    ori = event.accelerationIncludingGravity.x;
}*/
/*关闭上下功能*/
var ori = 0;
var browser = {
    versions: function () {
        var u = navigator.userAgent, app = navigator.appVersion;
        return { //移动终端浏览器版本信息
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器
            iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1, //是否iPad
        };
    }(),
}
if (browser.versions.iPhone || browser.versions.iPad || browser.versions.ios) {
    var sta = 1;
}else if (browser.versions.android) {
    var sta = -1;
}
if (window.DeviceOrientationEvent) {
    window.addEventListener("devicemotion", orientationHandler, false);
} else {
    document.body.innerHTML = "What user agent u r using???";
}
function orientationHandler(event) {
    ori = event.accelerationIncludingGravity.x*sta;
}
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 120);
        };
})();
