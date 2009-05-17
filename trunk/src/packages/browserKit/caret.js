/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 * General caret-related methods
 *
 */
/*
 * Window::setCaret(anchor_node, anchor_offset)
 *
 * Sets the caret to a given position.
 *
 */
"setCaret".__declare({
	/* Due to a bug in WebKit, where window is not instanceof Window */
	//_this:			"@Window",
	_whereas:			"this == window",
	
	anchorNode:		"@Node",
	anchorOffset:	"number",

_does:
	function setCaret(anchorNode, anchorOffset)
	{
		var selection = this.getSelection();
		selection.collapse(anchorNode, anchorOffset);
	
//		this._switchFocus(this._makeDescription(null));
	}

});

/*
 * Window::getCaret()
 *
 * Gets the current position and returns an object {anchorNode: , anchorOffset}
 *
 */
"getCaret".__declare({
	/* Due to a bug in WebKit, where window is not instanceof Window */
	//_this:			"@Window",
	_whereas:			"this == window",
	
	_output:		["caret_position", "structure"],

_does:
	function getCaret(anchorNode, anchorOffset)
	{
		var selection = this.getSelection();
	
		return {anchorNode: selection.anchorNode, anchorOffset: selection.anchorOffset};
	}

});

/*
 * Window::saveCaret([anchorNode, anchorOffset]) => [list]
 *
 * Stores the coordinates of the caret in a node-independend format.
 * The information stores the position of all nodes inside the node tree
 * from the document body to the current caret position.
 *
 * Optionally a caret position can be emulated by transmitting DOM nodes.
 *
 */
"saveCaret".__declare({
	/* Due to a bug in WebKit, where window is not instanceof Window */
	//_this:			"@Window",
	_whereas:			"this == window",
	
	_output:	"list",

	anchorNode:		"@Element",
	anchorOffset:	"number",
		
_does:
	function saveCaret()
	{
		var path = [anchorOffset];
		var current = anchorNode;

		while(current != this.document.body) {
			var parentList = current.parentNode.childNodes;
		
			for (var idx = 0; idx < parentList.length; idx ++) {
				if (parentList[idx] == current)
					path.push(idx);
			}
		
			current = current.parentNode;	
		}
	
		return path;
	}

});

"saveCaret".__declare({
	/* Due to a bug in WebKit, where window is not instanceof Window */
	//_this:			"@Window",
	_whereas:			"this == window",
	
	_output:	"list",
	
_does:
	function saveCaret()
	{
		var selection = this._getCaret();
	
		return this._setCaret(selection.anchorNode, selection.anchorOffset);
	}
});

/*
 * Window::restoreCaret(path)
 *
 * Restores the caret according to the given path. If one
 * element of the path doesn't exist any more, the function
 * tries to place the caret to the first position of the next
 * successor in the tree's corner.
 *
 */
"restoreCaret".__declare({
	/* Due to a bug in WebKit, where window is not instanceof Window */
	//_this:			"@Window",
	_whereas:			"this == window",
	
	path:		"list",

_does:
	function restoreCaret(path)
	{
		var current = this.document.body;

		for (var idx = path.length-1; idx > 0; idx --) {
			var child = current.childNodes[path[idx]];

			// Element removed
			if (     (current.childNodes.length < path[idx]) 
				 ||  (child == null)
				 ||  ((idx == 1) && (child.nodeValue.length < path[0]))
			   )
			{
				path[idx + 1] ++;
				path[0] = 1;

				idx += 2;
				current = current.parentNode;

				continue;
			}

			current = child;
		}
	
		this._setCaret(current, path[0]);
	}

});

