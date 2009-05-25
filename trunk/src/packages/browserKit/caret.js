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

		this._updateFocus();
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
	_whereas:		"this == window",
	
	_output:		"list",

	anchorNode:		"@Node",
	anchorOffset:	"number",
		
_does:
	function saveCaret(anchorNode, anchorOffset)
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

// Version without parameters
"saveCaret".__declare({
	/* Due to a bug in WebKit, where window is not instanceof Window */
	//_this:	"@Window",
	_whereas:	"this == window",
	
	_output:	"list",
	
_does:
	function saveCaret()
	{
		var selection = this._getCaret();
	
		return this._saveCaret({anchorNode: selection.anchorNode, anchorOffset: selection.anchorOffset});
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

		this._setCaret({anchorNode: current, anchorOffset:  path[0]});
	}

});

/*
 * Window::saveRelativeCaretPosition(anchor[, caretNode, caretOffset])
 *
 * Calculates an offset relative to the begin of "anchor". If "caretNode" and
 * "caretOffset" is not given, the current caret position is used. If the given
 * position is not inside the anchor, -1 will be returned.
 *
 */
"saveRelativeCaretPosition".__declare({
	//_this:			"@Window",
	_whereas:			"this == window",
	_output:			"number",
	
	anchor:					"@Node",
	_optional_caretNode:	"@Node",
	_optional_caretOffset:	"number",
	
_does:
	function saveRelativeCaretPosition(anchor, caretNode, caretOffset)
	{
		if ((caretNode == null) || (caretOffset == null)) {
			var selection = this._getCaret();
			caretNode = selection.anchorNode;
			caretOffset = selection.anchorOffset;
		}

		// Test if parent node
		var parent = caretNode;
		var found = false;
		
		while (parent != null) {
			if (parent == anchor) {
				found = true; 
				break;
			}
			
			parent = parent.parentNode;
		}
		
		if (found == false) return -1;
		
		// Calculate position inside anchor
		var childs = anchor._getViewDescendants();
		var offset = 0;

		for (idx = 0; idx < childs.length; idx ++) {
			var child = childs[idx];

			if (child == caretNode)
				break;

			if (child.nodeValue != null) {
				offset += child.nodeValue.length;
			}
		}

		return offset + caretOffset;
	}
});

/*
 * Window::restoreRelativeCaretPosition(anchor, offset)
 *
 * Restores the position of the caret at "offset", which is relative to "anchor".
 * If offset is "-1", the method does nothing.
 *
 */
"restoreRelativeCaretPosition".__declare({
	//_this:			"@Window",
	_whereas:			"this == window",
	
	anchor:				"@Node",
	offset:				"number",
	
_does:
	function restoreRelativeCaretPosition(anchor, offset)
	{
		if (offset == -1) return;
		
		// Calculate position inside anchor
		var childs = anchor._getViewDescendants();
		var lastOffset = 0, testOffset = 0;
		var destAnchor;
				
		for (idx = 0; idx < childs.length; idx ++) {
			destAnchor = childs[idx];
			
			if (destAnchor.nodeValue != null) {
				lastOffset = testOffset;
				testOffset += destAnchor.nodeValue.length;
			}
			
			if (testOffset > offset)
				break;
		}

		this._setCaret({anchorNode: destAnchor, anchorOffset: offset - lastOffset});
	}
});

/*
 * Window::clearFocus()
 *
 * Clears the focus, without blur notification.
 *
 */
"clearFocus".__declare({
	/* Due to a bug in WebKit, where window is not instanceof Window */
	//_this:			"@Window",
	_whereas:			"this == window",

_does:
	function clearFocus()
	{
		this.lastFocus = null;
	}

});

/*
 * Window::isFocussed(node)
 *
 * Tests, whether the given node has the current focus or not.
 *
 */
"isFocussed".__declare({
	/* Due to a bug in WebKit, where window is not instanceof Window */
	//_this:			"@Window",
	_whereas:			"this == window",
	
	node:				"@Node",
	_output:			"boolean",

_does:
	function isFocussed(node)
	{
		var focussed = this.lastFocus;
		
		while (focussed != null) {
			if (focussed == node) return true;
			
			focussed = focussed.parentNode;
		}
		
		return false;
	}

});

/*
 * Window::updateFocus()
 *
 * Updates the focus according to the current caret position. This
 * method will trigger a focus and blur event as required.
 *
 */
