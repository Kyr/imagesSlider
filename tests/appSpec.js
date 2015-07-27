describe('Image slider app: placeholders amount', function () {
	var scope;
	var appCtrl;
	var httpBackend;


	beforeEach(module('app'));

	beforeEach(inject(function ($rootScope, $injector, $controller) {
		scope = $rootScope.$new();
		httpBackend = $injector.get('$httpBackend');

		httpBackend.when('POST', 'user/login').respond(200, {
			images: ['fake element'],
			userName: 'testUser',
			userId: 'test',
			user: 'user'
		});

		appCtrl = $controller('appCtrl', {
			$scope: scope,
			// changePlaceholdersAmount: 'changePlaceholdersAmount'
		});
	}));

	it('we should have 3 image placeholder for empty images collection', function () {
		scope.images = null;
		scope.$digest();
		expect(scope.placeholders.length).toEqual(3);
	});

	it('we should have 2 image placeholder for images collection with one element', function () {
		scope.images = ['fake element'];
		scope.$digest();
		expect(scope.placeholders.length).toEqual(2);
	});

	it('we should have 1 image placeholder for images collection with two elements', function () {
		scope.images = ['fake element', 'fake element'];
		scope.$digest();
		expect(scope.placeholders.length).toEqual(1);

	});

	it('we should not have any image placeholder for images collection with elements amount equal to IMAGES_AMOUNT', function () {
		scope.images = ['fake element', 'fake element', 'fake element'];
		scope.$digest();
		expect(scope.placeholders.length).toEqual(0);
	});

	it('we should have 2 image placeholder for images collection with four element', function () {
		scope.images = ['fake element', 'fake element', 'fake element', 'fake element'];
		scope.$digest();
		expect(scope.placeholders.length).toEqual(2);
	});


});

describe('Image slider app: change pages', function () {
	var scope;
	var appCtrl;
	var httpBackend;


	beforeEach(module('app'));

	beforeEach(inject(function ($rootScope, $injector, $controller) {
		scope = $rootScope.$new();
		httpBackend = $injector.get('$httpBackend');

		httpBackend.when('POST', 'user/login').respond(200, {
			images: [],
			userName: 'testUser',
			userId: 'test',
			user: 'user'
		});

		appCtrl = $controller('appCtrl', {
			$scope: scope,
			// changePlaceholdersAmount: 'changePlaceholdersAmount'
		});
	}));

	it('we should stay on first page when try to go to the next page and have in images collection less or equal to' +
		' IMAGES_AMOUNT' +
		' (3)', function () {
		scope.images = ['fake element'];
		scope.$emit('slider:changePage');
		//scope.$digest();
		expect(scope.currentPage).toEqual(1);
	});

	it('we should stay on first page when try to go to the previous page and have in images collection less or equal' +
		' to IMAGES_AMOUNT (3)', function () {
		scope.images = ['fake element'];
		scope.$emit('slider:changePage', -1);
		//scope.$digest();
		expect(scope.currentPage).toEqual(1);
	});

	it('we should move to the second page from first page when try to go to the next page and have in images' +
		' collection more then 3 images', function () {
		scope.images = ['fake element', 'fake element', 'fake element', 'fake element'];
		scope.$emit('slider:changePage', 1);
		//scope.$digest();
		expect(scope.currentPage).toEqual(2);
	});

	it('we should move to the first page from second page when try to go to the next page and have in images' +
		' collection more then 3 and less then 7 images', function () {
		scope.images = ['fake element', 'fake element', 'fake element', 'fake element'];
		scope.$emit('slider:changePage', 1);
		scope.$emit('slider:changePage', 1);
		//scope.$digest();
		expect(scope.currentPage).toEqual(1);
	});

	/*
	 it('we should have 2 image placeholder for images collection with one element', function () {
	 scope.images = ['fake element'];
	 scope.$digest();
	 expect(scope.placeholders.length).toEqual(2);
	 });

	 it('we should have 1 image placeholder for images collection with two elements', function () {
	 scope.images = ['fake element', 'fake element'];
	 scope.$digest();
	 expect(scope.placeholders.length).toEqual(1);

	 });

	 it('we should not have any image placeholder for images collection with elements amount equal to IMAGES_AMOUNT', function () {
	 scope.images = ['fake element', 'fake element', 'fake element'];
	 scope.$digest();
	 expect(scope.placeholders.length).toEqual(0);
	 });

	 it('we should have 2 image placeholder for images collection with four element', function () {
	 scope.images = ['fake element', 'fake element', 'fake element', 'fake element'];
	 scope.$digest();
	 expect(scope.placeholders.length).toEqual(2);
	 });
	 */

});
