/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 * General event-related methods
 *
 */
var BrowserKit = ({});

BrowserKit.AvailableEvents = ["click", "mousedown", "mouseup", "keypress", "keydown", "keyup", "context", "focus", "blur"];
BrowserKit.DOMHandledEvents = ["click", "mousedown", "mouseup", "keypress", "keydown", "keyup", "context"];
BrowserKit.BrowserKitHandledEvents = ["focus", "blur"];
BrowserKit.FocusEvents = ["focus", "blur"];
 
BrowserKit.MoveKeys = [
					   KeyEvent.DOM_VK_PAGE_UP, 
					   KeyEvent.DOM_VK_PAGE_DOWN,
					   KeyEvent.DOM_VK_END,
					   KeyEvent.DOM_VK_HOME,
					   KeyEvent.DOM_VK_LEFT,
					   KeyEvent.DOM_VK_UP,
					   KeyEvent.DOM_VK_RIGHT,
					   KeyEvent.DOM_VK_DOWN
					  ];
 
BrowserKit.TargetIsFocus = ["keyup", "keydown", "keypress"];
 
BrowserKit.__protoEvent =({
							selection:		{anchorNode:	null,	anchorOffset: -1},
						
							type:			"unknown",
							
							lastFocus:				null,
							focusChangedInside:		false,
							
							targetNode:			null,
							targetView:			null,
							targetModel:		null,
							targetViewContext:	null,
							targetViewPath:		null,
							targetModelOffset:	null,
							targetRootView:		null,
							
							viewInformationAvailable:	false,
							
							parentNotification:	false,
							
							keyCode:		-1,
							charCode:		-1,
							charInput:		"",
							
							altKey:			false,
							ctrlKey:		false,
							shiftKey:		false,
							
							mouseX:			0,
							mouseY:			0,
							mouseButton:	0,
							
							__native:				null,
							__propagationStopped:	false
						 }).__tag("event_description", "structure");
 
/*
 * [private] BrowserKit.__eventFromTarget
 *
 * Initializes an event descriptor using a dom target node.
 *
 */
BrowserKit.__eventFromTarget = function(initializer, dom_target)
{
	var viewInfoAvl = true;

	initializer.lastFocus = window.lastFocus;
	initializer.selection = window._getCaret();

	try {
		initializer.targetNode = dom_target;
		initializer.targetView = initializer.targetNode._getView();
	
		if (initializer.targetView != null) {
			initializer.targetModel = initializer.targetView._getModel();
			initializer.targetViewContext = initializer.targetView._getModelContext();

			initializer.targetViewPath = initializer.targetViewContext.concat([initializer.targetModel]);

			initializer.targetModelOffset = initializer.targetView._translateOffset({anchorNode: dom_target, anchorOffset: initializer.selection.anchorOffset});
			initializer.targetRootView = initializer.targetViewPath[0];
		}
	}
	 catch(e) {
	 	initializer.targetModel = null;
	 	initializer.targetViewContext = null;
	 	initializer.targetViewPath = null;
	 	initializer.targetViewModelOffset = null;
	 	initializer.targetViewRootView = null;
	 
	 	viewInfoAvl = false;
	}
	
	initializer.viewInformationAvailable = viewInfoAvl;
}
 
/*
 * [constructor] event_description(domEvent)
 *
 * Creates a new "event_description" based on the given DOM-Event.
 *
 */
Model.Construct({
		type:			["event_description", "structure"],
		initializer:	BrowserKit.__protoEvent,

		domEvent:	"@Event",
		
		_optional_domTarget:		"?",
		
_does:
	function(domEvent, domTarget, initializer)
	{
		var target = (domTarget == null) ? domEvent.target : domTarget;

		initializer.type = domEvent.type.toLowerCase();
		
		BrowserKit.__eventFromTarget(initializer, target);

		initializer.keyCode = domEvent.keyCode;
		initializer.charCode = domEvent.charCode;
		
		if (initializer.charCode != 0)
			initializer.charInput = String.fromCharCode(domEvent.charCode);
			
		// Handle CR
		if (initializer.keyCode == 13) {
			initializer.charCode = 13;
			initializer.charInput = "\n";
		}
		
		initializer.altKey = domEvent.altKey;
		initializer.ctrlKey = domEvent.ctrlKey;
		initializer.shiftKey = domEvent.shiftKey;	
		
		initializer.mouseX = domEvent.pageX;
		initializer.mouseY = domEvent.pageY;
		initializer.mouseButton = domEvent.button;
		
		initializer.__native = domEvent;
	
		return initializer;
	}
});

