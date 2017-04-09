canvas = document.getElementById('screen');
ctx = canvas.getContext('2d');

function Point(x,y) {
    this.x = x;
    this.y = y;
}
Point.prototype.add = function(other) {
    return new Point(this.x+other.x, this.y+other.y);
}
Point.prototype.sub = function(other) {
    return new Point(this.x-other.x, this.y-other.y);
}
Point.prototype.length = function() {
    return Math.sqrt(this.x*this.x+this.y*this.y);
}
Point.prototype.length2 = function() {
    return this.x*this.x+this.y*this.y;
}
Point.prototype.distanceTo = function(other) {
    var dx = other.x-this.x, dy = other.y-this.y;
    return Math.sqrt(dx*dx+dy*dy);
}


function Matrix() {
    this.m = [1,0,0,1,0,0]; 
    // m[0], m[2], m[4]
    // m[1], m[3], m[5]
    //    0,    0,    1
}
Matrix.prototype.map = function(p) {
    return new Point(
        this.m[0]*p.x + this.m[2]*p.y + this.m[4],
        this.m[1]*p.x + this.m[3]*p.y + this.m[5]);        
}
Matrix.prototype.mult = function(other) {
    var res = new Matrix();
    res.m[0] = this.m[0]*other.m[0] + this.m[2]*other.m[1];
    res.m[2] = this.m[0]*other.m[2] + this.m[2]*other.m[3];
    res.m[4] = this.m[0]*other.m[4] + this.m[2]*other.m[5] + this.m[4];
    
    res.m[1] = this.m[1]*other.m[0] + this.m[3]*other.m[1];
    res.m[3] = this.m[1]*other.m[2] + this.m[3]*other.m[3];
    res.m[5] = this.m[1]*other.m[4] + this.m[3]*other.m[5] + this.m[5];    
    return res;
}
Matrix.prototype.translate = function(x, y) {
    this.m[4] += x;
    this.m[5] += y;
    return this;    
}
Matrix.prototype.rotate = function(theta) {
    var m = [1,0,0,1,0,0];
    var cs = Math.cos(theta), sn = Math.sin(theta);
    m[0] =  this.m[0]*cs + this.m[1]*sn;
    m[2] = -this.m[0]*sn + this.m[1]*cs;
    m[4] =  this.m[4];
    
    m[1] =  this.m[2]*cs + this.m[3]*sn;
    m[3] = -this.m[2]*sn + this.m[3]*cs;
    m[5] =  this.m[5];        
    this.m = m;    
    return this;    
}
Matrix.prototype.scale = function(sx,sy) {
    sy = sy || sx;
    this.m[0] *= sx;
    this.m[1] *= sy;
    this.m[2] *= sx;
    this.m[3] *= sy;
    return this;    
}
Matrix.prototype.inv = function() {
    var res = new Matrix();
    var k = 1/(this.m[0]*this.m[3] - this.m[1]*this.m[2]);
    res.m[0] = this.m[0]*k;
    res.m[1] = this.m[2]*k;
    res.m[2] = this.m[1]*k;
    res.m[3] = this.m[3]*k;
    res.m[4] = -(res.m[0] * this.m[4] + res.m[1] * this.m[5]);
    res.m[5] = -(res.m[2] * this.m[4] + res.m[3] * this.m[5]);
    return res;
}
Matrix.prototype.applyTransform = function(ctx) {
    ctx.transform(this.m[0],this.m[1],this.m[2],this.m[3],this.m[4],this.m[5]);
}



function Path() {
    this.points = arguments[0] || [];
}
Path.prototype.add = function(x,y) {
    this.points.push(new Point(x,y));
} 
Path.prototype.computeBBox = function() {
    if(this.points.length==0) return;
    var p = this.points[0];
    this.xmin = this.xmax = p.x;
    this.ymin = this.ymax = p.y;
    for(var i=1;i<this.points.length;i++) {
        p = this.points[i];
        if(p.x<this.xmin) this.xmin = p.x;
        else if(p.x>this.xmax) this.xmax = p.x;
        if(p.y<this.ymin) this.ymin = p.y;
        else if(p.y>this.ymax) this.ymax = p.y;        
    }
}
Path.prototype.isInside = function(x, y) {
    if(this.xmin) {
        if(x<this.xmin || x>this.xmax || y<this.ymin || y>this.ymax) return false;
    }
    var inside = false;
    var n = this.points.length;
    var j = n-1;
    for(var i=0; i<n; i++) {
        var p1 = this.points[i];
        var p2 = this.points[j];j=i;
        if((y>=p1.y && y<p2.y || y>=p2.y && y<p1.y) && (p1.x<=x || p2.x<=x)) {
            if(p1.x+(y-p1.y)*(p2.x-p1.x)/(p2.y-p1.y)<x) inside = !inside; 
        }  
    }
    return inside;
}

