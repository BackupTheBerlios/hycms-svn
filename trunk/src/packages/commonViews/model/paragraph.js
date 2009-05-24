/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
/*
 * <"*", "paragraph", "list">::insert(path, offset, child, pathAt)
 *
 * Inserts an element directly or indirectly into a paragraph. After
 * insertion, the paragraph cleans up automatically.
 *
 * See: <declarator> Model.Insert
 *
 */
Model.Insert({
	type:	["*", "paragraph", "list"],
	
	depth:	1,
	
_does:
	function insertParagraph(path, offset, child, pathAt)
	{
		var update = false;

		update = __delegate(null, {_this: this.__fakeClass("list")});

		update |= (this._cleanupTextNodes() > 0);
	
		return update;
	}
});

/*
 * paragraphRemove
 *
 * Default remove operations for paragraph objects.
 *
 */
function __paragraphRemove(self, path, offset, count, pathAt)
{
	var update = false;

	update = __delegate({path: path, pathAt: pathAt, count: count, offset: offset}, {_this: self.__fakeClass("list")});

	update |= (self._cleanupTextNodes() > 0);
	
	return update;
}

/*
 * <"*", "paragraph", "list">::remove(path, offset, count, pathAt)
 *
 * Removes "count" elements of a list, if the list is the
 * destination element of the given path.
 *
 * See: <declarator> Model.Remove
 *
 */
Model.Remove({
	type:				["*", "paragraph", "list"],

	depth:				0,
	
_does:
	function removeParagraphDirect(path, offset, count, pathAt)
	{
		return __paragraphRemove(this, path, offset, count, pathAt);
	}
});


/*
 * <"*", "paragraph", "list">::remove(path, offset, count, pathAt)
 *
 * Delegates the remove operation to a child object of a list.
 * If the child object changes, this operation will replace its
 * list entry.
 *
 * See: <declarator> Model.Remove
 *
 */
Model.Remove({
	type:				["*", "paragraph", "list"],
	
_does:
	function removeParagraphDepthChild(path, offset, count, pathAt)
	{
		return __paragraphRemove(this, path, offset, count, pathAt);
	}
});

/*
 * <"*", "paragraph", "list">::remove(path, offset, count, pathAt)
 *
 * Delegates the remove operation to a child object of a list.
 *
 * This operation will be called if the paragraph is the direct
 * parent of the element and if the element can't handle a backspace
 * request, because it is at the first position of the element.
 *
 * It will transfer the request to its predecessor.
 *
 * See: <declarator> Model.Remove
 *
 */
Model.Remove({
	type:				["*", "paragraph", "list"],
	
	depth:				1,
	
	_whereas:			"offset == -1",
_does:
	function removeParagraph_BackspaceNotHandled(path, offset, count, pathAt)
	{
		var idx = this.indexOf(path[pathAt + 1]);
	
		// Position at the begin of the paragraph, we can't handle it...
		if (idx == 0)
			return null;
	
		// Between two elements. just move the call to the predecessor node
		path[pathAt + 1] = this[idx - 1];
		offset = this[idx - 1]._getLength() - 1;

		return __paragraphRemove(this, path, offset, count, pathAt);
	}
});

/*
 * <"*", "paragraph", "list">::remove(path, offset, count, pathAt)
 *
 * Delegates the remove operation to a child object of a list.
 *
 * This operation will be called if the paragraph is the direct
 * parent of the element and if the element can't handle a delete
 * request, because it is at the last position of the element.
 *
 * It will transfer the request to its successor.
 *
 * See: <declarator> Model.Remove
 *
 */
Model.Remove({
	type:				["*", "paragraph", "list"],
	
	depth:				1,
	
	_whereas:			"offset >= path[path.length - 1]._getLength()",
_does:
	function removeParagraph_DeleteNotHandled(path, offset, count, pathAt)
	{
		var idx = this.indexOf(path[pathAt + 1]);

		// Position at the end of the paragraph, we can't handle it...
		if (idx == this.length - 1)
			return null;
	
		// Between two elements. just move the call to the sucessor node
		path[pathAt + 1] = this[idx + 1];
		offset = 0;

		return __paragraphRemove(this, path, offset, count, pathAt);
	}
});
