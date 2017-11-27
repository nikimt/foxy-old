// MongoDB data model for Note
//
// Main author: mslaught

var mongoose = require('mongoose');

// Model for storing note objects. Notes are used by users
// to jot down notes about their ideas.
//
// Notes have the following attributes:
//   ideaId: String, ideaId of the idea this note is associated with
//   creatorId: String, userId of user who created the note
//   content: String, content of note
//   date: Date, time the note was created
var noteSchema = new mongoose.Schema({
    ideaId: {
        type: String,
        required: [true, 'Needs to be associated with an idea']
    },
    creatorId: { 
        type: String,
        required: [true, 'Needs to be associated with a creator']
    },
    content: {
        type: String,
        required: [true, 'Needs Content']
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
});

// -------- Validators --------
var min_content_len = 1;

noteSchema.path("content").validate(function(value) {
    // This validates that the length of content is at least min_content_len
    return (value.length >= min_content_len);
}, "Invalid Content length");

var noteModel = mongoose.model('note', noteSchema);

var Notes = (function(noteModel) {
    var that = {};

    // Exposed function that takes a note and a callback.
    // Expects the note in the form of:
    //   {'content': 'someContent',
    //    'ideaId': 'ideaId',
    //    'creatorId': 'userId'}
    //
    // Put the note in the _store, (with the addition
    // of a UUID and Date()).
    that.addNote = function(note, callback) {
        var note = new noteModel({
            content: note.content,
            ideaId: note.ideaId,
            creatorId: note.creatorId
        });

        note.save(function(err, newNote) {
            if (err) {
                callback(err,null)
            } else {
                callback(null, newNote)
            }
        });
    }

    // Exposed function that takes a noteId and a callback.
    //
    // Returns a note if the note exists, otherwise an error.
    that.findNote = function(noteId, callback) {
        noteModel.findOne({ _id: noteId }, function(err, result) {
            if (err) callback({ msg: err });
            if (result !== null) {
                callback(null, result);
            } else {
                callback({ msg: 'No such note' });
            }
        });
    }

    // Exposed function that takes an array of noteIds and a callback.
    //
    // Returns an array of notes if the noteIds exists, otherwise an error.
    that.findNotesByIds = function(noteIds, callback) {
        noteModel.find({ _id: { $in: noteIds } }, function(err, result) {
            if (err) callback({ msg: err });
            if (result !== null) {
                callback(null, result);
            } else {
                callback({ msg: 'No such notes' });
            }
        });
    }

    // Exposed function that takes an ideaId and a callback.
    //
    // Returns an array of notes associated with the ideaId, otherwise an error.
    that.findNotesByIdea = function(ideaId, callback) {
        noteModel.find({ ideaId: ideaId }).sort('-date').exec(function(err, result) {
            if (err) callback({ msg: err });
            if (result.length > 0) {
                callback(null, result);
            } else {
                callback(null, result);
            }
        });
    }

    // Exposed function that takes a noteId and a callback.
    //
    // If the noteId exists, we delete the note corresponding to
    // that Id in the _store. Otherwise, we return an error.
    that.removeNote = function(noteId, callback) {
        noteModel.findOne({ _id: noteId }, function(err, result) {
            if (err) callback({ msg: err });
            if (result !== null) {
                result.remove();
                callback(null);
            } else {
                callback({ msg: 'No such notes' });
            }
        });
    }

    // Exposed function that takes an array of noteIds and a callback.
    //
    // If the noteIds exist, we delete the notes corresponding to
    // those Ids in the _store. Otherwise, we return an error.
    that.removeNotesByIds = function(noteIds, callback) {
        noteModel.remove({ _id: { $in: noteIds } }, function(err, result) {
            if (err) callback({ msg: err });
            if (result !== null) {
                callback(null);
            } else {
                callback({ msg: 'No such notes'});
            }
        });
    }

    Object.freeze(that);
    return that;

})(noteModel);

module.exports = Notes;