/*
 * [constructor] event_description(type, target)
 *
 * Creates a new "event_description" based on the given DOM-Event.
 *
 */
Model.Construct({
		type:			["event_description", "structure"],
		eventType:		"text",
		eventTarget:	"@Node",
		
		initializer:	BrowserKit.__protoEvent,
_does:
	function(eventType, eventTarget, initializer)
	{
		initializer.type = eventType;
		BrowserKit.__eventFromTarget(initializer, eventTarget);

		return initializer;
	}
});


/*
 * [constructor] event_description()
 *
 * Creates a new "event_description" based on the given DOM-Event.
 *
 */
Model.Construct({
		type:			["event_description", "structure"],
		initializer:	BrowserKit.__protoEvent,
_does:
	function(initializer)
	{
		return initializer;
	}
});

/* 
 * Generic used for event declarators
 *
 */
BrowserKit.__eventGeneric = function(event) { 
								if (BrowserKit.AvailableEvents.indexOf(event) > -1) 
									return {_name:	"on"+event, eventDescription: ["event_description", "structure"] }
								else
									throw new Error("Invalid event type");
							}

/*
 * [declarator]<jsPrototype, event>	Object::on<event>(eventDescription)
 *
 * Declares an event handler for the given event name "eventID" (like mouseDown). The
 * event applies on events.
 * 
 */
BrowserKit.PrototypeEvent = buildDeclarator(null, {
	_generic_jsPrototype:	function(proto) { return {_whereas:	"this instanceof "+proto } },
	_generic_event:			BrowserKit.__eventGeneric
});

/*
 * [declarator]<modelType, event>	Object::on<event>(eventDescription)
 *
 * Declares an event handler for all view nodes, that are representing model objects tagged with
 * 'modelType'.
 * 
 */
BrowserKit.ViewEvent = buildDeclarator(null, {
	_generic_modelType:		function(tag) { return {_max:	"this._getModel() ? this._getModel().__taggedAs('"+ tag.join("','") + "') : -1" } },
	_generic_event:			BrowserKit.__eventGeneric
});

/*
 * event_description::stopPropagation()
 *
 * Stops the propagation of the given event.
 *
 */
"stopPropagation".__declare({
	_this:		["event_description", "structure"],
	_whereas:	["this.__native instanceof Event"],

_does:
	function stopPropagation()
	{
		this.__propagationStopped = true;
		this.__native.preventDefault();
		this.__native.stopPropagation();
	}
});

/*
 * Element::addEventHandler(type, handler, useCapture = true, context = this)
 *
 * Whenever the event "type" occurs, the given handler function will be called. If 
 * 'useCapture' is set to "true", the handler will be called before lower elements in
 * the DOM tree. If "context" is given, the handlerFunction will receive "context"
 * as "this"-reference.
 *
 * The valid types of events can be determined in BrowserKit.AvailableEvents.
 *
 * The handler is a regular javascript function of the type:
 *
 *	function(eventDescription)
 *
 * As parameter it receives an event_description object.
 *
 */
 
// Method for all DOM events
"addEventHandler".__declare({
	_this:		"@Element",
	type:		"text",
	handler:	"function",
	
	_optional_useCapture:	"boolean",
	_default_useCapture:	"true",
	
	_optional_context:		"*",
	_default_context:		null,
	
	_whereas:	"BrowserKit.DOMHandledEvents.indexOf(type.toLowerCase()) > -1",
	
_does:
	function (type, handler, useCapture, context)
	{
		if (context == null)
			context = this;
		
		function ___internalHandler(event) 
		{ 
			try {
				var eventDescription = ["event_description", "structure"]._construct(event);
			
				handler.apply(context, [eventDescription]);
			} 
			 catch(e) 
			{ 
				console.log("Unhandled exception in event handler");
				console.log(e) 
			} 
		}
	
		handler.__backend = ___internalHandler;
	
		this.addEventListener(type.toLowerCase(), ___internalHandler, useCapture);
	}
});

// Method for all browser-kit events
"addEventHandler".__declare({
	_this:		"@Element",
	type:		"text",
	handler:	"function",
	
	_optional_useCapture:	"boolean",
	_default_useCapture:	"true",
	
	_optional_context:		"*",
	_default_context:		null,
	
	_whereas:	["BrowserKit.FocusEvents.indexOf(type.toLowerCase()) > -1", "useCapture == true"],
	
_does:
	function (type, handler, useCapture, context)
	{
		if (context == null)
			context = this;
		
		function ___internalHandler(eventDescription) 
		{ 
			try {
				handler.apply(context, [eventDescription]);
			} 
			 catch(e) 
			{ 
				console.log("Unhandled exception in event handler");
				console.log(e) 
			} 
		}
	
		handler.__backend = ___internalHandler;
	
		if (this.__bkHandler == null)
			this.__bkHandler = ({});
		
		if (this.__bkHandler[type] == null)
			this.__bkHandler[type] = [];
		
		// Add only, if not already added
		if (this.__bkHandler[type].indexOf(handler) < 0)
			this.__bkHandler[type].push(handler);
	}
});


