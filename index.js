var Noise = require('./noise');

var n1 = new Noise.Generate();
n1.min = 0;
n1.max = 50;

n1.stride = 1;
n1.length = 20;

n1.pipe(new Noise.Spy()).pipe(new Noise.Smooth()).pipe(new Noise.Spy());