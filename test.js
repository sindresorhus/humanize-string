import test from 'ava';
import humanizeString from './index.js';

test('main', t => {
	t.is(humanizeString(''), '');
	t.is(humanizeString('unicorns and rainbows'), 'Unicorns and rainbows');
	t.is(humanizeString('unicorns-and-rainbows'), 'Unicorns and rainbows');
	t.is(humanizeString('UnicornsAndRainbows'), 'Unicorns and rainbows');
	t.is(humanizeString('unicornsAndRainbows'), 'Unicorns and rainbows');
	t.is(humanizeString('unicorns_and_rainbows'), 'Unicorns and rainbows');
	t.is(humanizeString('-UnicornsAndRainbows'), 'Unicorns and rainbows');
	t.is(humanizeString('  unicorns  and  rainbows  '), 'Unicorns and rainbows');
	t.is(humanizeString('unicorns_and-Rainbows_andPonies  '), 'Unicorns and rainbows and ponies');
});
