var gl;
var simpleProgram, textureProgram, texture2Program;
var fbi, fbi2;
var m4 = twgl.m4;


function inside(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

function Shape(gl, type, data) {
    this.type = type;
    this.bi = twgl.createBufferInfoFromArrays(gl, data);    
}

Shape.prototype.draw = function(gl, proginfo, matrix) {
    twgl.setBuffersAndAttributes(gl, proginfo, this.bi);
    twgl.setUniforms(proginfo, { matrix : matrix }); 
    twgl.drawBufferInfo(gl, this.bi, this.type); 
}


function createSquareShape(gl) {
    return new Shape(gl, gl.TRIANGLE_STRIP, {
            position: { 
                numComponents:2, 
                data: [
                    -1.0, -1.0, 
                     1.0, -1.0, 
                    -1.0,  1.0, 
                     1.0,  1.0, 
                ]
    }});
}

function createSquareOutlineShape(gl) {
    return new Shape(gl, gl.LINE_STRIP, {
            position: { 
                numComponents:2, 
                data: [
                    -1.0, -1.0, 
                     1.0, -1.0, 
                     1.0,  1.0, 
                    -1.0,  1.0, 
                    -1.0, -1.0, 
                ]
    }});
}


var squareShape, squareOutlineShape;
var fboxShape;


function createShapes(gl) {
    squareShape = createSquareShape(gl);
    squareOutlineShape = createSquareOutlineShape(gl);    
    
    fboxShape = new Shape(gl, gl.TRIANGLE_STRIP, {
            position: { 
                numComponents:2, 
                data: [
                    -1.0, -1.0, 
                     1.0, -1.0, 
                    -1.0,  1.0, 
                     1.0,  1.0, 
                ]
            }, 
            texcoord: [ 0.,0., 1.,0., 0.,1., 1.,1.]
    });
}



function SquarePiece() {
    this.matrix = m4.create();
}

SquarePiece.prototype.draw2 = function(gl, viewMatrix) {
    var matrix = m4.multiply(viewMatrix, this.matrix);
    gl.useProgram(simpleProgram.program);  
    twgl.setUniforms(simpleProgram, { color : [0.2,0.7,0.9,1] });   
    squareShape.draw(gl, simpleProgram, matrix);
    twgl.setUniforms(simpleProgram, { color : [0.1,0.6,0.8,1] });   
    squareOutlineShape.draw(gl, simpleProgram, matrix);    
}

SquarePiece.prototype.draw = function(gl, viewMatrix) {
    var matrix = m4.multiply(viewMatrix, this.matrix);
    gl.useProgram(simpleProgram.program);  
    twgl.setUniforms(simpleProgram, { color : [0.2,0.2,0.5,1] });   
    squareOutlineShape.draw(gl, simpleProgram, matrix);    
}

SquarePiece.prototype.contains = function(pos) {
    return -1.02<pos[0] && pos[0]<1.02 && -1.02<pos[1] && pos[1]<1.02;
}





/*

function createStar(gl) {
    var buffer = [0.0, 0.0];
    var r0 = 1.0;
    var r1 = r0 * 0.38196530164;
    for(var i=0; i<=10; i++) {
        var phi = Math.PI*2*i/10;
        var r = (i%2)==0 ? r0 : r1;
        buffer.push(Math.sin(phi)*r, Math.cos(phi)*r);
    }
  
    var star = {};
    star.buffer = twgl.createBufferInfoFromArrays(gl, {
        position: { 
            numComponents:2, 
            data: buffer
        }
    });
    var bi = star.buffer;
    star.draw = function(gl, pinfo, modelMatrix) {
    
        twgl.setBuffersAndAttributes(gl, pinfo, bi);
        twgl.setUniforms(pinfo, { matrix : 
            m4.multiply(viewMatrix, modelMatrix)
        });     
        twgl.drawBufferInfo(gl, bi, gl.TRIANGLE_FAN); 
    }
    return star;
}

function createBox(gl) {
    var buffer = [
        -1.0, -1.0, 
         1.0, -1.0, 
         1.0,  1.0, 
        -1.0,  1.0, 
        -1.0, -1.0];
  
    var box = {};
    box.buffer = twgl.createBufferInfoFromArrays(gl, {
        position: { 
            numComponents:2, 
            data: buffer
        }
    });
    var bi = box.buffer;
    box.draw = function(gl, pinfo, modelMatrix) {
    
        twgl.setBuffersAndAttributes(gl, pinfo, bi);
        twgl.setUniforms(pinfo, { matrix : 
            m4.multiply(viewMatrix, modelMatrix)
        });     
        twgl.drawBufferInfo(gl, bi, gl.LINE_STRIP); 
    }
    return box;
}

function createFilledBox(gl, t) {
  
    var box = {};
    box.buffer = twgl.createBufferInfoFromArrays(gl, {
        position: { 
            numComponents:2, 
            data: [
                -1.0,-1.0, 
                 1.0,-1.0,
                -1.0, 1.0, 
                 1.0, 1.0,
            ]
        },
        texcoord: [
            0.,0., t,0., 0.,t, t,t
        ],
    });
    var bi = box.buffer;
    box.draw = function(gl, pinfo, modelMatrix) {
    
        twgl.setBuffersAndAttributes(gl, pinfo, bi);
        twgl.setUniforms(pinfo, { matrix : 
            m4.multiply(viewMatrix, modelMatrix)
        });     
        twgl.drawBufferInfo(gl, bi, gl.TRIANGLE_STRIP); 
    }
    return box;
}



var star, box, fbox, fbox2;
var meter;

*/


var pieces = [];



function main() {
    gl = document.getElementById("c").getContext("webgl");
    
    simpleProgram = twgl.createProgramInfo(gl, ["vs", "fs"]);
    textureProgram = twgl.createProgramInfo(gl, ["tx_vs", "tx_fs"]);
    texture2Program = twgl.createProgramInfo(gl, ["tx2_vs", "tx2_fs"]);
    
    createShapes(gl);
    pieces.push(new SquarePiece());
    pieces.push(new SquarePiece());
    pieces.push(new SquarePiece());
    
    
    pieces[0].matrix = m4.multiply(m4.translation(off),m4.scaling([70,70,1]));
    pieces[1].matrix = m4.multiply(m4.translation([200.0,0.0,0.0]),m4.scaling([70,70,1]));
    pieces[2].matrix = m4.multiply(m4.translation([-200.0,0.0,0.0]),m4.scaling([70,70,1]));
    
    for(var i=0;i<3;i++)
        pieces[i].matrix = m4.multiply(pieces[i].matrix, m4.rotationZ(0.2*i));
    

    /*
    star = createStar(gl);
    box = createBox(gl);
    fbox = createFilledBox(gl, 1.0);
    fbox2 = createFilledBox(gl, 5.0);
    
    bufferInfo = twgl.createBufferInfoFromArrays(gl, {
        position: { 
            numComponents:2, 
            data: [
                0,0, 0,0.5, 0.7,0
            ]
        }
    });
    
    bufferInfo2 = twgl.createBufferInfoFromArrays(gl, {
        position: { 
            numComponents:2, 
            data: [
                -0.9,-0.9, 
                 0.9,-0.9,
                -0.9, 0.9,
                 0.9, 0.9,
            ]
        },
        texcoord: [
            0.,0., 10.,0., 0.,10., 10.,10.
        ],
        
    });
    textures = twgl.createTextures(gl, {
        checker: {
            mag: gl.NEAREST,
            min: gl.LINEAR,
            src: [
                255,255,255,255,
                192,192,192,255,
                192,192,192,255,
                255,255,255,255
            ]
        },
        uff: { src: "cat.jpg" },
    });
    */
    
    fbi = twgl.createFramebufferInfo(gl, [
            { format: gl.RGBA, type: gl.UNSIGNED_BYTE, min: gl.LINEAR, wrap: gl.REPEAT },
        ], 1024,1024);
    fbi2 = twgl.createFramebufferInfo(gl, [
            { format: gl.RGBA, type: gl.UNSIGNED_BYTE, min: gl.LINEAR, wrap: gl.REPEAT },
        ], 1024,1024);
    
    twgl.bindFramebufferInfo(gl);
    

    meter = new FPSMeter(null, {
        interval:100,
        smoothing:10,
        show: 'fps',
        decimals: 1,
        maxFps: 60,
        threshold: 100,
        
        position: 'absolute',
        zIndex: 10,
        left: '20px',
        top: '70px',
        theme: 'dark',
        heat: 1,
        graph: 1,
        history: 20
    });
      
    
    requestAnimationFrame(render);
}

off = [0,0,0];
 
var viewMatrix;
var width, height; 
 
function render(time) {
    meter.tickStart();
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    width = gl.canvas.width;
    height = gl.canvas.height;
    
    viewMatrix = m4.ortho(
        -gl.canvas.width/2,
         gl.canvas.width/2, 
        -gl.canvas.height/2,
         gl.canvas.height/2,
        -1, 1);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(1.0,1.0,1.0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);



    
    var starMatrix = m4.multiply(m4.translation(off),m4.scaling([70,70,1]));

    var boxMatrix = m4.multiply(
        m4.translation([0,200,0]),
        m4.multiply(
            m4.rotationZ(Math.PI*72/180),
            m4.scaling([70,70,1])
            ));
            

    // draw to fbi -------------------
    twgl.bindFramebufferInfo(gl, fbi);
    gl.clearColor(1.0,1.0,0.0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    var fbiMatrix = m4.inverse(boxMatrix);
    for(var i=0;i<3;i++) pieces[i].draw2(gl, fbiMatrix);

    
    // draw to fbi2 -------------------
    twgl.bindFramebufferInfo(gl, fbi2);
    gl.clearColor(0.0,1.0,0.0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.useProgram(textureProgram.program);
    twgl.setUniforms(textureProgram, { 
        texture : fbi.attachments[0]
    });        
    fboxShape.draw(gl, textureProgram, 
        m4.multiply(m4.translation([-0.5,-0.5,0]),m4.scaling([0.5,0.5,1])));
   
    fboxShape.draw(gl, textureProgram, 
        m4.multiply(m4.translation([ 0.5,-0.5,0]),m4.scaling([-0.5,0.5,1])));
    fboxShape.draw(gl, textureProgram, 
        m4.multiply(m4.translation([-0.5, 0.5,0]),m4.scaling([0.5,-0.5,1])));
    fboxShape.draw(gl, textureProgram, 
        m4.multiply(m4.translation([ 0.5, 0.5,0]),m4.scaling([-0.5,-0.5,1])));
       
  
    // draw framebuffer  
    twgl.bindFramebufferInfo(gl);

    // draw bg & mosaic
    gl.useProgram(texture2Program.program);      
        
    var mymatrix = m4.multiply(viewMatrix, boxMatrix);
    
    mymatrix = m4.translate(mymatrix,[-1,-1,0]);
    mymatrix = m4.scale(mymatrix,[4,4,1]);
    mymatrix = m4.inverse(mymatrix);
    twgl.setUniforms(texture2Program, { 
        uvmatrix : mymatrix,
        texture : fbi2.attachments[0]    
    });
    fboxShape.draw(gl, texture2Program, m4.identity());

    // draw pieces
    
    for(var i=0;i<3;i++) pieces[i].draw(gl, viewMatrix);

            
/*            
    
 
    
    // draw to framwbuffer
    
   
    
    twgl.bindFramebufferInfo(gl);    
    viewMatrix = m4.ortho(
        -gl.canvas.width/2,
         gl.canvas.width/2, 
        -gl.canvas.height/2,
         gl.canvas.height/2,
        -1, 1);
    
    
    gl.clearColor(0,0.5,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    

    // draw bg & mosaic
    gl.useProgram(texture2Program.program);      
        
    var mymatrix = m4.multiply(viewMatrix, boxMatrix);
    
    mymatrix = m4.translate(mymatrix,[-1,-1,0]);
    mymatrix = m4.scale(mymatrix,[4,4,1]);
    mymatrix = m4.inverse(mymatrix);
    twgl.setUniforms(texture2Program, { 
        uvmatrix : mymatrix,
        texture : fbi2.attachments[0]    
    });
    
    var oldViewMatrix = viewMatrix
    viewMatrix = m4.identity();
    
    fbox.draw(gl, texture2Program, m4.identity());
    viewMatrix = oldViewMatrix;

    // draw other pieces
    
    gl.useProgram(simpleProgram.program);          
    twgl.setUniforms(simpleProgram, { color : [1,0,1,1] });
    
    star.draw(gl, simpleProgram, m4.scaling([100,100,1]));
    
    twgl.setUniforms(simpleProgram, { color : [0,1,1,1] });
    star.draw(gl, simpleProgram, starMatrix);
    
    twgl.setUniforms(simpleProgram, { color : [0,0,0,1] });
    box.draw(gl, simpleProgram, boxMatrix);
  */
  
       /* 
    gl.useProgram(textureProgram.program);
    twgl.setUniforms(textureProgram, { 
        texture : fbi2.attachments[0]
    });
        
    fboxShape.draw(gl, textureProgram, m4.multiply(viewMatrix, boxMatrix));
*/
    gl.useProgram(simpleProgram.program);
    twgl.setUniforms(simpleProgram, { color: [0.8,0.1,0.8,1.0]});
    squareOutlineShape.draw(gl, simpleProgram, m4.multiply(viewMatrix, boxMatrix));

    meter.tick();
    requestAnimationFrame(render);
}

function pick(x,y) {
    x -= width/2;
    y = height/2 - y;
    for(var i=pieces.length-1;i>=0;i--) {
        
        var matrix = m4.inverse(pieces[i].matrix);
        var p = m4.transformPoint(matrix, [x,y,0.0]);
        console.log(i, p[0], p[1]);
        if(pieces[i].contains(p)) return i;
    }
    return -1;    
}

var picked = -1;
var oldx, oldy, mousedown=false;
var cur = { x:0, y:0 };
window.onmousedown = function(e) {
    oldx=e.pageX-gl.canvas.offsetLeft; oldy=e.pageY-gl.canvas.offsetTop;
    mousedown=true;
    cur.x = oldx;
    cur.y = oldy;    
    picked = pick(oldx,oldy);
}
window.onmouseup = function(e) {
    mousedown=false;
}
window.onmousemove = function(e) {
    if(mousedown) {
        var x = e.pageX - gl.canvas.offsetLeft;
        var y = e.pageY - gl.canvas.offsetTop;
        
        var dx = x - oldx; oldx = x;
        var dy = y - oldy; oldy = y;
        // console.log(dx,dy);
        
        if(picked>=0) {
            var piece = pieces[picked];
            piece.matrix = m4.multiply(m4.translation([dx,-dy,0.0]), piece.matrix);
        }
        off[0]+=dx;
        off[1]-=dy;
        
    }
}

