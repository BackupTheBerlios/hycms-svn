/*
 * [class] Editor
 *
 * Properties:
 *		viewContainer			The DOM node used to show the content
 *
 *		content					The currently viewed document as content tree
 *		contentHash				Map from HTML node tags to content objects
 *
 *		focussedView			Focussed view object
 *		focussedContent			Focussed content object
 *		focussedViewContext		Semantic context of the view
 *		currentSemantics		Semantics selected by the user
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
 *		htmlUpdateAspect		Updates all views after insert/remove changes in the model
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
	this.focussedView = null;
	this.focussedContent = null;
	this.currentSemantics = null;

	// Register all aspects
	function renderAspectCallback() { return self.htmlRenderAspect.apply(self, arguments); }
	renderAspectCallback.__observes("after", "name == 'view'");

	function updateAspectCallback() { return self.htmlUpdateAspect.apply(self, arguments); }
	updateAspectCallback.__observes("after", "name == 'insert'");
	updateAspectCallback.__observes("after", "name == 'remove'");
	
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

		this.viewContainer._setInnerHtml({html: html});
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
		var uuid = node._getView().getAttribute("uuid");

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
		var uuid = node._getView().getAttribute("uuid");

		var refEntry = this.contentHash[uuid];
		var index = refEntry.views.indexOf(node);
		
		if (index > -1) return;
		
		refEntry.views.splice(index, 1);

// TODO: Garbage-collection of unused model objects
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
	this.contentHash[subject.__uuid] = ({link: subject, views: []});

	return returnValue;
}

/*
 * Editor::htmlUpdateAspect(aspect, method, subject, arguments, returnValue)
 *
 * Called after all insert/remove operations. It will be used to update all affected
 * views, if a call returns "true". If a new model object was created, the new object
 * will be automatically registered by the called view() method, which is used for the
 * update.
 *
 */
Editor.prototype.htmlUpdateAspect = function(aspect, method, subject, arguments, returnValue)
{
	if (returnValue == true) {
		var uuid = subject.__uuid;
		var views = this.contentHash[uuid].views;
		
		for (var idx = 0; idx < views.length; idx ++) {
			var view = views[idx];
		
			view._setOuterHtml( { html: subject._view( {parentList: view._getModelContext() } ) } );
		}
	}

	return returnValue;
}

/*
 * OnFocus event
 *
 */
BrowserKit.PrototypeEvent({
	jsPrototype:		"Element",
	event:				"focus",
	_whereas:			"this._getController() != undefined",

_does:
	function(eventDescription)
	{
		this.focussedView = eventDescription.targetView;

		if (this.focussedView != null) {
			this.focussedContent = eventDescription.targetModel;
			this.focussedViewContext = eventDescription.targetViewContext;
		
			if (this.focussedContent) {
				var tagArray = [];

				this.currentSemantics = this.focussedContent.__getTagging();
	
				for (var idx = 0; idx < this.focussedViewContext.length; idx ++) {
					if (this.focussedViewContext[idx] != null)
						tagArray.splice(0, 0, this.focussedViewContext[idx].__getClassName() );
				}
				tagArray.push(this.focussedContent.__getClassName());
				
				document.getElementById("semantics").value = tagArray.join(" > ");
			}
		}
	}
});

/*
 * OnKeyPress event
 *
 */
BrowserKit.PrototypeEvent({
	jsPrototype:		"Element",
	event:				"keypress",
	_whereas:			"this._getController() != undefined",

_does:
	function(eventDescription)
	{
		if (eventDescription.charInput != "") {
			var insertedText = eventDescription.charInput.__tag("important_text", "text");

			eventDescription.targetRootView._insert({path: 		eventDescription.targetViewPath, 
											 		 offset: 	eventDescription.targetModelOffset,
													 child:		insertedText
					  								});
			window._caretMove();
		}
	 
		eventDescription._stopPropagation();
	}
});

/*
 * OnKeyDown event
 *
 */
BrowserKit.PrototypeEvent({
	jsPrototype:		"Element",
	event:				"keydown",
	_whereas:			"this._getController() != undefined",

_does:
	function(eventDescription)
	{
		if (BrowserKit.MoveKeys.indexOf(eventDescription.keyCode) > -1)
			return;	

		if (eventDescription.keyCode == KeyEvent.DOM_VK_DELETE) {
			eventDescription.targetRootView._remove({path: 		eventDescription.targetViewPath, 
											 		 offset: 	eventDescription.targetModelOffset,
													 count:		1
					  								});	
		}
		else if (eventDescription.keyCode == KeyEvent.DOM_VK_BACK_SPACE) {
			var state =
			eventDescription.targetRootView._remove({path: 		eventDescription.targetViewPath, 
											 		 offset: 	eventDescription.targetModelOffset - 1,
													 count:		1
					  								});

			if (state != null)							
				window._caretMove({offset: -1});	
		}
		 else {	 
		 	return;
		}

		eventDescription._stopPropagation();
	}
});

