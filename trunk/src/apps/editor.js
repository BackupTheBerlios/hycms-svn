/*
 * [class] Editor
 *
 * Properties:
 *		viewContainer			The DOM node used to show the content
 *
 *		content					The currently viewed document as content tree
 *		contentHash				Map from HTML node tags to content objects
 *
 *		lastFocussed			Node with the current focus
 *		focussedContent			Focussed content object
 *		currentSemantics		Current semantics selected by the user
 *
 * Methods:
 *		show					Visualizes the content inside the editor
 *		showReference			Visualizes the content of a reference inside the editor
 *
 *		getViewContext			Returns the semantic context of a view
 *		getAnchorViewNode		Returns a view node of an anchor node
 *		getContentObject		Returns the content object of a view node
 *		findNodes				Returns all view nodes with a certain uuid
 *
 *		switchFocus				Changes the focus inside the editor
 *		makeDescription			Builds an event description
 *		updateViews				Updates all view nodes with a certain UUID
 *
 *		saveCaret				Stores the caret coordinates in a node-independend format
 *		restoreCaret			Places the caret accordings to a node-independend coordinate
 *		setCaret				Sets the caret to a user-defined position
 *
 * Aspects:
 *		htmlRenderAspect		Registers all viewed elements to the contentHash
 *		htmlMergeAspect			Updates views after merge
 *
 * Events:
 *		onClick					Click event (changes focus)
 *		onKeyPress				Keypress event (insert / delete text; no focus change)
 *		onKeyUp					KeyUp event (focus change / selection change)
 *
 * Signals:
 *		viewNode.receiveFocus		A view node receives the focus
 *		viewNode.lostFocus			A view node loses the focus
 *		viewNode.update				A view node should be updated
 *
 *		contentObject.view				A content object should be shown (as HTML)
 *
 *		contentObject.insertChild		A child node should be inserted into a content object
 *		contentObject.removeChild		A child node should be removed from a content object
 *
 *		contentObject.changeSemantics	The semantics of a content object is changing
 *		contentObject.construct			Initializes a content object using a template
 *
 */
function Editor(viewContainer)
{
	var self = this;
	
	// Register properties
	this.viewContainer = viewContainer;
	this.lastFocussed = null;
	this.focussedContent = null;
	this.currentSemantics = null;

	// Register events Handlers
	viewContainer.addEventListener("click", function(event) { try { self.onClick(self._makeDescription(event)); } catch(e) { console.log(e) } }, true);
	viewContainer.addEventListener("keypress", function(event) { if (event.target == viewContainer) try { self.onKeyPress(self._makeDescription(event)); } catch(e) { console.log(e) } }, true);
	viewContainer.addEventListener("keyup", function(event) { if (event.target == viewContainer) try { self.onKeyUp(self._makeDescription(event)); } catch(e) { console.log(e) } }, true);

	// Prevent context menu
	viewContainer.addEventListener("contextmenu", function(event) { event.preventDefault(); event.stopPropagation(); }, true);

	// Register all aspects
	function renderAspectCallback() { return self.htmlRenderAspect.apply(self, arguments); }
	renderAspectCallback.__observes("after", "name == 'view'");

	// Make the editor pane "contentEditable"
	this.viewContainer.contentEditable = true;
	
}

/*
 * Editor::show(content)
 *
 * Visualizes a certain content object into the editor view.
 *
 */
"show".__declare({
	input:		"content",
	whereas:	"this instanceof Editor",
	does:
	
function(content)
{
	// Flush old content tree
	this.content = content;
	this.contentHash = new Object();

	// We only accept those HTML views, that can set us the uuid_attribute
	var html = content._view(Request(["*", "html", "text"], "?recursive_context", "keep_method_conditions", "set_uuid_attribute"));

	this.viewContainer.innerHTML = html;
}

});

/*
 * Editor::showReference(content_path)
 *
 * Shows a document at a given path inside the Editor
 *
 */
"showReference".__declare({
	input:		"contentPath",
	whereas:	"this instanceof Editor",
	does:
	
function(contentPath)
{
	var self = this;

	// Prepare callback
	function viewContentCallback(content)
	{
		self._show(content);
	}
	// Call data provider
	contentPath._downloadContent( viewContentCallback );
								  
}

});

/*
 * Editor::findNodes(uuid)
 *
 * Returns all nodes with a certain uuid.
 *
 */
