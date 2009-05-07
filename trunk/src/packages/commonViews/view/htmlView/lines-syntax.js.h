//
// JavaScript syntax table
//
var js_replacement_table =
	[ {type:		"literal",		
	   regexp:		RegExp("~(?:\<span\ class\=)'([^\']*)\'", "g"),
	  },
	  
	  {type: 		"literal",
	   regexp: 		RegExp("(\")([^\"]*)(\")", "g")
	  },

	  {type: 		"literal",
	   regexp: 		/()(\b\d+\b)()/g
	  },
	  
	  {type:		"label",
	   regexp:		/()(\w+\:)()/g
	  },
	  
	  {type:		"comment",		
	   regexp:		RegExp("()(\/\\*.*\\*\/)()", "g"),
	  },
	  
	  {type:		"comment",		
	   regexp:		RegExp("()(//.*)()", "g"),
	  },	  
	   
	  {type: 		"expression",
	   regexp: 		/()\b(while|for|do|if|function|var)\b()/g
	  },
	  
	  {type: 		"type",
	   regexp: 		/()\b(Object|Array|Number|String|Function)\b()/g
	  },
	  
	  {type: 		"operator",
	   regexp: 		/()\b(in|typeof|return|instanceof)\b()/g
	  },
	  
	  {type:		"operator",
	   regexp:		/()(\+|\-|\*|\%|\&\&|\&\&\&\&|\||\|\||\~)()/g
	  },
	  
	  {type:		"operator",
	   regexp:		/()(?:~\<)(\/)(?:~span)()/g
	  },
	  
	  {type:		"parenthesis",
	   regexp:		/()(\(|\)|\[|\]|\{|\})()/g
	  }
];

