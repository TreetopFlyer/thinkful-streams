var Noise = require('./noise');

var noise = new Noise.Generate();
noise.min = 0;
noise.max = 50;
noise.stride = 1;
noise.length = 20;

var smooth = new Noise.Smooth();

noise
.pipe(new Noise.Spy("Raw noise"))
.pipe(smooth)
.pipe(new Noise.Spy("1st smooth"))
.pipe(smooth)
.pipe(new Noise.Spy("2nd smooth"))

/*
noise
.pipe(s1)
.pipe(new Noise.Display());
*/