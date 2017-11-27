// MongoDB data model for Board
//
// Main author: mslaught

var mongoose = require('mongoose');
var codeGenerator = require('../lib/board_code.js');

// Model for storing board objects. Boards are used by users
// to share ideas.
//
// Boards have the following attributes:
//   boardId: String, unique secret code for the board
//   name: String, human readable name for the board
//   moderator: String, userId of user who created the board
//   ideas: Array, array of ideaIds associated with the board
//   date: Date, time the board was created
var boardSchema = new mongoose.Schema({
    boardId: {
        type: String,
        unique: true,
        required: [true, 'Board needs a secret code']
    },
    name: {
        type: String,
        required: [true, 'Board needs a name']
    },
    moderator: { 
        type: String,
        required: [true, 'Needs a moderator']
    },
    ideas: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Idea',
        default: []
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
    anonymousUserCount: {
        type: Number,
        default: 0
    }
});

// -------- Validators --------
boardSchema.path("boardId").validate(function(value) {
    // This validates that the length of content is between min_content_len
    // and max_content_len
    return (value.length >= 0) && (value.length <= 6);
}, "Invalid boardId length");

var boardModel = mongoose.model('board', boardSchema);

var Boards = (function(boardModel) {

    var that = {};
    
    /* Unexposed function that generates a unique board code. */
    var getUniqueCode = function(callback){
        var code = codeGenerator.getCode();
        boardModel.findOne({boardId: code}, function(err, result){
            if (err){
                callback(err, null);
            }
            else if (result !== null){
                getUniqueCode(callback);
            }
            else{
                callback(null, code);
            }
        });
    }

    // Exposed function that takes boardInfo and a callback.
    // Expects the boardInfo in the form of:
    //   {'moderator': 'userId'}
    // Optionally also has {'name': 'board name'}, otherwise
    // name is defaulted to the boardId.
    //
    // We put the board in the _store, (with the addition
    // of a UUID and Date()). If error, we send an error message
    // back to the router.
    that.addBoard = function(boardInfo, callback) {
        getUniqueCode(function(err, boardId){
            if (err){
                callback(err, {msg: err});
            }
            else{
                var name = boardId;
                if ('name' in boardInfo) {
                    name = boardInfo.name;
                }
                var board = new boardModel({
                    moderator: boardInfo.moderator,
                    boardId: boardId,
                    name: name,
                });
                board.save(function(err, newboard) {
                    if (err){
                        callback(err, {msg: err});
                    }
                    else{
                        callback(null, newboard);
                    }
                });
            }
        });
    }

    // Exposed function that takes a boardId (as a string), a boardName, and
    // a callback.
    //
    // Updates the name of the board with boardId to boardName.
    that.updateBoardName = function(boardId, boardName, callback) {
        boardModel.update({ boardId: boardId }, { $set: { name: boardName } },
            function(err, result) {
                if (err) { callback({ msg: err }); }
                else { callback(null); }
        });
    }

    // Exposed function that takes an boardId (as a string) and
    // a callback.
    //
    // Returns an board if the board exists, otherwise an error.
    that.findBoard = function(boardId, callback) {
        boardModel.findOne({ boardId: boardId }, function(err, result) {
            if (err) {
                callback(err,null);
            }
            else if (result !== null) {
                callback(null, result);
            } else {
                callback(err,null);
            }
        });
    }

    // Exposed function that takes a boardId (as a string) and 
    // a callback.
    //
    // If there are boards associated with the moderatorId, returns
    // an array of board objects, otherwise an error.
    that.findBoardsByModerator = function(moderatorId, callback) {
        boardModel.find({ moderator: moderatorId }).sort('-date').exec(function(err, result) {
            if (err) { callback({ msg: err }); }
            else if (result.length > 0) {
                callback(null, result);
            } else {
                callback({ msg: 'No such boards!'})
            }
        });
    }

    // Exposed function that takes a boardId (as a string) and 
    // a callback.
    //
    // If there are ideas associated with the boardId, returns
    // an array of idea object ids, otherwise an error.
    that.getBoardIdeaIds = function(boardId, callback) {
        boardModel.findOne({ boardId: boardId }, function(err, result) {
            if (err) {
                callback({ msg: err });
            }
            if (result !== null) {
                callback(null, result.ideas);
            } else {
                callback({ msg: 'No such board!' });
            }
        });
    }

    // Exposed function that takes a boardId, an ideaId, and a callback.
    //
    // We put the board in the _store, (with the addition
    // of a UUID and Date()). If error, we send an error message
    // back to the router.
    that.addIdeaToBoard = function(boardId, ideaId, callback) {
        boardModel.findOne({ boardId: boardId }, function(err, result) {
            if (err) { callback(err, { msg: err }); }
            else {
                var ideas = result.ideas
            
                // Check for duplicates
                if (ideas.indexOf(ideaId) != -1) {
                    callback(null);
                } else {
                    boardModel.update({ boardId: boardId },
                        { $push: { "ideas": ideaId } }, function(err, result) {
                            if (err) { callback(err, { msg: err }) }
                            else {
                                callback(null);
                            }
                    });
                }
            }
        });
    }

    // Exposed function that takes a boardId, an ideaId, and a callback.
    //
    // We remove the ideaId from the board and from the idea collection. 
    // If error, we send an error message back to the router.
    that.removeIdeaFromBoard = function(boardId, ideaId, callback) {
        boardModel.update({ boardId: boardId },
            { $pull: { "ideas": ideaId } }, function(err, result) {
                if (err) {
                    callback(err, { msg: err });
                } else {
                    callback(null);
                }
        });
    }

    // Exposed function that takes an boardId and a callback.
    //
    // If the boardId exists, we delete the board corresponding to
    // that Id in the _store. Otherwise, we return an error.
    // We also delete all ideas associated with the board because
    // those ideas only exist within the context of the board.
    that.removeBoard = function(boardId, callback) {
        boardModel.findOne({ boardId: boardId }, function(err, result) {
            if (err) callback({ msg: err });
            if (result !== null) {
                result.remove();
                callback(null);
            } else {
                callback({ msg: 'No such board!'});
            }
        });
    }
    
    // Exposed function that takes a boardId and a callback.
    //
    // If the boardId exists, the board's anonymousUserCount property increases
    // by one and the callback is passed the updated count. Otherwise, we
    // return an error.
    that.incrementBoardUserCount = function(boardId, callback){
        boardModel.findOne({boardId: boardId}, function(err, result){
            if (err){
                callback(err, null);
            }
            else if (result){
                result.update({$inc: {anonymousUserCount: 1}}, function(err, count){
                    if (err) {
                        callback(err, null);
                    }
                    else {
                        callback(null, result.anonymousUserCount);
                    }
                });
            }
            else{
                callback({msg: 'No such board!'}, null);
            }
        });
    }

    Object.freeze(that);
    return that;

})(boardModel);

module.exports = Boards;

