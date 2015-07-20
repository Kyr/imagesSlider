var path = require('path');
var fs = require('fs');

module.exports.storage = {
	path: 'users_images',
	byUser: function (userId) {
		var rootPath = this.path;
		var userStoragePath = path.resolve(rootPath, userId.toString());
		if (!fs.existsSync(userStoragePath)) {
			fs.mkdirSync(userStoragePath);
		}
		return userStoragePath;
	}
};