"updateFocus".__declare({
	/* Due to a bug in WebKit, where window is not instanceof Window */
	//_this:			"@Window",
	_whereas:			"this == window",

_does:

	function updateFocus()
	{
		var blurViewList = [];
		var focusViewList = [];
		var commonIdxFocus = -1;
		var commonIdxBlur = -1;

		var destNode = window._getCaret().anchorNode;
		var destView = destNode._getView();
	
		// Identical => no event...
		if (destView == window.lastFocus) return;

		// No view => no event...	
		if (destView == null) return;

		// Get parent list of destination element
		var view = destView;

		while (view != null) {
			focusViewList.push(view);
		
			view = view.parentNode._getView();
		}

		if (window.lastFocus != null) {
			// Get parent list of blur element
			var view = window.lastFocus;

			while (view != null) {
				blurViewList.push(view);

				view = view.parentNode._getView();
			
				if ((focusViewList.indexOf(view) > -1) && (commonIdxFocus == -1)) {
					commonIdxFocus = focusViewList.indexOf(view);
					commonIdxBlur = blurViewList.length;
				}
			}

			// Create event description
			var eventDescription = ["event_description", "structure"]._construct({eventType: "blur", eventTarget: destNode});

				
			// Bubble "blur" event to blur and its parent (unless they are not common to both elements)
			for (idx = 0; idx < blurViewList.length && idx != commonIdxBlur; idx++) {
				var view = blurViewList[idx];

				try {	
					if (view["_on"+eventDescription.type])	
						view["_on"+eventDescription.type]({eventDescription: eventDescription});
				} catch (e) {
				if (!((e instanceof MethodNotExistsError) && (e.methodName == "_on"+eventDescription.type))) {
						console.log(e);
						break;
					}
				}
			
				try {	
					BrowserKit.__raiseBKEvent(view, blur, eventDescription);
				} catch (e) {
				if (!((e instanceof MethodNotExistsError) && (e.methodName == "_onblur"))) {
						console.log(e);
						break;
					}
				}

					
				if (eventDescription.__propagationStopped) return;
			
				eventDescription.parentNotification = true;
			}
		}

		// Bubble focus event
		var eventDescription = ["event_description", "structure"]._construct({eventType: "focus", eventTarget: destNode});

		for (idx = 0; idx < focusViewList.length; idx++) {
			var view = focusViewList[idx];

			if (commonIdxFocus == idx)
				eventDescription.focusChangedInside = true;

			try {							
				if (view["_on"+eventDescription.type])	
					view["_on"+eventDescription.type]({eventDescription: eventDescription});

			} catch (e) {
				if (!(e instanceof MethodNotExistsError)) {
					console.log(e);
					break;
				}
			}

			try {
				BrowserKit.__raiseBKEvent(view, blur, eventDescription);		
			} catch (e) {
				if (!((e instanceof MethodNotExistsError) && (e.methodName == "_onfocus"))) {
					console.log(e);
					break;
				}
			}
		
			if (eventDescription.__propagationStopped) return;
		
			eventDescription.parentNotification = true;
		}
	
		window.lastFocus = destView;	
	}
});

/*
 * Window::caretMove([offset = 1] >= 0)
 *
 * Moves the caret "offset" steps forward and updates the focus.
 *
 */
"caretMove".__declare({
	/* Due to a bug in WebKit, where window is not instanceof Window */
	//_this:			"@Window",
	_whereas:			["this == window", "offset >= 0"],
	
	_optional_offset:	"number",
	_default_offset:	1,

_does:
	function caretMoveForward(offset)
	{
		var selection = window._getCaret();
		var node = selection.anchorNode;
		var position = selection.anchorOffset + offset;

		while (position > node.nodeValue.length) {
			var nextNode = node._getNextTextNode();

			position -= node.length;
			node = nextNode;
		}

		this._setCaret({anchorNode: node, anchorOffset: position});
		
		return;
	}
});

/*
 * Window::caretMove(offset < 0)
 *
 * Moves the caret "offset" steps backward and updates the focus.
 *
 */
"caretMove".__declare({
	/* Due to a bug in WebKit, where window is not instanceof Window */
	//_this:			"@Window",
	offset:				"number",
	
	_whereas:			["this == window", "offset < 0"],

_does:
	function caretMoveBackward(offset)
	{
		var selection = window._getCaret();
		var node = selection.anchorNode;
		var position = selection.anchorOffset + offset;

		while (position < 0) {
			var nextNode = node._getPreviousTextNode();

			position = nextNode.length + position;
			node = nextNode;
		}

		this._setCaret({anchorNode: node, anchorOffset: position});
		
		return;
	}
});