"findNodes".__declare({
	input:		"uuid",
	whereas:	["this instanceof Editor", "uuid.__is('number')"],
	output:		["list"],
	does:
	
function findNodes(uuid)
{
	var nodeList = [];
	
	function recursor(node) {
		var children = node.childNodes;
	
		if ((node.getAttribute != null) && (node.getAttribute('uuid') == uuid)) {
			nodeList.push(node);
			
			// TODO: Currently we will find only the first element, for performance reasons... [1]
			return;
		}
			
		if (children != null) {
			for (var idx = 0; idx < children.length; idx ++) {
				recursor(children[idx]);
				
				// TODO: [1]
				if (nodeList.length > 1)
					return;
			}
		}
	}

	recursor(this.viewContainer);	
			
	return nodeList;
}

});

/*
 * Editor::updateViews(uuid)
 *
 * Updates all views with the given UUID.
 *
 */
"updateViews".__declare({
	input:		"uuid",
	whereas:	["this instanceof Editor", "uuid.__is('number')"],
	does:
	
function updateViews(uuid)
{
	var nodeList = this._findNodes(uuid);

	for (var idx = 0; idx < nodeList.length; idx ++) {
		var viewNode = nodeList[idx];
		var context = this._getViewContext(viewNode);
		var model = context[context.length - 1];

		var newHTML = model._view(Request(["*", "html", "text"], 
										  {"parentList": context.slice(0, -1)}, 
										  "?recursive_context", "keep_method_conditions", "set_uuid_attribute"
										 )
								 );

		// Replace the view (this is hacky...)	
		var tmpElement = document.createElement("div");
		tmpElement.innerHTML = newHTML;

		var tmpNew = tmpElement.firstChild;
		tmpElement.removeChild(tmpNew);
		
		viewNode.parentNode.replaceChild(tmpNew, viewNode);
	}
}

});

/*
 * Editor::updateViews(modelList, updateList)
 *
 * Updates all views responsible for the objects in 'modelList', if the
 * corresponding entry in 'updateList' is 'true'.
 *
 */
"updateViews".__declare({
	input:		["modelList", "updateList"],
	whereas:	["this instanceof Editor", "modelList instanceof Array", "updateList instanceof Array", "modelList.length == updateList.length"],
	does:
	
function updateViews(modelList, updateList)
{
	for (var idx = modelList.length - 1; idx > -1; idx --) {
		if (updateList[idx])
			this._updateViews(modelList[idx].__uuid);
	}
}

});

/*
 * Editor::htmlRenderAspect(aspect, method, subject, arguments, returnValue)
 *
 * Called on all view operations when rendering some content. If this
 * is the case, the aspect will register the content to the contentHash by
 * a unique id.
 *
 */
Editor.prototype.htmlRenderAspect = function(aspect, method, subject, arguments, returnValue)
{
	var uuid = arguments.__uuid;
	var refCount = 0;

	// Register object by its UUID
	if (this.contentHash[uuid] != null)
		refCount = this.contentHash[uuid].refCount;
		
	this.contentHash[subject.__uuid] = ({link: subject, refCount: refCount});

	return returnValue;
}

/*
 * Editor::getViewContext(element)
 *
 * Analyzes the context of a view element.
 *
 * Return value:
 *		Context description
 *
 */
"getViewContext".__declare({
	input:		"element",
	whereas:	["this instanceof Editor", "element instanceof Element", "element.getAttribute != null", "element.getAttribute('type') != null"],
	does:

function getViewContext(element)
{
	var list = [];
	
	while (element != this.viewContainer) {
	
		if (element.getAttribute('uuid') != null)
			list = [ this.contentHash[element.getAttribute('uuid')].link ].concat(list);
			
		element = element.parentNode;
	}
	
	return list;
}

});

/*
 * Editor::getAnchorViewNode(anchorNode)
 *
 * Returns the view node, which is responsible for the given
 * anchor node. The responsible view node is the first parent node
 * of the anchor node, that has a UUID attribute.
 *
 * Return value:
 *		- The view node (DOM)
 *		- null, if such a node does not exist
 */
"getAnchorViewNode".__declare({
	input:		"anchorNode",
	whereas:	["this instanceof Editor", "anchorNode instanceof Element", "anchorNode.getAttribute != null"],
	does:

function getAnchorViewNode(anchorNode)
{
	var targetView = anchorNode;
	var uuid;

	// Get the view node, which is associated with the event	
	while (   (targetView != null) 
	       && (targetView.getAttribute != null)
		   && ((uuid = targetView.getAttribute("uuid")) == null)
		  ) 
	{
		targetView = targetView.parentNode;
	}

	if (uuid == null)
		return null;

	return targetView;
}

});

