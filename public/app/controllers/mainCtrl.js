// Main angular controller
// Contributer: Jessica, Niki

angular.module('mainCtrl', [])

.controller('mainController', function($rootScope, $location, Auth) {

	var vm = this;

	vm.submitted = false;

	// get info if a person is logged in
	Auth.isLoggedIn()
		.then(function(data){
			vm.loggedIn = data.data.loggedIn
			if(vm.loggedIn) vm.username = data.data.user.name
		})

	// check to see if a user is logged in on every request
	$rootScope.$on('$routeChangeStart', function() {
		vm.currentPath = $location.path()
		vm.onBoardPage = vm.currentPath.substring(0,8) === '/boards/'
		Auth.isLoggedIn()
			.then(function(data){
				vm.loggedIn = data.data.loggedIn
				if(vm.loggedIn) vm.username = data.data.user.name
		})	

		// get user information on page load
		Auth.getUser()
			.then(function(data) {
				vm.user = data.data;
			});	
	});

	vm.canSubmit = function(valid) {
		vm.submitted = true;
		return valid;
	}

	/**
	* Handles login form
	*/
	vm.doLogin = function() {

		vm.processing = true;

		// clear the error
		vm.error = '';

		Auth.login(vm.loginData.username, vm.loginData.password)
			.then(function(data) {
				vm.processing = false;		

				// if a user successfully logs in, redirect to home page
				if (data.data.success) {	
					$location.path('/');
				} else {
					vm.error = data.data.message;
				}
				
			});
	};

	/**
	* Handles registration form
	*/
	vm.doRegister = function() {

		vm.processing = true;

		// clear the error
		vm.error = '';

		Auth.register(vm.registerData.username, vm.registerData.password)
			.then(function(data) {
				vm.processing = false;	

				// if a user successfully logs in, redirect to home page
				if (data.data.success) {		
					$location.path('/');
				}	
				else {
					vm.error = data.data.message
				}				
			});
	};

	/**
	* Handles logout 
	*/
	vm.doLogout = function() {
		Auth.logout();
		vm.username = '';
		vm.loggedIn = false;
		
		$location.path('/');
	};

});
