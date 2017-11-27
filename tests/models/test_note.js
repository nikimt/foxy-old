// Tests for the Notes model
//
// Main author: mslaught

var mongoose = require("mongoose");

var should = require('chai').should();
var expect = require('chai').expect;

var notes = require('../../app/models/note.js');

describe('Notes Model Tests', function() {
    
    // Holds a board to use in each test
    var currentNote = null;

    // Constants
    var userId = '0';
    var ideaId = '1';

    var verifyNote = function(doc) {
        doc.content.should.equal('test');
        doc.ideaId.should.equal(ideaId);
        doc.creatorId.should.equal(userId);
    }

    // Create an idea before each test
    beforeEach(function(done) {
        var noteInfo = {
            'content': 'test',
            'ideaId': ideaId,
            'creatorId': userId,
        }
        notes.addNote(noteInfo, function(err, noteDoc) {
            currentNote = noteDoc;
            done();
        });
    });

    // Drop notes collection between tests
    afterEach(function(done) {
        mongoose.connection.collections['notes'].drop( function(err) {
            done();
        });
    });

    describe ('Create', function() {
        it ('creates a new note', function(done) {
            var noteInfo = {
                'content': 'test',
                'ideaId': ideaId,
                'creatorId': userId,
            }
            notes.addNote(noteInfo, function(err, doc) {
                verifyNote(doc);

                done();
            });
        });

        it ('does not create a new note with empty content', function(done) {
            var noteInfo = {
                'content': '',
                'ideaId': ideaId,
                'creatorId': userId,
            }
            notes.addNote(noteInfo, function(err, doc) {
                expect(err).to.not.be.null;
                
                done();
            });
        });
    });

    it ('finds a note', function(done) {
        notes.findNote(currentNote._id, function(err, doc) {
            verifyNote(doc);
            
            done();
        });
    });

    it ('finds notes by ids', function(done) {
        notes.findNotesByIds([currentNote._id], function(err, docs) {
            expect(docs).length.to.be(1);

            verifyNote(docs[0]);
            
            done();
        });
    });

    it ('finds notes by idea', function(done) {
        notes.findNotesByIdea(currentNote.ideaId, function(err, docs) {
            expect(docs).length.to.be(1);

            verifyNote(docs[0]);
            
            done();
        });
    });

    it ('removes a note', function(done) {
        notes.removeNote(currentNote._id, function(err) {
            notes.findNote(currentNote._id, function(err, doc) {
                expect(err).to.not.be.null;
                err.msg.should.equal('No such note');

                done();
            }); 
        });
    });

    it ('removes notes by ids', function(done) {
        notes.removeNotesByIds([currentNote._id], function(err) {
            notes.findNote(currentNote._id, function(err, doc) {
                expect(err).to.not.be.null;
                err.msg.should.equal('No such note');

                done();
            });
        });
    });
});
