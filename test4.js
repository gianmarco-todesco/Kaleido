var gl;
var simpleProgram, textureProgram, texture2Program;
var fbi, fbi2;
var m4 = twgl.m4;
var sqrt_3 = Math.sqrt(3);
console.log("qui",sqrt_3 );
var mirrorType = 4;
var showMosaic = true;

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

function createShapes(gl) {
    gl.shapes = {};
    var square = gl.shapes.square = {};
    
    
    square.body = new Shape(gl, gl.TRIANGLE_STRIP, {
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
    square.outline = new Shape(gl, gl.LINE_STRIP, {
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
    
    
    var eqTriangle = gl.shapes.eqTriangle = {};
    
    console.log("qua",sqrt_3);
    
    eqTriangle.body = new Shape(gl, gl.TRIANGLES, {
            position: { 
                numComponents:2, 
                data: [
                    -1.0, -1.0, 
                     1.0, -1.0, 
                     0.0, -1.0 + sqrt_3, 
                ]
            }, 
            texcoord: [ 0.,0., 1.,0., 0.5,sqrt_3*0.5]
    });
    eqTriangle.outline = new Shape(gl, gl.LINE_STRIP, {
            position: { 
                numComponents:2, 
                data: [
                    -1.0, -1.0, 
                     1.0, -1.0, 
                     0.0, -1.0 + sqrt_3,
                    -1.0, -1.0,                      
                ]
            }, 
    });

    var rtIsoTriangle = gl.shapes.rtIsoTriangle = {};
    rtIsoTriangle.body = new Shape(gl, gl.TRIANGLES, {
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
    rtIsoTriangle.outline = new Shape(gl, gl.LINE_STRIP, {
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
    
    var rt30Triangle = gl.shapes.rt30Triangle = {};
    var h = 2.0*Math.tan(Math.PI/6);
    
    rt30Triangle.body = new Shape(gl, gl.TRIANGLES, {
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
    rt30Triangle.outline = new Shape(gl, gl.LINE_STRIP, {
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
    
    gl.shapes.circle = {};
    gl.shapes.circle.body = new Shape(gl, gl.TRIANGLE_FAN, (function() {
        var position = [0,0];
        var texcoord = [0.5,0.5];
        var n = 100;
        for(var i=0;i<n;i++) {
            var phi = Math.PI*2*i/(n-1);
            var cs = Math.cos(phi), sn = Math.sin(phi);
            position.push(cs,sn);
            texcoord.push(cs*0.5+0.5,sn*0.5+0.5);
        }
        return { position: {numComponents:2, data:position}, texcoord: texcoord };        
    })());
    
    
    
    
    gl.shapes.mirror1Cell = new Shape(gl, gl.TRIANGLES, {
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
    
    gl.shapes.mirror3Cell = new Shape(gl, gl.TRIANGLES, {
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
        
    var m1;
    // m1 = m4.inverse([[1.5,-sqrt_3/2,0,0, 1.5,sqrt_3/2,0,0, 0,0,1,0, 0,0,0,1]]);
    
    m1 = [[1.5,sqrt_3/2,0,0, -1.5,sqrt_3/2,0,0, 0,0,1,0, 0,0,0,1]];
    console.log(m1);
    
    
    m1 = m4.inverse([1.5,sqrt_3/2,0,0, -1.5,sqrt_3/2,0,0, 0,0,1,0, 0,0,0,1]);
    
    gl.shapes.mirror2Cell = makeCellShape(
        [
            -2,sqrt_3,  0,sqrt_3,  2,sqrt_3,
            -3,0,  -1,0,  1,0,  3,0,
            -2,-sqrt_3,  0,-sqrt_3,  2,-sqrt_3,
            
        ],
        [
            4,5,1,   4,5,8,   4,0,1,   2,5,1,   4,0,3,   5,2,6,
            4,7,3,   4,7,8,   9,5,6,   9,5,8
        ],
        [0,0, 1,0, 0.5,sqrt_3/2], m1);
    

    m1 = m4.inverse([0.5,sqrt_3/2,0,0, -0.5,sqrt_3/2,0,0, 0,0,1,0, 0,0,0,1]);
    
    gl.shapes.mirror4Cell = makeCellShape(
        [
            0,sqrt_3, -0.5,sqrt_3/2, 0.5,sqrt_3/2, 
            0,sqrt_3/3, -1,0, 0,0, 1,0, 0,-sqrt_3/3,
            -0.5,-sqrt_3/2, 0.5,-sqrt_3/2, 0,-sqrt_3
        ],
        [
            0,1,3, 0,2,3, 4,1,3, 4,5,3, 6,2,3, 6,5,3,
            4,5,7, 4,8,7, 6,5,7, 6,9,7, 
            10,8,7, 10,9,7
        ],
        [0,0, 1,0, 1,1.0/sqrt_3], m1);
}



function SquarePiece() {
    this.matrix = m4.create();
}

SquarePiece.prototype.draw2 = function(gl, viewMatrix) {
    var matrix = m4.multiply(viewMatrix, this.matrix);
    gl.useProgram(simpleProgram.program);  
    twgl.setUniforms(simpleProgram, { color : [0.2,0.7,0.9,1] });   
    gl.shapes.square.body.draw(gl, simpleProgram, matrix);
}

SquarePiece.prototype.draw = function(gl, viewMatrix) {
    var matrix = m4.multiply(viewMatrix, this.matrix);
    gl.useProgram(simpleProgram.program);  
    twgl.setUniforms(simpleProgram, { color : [0.2,0.2,0.5,1] });   
    gl.shapes.square.outline.draw(gl, simpleProgram, matrix);   

    twgl.setUniforms(simpleProgram, { color : [0.2,0.2,0.5,1] });   
    gl.shapes.circle.body.draw(gl, simpleProgram, mm(matrix, m4.translation([-1,-1,0]), m4.scaling([0.15,0.15,1])));    
}

SquarePiece.prototype.contains = function(pos) {
    return -1.02<pos[0] && pos[0]<1.02 && -1.02<pos[1] && pos[1]<1.02;
}


var mirror1 = {
    matrix : m4.create(),
    draw2 : function() {},
    draw : function(gl, viewMatrix) {
        var matrix = m4.multiply(viewMatrix, this.matrix);
        gl.useProgram(simpleProgram.program);  
        twgl.setUniforms(simpleProgram, { color : [0.9,0.1,0.9,1] });   
        gl.shapes.square.outline.draw(gl, simpleProgram, matrix); 
        twgl.setUniforms(simpleProgram, { color : [0.9,0.1,0.9,1] });   
        gl.shapes.circle.body.draw(gl, simpleProgram, mm(matrix, m4.translation([-1,-1,0]), m4.scaling([0.15,0.15,1])));    
        
    },
    contains : function(p) {
        return -1.02<p[0] && p[0]<1.02 && -1.02<p[1] && p[1]<1.02;2
    }
};


var mirror2 = {
    matrix : m4.create(),
    draw2 : function() {},
    draw : function(gl, viewMatrix) {
        var matrix = m4.multiply(viewMatrix, this.matrix);
        gl.useProgram(simpleProgram.program);  
        twgl.setUniforms(simpleProgram, { color : [0.9,0.1,0.9,1] });   
        gl.shapes.eqTriangle.outline.draw(gl, simpleProgram, matrix); 
    },
    contains : function(p) {
        return -1.02<p[0] && p[0]<1.02 && -1.02<p[1] && p[1]<1.02;
    }
};

var mirror3 = {
    matrix : m4.create(),
    draw2 : function() {},
    draw : function(gl, viewMatrix) {
        var matrix = m4.multiply(viewMatrix, this.matrix);
        gl.useProgram(simpleProgram.program);  
        twgl.setUniforms(simpleProgram, { color : [0.9,0.1,0.9,1] });   
        gl.shapes.rtIsoTriangle.outline.draw(gl, simpleProgram, matrix); 
    },
    contains : function(p) {
        return -1.02<p[0] && p[0]<1.02 && -1.02<p[1] && p[1]<1.02;
    }
};


var mirror4 = {
    matrix : m4.create(),
    draw2 : function() {},
    draw : function(gl, viewMatrix) {
        var matrix = m4.multiply(viewMatrix, this.matrix);
        gl.useProgram(simpleProgram.program);  
        twgl.setUniforms(simpleProgram, { color : [0.9,0.1,0.9,1] });   
        gl.shapes.rt30Triangle.outline.draw(gl, simpleProgram, matrix); 
    },
    contains : function(p) {
        return -1.02<p[0] && p[0]<1.02 && -1.02<p[1] && p[1]<1.02;
    }
};

var mirrors = [
    mirror1,
    mirror2,
    mirror3,
    mirror4    
];
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


*/


var pieces = [];


function main() {
    gl = document.getElementById("c").getContext("webgl");
    
    simpleProgram = twgl.createProgramInfo(gl, ["vs", "fs"]);
    textureProgram = twgl.createProgramInfo(gl, ["tx_vs", "tx_fs"]);
    texture2Program = twgl.createProgramInfo(gl, ["tx2_vs", "tx2_fs"]);
    
    createShapes(gl);
    pieces.push(mirrors[mirrorType-1]);
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
    

    addEventHandlers();
    
    
    
}

off = [0,0,0];
 
var viewMatrix;
var width, height; 
 

function drawSceneToFb(boxMatrix) {
    twgl.bindFramebufferInfo(gl, fbi);
    if(mousedown) gl.clearColor(1.0,1.0,0.0,1);
    else gl.clearColor(1.0,0.5,0.5,1);
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
        gl.shapes.mirror1Cell.draw(gl, textureProgram, m4.identity());        
    } else if(mirrorType == 2) {
        // equilateral triangle mirror  
        
        gl.shapes.mirror2Cell.draw(gl, textureProgram, m4.identity());        
        
        /*
        var m3a = m4.translation([0,1-sqrt_3,0]);
        var m3b = m4.multiply(m4.scaling([-1,1,1]), m3a);
        var m1 = m4.multiply(m4.translation([ 0.0, 0.0,0]),m4.scaling([0.25,0.25,1]));
        
        m1 = m4.inverse([1.5,-sqrt_3/2,0,0, 1.5,sqrt_3/2,0,0, 0,0,1,0, 0,0,0,1]);
        // m1 = m4.scaling([0.25,0.25,1.0]);
        
        
        var p = [
            [-3,0],[0,sqrt_3],[3,0],[0,-sqrt_3]
        ];
        var tt = function(d,r) {
            return m4.multiply(m1, 
                m4.multiply(
                    m4.translation([p[d][0],p[d][1],0]),
                    m4.multiply(m4.rotationZ(Math.PI*2*r/6),(r&1)==0?m3a:m3b)
                ));
        }
        
        
        gl.shapes.eqTriangle.body.draw(gl, textureProgram, tt(0,2));
        gl.shapes.eqTriangle.body.draw(gl, textureProgram, tt(1,5));
        gl.shapes.eqTriangle.body.draw(gl, textureProgram, tt(1,0));
        gl.shapes.eqTriangle.body.draw(gl, textureProgram, tt(1,1));
        gl.shapes.eqTriangle.body.draw(gl, textureProgram, tt(2,4));
        gl.shapes.eqTriangle.body.draw(gl, textureProgram, tt(2,5));
        gl.shapes.eqTriangle.body.draw(gl, textureProgram, tt(3,2));
        gl.shapes.eqTriangle.body.draw(gl, textureProgram, tt(3,3));
        gl.shapes.eqTriangle.body.draw(gl, textureProgram, tt(3,4));
        gl.shapes.eqTriangle.body.draw(gl, textureProgram, tt(0,1));    
        */
        
    } else if(mirrorType == 3) {
        gl.shapes.mirror3Cell.draw(gl, textureProgram, m4.identity());
    
    } else if(mirrorType == 4) {
        gl.shapes.mirror4Cell.draw(gl, textureProgram, m4.identity());
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
    }
    


    
    
    mymatrix = m4.inverse(mymatrix);
    twgl.setUniforms(texture2Program, { 
        uvmatrix : mymatrix,
        texture : fbi2.attachments[0]    
    });
    gl.shapes.square.body.draw(gl, texture2Program, m4.identity());    

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
    

    if(showMosaic) {
        if(mirrorType == 1) {
            drawMosaic(mm(boxMatrix, m4.translation([-1,-1,0]), m4.scaling([4,4,1])));
            
        } else if(mirrorType == 2) {
            drawMosaic(m4.multiply(
                boxMatrix,
            
                [1.5,sqrt_3/2,0,0, -1.5,sqrt_3/2,0,0, 0,0,1,0, 0,-1,0,1]
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
    }        

    // draw pieces
    
    for(var i=0;i<pieces.length;i++) pieces[i].draw(gl, viewMatrix);


    // square outline    
    
    gl.useProgram(simpleProgram.program);
    twgl.setUniforms(simpleProgram, { color: [0.8,0.1,0.8,1.0]});
    // gl.shapes.circle.body.draw(gl, simpleProgram, mm(viewMatrix, m4.scaling([30,30,0])));
    
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


    if(!showMosaic) {
        // show texture
        gl.useProgram(textureProgram.program);
        twgl.setUniforms(textureProgram, { 
            texture : fbi2.attachments[0]
        });        
        gl.shapes.square.body.draw(gl, textureProgram, 
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
            var q = m4.transformPoint(pieces[i].matrix, [-1,-1,0.0]);
            var dx = x-q[0];
            var dy = y-q[1];
            if(dx*dx+dy*dy<80) 
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

function setMirror(i) {
    mirrorType = i;
    var matrix = pieces[0].matrix; 
    pieces[0] = mirrors[mirrorType-1];
    pieces[0].matrix = matrix;
}

document.onkeypress = function(e) {
    console.log(e.keyCode);
    if(e.keyCode == 49) { setMirror(1); }
    else if(e.keyCode == 50) { setMirror(2); }
    else if(e.keyCode == 51) { setMirror(3); }
    else if(e.keyCode == 52) { setMirror(4); }
    
    else if(e.keyCode == 97) { showMosaic = !showMosaic; }
    
}

function addEventHandlers() {
    var canvas = document.getElementById("c");

    /*
    canvas.addEventListener('touchstart', function(e){
        e.preventDefault();
        mousedown=true;        
    });
    canvas.addEventListener('touchend', function(e){
        e.preventDefault();
        mousedown=false;        
    });
    canvas.addEventListener('touchcancel', function(e){
        e.preventDefault();
        mousedown=false;        
    });
    canvas.addEventListener('touchmove', function(e){
        e.preventDefault();
    });
    canvas.addEventListener('touchleave', function(e){
        e.preventDefault();
        mousedown=false;        
    });
    */
    
    
    canvas.addEventListener('pointerdown', function(e){
        e.preventDefault();
        oldx=e.pageX-gl.canvas.offsetLeft; oldy=e.pageY-gl.canvas.offsetTop;
        mousedown=true;
        cur.x = oldx;
        cur.y = oldy;    
        handler = pick(oldx,oldy);    
    }, false);

    canvas.addEventListener ('pointerup', function(e){ 
        e.preventDefault();
        mousedown=false;
        handler = null;
    }, false);
    canvas.addEventListener ('pointerout', function(e){ 
        e.preventDefault();
        mousedown=false;
    });
    canvas.addEventListener ('pointerleave', function(e){ 
        e.preventDefault();
        mousedown=false;
    });

    canvas.addEventListener ('pointermove', function(e){ 
        e.preventDefault();
        if(mousedown) {
            var x = e.pageX - gl.canvas.offsetLeft;
            var y = e.pageY - gl.canvas.offsetTop;
            
            var dx = x - oldx; oldx = x;
            var dy = y - oldy; oldy = y;
            // console.log(dx,dy);
            if(handler) handler.drag([x-width/2,height/2-y]);
            
            
        }
    }, false);


}

