"use strict";

/**
 * 200 (OK) Response end send file to response
 *
 * Usage:
 * return res.file(file);
 *
 * @param  {Object} file
 */

module.exports = function sendFile(file) {

	// Get access to `req`, `res`, & `sails`
	var req = this.req;
	var res = this.res;
	var sails = req._sails;

	sails.log.info('res.ok() :: Sending 200 ("OK") file response');

	// Set status code
	res.status(200);

	//content-disposition
	res.attachment(file.fileName);

	file.stream.on('end', function () {
		res.end();
	});

	file.stream.pipe(res);
};
