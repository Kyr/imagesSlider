/**
 * Images.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
	tableName: 'images',
	attributes: {

		owner: {
			model: 'User'
		},

		/**
		 * File description in system
		 */
		fd: {
			type: 'string',
			columnName: 'file_descriptor'
		},

		/**
		 * Original file name
		 */
		fileName: {
			type: 'string',
			columnName: 'file_name'
		},

		/**
		 *User provided image caption
		 */
		caption: {
			type: 'text'
		},

		/**
		 * View count
		 */
		impression: {
			type: 'integer'
		},

		/**
		 * User rating (hearts/stars)
		 */
		rating: {
			type: 'integer'
		}


	}
};

