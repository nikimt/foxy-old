// Service for users
// Contributer: Jessica, Niki

angular.module('userService', [])

.factory('user', function($http) {

	// create a new object
	var userFactory = {};

	/**
	* Get all boards associated with a user
	* @return all boards
	*/
	userFactory.all = function() {
		return $http.get('users/boards/');
	};

	// return our entire userFactory object
	return userFactory;

});