"getAnchorViewNode".__declare({
	input:		"anchorNode",
	whereas:	["this instanceof Editor", "anchorNode instanceof Node", "anchorNode.parentNode != null"],
	does:
	
function getAnchorViewNode(anchorNode)
{
	return this._getAnchorViewNode(anchorNode.parentNode);
}

});

/*
 * Editor::getContentObject(viewNode)
 *
 * Returns the content object that is associated with a given view node.
 *
 * Return value:
 *		The content object
 */
"getContentObject".__declare({
	input:		"viewNode",
	whereas:	["this instanceof Editor", "viewNode instanceof Element", "viewNode.getAttribute != null", "viewNode.getAttribute('uuid') != null"],
	does:

function getContentObject(viewNode)
{
	return this.contentHash[viewNode.getAttribute('uuid')].link;
}

});

/*
 * Editor::switchFocus(eventDescription)
 *
 * Switches the focus inside the editor
 *
 */
"switchFocus".__declare({
	input:		["eventDescription"],
	whereas:	["this instanceof Editor", 
				 
				 "eventDescription.__is('event_description')",
				 "eventDescription.destNode instanceof Element",
				 "eventDescription.anchorNode instanceof Node",
				 "typeof(eventDescription.anchorOffset) == 'number'",
				 
				 "this.lastFocussed != eventDescription.destNode"
				],
	does:

function switchFocus(eventDescription)
{
	if (this.lastFocussed != null) {
		if (!this.lastFocussed._lostFocus(this, eventDescription.destNode))
			return false;
	}

	if (!eventDescription.destNode._receiveFocus(this.lastFocussed, eventDescription))
		return false;

	this.lastFocussed = eventDescription.destNode;
	this.focussedContent = this._getContentObject(this.lastFocussed);
	this.currentSemantics = this.focussedContent.__def;
	
	document.title = this.currentSemantics.join(",");
	
	return true;
}

});

"switchFocus".__declare({
	input:		["eventDescription"],
	whereas:	["this instanceof Editor", 
				 
				 "eventDescription.__is('event_description')",
				 "eventDescription.destNode == null",
				],
	does:

function switchFocus(eventDescription)
{
	return false;
}

});

"switchFocus".__declare({
	input:		["eventDescription"],
	whereas:	["this instanceof Editor", 
				 
				 "eventDescription.__is('event_description')",
				 "eventDescription.destNode instanceof Element",				
				 "eventDescription.destNode == this.lastFocussed"
				],
	does:

function switchFocus(eventDescription)
{
	return true;
}

});

/*
 * Editor::makeDescription(event)
 *
 * Builds an event descriptor from an event for the
 * given editor.
 *
 */
"makeDescription".__declare({
	input:		"event",
	output:		"event_description",
	whereas:	["this instanceof Editor", 
				 "(event instanceof Event) || (event == null)",
				 "window != null"
				],
	does:

function makeDescription(event)
{
	var eventDescription = new Object();

	eventDescription.selection = window.getSelection();
	eventDescription.anchorNode = eventDescription.selection.anchorNode;
	eventDescription.anchorOffset = eventDescription.selection.anchorOffset;

	eventDescription.destNode = this._getAnchorViewNode(eventDescription.anchorNode);

	if (eventDescription.destNode != null)
	{
		eventDescription.content = this._getContentObject(eventDescription.destNode);
		eventDescription.contextList = this._getViewContext(eventDescription.destNode);
	}

	eventDescription.editor = this;
	eventDescription.event = event;	
	
	return eventDescription;
}

});

/*
 * Editor::saveCaret(anchorNode, anchorOffset) => [list]
 *
 * Stores the coordinates of the caret in a node-independend format.
 * The information stores the number of child nodes instead of
 * the concreate DOM nodes. Therefore it is no problem to exchange
 * a node to restore the caret position.
 *
 */
