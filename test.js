import {test} from 'node:test';
import process from 'node:process';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import humanizeString from './index.js';

test('humanizes camelized, dasherized, and underscored input', () => {
	assert.equal(humanizeString(''), '');
	assert.equal(humanizeString('unicorns and rainbows'), 'Unicorns and rainbows');
	assert.equal(humanizeString('unicorns-and-rainbows'), 'Unicorns and rainbows');
	assert.equal(humanizeString('UnicornsAndRainbows'), 'Unicorns and rainbows');
	assert.equal(humanizeString('unicornsAndRainbows'), 'Unicorns and rainbows');
	assert.equal(humanizeString('unicorns_and_rainbows'), 'Unicorns and rainbows');
	assert.equal(humanizeString('-UnicornsAndRainbows'), 'Unicorns and rainbows');
	assert.equal(humanizeString('  unicorns  and  rainbows  '), 'Unicorns and rainbows');
	assert.equal(humanizeString('unicorns_and-Rainbows_andPonies  '), 'Unicorns and rainbows and ponies');
});

test('throws on non-string input', () => {
	assert.throws(() => {
		humanizeString(1);
	}, {message: 'Expected a string'});

	assert.throws(() => {
		humanizeString(undefined);
	}, {message: 'Expected a string'});

	assert.throws(() => {
		humanizeString(null);
	}, {message: 'Expected a string'});
});

test('preserveCase option keeps the original case', () => {
	// Basic preserve case functionality
	assert.equal(humanizeString('unicorns_and-Rainbows_andPonies', {preserveCase: true}), 'Unicorns and Rainbows andPonies');
	assert.equal(humanizeString('The-NetApp-Guide-to-Kubernetes', {preserveCase: true}), 'The NetApp Guide to Kubernetes');
	assert.equal(humanizeString('iPhone-App-Store', {preserveCase: true}), 'IPhone App Store');
	assert.equal(humanizeString('XMLHttpRequest-API', {preserveCase: true}), 'XMLHttpRequest API');

	// Mixed separators with preserve case
	assert.equal(humanizeString('foo_Bar-Baz', {preserveCase: true}), 'Foo Bar Baz');
	assert.equal(humanizeString('FOO_BAR-baz', {preserveCase: true}), 'FOO BAR baz');

	// Edge cases with preserve case
	assert.equal(humanizeString('', {preserveCase: true}), '');
	assert.equal(humanizeString('singleword', {preserveCase: true}), 'Singleword');
	assert.equal(humanizeString('ALLCAPS', {preserveCase: true}), 'ALLCAPS');
	assert.equal(humanizeString('  spaced  words  ', {preserveCase: true}), 'Spaced words');

	// Multiple dashes/underscores with preserve case
	assert.equal(humanizeString('foo--bar__baz', {preserveCase: true}), 'Foo bar baz');
	assert.equal(humanizeString('prefix-_-suffix', {preserveCase: true}), 'Prefix suffix');

	// Leading dashes/underscores with preserve case
	assert.equal(humanizeString('-Leading-Dash', {preserveCase: true}), 'Leading Dash');
	assert.equal(humanizeString('_Leading_Underscore', {preserveCase: true}), 'Leading Underscore');
});

test('preserveCase false is the same as omitting the option', () => {
	assert.equal(humanizeString('unicorns_and-Rainbows', {preserveCase: false}), 'Unicorns and rainbows');
	assert.equal(humanizeString('The-NetApp-Guide-to-Kubernetes', {preserveCase: false}), 'The net app guide to kubernetes');
	assert.equal(humanizeString('The-NetApp-Guide-to-Kubernetes', {}), 'The net app guide to kubernetes');
});

test('uppercase a first letter outside the basic multilingual plane', () => {
	// `charAt()` splits surrogate pairs, so a non-BMP first letter was never uppercased.
	// The expected code points are each the `\p{Lu}` counterpart of the input, verified against Unicode data.
	assert.equal(humanizeString('\u{10428}'), '\u{10400}'); // Deseret
	assert.equal(humanizeString('\u{1E922}'), '\u{1E900}'); // Adlam
	assert.equal(humanizeString('\u{16E60}'), '\u{16E40}'); // Medefaidrin
	assert.equal(humanizeString('\u{118D0}'), '\u{118B0}'); // Warang Citi
	assert.equal(humanizeString('\u{10428}abc'), '\u{10400}abc');

	// An already uppercase astral letter, and a non-letter first character, are left alone.
	assert.equal(humanizeString('\u{10400}'), '\u{10400}');
	assert.equal(humanizeString('😀hello'), '😀hello');
	assert.equal(humanizeString('👨‍👩‍👧‍👦family'), '👨‍👩‍👧‍👦family');
});

test('normalizes any whitespace to a single space', () => {
	// A single non-space whitespace character was kept, while two of them were collapsed to a space.
	assert.equal(humanizeString('foo\tbar'), 'Foo bar');
	assert.equal(humanizeString('foo\nbar'), 'Foo bar');
	assert.equal(humanizeString('foo\r\nbar'), 'Foo bar');
	assert.equal(humanizeString('foo\u{A0}bar'), 'Foo bar');
	assert.equal(humanizeString('foo\u{3000}bar'), 'Foo bar');
	assert.equal(humanizeString('foo\u{2028}bar'), 'Foo bar');
	assert.equal(humanizeString('foo\tbar', {preserveCase: true}), 'Foo bar');
	assert.equal(humanizeString('fooBar\tBaz', {preserveCase: true}), 'FooBar Baz');

	// Whitespace mixed with separators.
	assert.equal(humanizeString('foo\t-\tbar'), 'Foo bar');
	assert.equal(humanizeString('foo_\nbar'), 'Foo bar');
	assert.equal(humanizeString('\tfoo\n'), 'Foo');
	assert.equal(humanizeString(' \t\n-_ '), '');
});

test('handles large input without running out of memory', () => {
	// Splitting the string into an array of characters to uppercase the first one used several times more memory than the string itself.
	const code = `
		import humanizeString from ${JSON.stringify(import.meta.resolve('./index.js'))};
		const input = 'a'.repeat(8_000_000);
		console.log(humanizeString(input).length, humanizeString(input, {preserveCase: true}).length);
	`;

	const {status, stdout, stderr} = spawnSync(process.execPath, ['--max-old-space-size=64', '--input-type=module', '--eval', code], {encoding: 'utf8'});
	assert.equal(status, 0, stderr.slice(0, 200));
	assert.equal(stdout, '8000000 8000000\n');
});
