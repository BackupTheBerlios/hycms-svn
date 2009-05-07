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
 *		currentSemantics		Current semantics selected by the user
 *
 * Methods:
 *		show					Visualizes the content inside the editor
 *		showReference			Visualizes the content of a reference inside the editor
 *
 * Aspects:
 *		htmlRenderAspect		Extends all HTML views with event handling and tags them
 *								to the contentHash
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
	this.viewContainer = viewContainer;

	// Register events Handlers
	viewContainer.addEventListener("click", function(event) { try { self.onClick(self._makeDescription(event)); } catch(e) { console.log(e) } }, true);
	viewContainer.addEventListener("keypress", function(event) { if (event.target == viewContainer) try { self.onKeyPress(self._makeDescription(event)); } catch(e) { console.log(e) } }, true);
	viewContainer.addEventListener("keyup", function(event) { if (event.target == viewContainer) try { self.onKeyUp(self._makeDescription(event)); } catch(e) { console.log(e) } }, true);

	// Prevent context menu
	viewContainer.addEventListener("contextmenu", function(event) { event.preventDefault(); event.stopPropagation(); }, true);

	// Register all aspects
	function aspectCallback() { return self.htmlRenderAspect.apply(self, arguments); }
	aspectCallback.__observes("after", "name == 'view'");

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
 * Editor::htmlRenderAspect(aspect, method, subject, arguments, returnValue)
 *
 * Watches all HTML-Render nodes for rendering some content. If this
 * is done, the aspect will register the content to the contentHash by
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
	
		if (element.getAttribute('type') != null)
			list.push( element.getAttribute('type').split(",") );
			
		element = element.parentNode;
	}
	
	return list;
}

});

/*
 * Editor::getViewNode(anchorNode)
 *
 * Returns the view node, which is responsible for the given
 * anchor node. The responsible view node is the first parent node
 * of the anchor node, that has a UUID attribute.
 *
 * Return value:
 *		- The view node (DOM)
 *		- null, if such a node does not exist
 */
"getViewNode".__declare({
	input:		"anchorNode",
	whereas:	["this instanceof Editor", "anchorNode instanceof Element", "anchorNode.getAttribute != null"],
	does:

function getViewNode(anchorNode)
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

"getViewNode".__declare({
	input:		"anchorNode",
	whereas:	["this instanceof Editor", "anchorNode instanceof Node", "anchorNode.parentNode != null"],
	does:
	
function getViewNode(anchorNode)
{
	return this._getViewNode(anchorNode.parentNode);
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
				 "typeof(eventDescription.anchorOffset) == 'number'"
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
				 "event instanceof Event",
				 "window != null"
				],
	does:

function makeDescription(event)
{
	var eventDescription = new Object();

	eventDescription.selection = window.getSelection();
	eventDescription.anchorNode = eventDescription.selection.anchorNode;
	eventDescription.anchorOffset = eventDescription.selection.anchorOffset;

	eventDescription.destNode = this._getViewNode(eventDescription.anchorNode);

	eventDescription.content = this._getContentObject(eventDescription.destNode);
	eventDescription.contextList = this._getViewContext(eventDescription.destNode);

	eventDescription.editor = this;
	eventDescription.event = event;	
	
	return eventDescription;
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
	this._switchFocus(eventDescription);
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
		this._switchFocus(eventDescription);

		return;
	}

	// Don't do anything else, if we didn't allowed it explicitly
	event.stopPropagation();	
	event.preventDefault();
}

