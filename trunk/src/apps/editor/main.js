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
 *		associateContent		Associates all view nodes with their content nodes
 *
 * Aspects:
 *		htmlRenderAspect		Registers all viewed elements to the contentHash
 *
 * Events:
 *		onClick					Click event (changes focus)
 *		onKeyPress				Keypress event (insert / delete text; no focus change)
 *		onKeyUp					KeyUp event (focus change / selection change)
 *
 * Signals:
 *		viewNode.receiveFocus		A view node receives the focus
 *		viewNode.lostFocus			A view node loses the focus
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

	// Register all aspects
	function renderAspectCallback() { return self.htmlRenderAspect.apply(self, arguments); }
	renderAspectCallback.__observes("after", "name == 'view'");

	// Make the editor pane "contentEditable"
	this.viewContainer.contentEditable = true;
	
	// Mark up view container
	this.viewContainer.isHeadContainer = true;
	this.viewContainer.relatedEditor = this;
}

/*
 * Editor::show(content)
 *
 * Visualizes a certain content object into the editor view.
 *
 */
"show".__declare({
	_this:		"@Editor",
	content:	"*",

_does:
	function(content)
	{
		// Flush old content tree
		this.content = content;
		this.contentHash = new Object();
		
		this.viewContainer.relatedContentHash = this.contentHash;

		// We only accept those HTML views, that can set us the uuid_attribute
		var html = content._view({_returns: ["*", "html", "text"], _features: ["?recursive_context", "keep_method_conditions", "set_uuid_attribute"]});

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
	_this:			"@Editor",
	contentPath:	"text",

_does:
	function(contentPath)
	{
		var self = this;

		// Prepare callback
		function viewContentCallback(content)
		{
			self._show({content: content});
		}
	
		// Call data provider
		contentPath._downloadContent({ callback: viewContentCallback });
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
 * OnClick event
 *
 */
BrowserKit.PrototypeEvent({
	jsPrototype:		"Element",
	event:				"click",
	_whereas:			"this.relatedEditor != undefined",

_does:
	function(eventDescription)
	{
		console.log("FOO");
	}
});

/*
 * OnClick event
 *
 */
BrowserKit.PrototypeEvent({
	jsPrototype:		"Element",
	event:				"keypress",
	_whereas:			"this.relatedEditor != undefined",

_does:
	function(eventDescription)
	{
		eventDescription._stopPropagation();
	}
});
