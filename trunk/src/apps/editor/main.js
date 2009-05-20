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
 *		getModel				Returns the model reference of a UUID
 *		registerViewNode		Registers a DOM view node to the editor and sets its model attribute
 *		unregisterViewNode		Removes a DOM view node from the editor
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
	this.viewContainer.__isHeadContainer = true;
	this.viewContainer.__controller = this;
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

		// We only accept those HTML views, that can set us the uuid_attribute
		var html = content._view({_returns: ["*", "html", "text"], _features: ["?recursive_context", "keep_method_conditions", "set_uuid_attribute"]});

		this.viewContainer._setInnerHTML({html: html});
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
 * Editor::getModel(uuid)
 *
 * Returns the model reference to an UUID.
 *
 */
"getModel".__declare({
	_this:		"@Editor",
	uuid:		"text",
	
_does:
	function(uuid)
	{
		return this.contentHash[uuid].link;
	}
});

/*
 * Editor::registerView(node)
 *
 * Registers a given view element to the editor.
 *
 */
"registerView".__declare({
	_this:		"@Editor",
	view:		"@Element",
	
	_features:	"use_uuid_attribute",
	
	_whereas:	"view.getAttribute('uuid') != null",
	
_does: 
	function(node)
	{
		var uuid = node.getAttribute("uuid");
		var viewList = this.contentHash[uuid].views;
		
		if (viewList.indexOf(node) > -1) return;
		
		viewList.push(node);
	}
});

/*
 * Editor::unregisterView(node)
 *
 * Unregisters a view. If there is no view referencing to a model
 * object anymore, the model object will also be freed.
 *
 */
"unregisterView".__declare({
	_this:		"@Editor",
	view:		"@Element",
	
	_features:	"use_uuid_attribute",
	
	_whereas:	"view.getAttribute('uuid') != null",
	
_does: 
	function(node)
	{
		var uuid = node.getAttribute("uuid");
		var refEntry = this.contentHash[uuid];
		var index = refEntry.views.indexOf(node);
		
		if (index > -1) return;
		
		refEntry.views.splice(index, 1);
		
		// Garbage-collect view table entry
		if (refEntry.views.length == 0)
			delete this.contentHash[uuid];
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
		
	this.contentHash[subject.__uuid] = ({link: subject, views: []});

	return returnValue;
}

/*
 * OnKeyPress event
 *
 */
BrowserKit.PrototypeEvent({
	jsPrototype:		"Element",
	event:				"keypress",
	_whereas:			"this.relatedEditor != undefined",

_does:
	function(eventDescription)
	{
		if ((eventDescription.keyCode >= 33) && (eventDescription.keyCode <= 40))
			return;
		
		if (eventDescription.charCode) {
			var insertedText = String.fromCharCode(eventDescription.charCode);
		
			this.content._insertChild({newChild: insertedText, 
									   context: eventDescription.targetViewContext, 
									   contextPosition: 0, 
									   insertOffset: eventDescription.anchorOffset
									  });
		}
		
				
		eventDescription._stopPropagation();
	}
});
