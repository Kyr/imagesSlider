var app = angular.module('app', ['ngResource', 'ui.bootstrap', 'ngTouch']);

/**
 * @ngdoc constant
 * @name IMAGE_AMOUNT
 * @constant
 */
app.constant('IMAGE_AMOUNT', 3);
app.constant('SLIDER_INTERVAL', 10000);

app.run([
	'$rootScope', '$interval', 'SLIDER_INTERVAL',
	function ($rootScope, $interval, SLIDER_INTERVAL) {
		$rootScope.sliderInderval = $interval(function () {
			$rootScope.$broadcast('slider:changePage', 1);
		}, SLIDER_INTERVAL, 0, false);
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
	'$scope', '$filter', '$timeout', 'IMAGE_AMOUNT', 'User', 'ImageService',
	function ($scope, $filter, $timeout, IMAGE_AMOUNT, User, ImageService) {

		User.login({login: 'login', password: 'password'}, function (result) {
			$scope.images = result.images;
			$scope.userName = result.userName;
			$scope.userId = result.id;
			$scope.user = result;
		});

		$scope.currentPage = 1;
		$scope.image_amount = IMAGE_AMOUNT;

		$scope.$on('slider:changePage', function (event, inc) {
			inc = inc || 1;

			if (inc == 1) {
				if ($scope.currentPage == Math.ceil($scope.images.length / IMAGE_AMOUNT)) {
					$scope.currentPage = 1;
				} else {
					$scope.currentPage++;
				}
			} else {
				if ($scope.currentPage == 1) {
					$scope.currentPage = Math.ceil($scope.images.length / IMAGE_AMOUNT);
				} else {
					$scope.currentPage--;
				}
			}

			$timeout(function () {
				$scope.$apply();
			}, 1, true);


		});

		$scope.$watchCollection('images', function (images) {

			if (!images || images.length == 0) {
				$scope.placeholders = '0'.repeat(IMAGE_AMOUNT).split('');
			} else if (images.length % IMAGE_AMOUNT == 0) {
				$scope.placeholders = [];
			} else {
				$scope.placeholders = '0'.repeat(IMAGE_AMOUNT - images.length % IMAGE_AMOUNT).split('');
			}
		});

		$scope.updateRate = function (image) {
			ImageService.save({id: image.id, rating: image.rating}, function (response) {

			});
		};

		$scope.swipeLeft = function () {
			$scope.$emit('slider:changePage')
		};

		$scope.swipeRight = function () {
			$scope.$emit('slider:changePage', -1);
		};

	}
]);

app.directive('imageListItem', [
	'$timeout', 'ImageService',
	function ($timeout, ImageService) {
		return {
			//template: '<li><md-whiteframe class="md-whiteframe-z2" layout layout-align="center center"><div ng-transclude="true"></div></md-whiteframe></li>',
			templateUrl: 'partials/image-list-item.html',
			transclude: true,
			replace: true,
			controller: ['$scope', 'ImageService', function ($scope, ImageService) {

				$scope.deleteImage = function (event) {
					ImageService.remove({id: $scope.image.id}, function (response) {
						$scope.images.splice($scope.$index, 1);
						$timeout(function () {
							$scope.$apply($scope.images);
						}, 1, false);

					});
				};

				$scope.updateCaption = function () {
					ImageService.save({id: $scope.image.id, caption: $scope.image.caption}, function (response) {

					});
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

					console.log('upload, $scope: %o', $scope);

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
