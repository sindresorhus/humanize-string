'use strict';
var test = require('ava');
var hs = require('./');

test(function (t) {
	t.assert(hs('') === '');
	t.assert(hs('unicorns and rainbows') === 'Unicorns and rainbows');
	t.assert(hs('unicorns-and-rainbows') === 'Unicorns and rainbows');
	t.assert(hs('UnicornsAndRainbows') === 'Unicorns and rainbows');
	t.assert(hs('unicornsAndRainbows') === 'Unicorns and rainbows');
	t.assert(hs('unicorns_and_rainbows') === 'Unicorns and rainbows');
	t.assert(hs('  unicorns  and  rainbows  ') === 'Unicorns and rainbows');
	t.assert(hs('unicorns_and-Rainbows_andPonies  ') === 'Unicorns and rainbows and ponies');
	t.end();
});
