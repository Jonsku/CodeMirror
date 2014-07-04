// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("vextab", function(cmConf, modeConf) {
  var KEYWORDS = /^notes|tabstave|stave|voice|options|text|slur$/;

  var PROPERTIES = {
    "options":{
      "width":/^\d+$/,
      "scale":/^\d+(\.\d+)?$/,
      "space":/^\d+$/,
      "stave-distance":/^\d+$/,
      "font-face":/^.+$/,
      "font-style":/^.+$/,
      "font-size":/^\d+$/
    },
    "tabstave":{
      "notation":/^true|false$/,
      "tablature":/^true|false$/,
      "clef":/^treble|alto|tenor|bass|percussion$/,
      "key":/^C|Am|F|Dm|Bb|Gm|Eb|Cm|Ab|Fm|Db|Bbm|Gb|Ebm|Cb|Abm|G|Em|D|Bm|A|F#m|E|C#m|B|G#m|F#|D#m|C#|A#m$/,
      "time":/^C|C\||\d\/\d$/,
      "tuning":/^standard|dropd|eb|E\/5|B\/4|G\/4|D\/4|A\/3|E\/3$/
    }
  };

  var ASSIGNMENT_OP = '=';

  return {
    token: function(stream, state) {
      var match;
      var currentKeyword = state.keyword;
      var currentProperty = state.property;
      
      //to next non space char on the line
      stream.eatSpace();
      if(stream.eol()) return null; //end of line
      
      /** KEYWORDS **/
      if(currentKeyword === null){
        
        //try to match the token with a keyword
        match = stream.match(KEYWORDS);
        if(!match){
          stream.skipToEnd();
          return 'error';
        }
        state.keyword = match[0];
        state.property = null;
        return "keyword";
      }

      /** NAMES OF PROPERTIES **/
      if( currentProperty === null && PROPERTIES.hasOwnProperty( currentKeyword ) ) {
        //parse property name
        match = stream.match(new RegExp("^[^"+ ASSIGNMENT_OP +"]*"), false);
        if(!match || !PROPERTIES[currentKeyword].hasOwnProperty(match[0]) ){
          //assume the definitions of properties for this keyword is over
          state.keyword = null;
          return null;
        }
        stream.skipTo( ASSIGNMENT_OP );
        state.property = match[0];
        return "property";
      }

      /** PROPERTY VALUE **/
      if( currentProperty !== null ){
        
        if( stream.eat( ASSIGNMENT_OP ) ){

          return "def";
        }
        //when the function returns, we'll be done with this property
        state.property = null;
        match = stream.match(/\S*/);
        if( !match || !PROPERTIES[currentKeyword][currentProperty].test(match[0]) ){
          return "error";
        }
        console.log(currentProperty," = ",match[0]);

        return 'atom';
      }
      
      //Notes, text, ...
      if( !PROPERTIES.hasOwnProperty( currentKeyword ) ){
        stream.skipToEnd();
        state.keyword = null;
      }
      return null;
    },

    startState: function() {
      return {keyword: null, property: null};
    }
  };
});

CodeMirror.defineMIME("text/vextab", "vextab");

});
