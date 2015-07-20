var app = angular.module('app', ['ngResource', 'ngMaterial']);

/**
 * @ngdoc constant
 * @name IMAGE_AMOUNT
 * @constant
 */
app.constant('IMAGE_AMOUNT', 3);

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

//app.config(['$provide', '$resource', function ($provide, $resource) {
//	$resource('user/login', {login: 'user', password: 'password'}, function (response) {
//		$provide.value('User', response)
//	})
//}]);


app.controller('appCtrl', [
	'$scope', '$filter', 'IMAGE_AMOUNT', 'User',
	function ($scope, $filter, IMAGE_AMOUNT, User) {
		console.log('appCtrl loaded');

		//var images = User.login('/images/:id', {id: '@id'}, null);
		$scope.currentPage = 1;
		//$scope.images = [];

		$scope.$watchCollection('images', function () {

			$scope.sliderSet = $filter('limitTo')($scope.images, IMAGE_AMOUNT, ($scope.currentPage - 1) * IMAGE_AMOUNT);
		});

		$scope.$watchGroup(['images', 'currentPage'], function () {

			$scope.sliderSet = $filter('limitTo')($scope.images, IMAGE_AMOUNT, ($scope.currentPage - 1) * IMAGE_AMOUNT);
		});

		$scope.image_amount = IMAGE_AMOUNT;


		$scope.sliderSize = '0'.repeat(IMAGE_AMOUNT).split('');

		User.login({login: 'login', password: 'password'}, function (result) {
			$scope.images = result.images;
			$scope.userName = result.userName;
			$scope.userId = result.id;
			$scope.user = result;
		});


	}
]);

app.directive('imageListItem', [

	function () {
		return {
			template: '<li><div ng-transclude="true"></div></li>',
			transclude: true,
			replace: true,
			link: function ($scope, element, attributes) {
				var deleteButton = angular.element('<button>X</button>').addClass('md-icon');
				var icon = angular.element('<md-icon>').attr('md-svg-icon', 'md-close');
				deleteButton.append(icon);

				deleteButton.on('click', function (event) {
					console.log('delete click, event: %o', event);
				});

				element.append(deleteButton);
			}
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
						console.log('upload success, response: %o', response);
						$scope.images.push(response);
						$scope.$apply();
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