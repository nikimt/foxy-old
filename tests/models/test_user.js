// Tests for the User model
//
// Main author: mslaught

var mongoose = require("mongoose");

var should = require('chai').should();
var expect = require('chai').expect;

var users = require('../../app/models/user.js');

describe('User Model Tests', function() {
    
    // Holds a board to use in each test
    var currentUser = null;

    // Constants
    var username = 'test';
    var username2 = 'test2';
    var password = 'password';

    var verifyUser = function(doc) {
        doc.username.should.equal(username);
        doc.password.should.not.equal(password);

        expect(doc.saved_boards).length.to.be(0);
    }

    // Create an idea before each test
    beforeEach(function(done) {
        var userInfo = {
            'username': username,
            'password': password,
        }
        users.addUser(userInfo, function(err, userDoc) {
            currentUser = userDoc;
            done();
        });
    });

    // Drop ideas collection between tests
    afterEach(function(done) {
        mongoose.connection.collections['users'].drop( function(err) {
            done();
        });
    });

    describe ('Create', function() {

        it ('creates a new user', function(done) {
            var userInfo = {
                'username': username2,
                'password': password,
            }
            users.addUser(userInfo, function(err, doc) {
                doc.username.should.equal(username2);
                doc.password.should.not.equal(password);

                expect(doc.saved_boards).length.to.be(0);
                
                done();
            });
        });

        it ('does not create a user with short username', function(done) {
            var userInfo = {
                'username': '1',
                'password': password,
            }
            users.addUser(userInfo, function(err, doc) {
                expect(err).to.not.be.null;
                
                done();
            });
        });

        it ('does not create a user with short password', function(done) {
            var userInfo = {
                'username': username2,
                'password': '1234',
            }
            users.addUser(userInfo, function(err, doc) {
                expect(err).to.not.be.null;
                
                done();
            });
        });
    });

    it ('correctly verifies a user', function(done) {
        var user = {
            'username': username,
            'password': password,
        }
        users.verifyUser(user, function(err, verify, result) {
            verify.should.equal(true);
            verifyUser(result);

            done();
        });
    });

    it ('correctly does not verify an incorrect password', function(done) {
        var user = {
            'username': username,
            'password': '1234',
        }
        users.verifyUser(user, function(err, verify, result) {
            verify.should.equal(false);

            done();
        });
    });

    it ('correctly does not verify an incorrect username', function(done) {
        var user = {
            'username': 'username',
            'password': password,
        }
        users.verifyUser(user, function(err, verify, result) {
            verify.should.equal(false);

            done();
        });
    });

    describe ('Boards', function() {
        
        // User with saved boards
        var userWithBoards;
        var boardId = '123456';

        beforeEach(function(done) {
            var userInfo = {
                'username': username2,
                'password': password,
            }
            users.addUser(userInfo, function(err, user) {
                users.addBoardToUser(user._id, boardId, function(err) {
                    userWithBoards = user;
                    done();
                });
            });
        });

        it ('should get boards from user', function(done) {
            users.getBoardsFromUser(userWithBoards._id, function(err, docs) {
                expect(docs).length.to.be(1);
                docs[0].should.equal('123456');

                done();
            });
        });

        it ('should add a board to a user', function(done) {
            users.addBoardToUser(currentUser._id, boardId, function(err) {
                users.getBoardsFromUser(currentUser._id, function(err, docs) {
                    expect(docs).length.to.be(1);
                    docs[0].should.equal('123456');

                    done();
                });
            });
        });

        it ('should remove a board from a user', function(done) {
            users.removeBoardFromUser(userWithBoards._id, boardId, function(err) {
                users.getBoardsFromUser(currentUser._id, function(err, docs) {
                    expect(docs).length.to.be(0);

                    done();
                });
            });
        });
    });

});
