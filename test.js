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

test('normalizes a next line character to a space', () => {
	// U+0085 (next line) is Unicode whitespace, but `\s` and `trim()` do not match it. It is common in text decoded as Latin-1 instead of Windows-1252.
	assert.equal(humanizeString('foo\u{85}bar'), 'Foo bar');
	assert.equal(humanizeString('foo\u{85}\u{85}bar'), 'Foo bar');
	assert.equal(humanizeString('foo\u{85}-\u{85}bar'), 'Foo bar');
	assert.equal(humanizeString('fooBar\u{85}Baz', {preserveCase: true}), 'FooBar Baz');

	// A leading one stopped the first letter from being uppercased.
	assert.equal(humanizeString('\u{85}foo\u{85}'), 'Foo');
	assert.equal(humanizeString('\u{85}foo', {preserveCase: true}), 'Foo');
	assert.equal(humanizeString('\u{85}'), '');

	// The byte order mark is not Unicode whitespace, but `\s` matches it, so it stays a separator.
	assert.equal(humanizeString('foo\u{FEFF}bar'), 'Foo bar');
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

test('titlecases a first letter that uppercases to several letters', () => {
	// `toUpperCase()` expands these to several uppercase letters, but only the first one should be uppercase.
	assert.equal(humanizeString('\u{FB01}le'), 'File'); // `ﬁ` ligature
	assert.equal(humanizeString('\u{FB02}ower'), 'Flower'); // `ﬂ` ligature
	assert.equal(humanizeString('\u{FB03}x'), 'Ffix'); // `ﬃ` ligature
	assert.equal(humanizeString('\u{FB06}op'), 'Stop'); // `ﬆ` ligature
	assert.equal(humanizeString('\u{DF}'), 'Ss'); // `ß`
	assert.equal(humanizeString('\u{DF}-foo'), 'Ss foo');
	assert.equal(humanizeString('\u{FB01}le-name', {preserveCase: true}), 'File name');
	assert.equal(humanizeString('\u{FB13}'), '\u{544}\u{576}'); // Armenian `ﬓ` → `Մն`
	assert.equal(humanizeString('\u{1FB2}'), '\u{1FBA}\u{3B9}'); // Greek `ᾲ` → `Ὰι`, which is better than `ᾺΙ`, but the Unicode titlecase is `Ὰ` with a combining iota subscript, as there is no precomposed titlecase letter for it. This is a known limitation.

	// Only the first letter is affected.
	assert.equal(humanizeString('a\u{FB01}'), 'A\u{FB01}');
	assert.equal(humanizeString('stra\u{DF}e'), 'Stra\u{DF}e');

	// Letters with a decomposed uppercase keep their combining marks.
	assert.equal(humanizeString('\u{1F0}'), 'J\u{30C}'); // `ǰ`
});

test('does not uppercase a first Georgian Mkhedruli letter', () => {
	// Georgian has no titlecase. Its uppercase letters (Mtavruli) are only used for all-caps text, so `toUpperCase()` turned `გამარჯობა` into `Გამარჯობა`.
	assert.equal(humanizeString('\u{10D2}\u{10D0}\u{10DB}\u{10D0}\u{10E0}\u{10EF}\u{10DD}\u{10D1}\u{10D0}'), '\u{10D2}\u{10D0}\u{10DB}\u{10D0}\u{10E0}\u{10EF}\u{10DD}\u{10D1}\u{10D0}');
	assert.equal(humanizeString('\u{10D0}-\u{10D1}'), '\u{10D0} \u{10D1}');
	assert.equal(humanizeString('\u{10D0}', {preserveCase: true}), '\u{10D0}');
	assert.equal(humanizeString('\u{10FF}'), '\u{10FF}'); // Last Mkhedruli letter

	// All-caps Mtavruli is lowercased to Mkhedruli, or kept with `preserveCase`.
	assert.equal(humanizeString('\u{1C92}\u{1C90}'), '\u{10D2}\u{10D0}');
	assert.equal(humanizeString('\u{1C92}\u{1C90}', {preserveCase: true}), '\u{1C92}\u{1C90}');

	// The older Nuskhuri script does have a titlecase, which is its uppercase (Asomtavruli).
	assert.equal(humanizeString('\u{2D00}\u{2D01}'), '\u{10A0}\u{2D01}');
});

test('splits camel case words with decomposed accents', () => {
	// Decomposed (NFD) text, common in macOS file names, puts a combining mark after the base letter, which hid the word boundary.
	assert.equal(humanizeString('cafe\u{301}Menu'), 'Cafe\u{301} menu');
	assert.equal(humanizeString('nai\u{308}veApproach'), 'Nai\u{308}ve approach');
	assert.equal(humanizeString('pho\u{302}\u{301}Bar'), 'Pho\u{302}\u{301} bar'); // Several marks
	assert.equal(humanizeString('XMLE\u{301}cole'), 'Xml e\u{301}cole');
	assert.equal(humanizeString('A\u{30A}Bcd'), 'A\u{30A} bcd');
	assert.equal(humanizeString('XA\u{30A}ngstro\u{308}m'), 'X a\u{30A}ngstro\u{308}m');
	assert.equal(humanizeString('E\u{301}COLEName'), 'E\u{301}cole name');

	// The same input in composed (NFC) and decomposed (NFD) form gives the same result.
	const inputs = ['caféMenu', 'naïveApproach', 'XMLÉcole', 'ÅBcd', 'XÅngström', 'ÉCOLEName', 'überÄrger', 'ÀÉÎÕÜ', 'São_PauloÉCity'];
	assert.deepEqual(inputs.map(input => humanizeString(input.normalize('NFD'))), inputs.map(input => humanizeString(input).normalize('NFD')));
});

test('keeps plural acronyms together', () => {
	// The `s` of a plural acronym was taken as the start of a new word: `userIDs` → `User i ds`.
	assert.equal(humanizeString('userIDs'), 'User ids');
	assert.equal(humanizeString('getURLs'), 'Get urls');
	assert.equal(humanizeString('listAPIs'), 'List apis');
	assert.equal(humanizeString('IDs'), 'Ids');
	assert.equal(humanizeString('getURLs-fromAPIs'), 'Get urls from apis');
	assert.equal(humanizeString('user IDs list'), 'User ids list');
	assert.equal(humanizeString('the_PDFs'), 'The pdfs');
	assert.equal(humanizeString('PDFs-and-URLs'), 'Pdfs and urls');
	assert.equal(humanizeString('allIDs2'), 'All i ds2'); // A digit continues the word, like in `mp3Player`
	assert.equal(humanizeString('E\u{301}TATs'), 'E\u{301}tats'); // Decomposed accent
	assert.equal(humanizeString('listCAFE\u{301}s'), 'List cafe\u{301}s'); // Decomposed accent on the last acronym letter
	assert.equal(humanizeString('IDs\u{301}'), 'I ds\u{301}'); // A decomposed `ś` is not a plural `s`, the same as a composed one
	assert.equal(humanizeString('ID\u{15B}'), 'I d\u{15B}');

	// A capitalized word starting with `s` after an acronym is still split.
	assert.equal(humanizeString('HTTPSServer'), 'Https server');
	assert.equal(humanizeString('XMLSchema'), 'Xml schema');

	// An `s` followed by more lowercase letters is not a plural, so the uppercase letter before it starts a new word.
	assert.equal(humanizeString('APIsearch'), 'Ap isearch');
	assert.equal(humanizeString('GPUsed'), 'Gp used');

	// Before a capitalized word, `Is`, `As`, `Us`, and `Os` after an acronym are words, which is more common than a plural acronym there. A plural acronym is therefore only recognized at the end of a word.
	assert.equal(humanizeString('userIDIsValid'), 'User id is valid');
	assert.equal(humanizeString('fileURLIsDirectory'), 'File url is directory');
	assert.equal(humanizeString('isCPUUsHigh'), 'Is cpu us high');
	assert.equal(humanizeString('XMLIsValid'), 'Xml is valid');
	assert.equal(humanizeString('USIsGood'), 'Us is good');
	assert.equal(humanizeString('URLAsString'), 'Url as string');
	assert.equal(humanizeString('userIDsList'), 'User i ds list');

	// At the end of a word, a plural acronym is more common than a word: `exportPDFAs` is a known limitation.
	assert.equal(humanizeString('exportPDFAs'), 'Export pdfas');

	// A single uppercase letter followed by `s` is a word.
	assert.equal(humanizeString('thisIs'), 'This is');
	assert.equal(humanizeString('fooAs'), 'Foo as');
});

test('titlecases a first digraph letter', () => {
	// The digraphs `ǆ`, `ǉ`, `ǌ`, and `ǳ` have a titlecase form that differs from their uppercase form.
	assert.equal(humanizeString('\u{1C6}ungla'), '\u{1C5}ungla'); // `ǆungla` → `ǅungla`, not `Ǆungla`
	assert.equal(humanizeString('\u{1C9}ubav'), '\u{1C8}ubav'); // `ǉ`
	assert.equal(humanizeString('\u{1CC}ega'), '\u{1CB}ega'); // `ǌ`
	assert.equal(humanizeString('\u{1F3}ar'), '\u{1F2}ar'); // `ǳ`
	assert.equal(humanizeString('\u{1C4}UNGLA'), '\u{1C5}ungla'); // All-caps `Ǆ` is lowercased first
	assert.equal(humanizeString('\u{1C5}ungla'), '\u{1C5}ungla');
	assert.equal(humanizeString('\u{1C6}ungla', {preserveCase: true}), '\u{1C5}ungla');

	// An already uppercase or titlecase letter is kept with `preserveCase`.
	assert.equal(humanizeString('\u{1C4}UNGLA', {preserveCase: true}), '\u{1C4}UNGLA');
	assert.equal(humanizeString('\u{1C5}ungla', {preserveCase: true}), '\u{1C5}ungla');
	assert.equal(humanizeString('\u{1C8}ubav', {preserveCase: true}), '\u{1C8}ubav');
	assert.equal(humanizeString('\u{1F88}', {preserveCase: true}), '\u{1F88}'); // Greek `ᾈ`
});

test('titlecases a first Greek letter with an iota subscript', () => {
	// `toUpperCase()` turns the iota subscript into a separate capital iota, but the titlecase letter keeps it as a subscript.
	assert.equal(humanizeString('\u{1FA0}\u{3B4}\u{3AE}'), '\u{1FA8}\u{3B4}\u{3AE}'); // `ᾠδή` → `ᾨδή`, not `Ὠιδή`
	assert.equal(humanizeString('\u{1F84}\u{3B4}\u{3C9}'), '\u{1F8C}\u{3B4}\u{3C9}'); // `ᾄδω` → `ᾌδω`
	assert.equal(humanizeString('\u{1FB3}'), '\u{1FBC}'); // `ᾳ` → `ᾼ`
	assert.equal(humanizeString('\u{1FC3}'), '\u{1FCC}'); // `ῃ` → `ῌ`
	assert.equal(humanizeString('\u{1FF3}'), '\u{1FFC}'); // `ῳ` → `ῼ`
	assert.equal(humanizeString('\u{1F80}-foo'), '\u{1F88} foo'); // `ᾀ` → `ᾈ`
	assert.equal(humanizeString('\u{1F80}', {preserveCase: true}), '\u{1F88}');

	// An already titlecase letter was lowercased by decamelize, and then uppercased to two letters.
	assert.equal(humanizeString('\u{1FA8}\u{3B4}\u{3AE}'), '\u{1FA8}\u{3B4}\u{3AE}'); // `ᾨδή`
	assert.equal(humanizeString('\u{1F8D}\u{3B4}\u{3B7}\u{3C2}'), '\u{1F8D}\u{3B4}\u{3B7}\u{3C2}'); // `ᾍδης`
	assert.equal(humanizeString('\u{1FBC}'), '\u{1FBC}'); // `ᾼ`

	// Only the first letter is titlecased.
	assert.equal(humanizeString('\u{1FB3}\u{1FB3}'), '\u{1FBC}\u{1FB3}');
});

test('titlecases every first letter that has a titlecase letter', () => {
	const titlecaseLetters = [];
	for (let codePoint = 0; codePoint <= 0x10_FF_FF; codePoint++) {
		const character = String.fromCodePoint(codePoint);
		if (/^\p{Titlecase_Letter}$/v.test(character)) {
			titlecaseLetters.push(character);
		}
	}

	assert.equal(titlecaseLetters.length, 31);
	assert.deepEqual(titlecaseLetters.map(letter => humanizeString(letter.toLowerCase())), titlecaseLetters);
	assert.deepEqual(titlecaseLetters.map(letter => humanizeString(letter)), titlecaseLetters);
	assert.deepEqual(titlecaseLetters.map(letter => humanizeString(`${letter.toLowerCase()}foo`)), titlecaseLetters.map(letter => `${letter}foo`));
});
