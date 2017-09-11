var gl;
var simpleProgram, textureProgram, texture2Program;
var fbi, fbi2;
var m4 = twgl.m4;

var mirrorType = 3;

function mm() {
    var m = m4.create();
    for(var i=0; i<arguments.length;i++) m = m4.multiply(m,arguments[i]);
    return m;
}

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


var squareShape, squareOutlineShape;
var fboxShape;
var equilateralTriangleShape;
var equilateralTriangleOutlineShape;
var rightTriangleShape;
var rightTriangleOutlineShape;

var mirror1CellShape;
var mirror2CellShape;
var mirror3CellShape;
var mirror4CellShape;


function createShapes(gl) {

    squareShape = new Shape(gl, gl.TRIANGLE_STRIP, {
            position: { 
                numComponents:2, 
                data: [
                    -1.0, -1.0, 
                     1.0, -1.0, 
                    -1.0,  1.0, 
                     1.0,  1.0, 
                ]
    }});
    squareOutlineShape = new Shape(gl, gl.LINE_STRIP, {
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
    
    var h = Math.sqrt(3);
    
    equilateralTriangleShape = new Shape(gl, gl.TRIANGLES, {
            position: { 
                numComponents:2, 
                data: [
                    -1.0, -1.0, 
                     1.0, -1.0, 
                     0.0, -1.0 + h, 
                ]
            }, 
            texcoord: [ 0.,0., 1.,0., 0.5,h*0.5]
    });
    equilateralTriangleOutlineShape = new Shape(gl, gl.LINE_STRIP, {
            position: { 
                numComponents:2, 
                data: [
                    -1.0, -1.0, 
                     1.0, -1.0, 
                     0.0, -1.0 + h,
                    -1.0, -1.0,                      
                ]
            }, 
    });

    rightTriangleShape = new Shape(gl, gl.TRIANGLES, {
            position: { 
                numComponents:2, 
                data: [
                    -1.0, -1.0, 
                     1.0, -1.0, 
                     1.0,  1.0, 
                ]
            }, 
            texcoord: [ 0.,0., 1.,0., 1.0,1.0]
    });
    rightTriangleOutlineShape = new Shape(gl, gl.LINE_STRIP, {
            position: { 
                numComponents:2, 
                data: [
                    -1.0, -1.0, 
                     1.0, -1.0, 
                     1.0,  1.0,
                    -1.0, -1.0,                      
                ]
            }, 
    });
    
    h = 2.0*Math.tan(Math.PI/6);
    rightTriangle2Shape = new Shape(gl, gl.TRIANGLES, {
            position: { 
                numComponents:2, 
                data: [
                    -1.0, -1.0, 
                     1.0, -1.0, 
                     1.0, -1.0+h, 
                ]
            }, 
            texcoord: [ 0.,0., 1.,0., 1.0,h*0.5]
    });
    rightTriangle2OutlineShape = new Shape(gl, gl.LINE_STRIP, {
            position: { 
                numComponents:2, 
                data: [
                    -1.0, -1.0, 
                     1.0, -1.0, 
                     1.0, -1.0+h, 
                    -1.0, -1.0,                      
                ]
            }, 
    });
    
    mirror1CellShape = new Shape(gl, gl.TRIANGLES, {
        position: { 
                numComponents:2, 
                data: [
                    -1.0, -1.0,   0.0, -1.0,   0.0,  0.0, 
                    -1.0, -1.0,   0.0,  0.0,  -1.0,  0.0, 

                     0.0, -1.0,   1.0, -1.0,   1.0,  0.0, 
                     0.0, -1.0,   1.0,  0.0,   0.0,  0.0, 

                    -1.0,  0.0,   0.0,  0.0,   0.0,  1.0, 
                    -1.0,  0.0,   0.0,  1.0,  -1.0,  1.0, 

                     0.0,  0.0,   1.0,  0.0,   1.0,  1.0, 
                     0.0,  0.0,   1.0,  1.0,   0.0,  1.0, 
                    ]
        }, 
        texcoord: [ 
                0.,0.,   1.,0.,   1.,1.,
                0.,0.,   1.,1.,   0.,1.,

                1.,0.,   0.,0.,   0.,1.,
                1.,0.,   0.,1.,   1.,1.,

                0.,1.,   1.,1.,   1.,0.,
                0.,1.,   1.,0.,   0.,0.,

                1.,1.,   0.,1.,   0.,0.,
                1.,1.,   0.,0.,   1.,0.,
                ]
    });
    
    mirror3CellShape = new Shape(gl, gl.TRIANGLES, {
        position: { 
                numComponents:2, 
                data: [
                    -1.0,  0.0,   0.0,  0.0,   0.0,  1.0,
                     0.0,  0.0,   1.0,  0.0,   0.0,  1.0,
                    -1.0,  0.0,   0.0, -1.0,   0.0,  0.0,
                     0.0,  0.0,   1.0,  0.0,   0.0, -1.0,
                    -1.0,  0.0,   0.0,  1.0,  -1.0,  1.0,
                     0.0,  1.0,   1.0,  0.0,   1.0,  1.0,
                    -1.0,  0.0,  -1.0, -1.0,   0.0, -1.0,
                     0.0, -1.0,   1.0, -1.0,   1.0,  0.0,
                    ]
            },
        texcoord: [ 
                0.,0.,   1.,0.,   1.,1.,
                1.,0.,   0.,0.,   1.,1.,
                0.,0.,   1.,1.,   1.,0.,
                1.,0.,   0.,0.,   1.,1.,
                0.,0.,   1.,1.,   1.,0.,
                1.,1.,   0.,0.,   1.,0.,
                0.,0.,   1.,0.,   1.,1.,
                1.,1.,   1.,0.,   0.,0.,
            ]
    });
    
    
    function makeCellShape(pts,tr, tx, matrix) {
        var position = [];
        var texcoord = [];
        for(var i=0;i<tr.length;i++) {
            var j = tr[i];
            var p = m4.transformPoint(matrix, [pts[j*2], pts[j*2+1], 0]);
            position.push( p[0], p[1] );
            j = i%3;
            texcoord.push( tx[j*2], tx[j*2+1] );            
        }
        return new Shape(gl, gl.TRIANGLES, {
            position: { numComponents:2, data: position },
            texcoord: texcoord});
    }
    
    var sqrt_3 = Math.sqrt(3);
    
    var m1 = m4.inverse([0.5,sqrt_3/2,0,0, -0.5,sqrt_3/2,0,0, 0,0,1,0, 0,0,0,1]);
    
    mirror4CellShape = makeCellShape(
        [0,sqrt_3, -0.5,sqrt_3/2, 0.5,sqrt_3/2, 
        0,sqrt_3/3, -1,0, 0,0, 1,0, 0,-sqrt_3/3,
        -0.5,-sqrt_3/2, 0.5,-sqrt_3/2, 0,-sqrt_3],
        [0,1,3, 0,2,3, 4,1,3, 4,5,3, 6,2,3, 6,5,3,
        4,5,7, 4,8,7, 6,5,7, 6,9,7, 
        10,8,7, 10,9,7],
        [0,0, 1,0, 1,1.0/sqrt_3], m1);
}



function SquarePiece() {
    this.matrix = m4.create();
}

SquarePiece.prototype.draw2 = function(gl, viewMatrix) {
    var matrix = m4.multiply(viewMatrix, this.matrix);
    gl.useProgram(simpleProgram.program);  
    twgl.setUniforms(simpleProgram, { color : [0.2,0.7,0.9,1] });   
    squareShape.draw(gl, simpleProgram, matrix);
    /*
    twgl.setUniforms(simpleProgram, { color : [1,1,1,1] });   
    squareOutlineShape.draw(gl, simpleProgram, matrix);    
*/
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

var mirror1Shape = {
    matrix : m4.create(),
    draw2 : function() {},
    draw : function(gl, viewMatrix) {
        var matrix = m4.multiply(viewMatrix, this.matrix);
        gl.useProgram(simpleProgram.program);  
        twgl.setUniforms(simpleProgram, { color : [0.9,0.1,0.9,1] });   
        squareOutlineShape.draw(gl, simpleProgram, matrix); 
    },
    contains : function(p) {
        return -1.02<p[0] && p[0]<1.02 && -1.02<p[1] && p[1]<1.02;
    }
};


var mirror2Shape = {
    matrix : m4.create(),
    draw2 : function() {},
    draw : function(gl, viewMatrix) {
        var matrix = m4.multiply(viewMatrix, this.matrix);
        gl.useProgram(simpleProgram.program);  
        twgl.setUniforms(simpleProgram, { color : [0.9,0.1,0.9,1] });   
        equilateralTriangleOutlineShape.draw(gl, simpleProgram, matrix); 
    },
    contains : function(p) {
        return -1.02<p[0] && p[0]<1.02 && -1.02<p[1] && p[1]<1.02;
    }
};

var mirror3Shape = {
    matrix : m4.create(),
    draw2 : function() {},
    draw : function(gl, viewMatrix) {
        var matrix = m4.multiply(viewMatrix, this.matrix);
        gl.useProgram(simpleProgram.program);  
        twgl.setUniforms(simpleProgram, { color : [0.9,0.1,0.9,1] });   
        rightTriangleOutlineShape.draw(gl, simpleProgram, matrix); 
    },
    contains : function(p) {
        return -1.02<p[0] && p[0]<1.02 && -1.02<p[1] && p[1]<1.02;
    }
};


var mirror4Shape = {
    matrix : m4.create(),
    draw2 : function() {},
    draw : function(gl, viewMatrix) {
        var matrix = m4.multiply(viewMatrix, this.matrix);
        gl.useProgram(simpleProgram.program);  
        twgl.setUniforms(simpleProgram, { color : [0.9,0.1,0.9,1] });   
        rightTriangle2OutlineShape.draw(gl, simpleProgram, matrix); 
    },
    contains : function(p) {
        return -1.02<p[0] && p[0]<1.02 && -1.02<p[1] && p[1]<1.02;
    }
};

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
    pieces.push(mirror1Shape);
    pieces.push(new SquarePiece());
    pieces.push(new SquarePiece());
    pieces.push(new SquarePiece());
    
    var sc = 30;
    pieces[0].matrix = m4.multiply(m4.translation([0,200,0]),m4.scaling([70,70,1]));
    pieces[1].matrix = m4.multiply(m4.translation([0.0,0.0,0.0]),m4.scaling([sc,sc,1]));
    pieces[2].matrix = m4.multiply(m4.translation([200.0,0.0,0.0]),m4.scaling([sc,sc,1]));
    pieces[3].matrix = m4.multiply(m4.translation([-200.0,0.0,0.0]),m4.scaling([sc,sc,1]));
    
    for(var i=1;i<4;i++)
        pieces[i].matrix = m4.multiply(pieces[i].matrix, m4.rotationZ(0.2*i));
    
    
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
 

function drawSceneToFb(boxMatrix) {
    twgl.bindFramebufferInfo(gl, fbi);
    gl.clearColor(1.0,1.0,0.0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    var fbiMatrix = m4.inverse(boxMatrix);
    for(var i=0;i<pieces.length;i++) pieces[i].draw2(gl, fbiMatrix);    
} 

function drawCellToFb2() {
    twgl.bindFramebufferInfo(gl, fbi2);
    gl.clearColor(0.0,1.0,0.0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.useProgram(textureProgram.program);
    twgl.setUniforms(textureProgram, { 
        texture : fbi.attachments[0]
    });        
    
    if(mirrorType == 1) {
        // square mirror
        
        mirror1CellShape.draw(gl, textureProgram, m4.identity());
        
        /*
        
        fboxShape.draw(gl, textureProgram, 
            m4.multiply(m4.translation([-0.5,-0.5,0]),m4.scaling([0.5,0.5,1])));   
        fboxShape.draw(gl, textureProgram, 
            m4.multiply(m4.translation([ 0.5,-0.5,0]),m4.scaling([-0.5,0.5,1])));
        fboxShape.draw(gl, textureProgram, 
            m4.multiply(m4.translation([-0.5, 0.5,0]),m4.scaling([0.5,-0.5,1])));
        fboxShape.draw(gl, textureProgram, 
            m4.multiply(m4.translation([ 0.5, 0.5,0]),m4.scaling([-0.5,-0.5,1])));
            */
    } else if(mirrorType == 2) {
        // equilateral triangle mirror  
        
        var h = Math.sqrt(3);
        
        var m3a = m4.translation([0,1-h,0]);
        var m3b = m4.multiply(m4.scaling([-1,1,1]), m3a);
        var m1 = m4.multiply(m4.translation([ 0.0, 0.0,0]),m4.scaling([0.25,0.25,1]));
        
        m1 = m4.inverse([1.5,-h/2,0,0, 1.5,h/2,0,0, 0,0,1,0, 0,0,0,1]);
        // m1 = m4.scaling([0.25,0.25,1.0]);
        

        var p = [
            [-3,0],[0,h],[3,0],[0,-h]
        ];
        var tt = function(d,r) {
            return m4.multiply(m1, 
                m4.multiply(
                    m4.translation([p[d][0],p[d][1],0]),
                    m4.multiply(m4.rotationZ(Math.PI*2*r/6),(r&1)==0?m3a:m3b)
                ));
        }
        
        
        equilateralTriangleShape.draw(gl, textureProgram, tt(0,2));
        equilateralTriangleShape.draw(gl, textureProgram, tt(1,5));
        equilateralTriangleShape.draw(gl, textureProgram, tt(1,0));
        equilateralTriangleShape.draw(gl, textureProgram, tt(1,1));
        equilateralTriangleShape.draw(gl, textureProgram, tt(2,4));
        equilateralTriangleShape.draw(gl, textureProgram, tt(2,5));
        equilateralTriangleShape.draw(gl, textureProgram, tt(3,2));
        equilateralTriangleShape.draw(gl, textureProgram, tt(3,3));
        equilateralTriangleShape.draw(gl, textureProgram, tt(3,4));
        equilateralTriangleShape.draw(gl, textureProgram, tt(0,1));            
    } else if(mirrorType == 3) {
        // right triangle mirror
        
        mirror3CellShape.draw(gl, textureProgram, m4.identity());
        
        /*
        var m1 = m4.scaling([0.25,0.25,1.0]);
        var m2 = m4.translation([-1,1,0]);
        
        rightTriangleShape.draw(gl, textureProgram, mm([m1,m2]));
        rightTriangleShape.draw(gl, textureProgram, 
            mm([m1,m4.scaling([-1,1,1]),m2]));
        rightTriangleShape.draw(gl, textureProgram, 
            mm([m1,m4.scaling([ 1,-1,1]),m2]));
        rightTriangleShape.draw(gl, textureProgram, 
            mm([m1,m4.scaling([-1,-1,1]),m2]));
          */  
   
    
    } else if(mirrorType == 4) {
        // right triangle mirror
        
        mirror4CellShape.draw(gl, textureProgram, m4.identity());
        
        /*
        var m1 = m4.scaling([0.25,0.25,1.0]);
        var m2 = m4.translation([-1,1,0]);
        
        rightTriangleShape.draw(gl, textureProgram, mm([m1,m2]));
        rightTriangleShape.draw(gl, textureProgram, 
            mm([m1,m4.scaling([-1,1,1]),m2]));
        rightTriangleShape.draw(gl, textureProgram, 
            mm([m1,m4.scaling([ 1,-1,1]),m2]));
        rightTriangleShape.draw(gl, textureProgram, 
            mm([m1,m4.scaling([-1,-1,1]),m2]));
          */  
    }


        
      
    // equilateralTriangleShape.draw(gl, textureProgram, m4.translation([0,1-h,0]));
    
   
    gl.useProgram(simpleProgram.program);
    // twgl.setUniforms(simpleProgram, { color: [0.1,0.8,0.1,1.0]});
    // squareOutlineShape.draw(gl, simpleProgram, m4.scaling([0.8,0.8,1.0]));

    /*
    twgl.setUniforms(simpleProgram, { color: [0.8,0.1,0.1,1.0]});
    squareShape.draw(gl, simpleProgram, 
        m4.multiply(
            m4.translation([-0.98,0.0,0.0]),
            m4.scaling([0.02,1.0,1.0])));
    twgl.setUniforms(simpleProgram, { color: [0.1,0.8,0.1,1.0]});
    squareShape.draw(gl, simpleProgram, 
        m4.multiply(
            m4.translation([0.0,-0.98,0.0]),
            m4.scaling([1.0,0.02,1.0])));
    */
    /*
    twgl.setUniforms(simpleProgram, { color: [0.1,0.8,0.1,1.0]});
    squareShape.draw(gl, simpleProgram, m4.multiply(m4.translation([0.0,0.8,0.0]),m4.scaling([0.2,0.2,1.0])));
    */
}
 
function drawMosaic(boxMatrix) {
    gl.useProgram(texture2Program.program);      
        
    var mymatrix = m4.multiply(viewMatrix, boxMatrix);

    if(mirrorType == 1) {
        mymatrix = m4.translate(mymatrix,[-1,-1,0]);
        mymatrix = m4.scale(mymatrix,[4,4,1]);        
    }    
    else if(mirrorType == 2) {
        var h = Math.sqrt(3);
        mymatrix = m4.translate(mymatrix,[-1,-1,0]);
        mymatrix = m4.scale(mymatrix,[2,2,1]);        
    }
    else if(mirrorType == 3) {
        mymatrix = m4.translate(mymatrix,[-1,1,0]);
        mymatrix = m4.scale(mymatrix,[4,4,1]);        
    }
    else if(mirrorType == 4) {
        //mymatrix = m4.translate(mymatrix,[-1,-1,0]);
        //mymatrix = m4.scale(mymatrix,[4,4,1]);        
        //mymatrix = m4.translate(mymatrix,[-1,-1,0]);
        //mymatrix = m4.scale(mymatrix,[2,2,1]);     
    }
    


    
    
    mymatrix = m4.inverse(mymatrix);
    twgl.setUniforms(texture2Program, { 
        uvmatrix : mymatrix,
        texture : fbi2.attachments[0]    
    });
    fboxShape.draw(gl, texture2Program, m4.identity());    

} 
 
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
            m4.rotationZ(0.2),
            m4.scaling([70,70,1])
            ));

    boxMatrix = pieces[0].matrix;           

    // draw to fbi -------------------
    drawSceneToFb(boxMatrix);

    
    // draw to fbi2 -------------------
    drawCellToFb2();       
  
    // draw framebuffer  
    twgl.bindFramebufferInfo(gl);

    // draw bg & mosaic
    var sqrt_3 = Math.sqrt(3);
    
    if(mirrorType == 1) {
        drawMosaic(boxMatrix);
        
    } else if(mirrorType == 2) {
        var h = Math.sqrt(3);
        drawMosaic(m4.multiply(
            boxMatrix,
        
            [1.5,-h/2,0,0, 1.5,h/2,0,0, 0,0,1,0, 0,-1,0,1]
            )); 
        
    } else if(mirrorType == 3) {
        drawMosaic(boxMatrix);
    } else if(mirrorType == 4) {
        drawMosaic(mm(
            boxMatrix,
            m4.translation([-1,-1,0]),
            m4.scaling([2,2,1]),
            m4.translation([1,0,0]),
            [0.5,sqrt_3/2,0,0, -0.5,sqrt_3/2,0,0, 0,0,1,0, 0,0,0,1],
            m4.translation([-1,-1,0]),
            m4.scaling([2,2,1]),
            
            ));        
    }
    

    // draw pieces
    
    for(var i=0;i<pieces.length;i++) pieces[i].draw(gl, viewMatrix);


    // square outline    
    
    /*
    gl.useProgram(simpleProgram.program);
    twgl.setUniforms(simpleProgram, { color: [0.8,0.1,0.8,1.0]});
    if(mirrorType == 1) {
        squareOutlineShape.draw(gl, simpleProgram, m4.multiply(viewMatrix, boxMatrix));        
    } else if(mirrorType == 2) {
        equilateralTriangleOutlineShape.draw(gl, simpleProgram, 
            m4.multiply(viewMatrix, boxMatrix));        
    } else if(mirrorType == 3) {
        rightTriangleOutlineShape.draw(gl, simpleProgram, 
            m4.multiply(viewMatrix, boxMatrix));        
    }
*/

    if(mirrorType == 4) {
        // show texture
        gl.useProgram(textureProgram.program);
        twgl.setUniforms(textureProgram, { 
            texture : fbi2.attachments[0]
        });        
        fboxShape.draw(gl, textureProgram, 
            m4.multiply(
                viewMatrix, 
                m4.multiply(
                    m4.translation([-300,-200,0]),
                    m4.scaling([100,100,1])
                )));
        
    }
                
    
    meter.tick();
    requestAnimationFrame(render);
}

var picked = -1;
var oldx, oldy, mousedown=false;
var cur = { x:0, y:0 };
var handler = null;


function translationHandler(piece, pos) {
    return { 
        piece:piece, 
        oldpos:pos,
        drag : function(pos) {
            var dx = pos[0]-this.oldpos[0];
            var dy = pos[1]-this.oldpos[1];
            this.oldpos = pos;
            this.piece.matrix = m4.multiply(m4.translation([dx,dy,0.0]), this.piece.matrix);
        }
    };
}


function rotoscalingHandler(piece, pos) {
    var c = m4.transformPoint(piece.matrix, [0,0,0]);
    var d1 = [pos[0]-c[0], pos[1]-c[1]];
    var r1 = Math.sqrt(d1[0]*d1[0]+d1[1]*d1[1]);
    var ir1 = 1.0/r1;
    var e0 = [d1[0]*ir1, d1[1]*ir1];
    var e1 = [-e0[1],e0[0]];
        
    return { 
        piece:piece, 
        oldpos:pos,
        center:c,
        e0:e0,
        e1:e1,
        r1:r1,
        startMatrix:m4.copy(piece.matrix),
        drag : function(pos) {
            console.log(pos, this.center);
            var d2 = [pos[0]-this.center[0], pos[1]-this.center[1]];
            var r2 = Math.sqrt(d2[0]*d2[0]+d2[1]*d2[1]);
            if(r2<5) return;
            var scale = r2/this.r1;
            var u = this.e0[0]*d2[0] + this.e0[1]*d2[1];
            var v = this.e1[0]*d2[0] + this.e1[1]*d2[1];
            var phi = Math.atan2(v,u);
            this.piece.matrix = m4.multiply(
                this.startMatrix,
                m4.multiply(
                    m4.rotationZ(phi),
                    m4.scaling([scale,scale,1.0])));
        }
    };
}


function pick(x,y) {
    x -= width/2;
    y = height/2 - y;
    for(var i=pieces.length-1;i>=0;i--) {
        
        var matrix = m4.inverse(pieces[i].matrix);
        var p = m4.transformPoint(matrix, [x,y,0.0]);
        if(pieces[i].contains(p)) {
            var q = m4.transformPoint(pieces[i].matrix, [1,1,0.0]);
            var dx = x-q[0];
            var dy = y-q[1];
            if(dx*dx+dy*dy<50) 
                return rotoscalingHandler(pieces[i], [x,y]);
            else
                return translationHandler(pieces[i], [x,y]);
        }
        /*
        if(pieces[i].contains(p)) {
                handle = 1;
                console.log("wow!");
            }
            else handle = 0;
            
            return i;
        }
        */
        
    }
    return null;    
}


window.onmousedown = function(e) {
    oldx=e.pageX-gl.canvas.offsetLeft; oldy=e.pageY-gl.canvas.offsetTop;
    mousedown=true;
    cur.x = oldx;
    cur.y = oldy;    
    handler = pick(oldx,oldy);
    
}
window.onmouseup = function(e) {
    mousedown=false;
    handler = null;
}
window.onmousemove = function(e) {
    if(mousedown) {
        var x = e.pageX - gl.canvas.offsetLeft;
        var y = e.pageY - gl.canvas.offsetTop;
        
        var dx = x - oldx; oldx = x;
        var dy = y - oldy; oldy = y;
        // console.log(dx,dy);
        if(handler) handler.drag([x-width/2,height/2-y]);
        /*
        if(picked>=0) {
            var piece = pieces[picked];
            piece.matrix = m4.multiply(m4.translation([dx,-dy,0.0]), piece.matrix);
        }
        off[0]+=dx;
        off[1]-=dy;
        */
        
    }
}

function setMirror(i) {
    mirrorType = i;
    var matrix = pieces[0].matrix; 
    pieces[0] = [mirror1Shape, mirror2Shape, mirror3Shape, mirror4Shape][mirrorType-1];
    pieces[0].matrix = matrix;
}

document.onkeypress = function(e) {
    console.log(e.keyCode);
    if(e.keyCode == 49) { setMirror(1); }
    else if(e.keyCode == 50) { setMirror(2); }
    else if(e.keyCode == 51) { setMirror(3); }
    else if(e.keyCode == 52) { setMirror(4); }
}


