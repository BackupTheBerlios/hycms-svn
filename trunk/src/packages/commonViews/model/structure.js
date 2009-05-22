/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
/*
 * ["*", "structure"]::construct([initializer])
 *
 * Creates a new list
 *
 * See: <declarator> Model.Construct
 *
 */
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

