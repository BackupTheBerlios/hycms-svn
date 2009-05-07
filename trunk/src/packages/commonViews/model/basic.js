/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
 
//
// Structure model
//
ModelConstruct_declare(
	["*", "structure"], null,

	function Model_Structure(initializer) 
	{
		var newObject = new Object();
		
		for (var idx in initializer) {
			if (idx[0] == "_") continue;
			
			newObject[idx] = initializer[idx];
		}
		
		return newObject;
	}
);

//
// List model
//
ModelConstruct_declare(
	["*", "list"], null,

	function Model_List(initializer) 
	{
		var newObject = [];
		
		for (var idx = 0; idx < initializer.length; idx++) {
			newObject[idx] = initializer[idx];
		}
		
		return newObject;
	}
);

//
// Plain text model
//		 
ModelConstruct_declare(
	["*", "text"], null,

	function Model_Text(initializer) 
	{
		return initializer.valueOf();
	}
);

