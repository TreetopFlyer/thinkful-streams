var Noise = require('./streams/noise.js');
var Smooth = require('./streams/smooth.js');
var Spy = require('./streams/spy.js');

var n1 = new Noise();
n1.min = 0;
n1.max = 50;
n1.length = 20;

n1.pipe(new Spy()).pipe(new Smooth()).pipe(new Spy()).pipe(new Smooth()).pipe(new Spy()).pipe(new Smooth()).pipe(new Spy());