/*
 * Element::removeEventHandler(type, handler, useCapture = true)
 *
 * Removes the given "handler" for handling events of "type". If defined,
 * the capture mode of the handler was defined in 'useCapture'.
 *
 */
 
// Method for DOM events
"removeEventHandler".__declare({
	_this:		"@Element",
	type:		"text",
	handler:	"function",
	
	_optional_useCapture:	"boolean",
	_default_useCapture:	"true",

	_whereas:	"BrowserKit.DOMHandledEvents.indexOf(type.toLowerCase()) > -1",
	
_does:
	function (type, handler, useCapture)
	{
		this.removeEventListener(type.toLowerCase(), handler.__backend, useCapture);
	}
});

// Method for Browser-Kit events
"removeEventHandler".__declare({
	_this:		"@Element",
	type:		"text",
	handler:	"function",
	
	_optional_useCapture:	"boolean",
	_default_useCapture:	"true",

	_whereas:	["BrowserKit.FocusEvents.indexOf(type) > -1", "useCapture == true"],
	
_does:
	function (type, handler, useCapture)
	{
		var handlers;
	
		if (this.__bkHandler == null)
			return;
		
		if (this.__bkHandler[type] == null)
			return;
		
		handlers = this.__bkHandler[type];
		
		// Find & Remove handler
		var idx = handlers.indexOf(handler);
		
		if (idx > -1)
			handlers.splice(idx, 1);
		
		// Garbage-collect handler list
		if (handlers.length == 0)
			delete this.__bkHandler[type];
	}
});

/*
 * BrowserKit::__raiseBKEvent(view, eventDescription)
 *
 */
BrowserKit.__raiseBKEvent = function(view, type, eventDescription)
{
	if (view.__bkHandler == null) return;
	if (view.__bkHandler[type] == null) return;	

	var handlers = view.__bkHandler[type];
	
	for (var idx = 0; idx < handlers.length; idx ++) {
		handlers[idx](eventDescription);
	}
	
	return;
}

/*
 * BrowserKit::__globalHandler
 *
 * Will be called on all events first. This function will call
 * predicate event handlers, if given.
 *
 * This function will propagate the event upwards.
 *
 */
BrowserKit.__globalHandler = function(event)
{
	var eventDescription, view, protoTarget;

	if (BrowserKit.TargetIsFocus.indexOf(event.type) > -1)
		protoTarget = window.lastFocus;
	else
		protoTarget = null;
		
	eventDescription = ["event_description", "structure"]._construct({domEvent: event, domTarget: protoTarget});	

	// Never call keypress, if no charCode is given, to make Firefox behave like webkit
	if ((event.type == "keypress") && (event.charCode == 0) && (event.keyCode != 13))
		return;

	view = eventDescription.targetView;

	while ((view != null) && (!eventDescription.__propagationStopped)) {
		try {
			if (view["_on"+eventDescription.type])	
				view["_on"+eventDescription.type]({eventDescription: eventDescription});
		} catch (e) {
			if (!((e instanceof MethodNotExistsError) && (e.methodName == "_on"+eventDescription.type))) {
				console.log(e);
				break;
			}
		}


		if (view.parentNode != null)
			view = view.parentNode._getView();
		else
			break;
			
		eventDescription.parentNotification = true;
	}
}

/*
 * BrowserKit::__focusTracking
 *
 * Implements improved focus tracking
 *
 */
BrowserKit.__focusTracking = function(event) 
{
	window._updateFocus();
}


/********************************************************
 * 
 * Pakage initialization
 *
 ********************************************************/

/*
 * BrowserKit::__initPredicateHandlers
 *
 * Enables global event handling, so that predicate events are
 * handled.
 *
 */
BrowserKit.__initPredicateHandlers = function ()
{
	var avlEvents = BrowserKit.DOMHandledEvents;

	// Focus tracking
	document.addEventListener("click", BrowserKit.__focusTracking, true);
	document.addEventListener("keyup", BrowserKit.__focusTracking, true);

	for (var idx = 0; idx < avlEvents.length; idx ++) {
		document.addEventListener(avlEvents[idx].toLowerCase(), BrowserKit.__globalHandler, true);
	}
}
 
BrowserKit.__initPredicateHandlers();

