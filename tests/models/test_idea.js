// Tests for the Idea model
//
// Main author: mslaught

var mongoose = require("mongoose");

var should = require('chai').should();
var expect = require('chai').expect;

var ideas = require('../../app/models/idea.js');

describe('Idea Model Tests', function() {
    
    // Holds a board to use in each test
    var currentIdea = null;

    // Constants
    var userid = '0';
    var boardId = '123456';

    // Create a board and an idea before each test
    beforeEach(function(done) {
        var ideaInfo = {
            'content': 'test',
            'boardId': boardId,
            'creatorId': userid,
        }
        ideas.addIdea(ideaInfo, function(err, ideaDoc) {
            currentIdea = ideaDoc;
            done();
        });
    });

    // Drop ideas collection between tests
    afterEach(function(done) {
        mongoose.connection.collections['ideas'].drop( function(err) {
            done();
        });
    });

    describe('Creates a new idea', function() {
        it ('with no explanation', function(done) {
            var ideaInfo = {
                'content': 'test',
                'boardId': boardId,
                'creatorId': userid,
            }
            ideas.addIdea(ideaInfo, function(err, doc) {
                doc.content.should.equal('test');
                doc.creatorId.should.equal(userid);
                doc.boardId.should.equal(boardId);
                doc.meta.upvotes.upvote_count.should.equal(0);
                doc.meta.flag.should.equal(false);
                
                expect(doc.meta.upvotes.users).to.have.length(0);
                
                done();
            });
        });

        it ('with an explanation', function(done) {
            var ideaInfo = {
                'content': 'test',
                'boardId': boardId,
                'creatorId': userid,
                'explanation': 'test explanation',
            }
            ideas.addIdea(ideaInfo, function(err, doc) {
                doc.content.should.equal('test');
                doc.creatorId.should.equal(userid);
                doc.boardId.should.equal(boardId);
                doc.explanation.should.equal('test explanation');

                doc.meta.upvotes.upvote_count.should.equal(0);
                doc.meta.flag.should.equal(false);
                
                expect(doc.meta.upvotes.users).to.have.length(0);
                
                done();
            });
        });
    });

    it ('finds an idea', function(done) {
        ideas.findIdea(currentIdea._id, function(err, doc) {
            doc.content.should.equal('test');
            doc.creatorId.should.equal(userid);
            doc.boardId.should.equal(boardId);

            doc.meta.upvotes.upvote_count.should.equal(0);
            doc.meta.flag.should.equal(false);

            expect(doc.meta.upvotes.users).to.have.length(0);

            done();
        });
    });

    it ('finds ideas by ids', function(done) {
        ideas.findIdeasByIds([currentIdea._id], function(err, docs) {
            expect(docs).to.have.length(1);

            var idea = docs[0];
            idea.content.should.equal('test');
            idea.creatorId.should.equal(userid);
            idea.boardId.should.equal(boardId);

            idea.meta.upvotes.upvote_count.should.equal(0);
            idea.meta.flag.should.equal(false);

            expect(idea.meta.upvotes.users).to.have.length(0);

            done();
        });
    });

    it ('finds ideas by board', function(done) {
        ideas.findIdeasByBoard(boardId, function(err, docs) {
            expect(docs).to.have.length(1);

            var idea = docs[0];
            idea.content.should.equal('test');
            idea.creatorId.should.equal(userid);
            idea.boardId.should.equal(boardId);

            idea.meta.upvotes.upvote_count.should.equal(0);
            idea.meta.flag.should.equal(false);

            expect(idea.meta.upvotes.users).to.have.length(0);

            done();
        });
    });

    it ('removes an idea', function(done) {
        ideas.removeIdea(currentIdea._id, function(err) {
            
            ideas.findIdea(currentIdea._id, function(err, doc) {
                expect(err).to.not.be.null;
                err.msg.should.equal('No such idea!');

                done();
            });
        });
    });

    it ('removes ideas by ids', function(done) {
        ideas.removeIdeasByIds([currentIdea._id], function(err) {
            ideas.findIdea(currentIdea._id, function(err, doc) {
                expect(err).to.not.be.null;
                err.msg.should.equal('No such idea!');

                done();
            });
        });
    });

    describe('Upvotes', function() {

        // Idea with an upvote
        var upvotedIdea;

        beforeEach(function(done) {
            var ideaInfo = {
                'content': 'test',
                'boardId': boardId,
                'creatorId': userid,
            }
            ideas.addIdea(ideaInfo, function(err, ideaDoc) {
                ideas.addUpvoteToIdea(ideaDoc._id, userid, function(err) {
                    upvotedIdea = ideaDoc;
                    done();
                });
            });
        });

        it ('adds an upvote to an idea', function(done) {
            ideas.addUpvoteToIdea(currentIdea._id, userid, function(err) {
                ideas.findIdea(currentIdea._id, function(err, doc) {
                    expect(err).to.be.null;

                    doc.content.should.equal('test');
                    doc.creatorId.should.equal(userid);
                    doc.boardId.should.equal(boardId);

                    doc.meta.upvotes.upvote_count.should.equal(1);
                    doc.meta.flag.should.equal(false);

                    expect(doc.meta.upvotes.users).to.have.length(1);

                    done();
                });
            });
        });

        it ('does not add an upvote to an idea that the user has already upvoted', function(done) {
            ideas.addUpvoteToIdea(upvotedIdea._id, userid, function(err) {

                expect(err).to.not.be.null;
                err.msg.should.equal('user has already upvoted');

                ideas.findIdea(upvotedIdea._id, function(err, doc) {
                    doc.content.should.equal('test');
                    doc.creatorId.should.equal(userid);
                    doc.boardId.should.equal(boardId);

                    doc.meta.upvotes.upvote_count.should.equal(1);
                    doc.meta.flag.should.equal(false);

                    expect(doc.meta.upvotes.users).to.have.length(1);

                    done();
                });
            });
        });

        it ('removes an upvote from an idea', function(done) {
            ideas.removeUpvoteFromIdea(upvotedIdea._id, userid, function(err) {
                ideas.findIdea(upvotedIdea._id, function(err, doc) {
                    expect(err).to.be.null;

                    doc.content.should.equal('test');
                    doc.creatorId.should.equal(userid);
                    doc.boardId.should.equal(boardId);

                    doc.meta.upvotes.upvote_count.should.equal(0);
                    doc.meta.flag.should.equal(false);

                    expect(doc.meta.upvotes.users).to.have.length(0);

                    done();
                });
            });
        });

        it ('does not remove an upvote if the user is not the creator of the idea', function(done) {
            ideas.removeUpvoteFromIdea(upvotedIdea._id, '1', function(err) {

                expect(err).to.not.be.null;

                ideas.findIdea(upvotedIdea._id, function(err, doc) {
                    doc.content.should.equal('test');
                    doc.creatorId.should.equal(userid);
                    doc.boardId.should.equal(boardId);

                    doc.meta.upvotes.upvote_count.should.equal(1);
                    doc.meta.flag.should.equal(false);

                    expect(doc.meta.upvotes.users).to.have.length(1);

                    done();
                });
            });
        });
    });

    describe ('Flagging', function() {

        // Idea with a flag
        var flaggedIdea;

        beforeEach(function(done) {
            var ideaInfo = {
                'content': 'test',
                'boardId': boardId,
                'creatorId': userid,
            }
            ideas.addIdea(ideaInfo, function(err, ideaDoc) {
                ideas.flagIdea(ideaDoc._id, function(err) {
                    flaggedIdea = ideaDoc;
                    done();
                });
            });
        });

        it ('flags an idea', function(done) {
            ideas.flagIdea(currentIdea._id, function(err, doc) {
                ideas.findIdea(currentIdea._id, function(err, doc) {
                    expect(err).to.be.null;

                    doc.content.should.equal('test');
                    doc.creatorId.should.equal(userid);
                    doc.boardId.should.equal(boardId);

                    doc.meta.upvotes.upvote_count.should.equal(0);
                    doc.meta.flag.should.equal(true);

                    expect(doc.meta.upvotes.users).to.have.length(0);

                    done();
                });
            });
        });

        it ('unflags an idea', function(done) {
            ideas.unflagIdea(flaggedIdea._id, function(err, doc) {
                ideas.findIdea(flaggedIdea._id, function(err, doc) {
                    expect(err).to.be.null;

                    doc.content.should.equal('test');
                    doc.creatorId.should.equal(userid);
                    doc.boardId.should.equal(boardId);

                    doc.meta.upvotes.upvote_count.should.equal(0);
                    doc.meta.flag.should.equal(false);

                    expect(doc.meta.upvotes.users).to.have.length(0);

                    done();
                });
            });
        });
    });

    it ('updates an idea explanation', function(done) {
        ideas.updateIdeaExplanation(currentIdea._id, 'test explanation', function(err) {
            ideas.findIdea(currentIdea._id, function(err, doc) {
                expect(err).to.be.null;

                doc.content.should.equal('test');
                doc.creatorId.should.equal(userid);
                doc.boardId.should.equal(boardId);
                doc.explanation.should.equal('test explanation')

                doc.meta.upvotes.upvote_count.should.equal(0);
                doc.meta.flag.should.equal(false);

                expect(doc.meta.upvotes.users).to.have.length(0);

                done();
            });
        });
    });
});
