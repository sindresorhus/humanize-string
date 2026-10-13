import decamelize from 'decamelize';

// Uppercase a character as the first letter of a word.
function titlecase(character) {
	// A titlecase letter, like `ǅ`, is already right, and Georgian Mkhedruli has no titlecase. Its uppercase (Mtavruli) is only used for all-caps text.
	if (/^[\p{Titlecase_Letter}\u{10D0}-\u{10FF}]$/v.test(character)) {
		return character;
	}

	// The lowercase digraphs have a titlecase letter that differs from their uppercase one: `ǆ` → `ǅ`, not `Ǆ`. It is the code point before the lowercase one.
	if (/^[ǆǉǌǳ]$/v.test(character)) {
		return String.fromCodePoint(character.codePointAt(0) - 1);
	}

	// Some characters, like `ß` and `ﬁ`, uppercase to several letters, of which only the first should be uppercase: `ﬁle` → `File`, not `FIle`.
	const [first, ...rest] = character.toUpperCase();
	return first + rest.join('').toLowerCase();
}

export default function humanizeString(string, options = {}) {
	if (typeof string !== 'string') {
		throw new TypeError('Expected a string');
	}

	if (!options.preserveCase) {
		string = decamelize(string);
	}

	string = string.replaceAll(/[\s\-_]+/gv, ' ').trim();

	// The `v` flag makes `.` match a whole code point, where `charAt()` would split a surrogate pair and leave the first letter unuppercased. Spreading the string into an array of characters instead would use several times more memory than the string itself.
	return string.replace(/^./sv, character => titlecase(character));
}
