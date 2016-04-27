var stream = require('stream');

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

module.exports = Spy;