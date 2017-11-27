// Helper that abstracts some of the model operations that require
// interactions with multiple models. 
// For example, creating an idea involves both the idea model
// (to create a new idea) and the board model (to update the 
// board's idea list).
//
// Main author: mslaught

var boards = require('../models/board.js');
var ideas = require('../models/idea.js');
var notes = require('../models/note.js');
var users = require('../models/user.js');

var ModelHelper = function() {
    var that = {};

    // Unexposed function that removes an idea from the datastore
    // and removes the idea id from the associated board.
    var removeIdea = function(boardId, ideaId, callback) {
        ideas.removeIdea(ideaId, function(err) {
            if (err) { callback(err); }
            else {
                boards.removeIdeaFromBoard(boardId, ideaId, callback);
            }
        });
    }

    // Exposed function that takes a boardId (as a string) and 
    // a callback.
    //
    // If there are ideas associated with the boardId, returns
    // an array of idea object ids, otherwise an error.
    that.getBoardIdeas = function(boardId, callback) {
        boards.getBoardIdeaIds(boardId, function(err, ideaIds) {
            if (err) { callback({ msg: err }); }
            else {
                ideas.findIdeasByIds(ideaIds, callback);
            }
        });
    }

    // Exposed function that takes a boardId, an idea, and a callback.
    // Expects idea in the form:
    //   {'content': 'someContent',
    //    'boardId': 'boardId',
    //    'creator': 'userId'}
    //
    // We put the idea in the _store, (with the addition
    // of a UUID and Date()) and add the ideaId to the board ideas. 
    // If error, we send an error message back to the router.
    that.addIdeaToBoard = function(boardId, idea, callback) {
        ideas.addIdea(idea, function(err, result) {
            if (err) { callback({ msg: err }); }
            else {
                boards.addIdeaToBoard(boardId, result._id, callback);
            }
        });
    }

    // Exposed function that takes a boardId, an ideaId, a userId, and a 
    // callback. An idea can only be deleted by the user who created it,
    // or by the moderator of the board.
    //
    // We delete the idea from the _store, (with the addition
    // of a UUID and Date()) and remove the ideaId from the board ideas. 
    // If error, we send an error message back to the router.
    that.deleteIdea = function(boardId, ideaId, userId, callback) {
        ideas.findIdea(ideaId, function(err, idea) {
            if (err) { callback({ msg: err }); }
            else {
                boards.findBoard(boardId, function(err, board) {
                    if (err) {
                        callback({ msg: err });
                    } else if (idea.creatorId != userId 
                        && board.moderator != userId) {
                        callback({ msg: err, msgToUser: "Only moderators can delete ideas. You are not a moderator of this board." });
                    } else {
                        removeIdea(boardId, ideaId, callback);
                    }
                });
            }
        });
    }

    // Exposed function that takes an ideaId and a callback.
    //
    // If the ideaId exists, we flag the idea corresponding
    // to that Id in the _store. Otherwise, we return an error.
    that.flagIdea = function(ideaId, callback) {
        ideas.flagIdea(ideaId, callback);
    }

    // Exposed function that takes an ideaId, a userId, and a callback.
    // An idea can only be deflagged by the moderator of the board.
    that.unflagIdea = function(boardId, ideaId, userId, callback) {
        boards.findBoard(boardId, function(err, board) {
            if (err) { callback({ msg: err }); }
            else if (board.moderator == userId) {
                ideas.unflagIdea(ideaId, callback);
            } else {
                callback({ msg: "user not the moderator of the board", msgToUser: "Only moderators of a board can unflag an idea. You are not a moderator of this board" });
            }
        });
    }

    // Exposed function that takes an ideaId, a userId, an explanation,
    // and a callback. An explanation can only be updated by the user 
    // who created it or the moderator of the board.
    that.updateIdeaExplanation = function(ideaId, userId, explanation, callback) {
        ideas.findIdea(ideaId, function(err, idea) {
            if (err) { callback({ msg: err }); }
            else {
                boards.findBoard(boardId, function(err, board) {
                    if (err) {
                        callback({ msg: err });
                    } else if (idea.creatorId != userId 
                        && board.moderator != userId) {
                        callback({ msg: "user not the moderator or owner of the idea" });
                    } else {
                        ideas.updateIdeaExplanation(ideaId, explanation, callback);
                    }
                });
            }
        });
    }

    // Exposed function that takes an ideaId, a userId, and a callback.
    // Notes can only be accessed by the owner of the note.
    that.findNotesByIdea = function(ideaId, userId, callback) {
        notes.findNotesByIdea(ideaId, function(err, notes) {
            if (err) { callback({ msg: err }); }
            else {
                var filteredNotes = notes.filter(function(note) {
                    return note.creatorId == userId;
                });
                console.log(filteredNotes)
                callback(null, filteredNotes);
            }
        });
    }

    // Exposed function that takes an ideaId, a userId, and a callback.
    // Notes can only be accessed by the owner of the note.
    that.saveBoardToUser = function(userId, boardId, callback) {
        boards.findBoard(boardId, function(err, board) {
            if (err) { callback({ msg: err }); }
            else if (board.moderator != userId) {
                callback({ msg: "user not the moderator of the board"});
            } else {
                users.addBoardToUser(userId, boardId, callback);
            }
        });
    }

    Object.freeze(that);
    return that;
}()

module.exports = ModelHelper;
