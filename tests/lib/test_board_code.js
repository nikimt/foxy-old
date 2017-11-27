var mongoose = require("mongoose");
var assert = require('chai').assert;

var codeGenerator = require('../../app/lib/board_code.js');

describe('Board Code Generator', function() {

    describe('checks that code validity checking works', function(){
        it('tests when code is all letters', function(){
            var code = "ABCDEZ";
            assert(codeGenerator.isValidCode(code));
        });
        it('tests when code is all numbers', function(){
            var code = "123459";
            assert(codeGenerator.isValidCode(code));
        });
        it('tests when code is a mix', function(){
            var code = "ABC123";
            assert(codeGenerator.isValidCode(code));
        });
        it('tests when code is not uppercase', function(){
            var code = "abc123";
            assert(!codeGenerator.isValidCode(code));
        });
        it('tests when code has non-alphanumeric characters', function(){
            var code = "ABC!#$";
            assert(!codeGenerator.isValidCode(code));
        });
        it('tests when code is not proper length', function(){
            var code = "ABC";
            assert(!codeGenerator.isValidCode(code));
        });
    });
    
    describe('tests code generation', function(){
        it ('tests code generation', function() {
            var code = codeGenerator.getCode();
            assert(codeGenerator.isValidCode(code));
        });
    });

});
