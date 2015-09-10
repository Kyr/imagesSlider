var app = angular.module('app', ['ngResource', 'ui.bootstrap', 'ngTouch']);

/**
 * Describe how many images should present at same time
 * @ngdoc constant
 * @name IMAGE_AMOUNT
 * @constant
 */
app.constant('IMAGE_AMOUNT', 3);

/**
 * Delay between auto slide image
 * @ngdoc constant
 * @name SLIDER_INTERVAL
 * @constant
 */
app.constant('SLIDER_INTERVAL', 10000);

app.run([
	'$rootScope', '$interval', 'SLIDER_INTERVAL',
	function ($rootScope, $interval, SLIDER_INTERVAL) {
		$rootScope.sliderInderval = $interval(function () {
			$rootScope.$broadcast('slider:changePage', 1);
		}, SLIDER_INTERVAL, 0, false);
	}
]);

app.run([
	'$rootScope',
	function ($rootScope) {
		io.socket.on('image:update:impression', function (event) {
			$rootScope.$broadcast('image:update:impression', event);
		});
	}
]);

app.run([
	'$rootScope', 'User',
	function ($rootScope, User) {

		User.login({login: 'login', password: 'password'}, function (user) {
			$rootScope.images = user.images;
			$rootScope.userName = user.userName;
			$rootScope.userId = user.id;
			$rootScope.user = user;

			subscribeOnImageCollectionEventViaSocket();
		});

		function subscribeOnImageCollectionEventViaSocket() {
			io.socket.on('image', function (event) {
				console.log('Socket event: %o', event);

				for (var i = 0, image; image = $scope.images[i]; i++) {
					if (event.id == image.id) {
						angular.extend($rootScope.images[i], event.data);
						break;
					}
				}
			});

			// TODO How it works?
			io.socket.get('/image', function (resData, jwres) {
				console.log('Initial load image data via socket, just for test ans subscribe to Image events', resData);
			});
		}

	}
]);

/**
 * @ngdoc service
 * @name User
 */
app.factory('User', ['$resource', function ($resource) {
	return $resource('user/:id/:action', {id: '@id'}, {
		login: {
			method: 'POST',
			params: {
				action: 'login'
			}
		}
	});
}]);

/**
 * @ngdoc service
 * @name ImageService
 */
app.factory('ImageService', ['$resource', function ($resource) {
	return $resource('image/:id/:action', {id: '@id'}, {
		impression: {
			method: 'POST',
			params: {
				action: '@id',
				id: 'incrementImpression'
			}
		},
		upload: {
			method: 'POST',
			params: {
				action: 'upload',
				userId: '@userId'
			},
			headers: {'content-type': undefined},
			transformRequest: [function (data) {
				return data.payload;
			}, angular.identity]

		}
	})
}]);

app.controller('appCtrl', [
	'$scope', '$filter', '$timeout', 'IMAGE_AMOUNT', 'ImageService',
	function ($scope, $filter, $timeout, IMAGE_AMOUNT, ImageService) {

		$scope.currentPage = 1;
		$scope.image_amount = IMAGE_AMOUNT; // TODO Is it required???

		$scope.$on('image:update:impression', updateImageImpression);

		$scope.$on('slider:changePage', onChangePageNumber);

		$scope.$watchCollection('images', changePlaceholdersAmount);

		$scope.updateRate = function (image) {
			ImageService.save({id: image.id, rating: image.rating});
		};

		$scope.swipeLeft = function () {
			$scope.$emit('slider:changePage');
		};

		$scope.swipeRight = function () {
			$scope.$emit('slider:changePage', -1);
		};

		/**
		 * TODO
		 * @param images
		 */
		function changePlaceholdersAmount(images) {

			//console.log('Change placeholders amount, image collection: %o ', images);

			if (!images || images.length == 0) {
				$scope.placeholders = '0'.repeat(IMAGE_AMOUNT).split('');
			} else if (images.length % IMAGE_AMOUNT == 0) {
				$scope.placeholders = [];
			} else {
				$scope.placeholders = '0'.repeat(IMAGE_AMOUNT - images.length % IMAGE_AMOUNT).split('');
			}
		}

		function onChangePageNumber(event, inc) {
			inc = inc || 1;

			if (inc === 1) {
				if ($scope.currentPage === Math.ceil($scope.images.length / IMAGE_AMOUNT)) {
					$scope.currentPage = 1;
				} else {
					$scope.currentPage++;
				}
			} else {
				if ($scope.currentPage === 1) {
					$scope.currentPage = Math.ceil($scope.images.length / IMAGE_AMOUNT);
				} else {
					$scope.currentPage--;
				}
			}

			$timeout(function () {
				$scope.$apply();
			}, 1, true);
		}

		function updateImageImpression(event, updatedImage) {
			for (var i = 0, image; image = $scope.images[i]; i++) {
				if (image.id == updatedImage.id) {
					$scope.images[i].impression = updatedImage.impression;
					break;
				}
			}
		}

	}
]);

/**
 * TODO Is it should be a directive? It's look like controller.
 * @name imageListItem
 */
app.directive('imageListItem', [
	function () {
		return {
			templateUrl: 'partials/image-list-item.html',
			transclude: true,
			replace: true,
			controller: ['$scope', '$timeout', 'ImageService', function ($scope, $timeout, ImageService) {

				$scope.deleteImage = function (event) {
					ImageService.remove({id: $scope.image.id}, function (response) {
						$scope.images.splice($scope.$index, 1);
						$timeout(function () {
							$scope.$apply($scope.images);
						}, 1, false);
					});
				};

				$scope.updateCaption = function () {
					ImageService.save({id: $scope.image.id, caption: $scope.image.caption});
				}
			}]
		}
	}
]);

app.directive('uploadImage', [
	'ImageService',
	function (ImageService) {
		return {
			link: function ($scope, element, attributes) {
				var fileInput = angular.element('<input type="file" style="display: none;">');

				fileInput.on('change', function (event) {
					var payload = new FormData();

					if (event.target.files.length === 0) {
						return false;
					}
					var file = event.target.files[0];

					payload.append('image', file);
					payload.append('user', $scope.userId);

					ImageService.upload({userId: $scope.user.id, payload: payload}, function (response) {
						$scope.images.push(response);
					});

				});

				element.after(fileInput);

				element.on('click', function (event) {
					event.preventDefault();
					event.stopPropagation();
					fileInput[0].click();
				});
			}
		}
	}
]);

app.directive('impressionCount', [
	'$parse', 'ImageService',
	function ($parse, ImageService) {
		return {
			restrict: 'A',
			link: function ($scope, element, attributes) {
				attributes.$observe('visible', function (expression) {
					$scope.$watch(function () {
						return $parse(expression)($scope);
					}, function (isVisible) {
						if (isVisible) {
							ImageService.impression({id: $scope.image.id}, function (response) {
								$scope.image.impression = response.impression;
							});
						}
					})
				})
			}
		}
	}
]);
