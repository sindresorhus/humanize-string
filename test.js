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

test('preserveCase option', t => {
	// Basic preserve case functionality
	t.is(humanizeString('unicorns_and-Rainbows_andPonies', {preserveCase: true}), 'Unicorns and Rainbows andPonies');
	t.is(humanizeString('The-NetApp-Guide-to-Kubernetes', {preserveCase: true}), 'The NetApp Guide to Kubernetes');
	t.is(humanizeString('iPhone-App-Store', {preserveCase: true}), 'IPhone App Store');
	t.is(humanizeString('XMLHttpRequest-API', {preserveCase: true}), 'XMLHttpRequest API');

	// Mixed separators with preserve case
	t.is(humanizeString('foo_Bar-Baz', {preserveCase: true}), 'Foo Bar Baz');
	t.is(humanizeString('FOO_BAR-baz', {preserveCase: true}), 'FOO BAR baz');

	// Edge cases with preserve case
	t.is(humanizeString('', {preserveCase: true}), '');
	t.is(humanizeString('singleword', {preserveCase: true}), 'Singleword');
	t.is(humanizeString('ALLCAPS', {preserveCase: true}), 'ALLCAPS');
	t.is(humanizeString('  spaced  words  ', {preserveCase: true}), 'Spaced words');

	// Multiple dashes/underscores with preserve case
	t.is(humanizeString('foo--bar__baz', {preserveCase: true}), 'Foo bar baz');
	t.is(humanizeString('prefix-_-suffix', {preserveCase: true}), 'Prefix suffix');

	// Leading dashes/underscores with preserve case
	t.is(humanizeString('-Leading-Dash', {preserveCase: true}), 'Leading Dash');
	t.is(humanizeString('_Leading_Underscore', {preserveCase: true}), 'Leading Underscore');
});
