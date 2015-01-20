'use strict';
module.exports = function (str) {
	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}

	str = str.replace(/[A-Z]/g, function (m) {
	  return ' ' + m.toLowerCase();
	});

	str = str.trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s{2,}/g, ' ');
	str = str.charAt(0).toUpperCase() + str.slice(1);

	return str;
};
