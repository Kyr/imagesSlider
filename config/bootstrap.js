/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function (cb) {

	// It's very important to trigger this callback method when you are finished
	// with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)

	//io.sockets.on("Image", function(event){console.log(event);});

	async.parallel([createDefaultUser], cb);

	//cb();
};

function createDefaultUser(cb) {
	User.count(function (err, cnt) {
		if (err) {
			cb(err);
		}
		if (cnt === 0) {
			User.create({
				userName: 'John Gold',
				password: 'password',
				authName: 'login'
			}, function (err, result) {
				sails.log.debug(err, result);
				cb(err);
			});
		} else {
			cb();
		}
	})
}
