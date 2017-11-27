// MongoDB data model for Idea
//
// Main author: mslaught

var mongoose = require('mongoose')

// Model for storing idea objects. Ideas are shared by users
// on boards.
//
// Ideas have the following attributes:
//   boardId: String, boardId of board this idea is shared to
//   creatorId: String, userId of user who created this idea
//   content: String, content of the idea
//   meta: Object, meta data associated with the idea
//      upvotes: Object, upvote meta data
//          upvote_count: Number, number of upvotes for an idea
//          users: Array, array of userIds of users who have upvoted
//              this idea
//      flag: Boolean, represents if the idea has been flagged
//   date: Date, time the idea was created
var ideaSchema = new mongoose.Schema({
    boardId: {
        type: String,
        required: [true, 'Needs to be associated with a board']
    },
    creatorId: {
        type: String,
        required: [true, 'Needs to be associated with a creator']
    },
    content: { 
        type: String,
        required: [true, 'Needs Content']
    },
    explanation: {
        type: String,
    },
    meta: {
        upvotes: {
            upvote_count: {
                type: Number,
                default: 0,
                min: [0, 'No negative upvote counts'],
                required: [true, 'Must have an upvote value, defaults to 0']
            },
            users: {
                type: [String],
                default: []
            }
        },
        flag: {
            type: Boolean,
            default: false,
            required: [true, 'Must have a flag value, defaults to false']
        }
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
});

// -------- Validators --------
var max_content_len = 15;
var min_content_len = 1;

var max_explanation_len = 10000;
var min_explanation_len = 1;

ideaSchema.path("content").validate(function(value) {
    // This validates that the length of content is between min_content_len
    // and max_content_len

    return (value.length >= min_content_len) && (value.length <= max_content_len);
}, "Invalid Content length");

ideaSchema.path("explanation").validate(function(value) {
    // This validates that the length of explanation is between min_content_len
    // and max_content_len

    return (value.length >= min_explanation_len) && (value.length <= max_explanation_len);
}, "Invalid Explanation length");

ideaSchema.path("boardId").validate(function(value) {
    // This validates that the length of content is equal to 6
    return (value.length == 6);
}, "Invalid boardId length");


var ideaModel = mongoose.model('Idea', ideaSchema);

var Ideas = (function(ideaModel) {

    var that = {};

    // Exposed function that takes an idea and a callback.
    // Expects the idea in the form of:
    //   {'content': 'someContent',
    //    'boardId': 'boardId',
    //    'creatorId': 'userId'}
    //
    // If the idea has an appropriate content length, we
    // allow it to be put in the _store, (with the addition
    // of a UUID and Date()). If not, we send an error message
    // back to the router, reminding the user of the character limit.
    that.addIdea = function(idea, callback) {
        if (idea.content.length <= max_content_len) {
            if (idea.explanation) {
                var idea = new ideaModel({
                    content: idea.content,
                    boardId: idea.boardId,
                    creatorId: idea.creatorId,
                    explanation: idea.explanation
                });
            } else {
                var idea = new ideaModel({
                    content: idea.content,
                    boardId: idea.boardId,
                    creatorId: idea.creatorId
                });
            }

            idea.save(function(err, newIdea) {
                if (err) {
                    callback({ msg: err });
                } else {
                    callback(null, newIdea);
                }
            });
        } else {
            callback({ msg: 'Limit ideas to ' + max_content_len + 'characters!'});
        }
    }

    // Exposed function that takes an ideaId (as a string) and
    // a callback.
    //
    // Returns an idea if the idea exists, otherwise an error.
    that.findIdea = function(ideaId, callback) {
        ideaModel.findOne({ _id: ideaId }, function(err, result) {
            if (err) {
                callback({ msg: err });
            } else if (result !== null) {
                callback(null, result);
            } else {
                callback({ msg: 'No such idea!' });
            }
        });
    }

    // Exposed function that takes an array of ideaIds (as strings) and
    // a callback.
    //
    // Returns an array of ideas if the ideaIds exist, otherwise an error.
    that.findIdeasByIds = function(ideaIds, callback) {
        ideaModel.find({ _id: { $in: ideaIds } }, function(err, result) {
            if (err) callback({ msg: err });
            if (result !== null) {
                callback(null, result);
            } else {
                callback({ msg: 'No such ideas!' });
            }
        });
    }

    // Exposed function that takes a boardId (as a string) and 
    // a callback.
    //
    // If there are ideas associated with the boardId, returns
    // an array of idea objects, otherwise an error.
    that.findIdeasByBoard = function(boardId, callback) {
        ideaModel.find({ boardId: boardId }).sort('-date').exec(function(err, result) {
            if (err) callback(err, { msg: err });
            if (result.length > 0) {
                callback(null, result);
            } else {
                callback(null,result)
            }
        });
    }

    // Exposed function that takes an ideaId and a callback.
    //
    // If the ideaId exists, we delete the idea corresponding to
    // that Id in the _store. Otherwise, we return an error.
    that.removeIdea = function(ideaId, callback) {
        ideaModel.findOne({ _id: ideaId }, function(err, result) {
            if (err) callback({ msg: err });
            if (result !== null) {
                result.remove();
                callback(null);
            } else {
                callback({ msg: 'No such idea!'});
            }
        });
    }

    // Exposed function that takes an array of ideaIds and a callback.
    //
    // If the ideaIds exist, we delete the ideas corresponding to
    // those Ids in the _store. Otherwise, we return an error.
    that.removeIdeasByIds = function(ideaIds, callback) {
        ideaModel.remove({ _id: { $in: ideaIds } }, function(err, result) {
            if (err) callback({ msg: err });
            if (result !== null) {
                callback(null);
            } else {
                callback({ msg: 'No such idea!'});
            }
        });
    }

    // Exposed function that takes an ideaId, a userId, and a callback.
    // A user can only upvote an idea at most once.
    //
    // If the ideaId exists, we increment the upvote count of the idea 
    // corresponding to that Id in the _store by +1. Otherwise, we return
    // an error.
    that.addUpvoteToIdea = function(ideaId, userId, callback) {
        ideaModel.findOne({ _id: ideaId }, function(err, idea) {
            if (err) callback({ msg: err });

            var upvote_users = idea.meta.upvotes.users;
            if (upvote_users.indexOf(userId) != -1) {
                // User has already upvoted this idea
                callback({ msg: "user has already upvoted" });
            } else {
                ideaModel.update({ _id: ideaId },
                    { $inc: { "meta.upvotes.upvote_count": 1 },
                      $push: { "meta.upvotes.users": userId } }, function(err, result) {
                        if (err) callback({ msg: err });
                        callback(null);
                });
            }
        });
    }

    // Exposed function that takes an ideaId and a callback. A user can
    // only remove an upvote from an idea that they have already upvoted.
    //
    // If the ideaId exists, we increment the upvote count of the idea 
    // corresponding to that Id in the _store by -1. Otherwise, we return
    // an error.
    that.removeUpvoteFromIdea = function(ideaId, userId, callback) {
        ideaModel.findOne({ _id: ideaId }, function(err, idea) {
            if (err) callback({ msg: err });

            var upvote_users = idea.meta.upvotes.users;
            if (upvote_users.indexOf(userId) != -1) {
                // User has upvoted this idea
                ideaModel.update({ _id: ideaId },
                    { $inc: { "meta.upvotes.upvote_count": -1 },
                      $pull: { "meta.upvotes.users": userId } }, function(err, result) {
                        if (err) callback({ msg: err });
                        callback(null);
                });
            } else {
                callback({ msg: "user has not upvoted" });
            }
        });
    }

    // Exposed function that takes an ideaId and a callback.
    //
    // If the ideaId exists, we set the flagged field of the idea 
    // corresponding to that Id to false in the _store. Otherwise, we return
    // an error.
    that.unflagIdea = function(ideaId, callback) {
        ideaModel.update({ _id: ideaId }, {"meta.flag": false}, function(err, result) {
            if (err) {
                callback({ msg: err });
            } else {
                callback(null);
            }
        });
    }

    // Exposed function that takes an ideaId and a callback.
    //
    // If the ideaId exists, we set the flagged field of the idea 
    // corresponding to that Id to true in the _store. Otherwise, we return
    // an error.
    that.flagIdea = function(ideaId, callback) {
        ideaModel.update({ _id: ideaId }, {"meta.flag": true}, function(err, result) {
            if (err) {
                callback({ msg: err });
            } else {
                callback(null);
            }
        });
    }

    // Exposed function that takes an ideaId (as a string), an explanation, and
    // a callback.
    //
    // Updates the explanation of the idea with ideaId to explanation.
    that.updateIdeaExplanation = function(ideaId, explanation, callback) {
        ideaModel.update({ _id: ideaId }, { $set: { explanation: explanation } },
            function(err, result) {
                if (err) { callback({ ms: err }); }
                else { callback(null) }
        });
    }

    Object.freeze(that);
    return that;

})(ideaModel);

module.exports = Ideas;

