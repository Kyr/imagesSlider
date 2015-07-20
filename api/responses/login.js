"use strict";
module.exports = function login(error, user) {
	var req = this.req;
	var res = this.res;

	if (error) {
		return res.serverError(error);
	}
	if (!user) {
		return res.badRequest('User not found.');
	}

	return res.ok(user);
};
