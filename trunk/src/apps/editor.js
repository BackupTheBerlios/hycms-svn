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
 *		viewContent				Renders a given content
 *		show					Shows the editor view for a given content path
 *
 *		propagateDownwards		Propagates a certain event downwards the tree
 *		getViewNode				Retrieves the view node responsible for a given DOM node
 *
 *		changeFocus				Changes the focus inside the editor
 *		insertText				Inserts a given text with a given semantic on a given position
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
 */
function Editor(viewContainer)
{
	var self = this;
	this.viewContainer = viewContainer;

	// Register events Handlers
	viewContainer.addEventListener("click", function(event) { try { self.onClick(event); } catch(e) { console.log(e) } }, true);
	viewContainer.addEventListener("keypress", function(event) { if (event.target == viewContainer) try { self.onKeyPress(event); } catch(e) { console.log(e) } }, true);
	viewContainer.addEventListener("keyup", function(event) { if (event.target == viewContainer) try { self.onKeyUp(event); } catch(e) { console.log(e) } }, true);

	// Prevent context menu
	viewContainer.addEventListener("contextmenu", function(event) { event.preventDefault(); event.stopPropagation(); }, true);

	// Register all aspects
	function aspectCallback() { self.htmlRenderAspect.apply(self, arguments); }
	aspectCallback._observe(["|View; <(~html)>; html < text; {set_uuid_attribute}"], ":after");

	// Make the editor "contentEditable"
	this.viewContainer.contentEditable = true;
}

/*
 * Editor::viewContent(content)
 *
 * Visualizes a certain content object into the editor view.
 *
 */
Editor.prototype.viewContent = function(content)
{
	// Flush old content tree
	this.content = content;
	this.contentHash = new Object();
	this.contentHash.nextID = 0;

	// We only accept those HTML views, that can set us the uuid_attribute
	var html = "|View; <(~html)>; ?html < text; {set_uuid_attribute, ?not_editable_attribute}"._send ( content );

	this.viewContainer.innerHTML = html;
}

/*
 * Editor::show(content_path)
 *
 * Shows a document inside the Editor
 *
 */
Editor.prototype.show = function (contentPath)
{
	var self = this;

	// Prepare callback
	function viewContentCallback(content)
	{
		self.viewContent(content);
	}
	viewContentCallback._as("|callback < function; >(?path)<; ?path < ?text");

	// Call data provider
	"|?SemanticDataProvider < DataProvider"._send ( contentPath._as("|path < text"), 
													viewContentCallback
												  );
								  
}

/*
 * Editor::htmlRenderAspect(receiver, result, input, def)
 *
 * Watches all HTML-Render nodes for rendering some content. If this
 * is done, the aspect will register the content to the contentHash by
 * a unique id.
 *
 */
Editor.prototype.htmlRenderAspect = function(receiver, result, input, def)
{
	var input_object = input._get(def._getUnorderedRelationElement(">()<", 0, 0).name);
	var uuid_string = HtmlView_uuid_attribute(input_object);

	// Register object by its UUID
	this.contentHash[input_object.__uuid] = input_object;
	
	return result;
}

/*
 * Editor::propagateDownwards(target, handler(node) )
 *
 * Calls "handler" for each view nodes in the propagation hierarchy
 * upwards of target. A DOM node is seen as view node, iff. it has the
 * UUID-attribute. The view hierarchy will be traversed downwards.
 * The handler will also be called for the target itself. 
 *
 */
Editor.prototype.propagateDownwards = function(target, handler)
{
	var propagationList = [];
	var node = target;
	
	while ((node != null) && (node.getAttribute != null) && (node != this.viewContainer))
	{
		if (node.getAttribute("uuid") != null)
			propagationList.push(node);
			
		node = node.parentNode;
	}
	
	for (var idx=0; idx < propagationList.length; idx ++) {
		handler(propagationList[idx]);
	}
}

/*
 * Editor::sendEventWithContext(message, node, ...)
 *
 * Sends an event message with respect to a certain DOM node "node". The
 * message begins with the message string "message". The message will
 * be extended by the entire context of the content object represented
 * by the view node.
 *
 * The "node" is a native datatype.
 *
 * Return value:
 *		Answer of the message receiver
 *
 */
