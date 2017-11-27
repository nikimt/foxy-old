// Service for ideas
// Contributer: Jessica, Niki

angular.module('ideaService', [])

.factory('idea', function($http) {

	// create a new object
	var ideaFactory = {};

	/**
	* Get all ideas
	* @return all ideas
	*/
	ideaFactory.all = function(id) {
		return $http.get('board/boards/' + id);
	};

	/**
	* Create a single idea
	* @param ideaData, the idea text
	* @return the new idea
	*/
	ideaFactory.create = function(id,ideaData) {
		return $http.post('/board/boards/' + id + '/ideas', ideaData);
	};

	/**
	* Upvote an idea
	* @param ideaId
	* @param boardId
	* @return the idea
	*/
	ideaFactory.upvote = function(boardId,ideaId){
		return $http.put('board/boards/' + boardId + '/ideas/' + ideaId + '/upvote');
	}

	/**
	* Un-upvote an idea
	* @param ideaId
	* @param boardId
	* @return the idea
	*/
	ideaFactory.unupvote = function(boardId,ideaId){
		return $http.delete('board/boards/' + boardId + '/ideas/' + ideaId + '/upvote');
	}

	/**
	* Flag an idea
	* @param ideaId
	* @param boardId
	* @return the idea
	*/
	ideaFactory.flag = function(boardId, ideaId){
		return $http.put('board/boards/' + boardId + '/ideas/' + ideaId + '/flag');
	}

	/**
	* Remove flag from an idea
	* @param ideaId
	* @param boardId
	* @return the idea
	*/
	ideaFactory.unflag = function(boardId, ideaId){
		return $http.delete('board/boards/' + boardId + '/ideas/' + ideaId + '/flag');
	}

	/**
	* Edit explanation of idea
	* @param ideaId
	* @param boardId
	* @param explanationContent
	* @return the explanation
	*/
	ideaFactory.explanation = function(boardId, ideaId, explanationContent){
		return $http.post('board/boards/' + boardId + '/ideas/' + ideaId + '/explanation', explanationContent);
	}

	/**
	* Create note
	* @param ideaId
	* @param boardId
	* @param noteContent
	* @return the note
	*/
	ideaFactory.createNote = function(boardId, ideaId, noteContent){
		return $http.post('board/boards/' + boardId + '/ideas/' + ideaId + '/notes', noteContent)
	}

	/**
	* Retrive notes associated with an idea
	* @param ideaId
	* @param boardId
	* @return the notes
	*/
	ideaFactory.getNotes = function(boardId, ideaId){
		return $http.get('board/boards/' + boardId + '/ideas/' + ideaId + '/notes');
	}

	/**
	* See whether user is logged in
	* @return true if user is logged in, false otherwise
	*/
	ideaFactory.isLoggedIn = function() {
		return $http.get('users/session/');
	};

	/**
	* Delete a single idea
	* @param id, idea
	* @return the message if sucessfull or not
	*/
	ideaFactory.delete = function(boardId, ideaId) {
		return $http.delete('board/boards/' + boardId + '/ideas/' + ideaId);
	}

	/** 
	* Get all the boards associated with a user
	* @return all boards
	*/
	ideaFactory.getBoards = function(){
		return $http.get('/users/boards/')
	}

	/**
	* Save a board
	* @param boardId, board id of the board
	* @return board saved
	*/
	ideaFactory.saveUserBoard = function(boardId){
		return $http.put('/users/boards/' + boardId)
	};

	/**
	* Retrieves the permissions level of a user
	* @param boardId
	* @return true if the user is the moderator of this board, otherwise false
	*/
	ideaFactory.isModerator = function(boardId){
		return $http.get('/board/boards/' + boardId + '/moderator');
	};

	/**
	* Retrieves the owner of an idea.
	* @param boardId
	* @return true if the user is the owner of this idea, otherwise false
	*/
	ideaFactory.isOwner = function(boardId, ideaId){
		return $http.get('/board/boards/' + boardId + '/ideas/' + ideaId + '/owner');
	};

	// return our entire ideaFactory object
	return ideaFactory;

});