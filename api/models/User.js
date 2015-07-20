var bcrypt = require('bcrypt');

/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
	tableName: 'users',
	attributes: {
		/**
		 * Login
		 */
		authName: {
			type: 'string',
			unique: true,
			columnName: 'auth_name'
		},
		/**
		 * Real name
		 */
		userName: {
			type: 'string',
			columnName: 'user_name'
		},
		password: {
			type: 'string'
		},
		images: {
			collection: 'Image', via: 'owner'
		}
	},

	beforeCreate: function (attributes, next) {
		var saltLength = 10;
		var error = null;

		try {
			attributes.password = bcrypt.hashSync(attributes.password, saltLength);
		} catch (e) {
			error = e.message;
		} finally {
			next(error);
		}
	},

	attemptLogin: function (credentials, callback) {
		User.findOne({authName: credentials.login})
			.populate('images')
			.exec(function (error, user) {

				if (error) {
					callback(error);
				}

				if (user) {
					callback(null, user);
				} else {
					callback(error, null);
				}

			});
	}
};

