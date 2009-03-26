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
	viewContainer.addEventListener("click", function(event) { self.onClick(event); } , true);

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
	var html = "|View; <(~html)>; ?html < text; {set_uuid_attribute}"._send ( content );

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
	alert(event.target.getAttribute("uuid"));
}

