 // Data model and helper function testing suite. Information on route testing can
 //   be found in their respective files. 

 // Front end code was tested through visual checks and user testing. We tested the 
 //   following functionality and ensured that pages looked and behaved as they should:
 //     - creating board
 //     - joining board
 //     - adding idea
 //     - idea actions
//          - upvote
//          - unupvote
//          - flag/unflag
//          - show notes/explanation
//          - delete idea
//      - refreshing pages
//      - creating an account
//      - logging in
//      - saving boards
//      - viewing saved boards

var mongoose = require('mongoose');

var db = mongoose.connect('mongodb://localhost/test');

var importTest = function(name, path) {
    describe(name, function() {
        require(path);
    });
};

describe("Model Testing:", function(){

    importTest('Board Model Testing:', './models/test_board.js');
    importTest('Idea Model Testing:', './models/test_idea.js');
    importTest('Note Model Testing:', './models/test_note.js');
    importTest('User Model Testing:', './models/test_user.js');

    after(function() {
        mongoose.disconnect();
    });
});

describe("Code Generation Testing:", function(){
    importTest('Code Generator Testing:', './lib/test_board_code.js');
});