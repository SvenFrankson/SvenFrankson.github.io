var context;
var Crayon;
var Ball;
var area;
var loop;
var sky = new Image();
sky.src = 'png/sky.png';
var score = 0;

var QUALITY = 1;
var BUILDING = 2;
var AREA_WIDTH = 780
var AREA_HEIGHT = 500
var INFO_HEIGHT = 50;
var SMOKE_DELAY = 20;

var NB_BUILDINGS = AREA_WIDTH/32;
var MAX_J = AREA_HEIGHT/32;

function Area() {

	this.kalashTemplate = new Image();
	this.kalashTemplate.src = 'png/kalashnikov.png';
	
	this.kalashWidth;
	this.kalashHeight;
	this.grid;
	
	var indice;
	var height;
	this.nb_buildings = NB_BUILDINGS;
	this.max_height = MAX_J;
	this.picture = new Array();
		for (i = 1; i < this.nb_buildings - 1; i++) {
			indice = (Math.floor(Math.random() * 4) + 1);
			this.picture[i] = new Image();
			this.picture[i].src = 'png/building_' + indice + '.png';
		}
	this.buildings = new Array();
	this.buildings[0] = new Array();
	for (j = 1; j < this.nb_buildings - 1; j++) {
		this.buildings[j] = new Array();
		height = Math.floor(Math.random() * 5);
		for (k = 0; k < height; k++) {
			this.buildings[j][this.max_height - k - 1] = BUILDING;
		}
	}
	this.buildings[this.nb_buildings - 1] = new Array();
	
	Area.prototype.Initialize = function(context) {
		this.kalashWidth = this.kalashTemplate.width;
		this.kalashHeight = this.kalashTemplate.height;
		context.drawImage(this.kalashTemplate, 0, 0);
		var imageData = context.getImageData(0, 0, this.kalashWidth, this.kalashHeight);
		var data = imageData.data;
		this.grid = new Array();
		for (i = 0; i < this.kalashWidth * this.kalashHeight; i++) {
			var r = data[4 * i];
			var g = data[4 * i + 1];
			var b = data[4 * i + 2];
			if ((r == 0) && ((g == 255) && (b == 0))) {
				this.grid[i] = "nope";
			}
			else {
				this.grid[i] = "rgba(" + r + "," + g + "," + b + ",1)";
			}
		}
	}
	
	Area.prototype.Display = function(context) {
		var color;
		for (l = 0; l < this.kalashWidth; l++) {
			for (m = 0; m < this.kalashHeight; m++) {
				color = this.grid[this.kalashWidth * m + l];
				if (color != "nope") {
					context.fillStyle = color;
					context.strokeStyle = "#ffffff";
					context.lineWidth = 1;
					context.fillRect(l*20, m*10, 20, 10);
					context.strokeRect(l*20, m*10, 20, 10);
				}
			}
		}
	}
}

function Crayon() {
	this.x = 0;
	this.speed = 2;
	
    this.picture = new Image();
	this.picture.src = 'png/crayon.png';
	
	Crayon.prototype.Move = function() {
		this.x += this.speed;
		if (this.x < 0) {
			this.x = 0;
			this.speed = - this.speed;
		}
		if (this.x > AREA_WIDTH - 102) {
			this.x = AREA_WIDTH - 102;
			this.speed = - this.speed;
		}
	}

	Crayon.prototype.pDisplay = function(context) {	
		context.drawImage(this.picture, this.x, AREA_HEIGHT - 24);
	}
}

function Ball() {
	this.x = 390;
	this.y = 400;
	this.dx = 1;
	this.dy = -1;
	
	Ball.prototype.Move = function() {
		var tileX = Math.floor(this.x / 20);
		var tileY = Math.floor(this.y / 10);
		this.x += this.dx;
		this.y += this.dy;
		this.checkCollide ();
		var newTileX = Math.floor(this.x / 20);
		var newTileY = Math.floor(this.y / 10);
		
		if (area.kalashWidth * newTileY + newTileX < area.grid.length) {
			var color = area.grid[area.kalashWidth * newTileY + newTileX];
			if (color != "nope") {
				area.grid[area.kalashWidth * newTileY + newTileX] = "nope";
				if ((newTileX - tileX) != 0) {
					this.dx = - this.dx;
				}
				if ((newTileY - tileY) != 0) {
					this.dy = - this.dy;
				}
			}
		}
	}
	
	Ball.prototype.checkCollide = function () {
		if (this.x < 0) {
			this.dx = - this.dx;
			this.x = 0;
		}
		if (this.x > AREA_WIDTH) {
			this.dx = - this.dx;
			this.x = AREA_WIDTH;
		}
		if (this.y < 0) {
			this.dy = - this.dy;
			this.y = 0;
		}
		if (this.y > AREA_HEIGHT - 24) {
			this.checkCrayonCollide ();
		}
	}
	
	Ball.prototype.checkCrayonCollide = function () {
		if (this.x > Crayon.x) {
			if (this.x < Crayon.x + 102) {
				var angle = (this.x - (Crayon.x + 61)) / 61;
				this.dx += angle;
				if (this.dx > 3) {
					this.dx = 3;
				}
				if (this.dx < -3) {
					this.dx = -3;
				}
			}
		}
		this.dy = - this.dy;
		this.y = AREA_HEIGHT - 24;
	}
	
	Ball.prototype.bDisplay = function(context) {
		context.fillStyle = "#ffffff";
		context.fillRect(this.x, this.y, 5, 5);
	}
}

function bDrop() {
	Crayon.speed = - Crayon.speed;
}

var count = 0;
var svenfrankson = new Image();
svenfrankson.src = 'png/svenfrankson.png';

function DisplayMaster() {
	count = count + 1;
	context.fillStyle = "#000000";
	context.strokeStyle = "#000000";
	context.fillRect(0, 0, AREA_WIDTH, AREA_HEIGHT);
	context.drawImage(svenfrankson, AREA_WIDTH - 109, AREA_HEIGHT - 18);
	area.Display(context);
	Crayon.pDisplay(context);
	Ball.bDisplay(context);
	context.strokeRect(0, 0, AREA_WIDTH, AREA_HEIGHT);
}

function clearContext() {
	context.clearRect(0, 0, AREA_WIDTH, AREA_HEIGHT);
}

function refresh() {
	clearContext();
	DisplayMaster();
	Crayon.Move();
	Ball.Move();
}

area = new Area();
Crayon = new Crayon();
Ball = new Ball();
	
window.onload = function() {
    var canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
	area.Initialize(context);
	loop = setInterval(refresh, 10*QUALITY);
	onkeydown = bDrop;
}

