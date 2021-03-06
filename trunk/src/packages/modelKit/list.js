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
 * <"*", "list">::buildContentMap(map)
 *
 * Fills the current object into the given content map.
 *
 * See: <declarator> Model.BuildContentMap
 *
 */
Model.BuildContentMap({
	type:	["*", "list"],

_does:
	function list(map)
	{
		map[this.__uuid] = this;
		
		for (var idx = 0; idx < this.length; idx ++) {
			map = this[idx]._buildContentMap( {map: map } );
		}
		
		return map;
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
 * <"*", "list">::remove(path, offset, count, pathAt)
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
 * <"*", "list">::remove(path, offset, count, pathAt)
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

/*
 * <"*", "list">::duplicate(path, offset, endPath, length, pathAt)
 *
 * Duplicates a list and its children
 *
 */
Model.Duplicate({
	type:		["*", "list"],
	
_does:
	function duplicateList(path, offset, endPath, length, pathAt)
	{
		var duplicant = [].__tag(this.__getTagging());

		var startIdx = this.indexOf(path[pathAt + 1]);
		var endIdx = this.length - 1;
		var endReached = false;
	
		if (startIdx == -1) startIdx = 0;

		if ((endPath[pathAt] != undefined) && (endPath[pathAt] == this)) {
			endIdx = this.indexOf(endPath[pathAt + 1]);
			endReached = true;
		}
		
		for (var idx = startIdx; idx <= endIdx; idx ++) {
			var curLength = -1;
		
			if ((endReached) && (idx == endIdx))
				curLength = length;
		
			path[pathAt + 1] = this[idx];

			var copy = path[pathAt + 1]._duplicate({path: path, 
													offset: offset, 
													endPath: endPath, 
													length: curLength, 
													pathAt: pathAt + 1
												  });

			duplicant.push(copy);

			offset = 0;
			path.pop();
		}

		return duplicant;		
	}
});

/*
 * <"*", "list">::getLength()
 *
 * Returns the highest possible offset inside a text node.
 *
 * See: <declarator> Model.GetLength
 *
 */
Model.GetLength({
	type:				["*", "list"],
	
_does:
	function getLength()
	{
		return this.length;
	}
});

/*
 * <"*", "list">::cleanupTextNodes() => number
 *
 * Tries to merge all text nodes, which have the same tagging.
 *
 * Returns the number of merged elements.
 *
 */
"cleanupTextNodes".__declare({
	_this:		["*", "list"],
	_output:	"number",
	
_does:
	function cleanupTextNodes()
	{
		var ctr = 0;

		// Merge, if there are text nodes of the same type
		for (var idx = 0; idx < this.length - 1; idx ++) {
			if (this[idx].__is("text") && ( this[idx].__taggedAs(this[idx + 1].__getTagging()) > -1 )) {
				var newNode = this[idx]._insert({path: [this[idx]], offset: this[idx]._getLength(), child: this[idx + 1]});
			
				this.splice.apply(this, [idx, 2].concat(newNode));
				
				ctr ++;
				idx --;
			}
		}
		
		// Remove empty text nodes
		for (var idx = 0; idx < this.length; idx ++) {
			if (this[idx].__is("text") && ( this[idx].length == 0))
				this.splice(idx, 1);
				
			ctr ++;
		}

		return ctr;
	}
});

/*
 * <"*", "list">::merge(other[, offset = this.length])
 *
 * Moves all elements of "other" into "this" at position "offset".
 *
 */
"merge".__declare({
	_this:		["*", "list"],
	other:		["*", "list"],

	_optional_offset:	"number",
	
_does:
	function merge(other, offset)
	{
		var mover = other;
	
		if (offset == null)
			offset = this.length;
	
		// Merge elements
		for (var idx = 0; idx < mover.length; idx ++) {
			var newChild = mover[idx];
							  
			this.splice(offset, 1, newChild);
			mover.splice(idx, 1);
			
			offset ++;
			idx --;
		}
	}
});

