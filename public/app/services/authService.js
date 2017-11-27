// Service for authentication
// Contributer: Jessica

angular.module('authService', [])

// ===================================================
// auth factory to login and get information
// inject $http for communicating with the API
// inject $q to return promise objects
// inject AuthToken to manage tokens
// ===================================================
.factory('Auth', function($http, $q, AuthToken) {

	// create auth factory object
	var authFactory = {};

	/**
	* Login a user
	* @param username
	* @param password
	* @return login data
	*/
	authFactory.login = function(username, password) {

		// return the promise object and its data
		return $http.post('/users/login', {
			username: username,
			password: password
		})
			.then(function(data) {
				AuthToken.setToken(data.data.token);
       			return data;
			});
	};

	/**
	* Register a user
	* @param username
	* @param password
	* @return registration data
	*/
	authFactory.register = function(username, password) {

		// return the promise object and its data
		return $http.post('/users/register', {
			username: username,
			password: password
		})
			.then(function(data) {
       			return data;
			});
	};

	/**
	* Logout a user
	* Log a user out by clearing the token
	*/
	authFactory.logout = function() {
		// clear the token
		return $http.post('users/logout/');
	};

	/**
	* Check if a user is logged in
	* Checks if there is a local token
	* @return boolean, true if user is logged in
	* false otherwise
	*/
	authFactory.isLoggedIn = function() {
		return $http.get('users/session/');
	};

	/**
	* Get the logged in user
	* @return current user's data if logged in, otherwise an unsucessfull message
	*/
	authFactory.getUser = function() {
		if (AuthToken.getToken())
			return $http.get('/api/me', { cache: true });
		else
			return $q.reject({ message: 'User has no token.' });		
	};

	// return auth factory object
	return authFactory;

})

// factory for handling tokens
// inject $window to store token client-side
.factory('AuthToken', function($window) {

	var authTokenFactory = {};

	/**
	* Get the token out of local storage
	* @return token
	*/
	authTokenFactory.getToken = function() {
		return $window.localStorage.getItem('token');
	};

	/**
	* function to set token or clear token
	* if a token is passed, set the token
	* if there is no token, clear it from local storage
	* @param token
	* @return authTokenFactory
	*/
	authTokenFactory.setToken = function(token) {
		if (token){
			$window.localStorage.setItem('token', token);
		}
	 	else {
			$window.localStorage.removeItem('token');
		}
	};

	return authTokenFactory;

})

// application configuration to integrate token into requests
.factory('AuthInterceptor', function($q, $location, AuthToken) {

	var interceptorFactory = {};

	/**
	* Happens on all HTTP requests
	* @param config
	* @return config
	*/
	interceptorFactory.request = function(config) {

		// grab the token
		var token = AuthToken.getToken();

		// if the token exists, add it to the header as x-access-token
		if (token) 
			config.headers['x-access-token'] = token;
		
		return config;
	};

	// happens on response errors
	interceptorFactory.responseError = function(response) {

		// if our server returns a 403 forbidden response
		if (response.status == 403) {
			AuthToken.setToken();
			$location.path('/login');
		}

		// return the errors from the server as a promise
		return $q.reject(response);
	};

	return interceptorFactory;
	
});