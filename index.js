var stream = require('stream');

//Readable Stream: noise Generator
function Noise(inOptions){
    stream.Readable.call(this, inOptions);
    this.min = 0;
    this.max = 100;
    this.length = 10;
    this.index = 0;
    this.stride = 1;
};
Noise.prototype = Object.create(stream.Readable.prototype);
Noise.prototype._read = function(){
    
    var i, samples;
    
    samples = new Uint16Array(this.stride);
    for(i=0; i<this.stride; i++){
       samples[i] = Math.floor(this.min + Math.random()*(this.max - this.min)); 
    }
    
    this.push(new Buffer(samples));
    
    this.index++;
    if(this.index >= this.length)
        this.push(null);
};

//Transform Stream: noise smoother
function Smooth(inOptions){
    stream.Transform.call(this, inOptions);
    this.kernel = [0.25, 0.5, 0.25];
    this.temp = new Buffer([0]);
    this.name = "";
}
Smooth.prototype = Object.create(stream.Transform.prototype);
Smooth.prototype.compute = function(inChunk){
    var i;
    var overflow;
    
    /*
    Keep appending the incoming chunks to a temporary buffer,
    until there is enough for the kernel to process.
    */
    this.temp = Buffer.concat([this.temp, inChunk]);
    overflow = this.temp.length - this.kernel.length;
    
    /*
    Once the temp buffer is full or overflowing,
    keep sampling and shifting the temp buffer until that is not the case.
    */
    if(overflow >= 0){
        for(i=0; i<overflow+1; i++){
            this.sample();
            this.shift();
        }
    }
    
    
    /*
    ======================
    Buffer is too small, nothing happens:
    
    Kernel: [X][Y][Z]
    
    Buffer: [1][2]
    
    ======================
    Enough data has come in and now the buffer is overflowing beyond the kernel:
    
    Kernel: [X][Y][Z]
    
    Buffer: [1][2][3][4][5]
    
    ======================
    ----------
    Sample the buffer with the kernel weights:
    
    Kernel: [X][Y][Z]
             |  |  |
    Buffer: [1][2][3][4][5]
             \ _|__/
                |
    Output:    [A]
    
    ----------
    Shift and repeat until the buffer is not full/overflowing:
    
    Kernel: [X][Y][Z]
             |  |  |
    Buffer: [2][3][4][5] <<---
             \ _|__/
                |
    Output:    [B]
    
    ----------
    Kernel: [X][Y][Z]
             |  |  |
    Buffer: [3][4][5] <<------
             \ _|__/
                |
    Output:    [C]
    
    
    ----------
    Buffer is again too small, so no output until more data comes in:
    
    Kernel: [X][Y][Z]
    
    Buffer: [4][5] <<---------
    
    */
};

Smooth.prototype.sample = function(){
    var i;
    var sum;
    
    sum = 0;
    for(i=0; i<this.kernel.length; i++){
        sum += this.kernel[i] * this.temp[i];
    }

    var output = new Uint16Array(1);
    output[0] = sum;
    this.push(new Buffer(output));
};

Smooth.prototype.shift = function(){
    this.temp = this.temp.slice(1);  
};

Smooth.prototype._transform = function(inChunk, inEncoding, inDone){
    this.compute(inChunk);
    inDone();
};

Smooth.prototype._flush = function(inDone){
    var empty;

    empty = new Buffer([0]);
    this.compute(empty);//pad the input with empty values so the kernel can scan past the edge.
    this.temp = empty;// reset the temp buffer so this smoother can be used again.
    inDone();
};


function Spy(inOptions){
    stream.Transform.call(this, inOptions);
    this.record = new Buffer([]);
};
Spy.prototype = Object.create(stream.Transform.prototype);
Spy.prototype._transform = function(inChunk, inEncoding, inDone){
    this.record = Buffer.concat([this.record, inChunk]);
    this.push(inChunk);
    inDone();
};
Spy.prototype._flush = function(inDone){
    var i, j;
    var int;
    var str;
    console.log("\n||||||||||||||||||||||||||||||||||||||||||||||\n");
    for(i=0; i<this.record.length; i++){
        int = parseInt(this.record[i]);
        str = "";
        for(j=0; j<int; j++){
            str += "-";
        }
        str += "+";
        console.log(str);
    }
    inDone();
};

var n1 = new Noise();
n1.min = 0;
n1.max = 50;
n1.length = 20;

n1.pipe(new Spy()).pipe(new Smooth()).pipe(new Spy()).pipe(new Smooth()).pipe(new Spy()).pipe(new Smooth()).pipe(new Spy());