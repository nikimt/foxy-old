// Controller for ideas
// Contributer: Jessica, Niki

angular.module('ideaCtrl', ['ideaService'])

.controller('ideaController', function($scope, idea, $routeParams, $location) {

	var vm = this;

	// set a processing variable to show loading things
	vm.processing = true;
	vm.boardId = $routeParams.board_id
	vm.submitted = false;

	// grab all the ideas at page load
	idea.all($routeParams.board_id)
		.then(function(data) {

			// when all the ideas come back, remove the processing variable
			vm.processing = false;

			// bind the ideas that come back to vm.ideas
			vm.ideas = data.data.data.ideas;
		});

	/**
	* Delete an idea
	* @param id, id of the idea to delete
	*/
	vm.deleteidea = function(id) {

		vm.processing = true;

		idea.delete(id)
			.then(function(data) {

				// get all ideas to update the table
				idea.all()
					.then(function(data) {
						vm.processing = false;
						vm.ideas = data.data;
					});

			});
	};

	vm.canSubmit = function(valid) {
		vm.submitted = true;
		return valid;
	}

	/**
	* Save an idea
	*/
	vm.saveIdea = function() {
		vm.processing = true;
		vm.message = '';

		// use the create function in the ideaservice
		idea.create($routeParams.board_id, vm.ideaData)
			.success(function (data) {
				console.log(data)
			    $location.path('/boards/' + $routeParams.board_id);
			});
	};
});
