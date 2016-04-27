var stream = require('stream');
var plotter = require('./plotter');

function Display(inOptions){
    stream.Writable.call(this, inOptions);
}
Display.prototype = Object.create(stream.Writable.prototype);
Display.prototype._write = function(inChunk, inEncoding, inDone){
    plotter(inChunk);
    inDone();
};

module.exports = Display;