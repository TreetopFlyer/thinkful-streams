var stream = require('stream');
var plotter = require('./plotter');

function Spy(inAlias, inOptions){
    this.alias = inAlias;
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
    
    console.log("\n\n_______________________| "+this.alias+" |_______________________\n");
    plotter(this.record);
    inDone();
    
};

module.exports = Spy;