/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */

 
/*
 * <"*", "section", "list">::remove(path, offset, count, pathAt)
 *
 * Delegates the remove operation to a child object of a list.
 *
 * If it is not possible to remove a part of a child object, because
 * we are at offset -1, this function tries to merge the child object
 * with its predecessor.
 *
 * See: <declarator> Model.Remove
 *
 */
Model.Remove({
	type:				["*", "section", "list"],
	
	depth:				2,
	
	_whereas:			["offset == -1", 
						 "this.indexOf(path[pathAt + 1]) > 0", 												// We are not at the begin of the section
						 "(path[pathAt + 1].__is('list')) && (path[pathAt+1].indexOf(path[pathAt+2]) == 0)"	// It is the first element of the child
						],
	
_does:
	function removeSection(path, offset, count, pathAt)
	{
		var moverIdx = this.indexOf(path[pathAt + 1]);
		var mergerIdx = moverIdx - 1;
	
		this[mergerIdx]._merge({other: this[moverIdx]});
		
		this.splice(moverIdx, 1);
		
		return true;		
	}
});

/*
 * <"*", "section", "list">::remove(path, offset, count, pathAt)
 *
 * Delegates the remove operation to a child object of a list.
 *
 * If it is not possible to remove a part of a child object, because
 * we are at the last position, this function tries to merge the child object
 * with its predecessor.
 *
 * See: <declarator> Model.Remove
 *
 */
Model.Remove({
	type:				["*", "section", "list"],
	
	depth:				2,
	
	_whereas:			["offset >= path[pathAt + 2].length", 
						// We are not at the end of the section
						 "this.indexOf(path[pathAt + 1]) < this.length - 1",
						// It is the first element of the child
						 "(path[pathAt + 1].__is('list')) && (path[pathAt+1].indexOf(path[pathAt+2]) == path[pathAt+1].length - 1)"	
						],
	
_does:
	function removeSection(path, offset, count, pathAt)
	{
		var mergerIdx = this.indexOf(path[pathAt + 1]);
		var moverIdx = mergerIdx + 1;
	
		this[mergerIdx]._merge({other: this[moverIdx]});
		
		this.splice(moverIdx, 1);
		
		return true;		
	}
});
