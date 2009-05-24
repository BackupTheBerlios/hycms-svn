/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 * Methods for editable views
 *
 */
 
/*
 * <"editable_html_controller", "html_controller", "controller">._construct(view)
 *
 */
Model.Construct({
	type:				["editable_html_controller", "html_controller", "controller"], 
	view:				"@Element",
	initializer:		({
							viewMap:			({}),
							focussedView:		null,
							focussedContent:	null,
							currentSemantics:	null,
							content:			null,
							viewContainer:		null
						}).__tag(["editable_html_controller", "html_controller", "controller"]),

_does:
	function editable_html_controller(view, initializer) 
	{
		// Register properties
		initializer.focussedView = null;
		initializer.focussedContent = null;
		initializer.currentSemantics = null;
	
		// Make the editor pane "contentEditable"
		initializer.viewContainer = view;
		initializer.viewContainer.contentEditable = true;
	
		// Mark up view container
		initializer.viewContainer.__isHeadContainer = true;
		initializer.viewContainer.__controller = initializer;
	
		return initializer;
	}
});	
 
 
/*
 * OnFocus event
 *
 */
BrowserKit.PrototypeEvent({
	jsPrototype:		"Element",
	event:				"focus",
	_whereas:			["this._getController() != undefined",  "this._getController().__is('editable_html_controller')"],

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
	_whereas:			["this._getController() != undefined", "this._getController().__is('editable_html_controller')"],

_does:
	function(eventDescription)
	{
		if (!eventDescription.viewInformationAvailable)
			return;
		
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
	_whereas:			["this._getController() != undefined", "this._getController().__is('editable_html_controller')"],

_does:
	function(eventDescription)
	{
		if (BrowserKit.MoveKeys.indexOf(eventDescription.keyCode) > -1) {
			return;
		}

		if (eventDescription.keyCode == KeyEvent.DOM_VK_DELETE) {
			eventDescription.targetRootView._remove({path: 		eventDescription.targetViewPath, 
											 		 offset: 	eventDescription.targetModelOffset,
													 count:		1
					  								});	
					  								
			eventDescription._stopPropagation();
		}
		else if (eventDescription.keyCode == KeyEvent.DOM_VK_BACK_SPACE) {
			var state =
			eventDescription.targetRootView._remove({path: 		eventDescription.targetViewPath, 
											 		 offset: 	eventDescription.targetModelOffset - 1,
													 count:		1
					  								});

			if (state != null)							
				window._caretMove({offset: -1});	

			eventDescription._stopPropagation();
		}
		 else {	 
		 	return;
		}

		
	}
});

