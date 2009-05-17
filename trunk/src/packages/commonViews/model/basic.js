/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
 
//
// Structure model
//
Model.Construct({
	 type:			["*", "structure"], 
	 initializer:	({}),

_does:
	function structure(initializer) 
	{
		var newObject = new Object();
		
		for (var idx in initializer) {
			if (idx[0] == "_") continue;
			
			newObject[idx] = initializer[idx];
		}
		
		return newObject;
	}
});

//
// List model
//
Model.Construct({
	 type:			["*", "list"], 
	 initializer:	[],

_does:
	function list(initializer) 
	{
		var newObject = [];
		
		for (var idx = 0; idx < initializer.length; idx++) {
			newObject[idx] = initializer[idx];
		}
		
		return newObject;
	}
});

//
// Plain text model
//		 
Model.Construct({
	 type:				["*", "text"], 
	 initializer:		"",

_does:
	function text(initializer) 
	{
		return initializer.valueOf();
	}
});