Editor.prototype.sendEventWithContext = function(msg, node)
{
	var self = this;
	var context = ". ";
	var inheritances = "";
	
	// Build context relation
	this.propagateDownwards(node, function _stopEdit(parent_node) {
		var parent_object = self.contentHash[parent_node.getAttribute("uuid")];

		context += " << ?~"+parent_object._getClassName();
		inheritances += parent_object._relationToString("<", 0, true, "?") + "; ";
	});
	
	// Extract arguments
	var args = [];
	
	for (var idx = 2; idx < arguments.length; idx++) {
		args.push(arguments[idx]);
	}
	
	// Send message
	return String.prototype._send.apply(("|"+msg+"; "+inheritances+context), args);
}

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
Editor.prototype.getViewNode = function(anchorNode)
{
	var targetView = anchorNode.parentNode;
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

/*
 * Editor::changeFocus(anchorNode, anchorOffset, pageX, pageY)
 *
 * Informs the views about changing of the caret inside the editor. "anchorNode"
 * is the node which should receive the focus at position "anchorOffset". The
 * coordinates "pageX" and "pageY" should give further informations about the position,
 * the user selected exactly.
 *
 * This function call StopEdit on the view which is going to lose its focus (this.lastFocussed).
 * If this view accepts the lost of focus, the message BeginEdit will be called for the view
 * that will receive the focus. If it accepts the new focus, lastFocussed will be updated.
 * Further propagation of the event will be prevented.
 *
 * Return value:
 *		true			Event accepted
 *		false			Event not accepted
 *		null			Event not handled
 *
 */
Editor.prototype.changeFocus = function(anchorNode, anchorOffset, pageX, pageY)
{
	var targetView = this.getViewNode(anchorNode);
	var lastFocussed = null;
	var uuid = (targetView != null) ? (targetView.getAttribute("uuid")) : null;
	var targetModel = this.contentHash[uuid];

	// Event did not targeting a view node
	if (uuid == null)
		return null;

	// Objectify node
	targetView = (new Native(targetView))._as("|?anchor_view < ?dom_node < native");
	
	// Create target description
	var eventCoordinates = { "|?anchor_node < ?dom_node < native":	 	new Native(anchorNode), 
			 				 "|?anchor_offset < number": 				anchorOffset,
							 "|?anchor_view < ?dom_node < native":		targetView,
							 "|?page_x < cartesian < number":			pageX,
							 "|?page_y < cartesian < number":			pageY
						   }._as("|event_coordinates < structure");

	// Send stop edit
	if (this.lastFocussed != null) {
		var lastFocussed = (new Native(this.lastFocussed))._as("|?last_focussed_view < ?dom_node < native");
	
		var accepted = this.sendEventWithContext("StopEdit; {use_uuid_attribute, unset_is_focussed, use_content_editable_caret}; <(accepted)>; accepted < boolean", 
												 lastFocussed.valueOf(), 
												 eventCoordinates, lastFocussed, this.contentHash[lastFocussed.valueOf().getAttribute("uuid")]
												);
	
		if (!accepted)
			return false;
	}		

	// Send begin edit
	var accepted = this.sendEventWithContext("BeginEdit; {use_uuid_attribute, set_is_focussed, use_content_editable_caret}; <(accepted)>; accepted < boolean", 
											 targetView.valueOf(), 
											 eventCoordinates, targetModel
											);

	if (!accepted)
		return false;
		
	// Set up focus
	this.lastFocussed = targetView.valueOf();
	
	// Set current semantics
	this.currentSemantics = targetModel._def_string();
	document.title = this.currentSemantics;
	return true;
}

/*
 * Editor::insert(object, anchorNode, anchorOffset)
 *
 * Inserts a given "object" at the given anchor node and offset. This function
 * will send a "InsertChild" event to the view of the given anchor node. If the
 * node denies the insertion, the event will be passed to its parent node.
 *
 * The called node should place the object as its child and call View to
 * show it into the tree.
 *
 * Return value:
 *		true		Operation accepted
 *		false		Operation denied
 *		null		Operation not applicable on the given node
 *
 */
Editor.prototype.insert = function(object, anchorNode, anchorOffset)
{
	var accepted = false;
	var parentView = this.getViewNode(anchorNode);
	
	do {
		// Create target description
		var eventCoordinates = { "|?anchor_node < ?dom_node < native":	 	new Native(anchorNode), 
				 				 "|?anchor_offset < number": 				anchorOffset,
								 "|?anchor_view < ?dom_node < native":		parentView,
							   }._as("|event_coordinates < structure");

		parentView = this.getViewNode(anchorNode);
		
		if (parentView == null)
			return null;

		accepted = this.sendEventWithContext("InsertChild; {call_view_method, use_uuid_attribute}; call_view_method: {set_uuid_attribute, ?not_editable_attribute}; <(accepted)>; accepted < boolean",
											 eventCoordinates,
											 object._extend("?child_model"),
											 this.contentHash[parentView.getAttribute("uuid")]._extend("?parent_model")
											);
	
	} while(!accepted);
	
	return true;
}

/*
 * Editor::onClick(event)
 *
 * Handles a click into the editor view. The caller have to make sure, that the reference
 * to "this" is the editor object associated with the view.
 *
 * This function will call the high-level event "onSetCaret".
 *
 */
Editor.prototype.onClick = function(event)
{
	var selection = window.getSelection();

	if (this.changeFocus(selection.anchorNode, selection.anchorOffset, event.pageX, event.pageY) != null) {
		event.preventDefault();
		event.stopPropagation();
	}
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
Editor.prototype.onKeyPress = function(event)
{
	// Ignore cursor events
	if ((event.keyCode > 32) && (event.keyCode < 41)) {
		return;
	}

	// Insert text
	if (event.charCode != 0) {
		var selection = window.getSelection();
		var inputText = String.fromCharCode(event.charCode)._as(this.currentSemantic);
		
		this.insert(inputText, selection.anchorNode, selection.anchorOffset);
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
Editor.prototype.onKeyUp = function(event)
{
	// Move cursor
	if ((event.keyCode > 32) && (event.keyCode < 41)) {
		var selection = window.getSelection();

		this.changeFocus(selection.anchorNode, selection.anchorOffset, event.pageX, event.pageY)

		return;
	}

	// Don't do anything else, if we didn't allowed it explicitly
	event.preventDefault();
	event.stopPropagation();	
}

