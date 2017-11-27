// Controller for users
// Contributer: Jessica, Niki

angular.module('userCtrl', ['userService'])

.controller('userController', function($scope, user, $routeParams, $location) {

	var vm = this;

	// set a processing variable to show loading things
	vm.processing = true;

	// grab all the boards at page load
	user.all()
		.then(function(data) {

			// when all the ideas come back, remove the processing variable
			vm.processing = false;

			// bind the ideas that come back to vm.ideas
			vm.boards = data.data.boards;
		});

});
