// Service for board
// Contributer: Jessica, Niki

angular.module('boardService', [])

.factory('Board', function($http) {

	// create a new object
	var boardFactory = {};

	/**
	* Get a single board
	* @param id, board id 
	* @return the board
	*/
	boardFactory.get = function(id) {
		return $http.get('/board/boards/validate/' + id);
	};

	/**
	* Create a single board
	* @return the new board
	*/
	boardFactory.create = function() {
		return $http.post('/board/boards/');
	};

	/**
	* Delete a single board
	* @param id, board id to delete
	* @return the message if sucessfull or not
	*/
	boardFactory.delete = function(id) {
		return $http.delete('/board/boards/' + id);
	};

	// return our entire boardFactory object
	return boardFactory;

});