Path.prototype.doPath = function(ctx) {
    ctx.beginPath();
    var points = this.points;
    var n = points.length;
    ctx.moveTo(points[n-1].x, points[n-1].y);
    for(var i=0; i<n; i++) 
        ctx.lineTo(points[i].x, points[i].y);
}

Path.makeStar = function(r) {
    var star = new Path();
    var gr = 0.61803398875;
    for(var i=0;i<10;i++) {
        var phi = 2*Math.PI*i/10;
        var ri = r * ( 1 - gr*(i&1));
        star.add(Math.cos(phi)*ri, Math.sin(phi)*ri);
    }
    return star;
}

Path.makePolygon = function(r,n,theta) {
    theta = theta || 0.0;
    var path = new Path();
    for(var i=0;i<n;i++) {
        var phi = 2*Math.PI*i/n;
        path.add(Math.cos(phi)*r, Math.sin(phi)*r);
    }
    return path;
}

Path.makeSquare = function(r) {
    return new Path([
        new Point(-r,-r),
        new Point( r,-r),
        new Point( r, r),
        new Point(-r, r)        
    ]);
}

function Shape(opt) {
    opt = opt || {};
    this.path = opt.path || new Path();    
    this.matrix = new Matrix();
    this.strokeStyle = opt.strokeStyle || "#000000";
    this.lineWidth = opt.lineWidth || 3;
    this.fillStyle = opt.fillStyle || "#00FFFF";    
    this.matrix.translate(opt.x||0, opt.y||0);
    this.handles = opt.handles || 
        (this.path.points.length>0 ? [this.path.points[0]] : []);
    this.selectedHandleIndex = -1;
    this.q = new Point(0,0);
}

// 0 = pick inside, 1.. = handle, -1 = none
Shape.prototype.pick = function(x,y) {
    var matrix = this.matrix.inv();
    var xx = matrix.m[0] * x + matrix.m[1] * y + matrix.m[4];
    var yy = matrix.m[2] * x + matrix.m[3] * y + matrix.m[5];
    
  
    if(this.path.isInside(xx,yy)) { this.q.x = xx; this.q.y = yy; return true;}
    else return false;    
}


Shape.prototype.draw = function(ctx) {
    var m = this.matrix.m;
    ctx.save();
    ctx.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);
    ctx.beginPath();
    var points = this.path.points;
    var n = points.length;
    ctx.moveTo(points[n-1].x, points[n-1].y);
    for(var i=0; i<n; i++) 
        ctx.lineTo(points[i].x, points[i].y);
    ctx.fillStyle = this.fillStyle;
    ctx.fill();
    ctx.strokeStyle = this.strokeStyle;
    ctx.lineWidth = this.lineWidth;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.ellipse(this.q.x,this.q.y,5,5,0,0,2*Math.PI);
    ctx.fillStyle = "#ff0000";
    ctx.fill();
    this.drawHandles(ctx);
    ctx.restore();
}

