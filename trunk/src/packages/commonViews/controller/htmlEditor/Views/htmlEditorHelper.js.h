/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 * HTML Editor View helper functions
 *
 */
 
/*
 * EditorReceiveFocus_declare( type, whereas, func )
 *
 * Declares a standard function "receiveFocus" with the implementation "func"
 * for all objects showing a content object tagged with "type". Additional conditions
 * can be passed through the 'whereas' clause. 
 *
 * This declarator declares 'func' with the following properties:
 *
 * Purpose:
 *		'func' will be called, whenever a view receives the focus.
 *
 * Features:
 *
 *		use_uuid_attribute		The function will identify the content by the uuid attribute
 *
 * This:
 * 		The 'this' object of 'func' will be the view node, which received the event.
 *
 * Parameters:
 *	lastFocussed		The view node that lost the focus (or null)
 *	eventDescription	A descriptor of the event, which has the following structure:
 *
 *			content				The content object associated with the view node
 *			contextList			The list of content objects marking the semantic context of the content
 *							(see 'parentList' in _view)
 *			destNode			The view node, responsible for the event handling (same as "this")
 *		
 *			selection			The selection object describing the selected content
 *			anchorNode			Node where the user has clicked on
 *			anchorOffset		Text position inside the anchorNode
 *
 *			editor				The editor which is related to the event
 *			event				The DOM Event descriptor
 *
 * Return Value:
 * 		'func' returns the type ["eventAccepted", "boolean"]. If the return value is true, the
 * 		function accepts the event, otherwise not. 
 *
 */
function EditorReceiveFocus_declare( type, whereas, func )
{
	if (whereas == null)
		whereas = [];
		
	if (!(whereas instanceof Array))
		whereas = [whereas];

	"receiveFocus".__declare(
		({
			features:	["use_uuid_attribute"],

			input:		["lastFocussed", "eventDescription"],
			output:		["eventAccepted", "boolean"],

			whereas:	["(lastFocussed instanceof Element) || (lastFocussed == null)",
						 "eventDescription != null",
						 "eventDescription.__is('event_description')",
						 "eventDescription.content != null",
						 "eventDescription.contextList instanceof Array",
						 "eventDescription.destNode instanceof Element",
						 "eventDescription.selection != null",
						 "eventDescription.anchorNode instanceof Node",
						 "eventDescription.anchorOffset != null",
						 "eventDescription.editor instanceof Editor",						 
						 "eventDescription.event instanceof Event"
						].concat(whereas),
			max:		["eventDescription.content.__taggedAs('"+type.join("','")+"')"],
		
			does:		func
		})
	);
}

/*
 * EditorListFocus_declare( type, whereas, func )
 *
 * Declares a standard function "lostFocus" with the implementation "func"
 * for all objects showing a content object tagged with "type". Additional conditions
 * can be passed through the 'whereas' clause.
 *
 * This declarator declares 'func' with the following properties:
 *
 * Purpose:
 *		func will be called, whenever a view losts its focus.
 *
 * Features:
 *
 *		use_uuid_attribute		The function will identify the content by the uuid attribute
 *
 * This:
 * 		The 'this' object of 'func' will be the view node, which received the event.
 *
 * Parameters:
 *		editor		The editor object, associated with the node.
 * 		newFocus	The view node, that should receive the new focus.
 *
 * Return Value:
 * 		'func' returns the type ["eventAccepted", "boolean"]. If the return value is true, the
 * 		function accepts the event, otherwise not.
 *
 */
function EditorLostFocus_declare( type, whereas, func )
{
	if (whereas == null)
		whereas = [];
		
	if (!(whereas instanceof Array))
		whereas = [whereas];

	"lostFocus".__declare(
		({
			features:	["use_uuid_attribute"],

			input:		["editor", "newFocus"],
			output:		["eventAccepted", "boolean"],

			whereas:	["editor instanceof Editor",
						 "newFocus instanceof Element",
						].concat(whereas),
			max:		["editor._getContentObject(this).__taggedAs('"+type.join("','")+"')"],
		
			does:		func
		})
	);
}


