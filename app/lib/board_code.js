/* Methods for generating and checking random unique codes for boards.
   Main author: epw */

var CodeGenerator = (function(){
    
    var that = {};
    
    var CODE_LENGTH = 6;
    var CODE_SYMBOLS = ["A","B","C","D","E","F","G","H","I","J","K","L","M",
                        "N","O","P","Q","R","S","T","U","V","W","X","Y","Z",
                        "1","2","3","4","5","6","7","8","9","0"];
    
    /** Unexposed function that returns a random character to be used in a board code. */
    var getRandomCharacter = function(){
        return CODE_SYMBOLS[Math.floor(Math.random()*CODE_SYMBOLS.length)];
    }

    /** Exposed function that returns a code to associate with a particular board */
    that.getCode = function(){
        var code = "";
        for (var i = 0; i < CODE_LENGTH; i++){
            code += getRandomCharacter();
        }
        return code;
    }
    
    /** 
      * Exposed function that returns true if the given code is valid.
      *
      * @param {String} code - the code to test
      * @return true if valid code, else false
      */
    that.isValidCode = function(code){
        for (var i = 0; i < CODE_LENGTH; i++){
            var code_character = code.charAt(i);
            if (CODE_SYMBOLS.indexOf(code_character) == -1){
                return false;
            }
        }
        return true;
    }
    
    Object.freeze(that);
    return that;
})();

module.exports = CodeGenerator;