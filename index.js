'use strict';
const decamelize = require('decamelize');

function humanizeString(input) {
	if (typeof input !== 'string') {
		throw new TypeError('Expected a string');
	}

	return (
		decamelize(input)
			.toLowerCase()
			.replace(/[_-]+/g, ' ')
			.replace(/\s{2,}/g, ' ')
			.trim()
			.charAt(0)
			.toUpperCase() + input.slice(1)
	);
}

module.exports = humanizeString;
// TODO: Remove this for the next major release
module.exports.default = humanizeString;
