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
	_whereas:			["this.contentEditable == 'true'", "this._getController() != undefined",  "this._getController().__is('editable_html_controller')"],

_does:
	function(eventDescription)
	{
		var controller = this.__controller;

		controller.focussedView = eventDescription.targetView;

		if (controller.focussedView != null) {
			controller.focussedContent = eventDescription.targetModel;
			controller.focussedViewContext = eventDescription.targetViewContext;

			try {
				controller._onSelectionChanged();
			}
			 catch(e) {

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
		if (!eventDescription.viewInformationAvailable) {
			eventDescription._stopPropagation();
			return;
		}
		
		if (eventDescription.charInput != "") {
			var insertedText = eventDescription.charInput.__tag("important_text", "text");
console.log(insertedText.length);
			eventDescription.targetRootView._insert({path: 		eventDescription.targetViewPath, 
											 		 offset: 	eventDescription.targetModelOffset,
													 child:		insertedText
					  								});
					  								
			if (eventDescription.charInput != "\n")
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
			var offset = eventDescription.targetModelOffset - 1;
			var path = eventDescription.targetViewPath;
			
			// Required for correct carret placement
			var isLastOffset =     (eventDescription.targetModel.length == offset + 1) 
								&& (path.length > 2)
								&& (path[path.length - 2].indexOf(path[path.length-1]) == path[path.length - 2].length);
			var isFirstOffset =    (offset < 0)
								&& (path.length > 2)
								&& (path[path.length - 2].indexOf(path[path.length-1]) == 0);
			

			var state =
			eventDescription.targetRootView._remove({path: 		path, 
											 		 offset: 	offset,
													 count:		1
					  								});

			if ((state != null) && (!isLastOffset) && (!isFirstOffset))
				window._caretMove({offset: -1});	

			eventDescription._stopPropagation();
		}
		 else {	 
		 	return;
		}

		
	}
});

