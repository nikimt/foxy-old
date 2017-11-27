// Controller for board
// Contributer: Jessica, Niki

angular.module('boardCtrl', ['boardService'])

// controller applied to board creation page
.controller('boardCreateController', function($location, Board) {
	
	var vm = this;

	vm.create = false;
	vm.join = false;
	vm.either = (vm.create || vm.join);
	vm.homepage = true;
	vm.successfulCode = true;

	/**
	* Create a board
	*/
	vm.createBoard = function(){

		vm.create = true;
		vm.join = false;
		vm.either = (vm.create || vm.join);

		Board.create().then(function(data){
			vm.boardCode = data.data.id;
		});
	};

	/**
	* Join an existing board
	*/
	vm.joinBoard = function(){
		vm.join = true;
		vm.create = false;
		vm.either = (vm.create || vm.join);
	}

	/**
	* Retrieve a board
	*/
	vm.getBoard = function() {
		Board.get(vm.boardData)
			.error(function(data) {
				vm.successfulCode = false;
			})
			.then(function(data) {
				vm.success = data.data.success;
				if(vm.success){
					var boardCode = data.data.board.boardId;
					$location.path('/boards/' + boardCode);
				} else {
					vm.successfulCode = false;
				}
			});		
	};

	vm.reset = function(){
		vm.create = false;
		vm.join = false;
		vm.either = (vm.create || vm.join);
	}

});