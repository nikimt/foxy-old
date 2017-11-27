// Tests for the Board model
//
// Main author: mslaught

var mongoose = require("mongoose");

var should = require('chai').should();
var expect = require('chai').expect;

var boards = require('../../app/models/board.js');
var ideas = require('../../app/models/idea.js');


describe('Board Model Tests', function() {
    
    // Holds a board to use in each test
    var currentBoard = null;
    var currentIdea = null;

    // Constants
    var moderatorId = '0';

    beforeEach(function(done) {
        boards.addBoard({ 'moderator': moderatorId }, function(err, boardDoc) {
            currentBoard = boardDoc;

            var ideaInfo = {
                'content': 'test idea',
                'boardId': boardDoc.boardId,
                'creatorId': moderatorId,
            }
            ideas.addIdea(ideaInfo, function(err, ideaDoc) {
                currentIdea = ideaDoc;
                done();
            });
        });
    });

    // Drop boards and ideas collection between tests
    afterEach(function(done) {
        mongoose.connection.collections['boards'].drop( function(err) {
            mongoose.connection.collections['ideas'].drop( function(err) {
                done();
            });
        });
    });

    describe ('Creates a new board', function() {

        it ('with no name', function(done) {
            boards.addBoard({ 'moderator': moderatorId }, function(err, doc) {
                doc.moderator.should.equal(moderatorId);
                
                expect(doc.ideas).to.have.length(0);
                expect(doc.boardId).to.have.length(6);
                expect(doc.name).to.have.length(6);
                
                done();
            });
        });

        it ('with a name', function(done) {
            boards.addBoard({ 'moderator': moderatorId, 'name': 'Name' }, function(err, doc) {
                doc.moderator.should.equal(moderatorId);
                doc.name.should.equal('Name');
                
                expect(doc.ideas).to.have.length(0);
                expect(doc.boardId).to.have.length(6);
                
                done();
            });
        });
    });

    it ('updates board name', function(done) {
        boards.updateBoardName(currentBoard.boardId, 'New Name', function(err, doc) {

            boards.findBoard(currentBoard.boardId, function(err, updatedBoard) {
                updatedBoard.moderator.should.equal(moderatorId);
                expect(updatedBoard.ideas).to.have.length(0);
                expect(updatedBoard.boardId).to.have.length(6);

                updatedBoard.name.should.equal('New Name');

                done();
            });
        });
    });

    it ('finds a board by boardId', function(done) {
        boards.findBoard(currentBoard.boardId, function(err, doc) {
            doc.moderator.should.equal(moderatorId);
            doc.boardId.should.equal(currentBoard.boardId);
            
            expect(doc.ideas).to.have.length(0);
            expect(doc.boardId).to.have.length(6);

            done();
        });
    });

    it ('finds boards by moderator id', function(done) {
        boards.findBoardsByModerator(moderatorId, function(err, docs) {
            expect(docs).to.have.length(1);

            var board = docs[0];
            board.moderator.should.equal(moderatorId);

            done();
        });
    });

    it ('adds an idea to a board', function(done) {
        boards.addIdeaToBoard(currentBoard.boardId, currentIdea._id, function(err) {
            
            boards.findBoard(currentBoard.boardId, function(err, updatedBoard) {
                updatedBoard.moderator.should.equal(moderatorId);
            
                expect(updatedBoard.ideas).to.have.length(1);

                done();
            });
        });
    });

    it ('gets ideas from a board', function(done) {
        boards.addIdeaToBoard(currentBoard.boardId, currentIdea._id, function(err) {
            boards.getBoardIdeaIds(currentBoard.boardId, function(err, ideaIds) {
                var idea = ideaIds[0]
                // idea.should.equal(currentIdea._id);
            
                expect(ideaIds).to.have.length(1);

                done();
            });
        });
    });


    it ('removes an idea from a board', function(done) {
        boards.removeIdeaFromBoard(currentBoard.boardId, currentIdea._id, function(err) {
            
            boards.findBoard(currentBoard.boardId, function(err, updatedBoard) {
                updatedBoard.moderator.should.equal(moderatorId);
            
                expect(updatedBoard.ideas).to.have.length(0);

                done();
            });
        });
    });

    it ('removes a board', function(done) {
        boards.removeBoard(currentBoard.boardId, function(err) {

            boards.findBoard(currentBoard.boardId, function(err, board) {
                expect(board).to.be.null;

                done();
            });
        });
    });
});
