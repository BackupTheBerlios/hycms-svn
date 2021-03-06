/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
/*
 * splitOnNewlines(self)
 *
 * Splits the paragraph on all newlines
 *
 */
function _splitOnNewlines(self)
{
	var outlist = [];
	var lastChild = self[0];
	var lastOffset = 0;

	for (var listIdx = 0; listIdx < self.length; listIdx ++) {

		if (!self[listIdx].__is("text")) continue;
	
		var child = self[listIdx];
		var lastIdx = 0;
		var curIdx = child.indexOf("\n");

		if (curIdx > -1) {
			var abort = 0;
		
			while (abort < 2) {
				var newParagraph = self._duplicate({path:		[self, lastChild],
													offset:		lastOffset,
													endPath:	[self, child],
													length:		curIdx - lastOffset,
												  });
				newParagraph._cleanupTextNodes();

				// Try next...
				var tmpIdx = curIdx + 1;
				curIdx = child.indexOf("\n", tmpIdx);

				// Next child
				lastChild = child;
				lastOffset = tmpIdx;

				// Copy the remaining 
				if (curIdx == -1) {
					abort ++;
					curIdx = lastOffset - 1;
					child = self[self.length - 1];
				}
			
				if (newParagraph.length == 0) {
					// Fill empty paragraphs...
					newParagraph.push("".__tag("text"));
				}
			
				outlist.push(newParagraph);
			}
		}
	}

	return outlist;
}

 
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

		// Replace all \n to paragraph splits
		var outlist = _splitOnNewlines(this);
	
		// Return outlist, if we has \n
		if (outlist.length > 0)
			return outlist;
		else
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
