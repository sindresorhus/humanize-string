import decamelize from 'decamelize';

// These lowercase letters have a titlecase letter that differs from their uppercase: `ǆ` → `ǅ`, not `Ǆ`, and Greek `ᾳ` → `ᾼ`, not `ΑΙ`. These are all the titlecase letters in Unicode.
const titlecaseLetters = new Map([...'ǅǈǋǲᾈᾉᾊᾋᾌᾍᾎᾏᾘᾙᾚᾛᾜᾝᾞᾟᾨᾩᾪᾫᾬᾭᾮᾯᾼῌῼ'].map(letter => [letter.toLowerCase(), letter]));

// Uppercase a character as the first letter of a word.
function titlecase(character) {
	// A titlecase letter, like `ǅ`, is already right, and Georgian Mkhedruli has no titlecase. Its uppercase (Mtavruli) is only used for all-caps text.
	if (/^[\p{Titlecase_Letter}\u{10D0}-\u{10FF}]$/v.test(character)) {
		return character;
	}

	if (titlecaseLetters.has(character)) {
		return titlecaseLetters.get(character);
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

	// `\s` misses U+0085 (next line), which is Unicode whitespace.
	string = string.replaceAll(/[\s\p{White_Space}\-_]+/gv, ' ').trim();

	// The `v` flag makes `.` match a whole code point, where `charAt()` would split a surrogate pair and leave the first letter unuppercased. Spreading the string into an array of characters instead would use several times more memory than the string itself.
	return string.replace(/^./sv, character => titlecase(character));
}