Shape.prototype.drawHandles = function(ctx) {
    for(var i=0; i<this.handles.length; i++) {
        ctx.beginPath();
        var p = this.handles[i];
        ctx.ellipse(p.x,p.y,6,6,0,0,Math.PI*2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.stroke();        
    }
}


function Stage() {
    this.shapes = []; 
         
}

Stage.prototype.draw = function(ctx) {
    for(var i=0;i<this.shapes.length;i++) {
        this.shapes[i].draw(ctx);
    }
}

Stage.prototype.pick = function(x,y) {
    var i = this.shapes.length-1;
    while(i>=0) {
        
        
      
        
        if(this.shapes[i].pick(x,y)) {
            break;
        }
        i--;
    }
    if(i>=0)
        return this.shapes[i];
    else
        return null;
}


var stage = new Stage();
stage.shapes = [
    new Shape({path: Path.makeSquare(50), fillStyle:"#225588", x:30, y:450}),
    
    new Shape({path: Path.makeStar(100), fillStyle:"#885522", x:300, y:200}),
    //new Shape({path: Path.makeSquare(100), fillStyle:"#0000FF", x:500, y:150})
];

var cur = new Point();

 
var canvas1 = document.createElement('canvas');
canvas1.width = 1024;
canvas1.height = 1024;
var ctx1 = canvas1.getContext('2d');

var canvas2 = document.createElement('canvas');
canvas2.width = 1024;
canvas2.height = 1024;
var ctx2 = canvas2.getContext('2d');


function redraw() {
    ctx.clearRect(0,0,canvas.width, canvas.height);

    foobar();

    ctx.setTransform(1,0,0,1,0,0);

    for(var i=0;i<stage.shapes.length;i++) {
        var shape = stage.shapes[i];
        ctx.save();
        shape.matrix.applyTransform(ctx);
        shape.path.doPath(ctx);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }
    // stage.draw(ctx);  

   
    
    ctx.setTransform(1,0,0,1,0,0);
    
    
    ctx.beginPath();
    
    ctx.ellipse(cur.x,cur.y,3,3,0,0,2*Math.PI);
    ctx.fillStyle = "#00ff00";
    ctx.fill();    
    
}

var ly = 200;
var lx = ly * Math.tan(Math.PI/6);
var ld = Math.sqrt(lx*lx+ly*ly);

var tlx = 2*(ld+lx), tly = 2*ly;

var mm = [];
mm.push(new Matrix());
mm.push(new Matrix().rotate(-Math.PI/3));
mm.push(new Matrix().rotate(Math.PI/3).scale(-1,1));

var mat = new Matrix().translate(ld+lx,ly).scale(-1,-1);
for(var i=0;i<3;i++) {
    mm.push(mat.mult(mm[i]))
}
var mat1 = new Matrix().translate(ld+lx,ly);
var mat3 = new Matrix().translate(-ld-lx,-ly);

for(var i=1;i<4;i++) {
    var sx = 1-2*(i&1), sy = 1-2*((i>>1)&1);
    var mat = mat1.mult(new Matrix().scale(sx,sy)).mult(mat3);
    for(var j=0;j<6;j++) {
        mm.push(mat.mult(mm[j]));        
    }    
}



//
    
//}

var eps = 0.5;
var epsy = eps/Math.tan(Math.PI/12);
var epsx = eps/Math.tan(Math.PI/12);



function foobar()
{   
    ctx1.clearRect(0,0,canvas1.width,canvas1.height);
    
    for(var i=0; i<stage.shapes.length; i++) {
        ctx1.save();
        ctx1.translate(-400+10,-200+10);
        stage.shapes[i].matrix.applyTransform(ctx1);
        ctx1.beginPath();
        var points = stage.shapes[i].path.points;
        var n = points.length;
        ctx1.moveTo(points[n-1].x, points[n-1].y);
        for(var j=0; j<n; j++) 
            ctx1.lineTo(points[j].x, points[j].y);
        ctx1.fillStyle = stage.shapes[i].fillStyle; // "#0000ff";
        ctx1.fill();
        ctx1.restore();
    }
    
    //ctx.fillStyle = "#888888";
    //ctx.fillRect(400,200,2*(ld+lx),2*ly);    
    ctx.fillStyle = ctx.createPattern(canvas1, 'repeat');
    
    //ctx.fillStyle = "#228888";
    //ctx.fillRect(1,1,256,256);  

    
    ctx2.clearRect(0,0,canvas2.width,canvas2.height);
    ctx2.fillStyle = ctx2.createPattern(canvas1, 'repeat');
    
    ctx2.save();
    ctx2.scale(1024/tlx, 1024/tly);
    
    for(var i=0;i<mm.length;i++) {
       // if(i<6) ctx.fillStyle = "#ffff00";
       // else ctx.fillStyle = "#ff00ff";

        ctx2.save();
        mm[i].applyTransform(ctx2);
        ctx2.translate(-10,-10);
        ctx2.beginPath();
        ctx2.moveTo(10-eps,10-epsy);
        ctx2.lineTo(10-eps,10+ly+eps);
        ctx2.lineTo(10+lx+epsx,10+ly+eps);
        ctx2.lineTo(10-eps,10-epsy);    
        ctx2.fill();
        ctx2.restore();
        
    }
    ctx2.restore();
    
    ctx.fillStyle = ctx.createPattern(canvas2, 'repeat');
    ctx.save();
    ctx.translate(400,200);
    var sx = tlx/1024, sy = tly/1024;
    ctx.scale(sx,sy);
    
    ctx.fillRect(-400/sx,-200/sy,canvas.width/sx, canvas.height/sy);
    
    ctx.restore();
    
    ctx.save();
    ctx.setTransform(1,0,0,1,400,200);
    ctx.translate(-10,-10);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.beginPath();
    ctx.moveTo(10-eps,10-epsy);
    ctx.lineTo(10-eps,10+ly+eps);
    ctx.lineTo(10+lx+epsx,10+ly+eps);
    ctx.lineTo(10-eps,10-epsy);    
    
    ctx.stroke();
    
    ctx.restore();
    
}





redraw();

var oldx, oldy, mousedown=false;
var curShape = null;
window.onmousedown = function(e) {
    oldx=e.pageX-canvas.offsetLeft; oldy=e.pageY-canvas.offsetTop;
    mousedown=true;
    curShape = stage.pick(oldx,oldy);
    cur.x = oldx;
    cur.y = oldy;
    redraw();
}
window.onmouseup = function(e) {
    mousedown=false;
}
window.onmousemove = function(e) {
    if(mousedown) {
        var x = e.pageX - canvas.offsetLeft;
        var y = e.pageY - canvas.offsetTop;
        
        var dx = x - oldx; oldx = x;
        var dy = y - oldy; oldy = y;
        if(curShape) { curShape.matrix.translate(dx,dy); redraw(); }
    }
}

