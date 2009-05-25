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
 * <"*", "text">::buildContentMap(map)
 *
 * Fills the current object into the given content map.
 *
 * See: <declarator> Model.BuildContentMap
 *
 */
Model.BuildContentMap({
	type:	["*", "text"],

_does:
	function text(map)
	{
		map[this.__uuid] = this;
		
		return map;
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
		var outlist = [];
		
		var tag = this.__getTagging();
		var part1 = this.substr(0, offset).__tag(tag);
		var part2 = child;
		var part3 = this.substr(offset).__tag(tag);
		
		if (part1.length > 0) outlist.push(part1);
		if (part2 != null) outlist.push(part2);
		if (part3.length > 0) outlist.push(part3);
		
		return outlist;
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
	{
		var newText = this.substr(0, offset) + this.substr(offset + count);

		if (newText.length == 0)
			return [];
		else
			return [newText.__tag(this.__getTagging())];
	}
});

/*
 * <"*", "text">::duplicate(path, offset, length, endPath, pathAt)
 *
 * Duplicates a text element
 *
 */
Model.Duplicate({
	type:		["*", "text"],
	
	depth:		0,
	
_does:
	function duplicateText(path, offset, endPath, length, pathAt)
	{
		var newStr;
		
		if (length == -1)
			length = this.length;

		newStr = this.substr( offset, length )

		return newStr.__tag(this.__getTagging());
	}
});

/*
 * <"*", "text">::getLength()
 *
 * Returns the highest possible offset inside a text node.
 *
 * See: <declarator> Model.GetLength
 *
 */
Model.GetLength({
	type:				["*", "text"],
	
_does:
	function getLength()
	{
		return this.length;
	}
});

