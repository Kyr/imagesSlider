/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

	login: function (req, res) {

		var credentials = {
			login: req.body.login || '',
			password: req.body.password || ''
		};

		if (credentials.login === '' || credentials.password === '') {
			res.badRequest('Empty credential not allowed.')
		} else {
			User.attemptLogin(credentials, res.login);
		}

	}
};

