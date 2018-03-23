import test from 'ava';
import m from '.';

test('main', t => {
	t.is(m(''), '');
	t.is(m('unicorns and rainbows'), 'Unicorns and rainbows');
	t.is(m('unicorns-and-rainbows'), 'Unicorns and rainbows');
	t.is(m('UnicornsAndRainbows'), 'Unicorns and rainbows');
	t.is(m('unicornsAndRainbows'), 'Unicorns and rainbows');
	t.is(m('unicorns_and_rainbows'), 'Unicorns and rainbows');
	t.is(m('-UnicornsAndRainbows'), 'Unicorns and rainbows');
	t.is(m('  unicorns  and  rainbows  '), 'Unicorns and rainbows');
	t.is(m('unicorns_and-Rainbows_andPonies  '), 'Unicorns and rainbows and ponies');
});
