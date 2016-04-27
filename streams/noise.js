var stream = require('stream');

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

module.exports = Noise;