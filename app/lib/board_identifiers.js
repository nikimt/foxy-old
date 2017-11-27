/* Methods for identifying anonymous users based on their requests. 
   Main author: epw */

var express = require('express');
var session = require('express-session');
var boards = require('../models/board.js');

var BoardIdentifier = (function(){
    
    var that = {};

    /** 
    * Ensures that a user has a unique, anonymous identifier for each board they contribute to.
    * This allows ideas, upvotes, and flags to be tied to a specific client.
    *
    * @param {Object} req - express request object of the relevant client
    * @param {String} boardId - the unique identifier for the board
    * @param {String} value (optional) - the desired value for the identifier
    */
    that.setSessionIdentifier = function(req, boardId, value){
        if (req.session.identifiers == null){ // ensure identifiers object exists
            req.session.identifiers = {};
        }
        if (req.session.identifiers[boardId] == null){ // set session identifier if it is absent
            if (value){
                req.session.identifiers[boardId] = value;
            }
            else if (req.session.user){ // if user is logged in, use their unique id
                req.session.identifiers[boardId] = req.session.user.id;
            }
            else{ // if user is anonymous, need a different unique id
                boards.incrementBoardUserCount(boardId, function(err, count){
                    if (err){ // set a random identifier to prioritize responsiveness in the case of error
                        req.session.identifiers[boardId] = 1000000 + Math.floor(Math.random()*999999999);
                    }
                    else{ // if no database error, returns a guaranteed-unique anonymous identifier
                        req.session.identifiers[boardId] = count;
                    }
                });
            }
        }
    }
    
    /**
    * Retrieves the requesting client's unique anonymous identifier for a given board.
    *
    * @param {Object} req - express request object of the relevant client
    * @param {String} boardId - the unique identifier for the board
    * @return {String} - the client's unique identifier
    */
    that.getIdentifierFromRequest = function(req, boardId){
      that.setSessionIdentifier(req, boardId);
      return req.session.identifiers[boardId];
    }
    
    Object.freeze(that);
    return that;
})();

module.exports = BoardIdentifier;