"saveCaret".__declare({
	input:		["anchorNode", "anchorOffset"],
	output:		"list",
	whereas:	["this instanceof Editor", 
				 "anchorNode instanceof Node",
				 "anchorOffset.__is('number')",
				],
	does:

function saveCaret(anchorNode, anchorOffset)
{
	var path = [anchorOffset];
	var current = anchorNode;

	while(current != this.viewContainer) {
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

/*
 * Editor::restoreCaret(path)
 *
 * Restores the caret according to the given path. If one
 * element of the path doesn't exist any more, the function
 * tries to place the caret to the first position of the next
 * successor in the tree's corner.
 *
 */
"restoreCaret".__declare({
	input:		["path"],
	whereas:	["this instanceof Editor", 
				 "path.__is('list')",
				 "window != null"
				],
	does:

function restoreCaret(path)
{
	var current = this.viewContainer;

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

/*
 * Editor::setCaret(anchor_node, anchor_offset)
 *
 * Sets the caret to a given position.
 *
 */
"setCaret".__declare({
	input:		["anchorNode", "anchorOffset"],
	whereas:	["this instanceof Editor", 
				 "anchorNode instanceof Node",
				 "anchorOffset.__is('number')",				 
				 "window != null"
				],
	does:

function setCaret(anchorNode, anchorOffset)
{
	var selection = window.getSelection();
	selection.collapse(anchorNode, anchorOffset);
	
	this._switchFocus(this._makeDescription(null));
}

});

/*
 * Editor::getCaret(anchor_node, anchor_offset)
 *
 * Gets the current position and returns an object {anchorNode: , anchorOffset}
 *
 */
"getCaret".__declare({
	input:		["anchorNode", "anchorOffset"],
	output:		["caret_position", "structure"],
	
	whereas:	["this instanceof Editor", 
				 "window != null"
				],
	does:

function getCaret(anchorNode, anchorOffset)
{
	var selection = window.getSelection();
	
	return {anchorNode: selection.anchorNode, anchorOffset: selection.anchorOffset};
}

});

/*
 * Editor::insertContent(object, context, offset)
 *
 * Inserts a content object at the given context position and text offset.
 * Whereas "context" is a list of all objects inside the content hierarchy
 * from its top to the element to modify.
 *
 */
"insertContent".__declare({
	input:		["object", "context", "offset"],
	whereas:	["this instanceof Editor", 
				 "object != null",
				 "window != null"
				],
	does:

function insertContent(object, context, offset)
{
//console.profile();
	var caretPosition, updateList, offsetContext, domCaret;

	// Save caret position
	domCaret = this._getCaret();
	caretPosition = this._saveCaret(domCaret.anchorNode, domCaret.anchorOffset);

	// Change model
	offsetContext = context.concat([offset]);
	updateList = context[0]._propagateMerge(offsetContext, 0, object);

	// Update view
	this._updateViews(context.slice(0,-1), updateList);

	// Restore caret position
	caretPosition[0] ++;
	this._restoreCaret(caretPosition);
//console.profileEnd();
}

});

/*
 * Editor::onClick(event)
 *
 * Handles a click into the editor view. The caller have to make sure, that the reference
 * to "this" is the editor object associated with the view.
 *
 * This function will call the high-level event "onSetCaret".
 *
 */
Editor.prototype.onClick = function(eventDescription)
{
	if (this._switchFocus(eventDescription))
		return;
		
	this.stopPropagation();
	this.preventDefault();
}

/*
 * Editor::onKeyPress(event)
 *
 * Handles a keypress inside the editor view. The caller have to make sure, that the reference
 * to "this" is the editor object associated with the view.
 *
 * This function multiplexes several high-level events:
 *
 * - Ignore cursor moves
 * - Insert content
 * - Delete content
 *
 */
Editor.prototype.onKeyPress = function(eventDescription)
{
	var event = eventDescription.event;

	// Ignore cursor events
	if ((event.keyCode > 32) && (event.keyCode < 41)) {
		return;
	}
	 else if (event.charCode != 0) {
	 	// Insert text
	 	if (this.currentSemantics.__understoodAs("*", "text") > -1) {
	 		var newText = String.fromCharCode(event.charCode).__tag(this.currentSemantics);

			this._insertContent(newText, eventDescription.contextList, eventDescription.anchorOffset);

			event.preventDefault();
			event.stopPropagation();
			
			return;
		}
	}

	// Don't do anything else, if we didn't allowed it explicitly
	event.preventDefault();
	event.stopPropagation();	
}


/*
 * Editor::onKeyUp(event)
 *
 * Handles a keypress inside the editor view. The caller have to make sure, that the reference
 * to "this" is the editor object associated with the view.
 *
 * This function multiplexes several high-level events:
 *
 * - Focus change after cursor move
 *
 */
Editor.prototype.onKeyUp = function(eventDescription)
{
	var event = eventDescription.event;

	// Move cursor
	if ((event.keyCode > 32) && (event.keyCode < 41)) {
		if (this._switchFocus(eventDescription))
			return;
	}

	// Don't do anything else, if we didn't allowed it explicitly
	event.stopPropagation();	
	event.preventDefault();
}

