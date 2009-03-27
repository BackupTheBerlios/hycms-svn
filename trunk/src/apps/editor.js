/*
 * [class] Editor
 *
 * Properties:
 *		viewContainer		The DOM node used to show the content
 *		content				The currently viewed document as content tree
 *		contentHash			Map from HTML node tags to content objects
 *
 * Methods:
 *		viewContent
 *		show
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
 * Editor::onClick(event)
 *
 * Handles a click into the editor view. The system guarantees, that the reference
 * to "this" is the editor object associated with the view.
 *
 */
Editor.prototype.onClick = function(event)
{
	var parent_node = event.target;
	var selection = window.getSelection();
	var uuid;
	var ex_node;
	
	var text_coordinates = { "|?anchor_node < ?dom_node < native":	 	new Native(selection.anchorNode), 
							 "|?anchor_offset < number": 				selection.anchorOffset
						   }._as("|?selection_coordinates < structure");

	// Get associated parent node
	while ((uuid = parent_node.getAttribute("uuid")) == null) {
		parent_node = parent_node.parentNode;
		
		// Event not going to a tagged node
		if (parent_node == null)
			return;
	}

	// Objectify node
	parent_node = (new Native(parent_node))._as("|?focussed < ?dom_node < native");
	
	// Get unfocussed node
	if (this.focussed_node != null) {
		ex_node = (new Native(this.focussed_node.valueOf()))._as("|?unfocussed < ?dom_node < native");

		// Send stop edit, to currently focussed node
		var lost_accepted =
			"|StopEditHandler; {use_uuid_attribute, unset_is_focussed}; <(accepted)>; accepted < boolean"._send(ex_node, parent_node);

		// Change of focus was not accepted
		if (!lost_accepted)
			return;
	}
	 else {
	 	ex_node = null;
	}

	// Send begin edit to newly focussed node
	"|BeginEditHandler; {use_uuid_attribute, set_is_focussed}; <(accepted)>; accepted < boolean"._send(parent_node, 
																									   ex_node,
																									   this.contentHash[uuid], 
																									   text_coordinates
																									  );
	this.focussed_node = parent_node;
}

