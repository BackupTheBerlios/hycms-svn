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

/*
 * <"*", "structure">::buildContentMap(map)
 *
 * Fills the current object into the given content map.
 *
 * See: <declarator> Model.BuildContentMap
 *
 */
Model.BuildContentMap({
	type:	["*", "structure"],

_does:
	function structure(map)
	{
		map[this.__uuid] = this;
		
		for (var idx in this) {
			if (idx[0] == "_") continue;
			
			map = this[idx]._buildContentMap( {map: map } );
		}
		
		return map;
	}
});

