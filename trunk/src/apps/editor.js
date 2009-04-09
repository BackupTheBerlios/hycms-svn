/*
 * [class] Editor
 *
 * Properties:
 *		viewContainer		The DOM node used to show the content
 *		content				The currently viewed document as content tree
 *		contentHash			Map from HTML node tags to content objects
 *		focussedNode		Node with the current focus
 *
 * Methods:
 *		viewContent
 *		show
 *		propagateDownwards		Propagates a certain event downwards the tree
 *
 * Aspects:
 *		htmlRenderAspect		Extends all HTML views with event handling and tags them
 *								to the contentHash
 *
 * Events:
 *		onClick					Click event
 *
 */
function Editor(viewContainer)
{
	var self = this;
	this.viewContainer = viewContainer;

	// Register events Handlers
	viewContainer.addEventListener("click", function(event) { try { self.onClick(event); } catch(e) { console.log(e) } } , true);
	viewContainer.addEventListener("keypress", function(event) { try { self.onClick(event); } catch(e) { console.log(e) } } , true);

	// Register all aspects
	function aspectCallback() { self.htmlRenderAspect.apply(self, arguments); }
	aspectCallback._observe(["|View; <(~html)>; html < text; {set_uuid_attribute}"], ":after");
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
	
	while ((node != null) && (node != this.viewContainer))
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
 * Editor::onClick(event)
 *
 * Handles a click into the editor view. The system guarantees, that the reference
 * to "this" is the editor object associated with the view.
 *
 */
Editor.prototype.onClick = function(event)
{
	var targetView = event.target;
	var selection = window.getSelection();
	var lastFocussed = null;

	// Get the view node, which is associated with the event
	var uuid;
	
	while ((uuid = targetView.getAttribute("uuid")) == null) {
		targetView = targetView.parentNode;
		
		// Event is not targeting a view node
		if (targetView == null)
			return;
	}

	// Objectify node
	targetView = (new Native(targetView))._as("|?anchor_view < ?dom_node < native");
	
	// Create target description
	var eventCoordinates = { "|?anchor_node < ?dom_node < native":	 	new Native(selection.anchorNode), 
			 				 "|?anchor_offset < number": 				selection.anchorOffset,
							 "|?anchor_view < ?dom_node < native":		targetView,
							 "|?page_x < cartesian < number":			event.pageX,
							 "|?page_y < cartesian < number":			event.pageY
						   }._as("|event_coordinates < structure");

	// Send stop edit
	if (this.lastFocussed != null) {
		var lastFocussed = (new Native(this.lastFocussed))._as("|?last_focussed_view < ?dom_node < native");
	
		var accepted = this.sendEventWithContext("StopEdit; {use_uuid_attribute, unset_is_focussed}; <(accepted)>; accepted < boolean", 
												 lastFocussed.valueOf(), 
												 eventCoordinates, lastFocussed, this.contentHash[lastFocussed.valueOf().getAttribute("uuid")]
												);
	
		if (!accepted)
			return;
	}		

	// Send begin edit
	var accepted = this.sendEventWithContext("BeginEdit; {use_uuid_attribute, set_is_focussed}; <(accepted)>; accepted < boolean", 
											 targetView.valueOf(), 
											 eventCoordinates, this.contentHash[targetView.valueOf().getAttribute("uuid")]
											);

	if (!accepted)
		return;
		
	// Set up focus
	this.lastFocussed = targetView.valueOf();
	
	// Finish handling
	event.preventDefault();
	event.stopPropagation();

	return true;
}

