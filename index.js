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
    
    this.push(new Buffer(sum));
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
    this.compute(empty);//pad the input
    this.temp = empty;// reset the temp buffer so this smoother can be used again
    inDone();
};


var n1 = new Noise();
n1.length = 2;
n1.stride = 5;

var s1 = new Smooth();
var s2 = new Smooth();


n1.pipe(s1);