var path = require('path');
var fs = require('fs');

/**
 * ImagesController
 *
 * @description :: Server-side logic for managing images
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

	incrementImpression: function (req, res, next) {
		//sails.log.debug('Impressions for :', req.params.id);

		Image.findOne(req.params.id, function (err, image) {
			if (err) {
				res.serverError(err);
			}
			image.impression = image.impression + 1;
			image.save(function (err, updated) {
				if (err) {
					res.serverError(err);
				}

				sails.sockets.blast('image:update:impression', {id: updated.id, impression: updated.impression});
				res.ok(updated);
			})
		});

	},
	/**
	 * Override GET image/:imageID
	 * @param req
	 * @param res
	 * @param next
	 */
	findOne: function (req, res, next) {
		var fileName = req.params && req.params.id || null;

		Image.findOne({fileName: fileName}, function (err, image) {
			if (err) {
				res.serverError(err);
			}


			var folder = sails.config.storage.byUser(image.owner);
			var filePath = path.resolve(folder, image.fd);

			image.stream = fs.createReadStream(filePath);
			image.stream.pipe(res);
		})
	},

	upload: function (req, res, next) {

		var userId = req.param('userId'); // TODO Use auth token or session for identify users
		var payload = req.file('image');

		if (!userId) {
			return res.badRequest('User id not specified');
		}

		payload.upload({
			dirname: sails.config.storage.byUser(userId)
		}, function (error, images) {
			if (error) {
				return res.serverError(error);
			}

			if (images.length) {
				var image = images[0];
				var fileDescriptor = path.basename(image.fd);

				Image.create({
					owner: userId,
					fd: fileDescriptor,
					fileName: image.filename
				}, function (err, createdImage) {
					res.ok(createdImage);
				});


			} else {
				res.badRequest('No image in payload');
			}
		});

	}
};

