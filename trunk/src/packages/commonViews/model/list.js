/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */

/*
 * ["*", "list"]::construct([initializer])
 *
 * Creates a new list
 *
 * See: <declarator> Model.Construct
 *
 */
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

/*
 * <"*", "list">::insert(path, offset, child, pathAt)
 *
 * Inserts "child" into the list at "offset", if the list is the
 * destination object of "path".
 *
 * See: <declarator> Model.Insert
 *
 */
Model.Insert({
	type:				["*", "list"],
	child_type:			["*"],
	
	depth:				0,	
	
_does:
	function insertList(path, offset, child, pathAt)
	{
		this.splice(offset, 0, child);
		
		return true;
	}
});

/*
 * <"*", "list">::insert(path, offset, child, pathAt)
 *
 * Transfers the insertion to a child object of the list.
 *
 * See: <declarator> Model.Insert
 *
 */
Model.Insert({
	type:				["*", "list"],
	child_type:			["*"],
	
_does:
	function insertList(path, offset, child, pathAt)
	{
		var next = path[pathAt + 1];
	
		var result = next._insert({path: path, pathAt: pathAt + 1, offset: offset, child: child});
		if (result == null) return null;
		
		if (result instanceof Array) {
			this.splice.apply(this, [this.indexOf(next), 1].concat(result));
			
			return true;
		}
		 else {
		 	return false;
		}
	}
});

/*
 * <"*", "text">::remove(path, offset, count, pathAt)
 *
 * Removes "count" elements of a list, if the list is the
 * destination element of the given path.
 *
 * See: <declarator> Model.Remove
 *
 */
Model.Remove({
	type:				["*", "list"],

	depth:				0,
	
_does:
	function removeList(path, offset, count, pathAt)
	{
		this.splice(offset, count);
	
		return true;
	}
});

/*
 * <"*", "text">::remove(path, offset, count, pathAt)
 *
 * Delegates the remove operation to a child object of a list.
 * If the child object changes, this operation will replace its
 * list entry.
 *
 * See: <declarator> Model.Remove
 *
 */
Model.Remove({
	type:				["*", "list"],
	
_does:
	function removeList(path, offset, count, pathAt)
	{
		var next = path[pathAt + 1];
	
		var result = next._remove({path: path, pathAt: pathAt + 1, offset: offset, count: count});
		if (result == null) return null;
		
		if (result instanceof Array) {
			this.splice.apply(this, [this.indexOf(next), 1].concat(result));
			
			return true;
		}
		 else {
		 	return false;
		}
	}
});

