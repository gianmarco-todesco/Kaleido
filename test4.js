var gl;
var simpleProgram, textureProgram, texture2Program;
var bufferInfo, bufferInfo2;
var textures;
var fbi, fbi2;
var m4 = twgl.m4;
var viewMatrix;


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

function main() {
    gl = document.getElementById("c").getContext("webgl");
    
    simpleProgram = twgl.createProgramInfo(gl, ["vs", "fs"]);
    textureProgram = twgl.createProgramInfo(gl, ["tx_vs", "tx_fs"]);
    texture2Program = twgl.createProgramInfo(gl, ["tx2_vs", "tx2_fs"]);
    
    
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
    
    fbi = twgl.createFramebufferInfo(gl, [
            { format: gl.RGBA, type: gl.UNSIGNED_BYTE, min: gl.LINEAR, wrap: gl.REPEAT },
        ], 1024,1024);
    fbi2 = twgl.createFramebufferInfo(gl, [
            { format: gl.RGBA, type: gl.UNSIGNED_BYTE, min: gl.LINEAR, wrap: gl.REPEAT },
        ], 1024,1024);
    
    

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
 
function render(time) {
    meter.tickStart();
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    var starMatrix = m4.multiply(m4.translation(off),m4.scaling([70,70,1]));
    var boxMatrix = m4.multiply(
        m4.translation([0,200,0]),
        m4.multiply(
            m4.rotationZ(Math.PI*72/180),
            m4.scaling([70,70,1])
            ));
    
    
    // draw to fbi -------------------
    twgl.bindFramebufferInfo(gl, fbi);
    viewMatrix = m4.identity();
    gl.useProgram(simpleProgram.program);          
    twgl.setUniforms(simpleProgram, { color : [1,0,1,1] });    
    gl.clearColor(1.0,1.0,0.0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
        
    viewMatrix = m4.inverse(boxMatrix);
    
    twgl.setUniforms(simpleProgram, { color : [0,1,1,1] });
    star.draw(gl, simpleProgram, starMatrix);
    
    // draw to fbi2 -------------------

    viewMatrix = m4.identity();
    twgl.bindFramebufferInfo(gl, fbi2);
    gl.clearColor(0.0,1.0,0.0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.useProgram(textureProgram.program);
    twgl.setUniforms(textureProgram, { 
        texture : fbi.attachments[0]
    });
        
    fbox.draw(gl, textureProgram, 
        m4.multiply(m4.translation([-0.5,-0.5,0]),m4.scaling([0.5,0.5,1])));
    fbox.draw(gl, textureProgram, 
        m4.multiply(m4.translation([ 0.5,-0.5,0]),m4.scaling([-0.5,0.5,1])));
    fbox.draw(gl, textureProgram, 
        m4.multiply(m4.translation([-0.5, 0.5,0]),m4.scaling([0.5,-0.5,1])));
    fbox.draw(gl, textureProgram, 
        m4.multiply(m4.translation([ 0.5, 0.5,0]),m4.scaling([-0.5,-0.5,1])));
    
 
    
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
    
    /*
    gl.useProgram(programInfo.program);       
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, { matrix : m4.translation([0.5, 0.3, 0.0])});
    twgl.drawBufferInfo(gl, bufferInfo); 
    twgl.setUniforms(programInfo, { matrix : m4.translation([-0.5, 0.0, 0.0])});
    twgl.drawBufferInfo(gl, bufferInfo); 
    */

    

    // -------------------
    
    
    /*
    fbox.draw(gl, textureProgram, 
        m4.multiply(m4.translation([ 0.5,-0.5,0]),m4.scaling([-0.5,0.5,1])));
    */
    

    // -------------------
    
    
    // twgl.bindFramebufferInfo(gl);
        
        
    gl.useProgram(textureProgram.program);
    twgl.setUniforms(textureProgram, { 
        texture : fbi2.attachments[0]
    });
        
    fbox2.draw(gl, textureProgram, 
        m4.multiply(m4.translation([300,-200,0]),m4.scaling([140,140,1])));
    
    

    

    
    /*

    gl.useProgram(programInfo2.program);
    twgl.setBuffersAndAttributes(gl, programInfo2, bufferInfo2);
    
    twgl.setUniforms(programInfo2, { 
        texture : fbi.attachments[0], 
        matrix : m4.translation([0,0,0]) });
    
    twgl.drawBufferInfo(gl, bufferInfo2, gl.TRIANGLE_STRIP); 
    */
    
    /*
    
     

    
    twgl.bindFramebufferInfo(gl);
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    
    
    
    
    gl.useProgram(programInfo2.program);
    twgl.setBuffersAndAttributes(gl, programInfo2, bufferInfo2);
    
    twgl.setUniforms(programInfo2, { 
        texture : fbi.attachments[0], 
        matrix : m4.translation([0,0,0]) });
    
    twgl.drawBufferInfo(gl, bufferInfo2, gl.TRIANGLE_STRIP); 
    */
    meter.tick();
    requestAnimationFrame(render);
}




var oldx, oldy, mousedown=false;
var cur = { x:0, y:0 };
window.onmousedown = function(e) {
    oldx=e.pageX-gl.canvas.offsetLeft; oldy=e.pageY-gl.canvas.offsetTop;
    mousedown=true;
    cur.x = oldx;
    cur.y = oldy;    
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
        
        off[0]+=dx;
        off[1]-=dy;
        
    }
}

