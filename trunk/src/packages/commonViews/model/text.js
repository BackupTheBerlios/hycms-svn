/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
 
/*
 * ["*", "text"]::construct([initializer])
 *
 * Creates a new text
 *
 * See: <declarator> Model.Construct
 *
 */
Model.Construct({
	type:				["*", "text"], 
	initializer:		"",

_does:
	function text(initializer) 
	{
		return initializer.valueOf();
	}
});

/*
 * <"*", "text">::insert(path, offset, child, pathAt)
 *
 * Inserts "child" into the text at "offset", if the child
 * has the same type as 'this'.
 *
 * As a result of this operation a new object will be
 * created since text objects are immutable in JavaScript.
 *
 * See: <declarator> Model.Insert
 *
 */
Model.Insert({
	type:				["*", "text"],
	child_type:			["*", "text"],

	depth:				0,
	
	_whereas:			"this.__taggedAs(child.__getTagging()) > -1",
	
_does:
	function insertText(path, offset, child, pathAt)
	{
		var newText = this.substr(0, offset) + child + this.substr(offset);
	
		return [newText.__tag(this.__getTagging())];
	}
});

/*
 * <"*", "text">::insert(path, offset, child, pathAt)
 *
 * Inserts "child" into the text at "offset", if the child
 * has a different type than "child".
 *
 * As a result of this operation three new objects will be created,
 * because text objects can only be merged with objects of the same
 * type.
 *
 * See: <declarator> Model.Insert
 *
 */
Model.Insert({
	type:				["*", "text"],
	child_type:			["*"],
	
	depth:				0,
	
	_whereas:			"this.__taggedAs(child.__getTagging()) == -1",
	
_does:
	function insertText(path, offset, child, pathAt)
	{
		var tag = this.__getTagging();
		var part1 = this.substr(0, offset).__tag(tag);
		var part2 = child;
		var part3 = this.substr(offset).__tag(tag);
		
		return [part1, part2, part3];
	}
});

/*
 * <"*", "text">::remove(path, offset, count, pathAt)
 *
 * Removes "count" charracters at the given "offset"
 *
 * As a result of this operation a new object will be
 * created since text objects are immutable in JavaScript.
 *
 * See: <declarator> Model.Remove
 *
 */
Model.Remove({
	type:				["*", "text"],

	depth:				0,
	
_does:
	function removeText(path, offset, count, pathAt)
	{console.log(path, offset, count, pathAt);
		var newText = this.substr(0, offset) + this.substr(offset + count);
		
		return [newText.__tag(this.__getTagging())];
	}
});

