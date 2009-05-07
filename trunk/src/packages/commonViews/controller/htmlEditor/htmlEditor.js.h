/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 * HTML Editor Controller helper functions
 *
 */
HtmlEditor = new Package();

/*
 * [declarator] HtmlEditor::ReceiveFocus( type, whereas, method_body )
 *
 * This declarator will register an implementation of the method "receiveFocus" with the given method_body.
 * The applicability of the method can be restricted by the parameters 'type' and 'whereas'. The method
 * declared by this declarator has the following syntax and semantics:
 *
 * --------------------------------------------------------------------------------------------------------
 *
 * Element::receiveFocus( lastFocussed, eventDescription ) ==> [eventAccepted, boolean]
 *
 * Purpose:
 * 		This method will be called, if a view element inside a HTML-Editor receives the focus. The view
 *		object is represented by an Element object (@See DOM). The method will further receive informations
 *		about the circumstances of the focus event and has to return, whether the focus change was accepted
 *		or not. Normally this method will be used, to highlight the element in the editor view and show controls,
 *		which should only be visible on focus.
 *
 * Applicability:
 *		This method is applicable, if the event is related to a model object tagged with <type>. The given
 *		parameters have to be correct according to the specification. The applicability of the requires, that
 *		all clauses of <whereas> are satisfied.
 *
 * Parameters:
 *		lastFocussed		The view node that lost the focus (or null)
 *		eventDescription	A descriptor of the event, which has the following structure:
 *
 *			content					The content object associated with the view node
 *			contextList				The list of content objects marking the semantic context of the content
 *									(see 'parentList' in _view)
 *			destNode				The view node, responsible for the event handling (same as "this")
 *		
 *			selection				The selection object describing the selected content
 *			anchorNode				Node where the user has clicked on
 *			anchorOffset			Text position inside the anchorNode
 *
 *			editor					The editor which is related to the event
 *			event					The DOM Event descriptor	
 *
 * Return value:
 *		TRUE, if the focus is accepted. FALSE otherwise.
 *
 * --------------------------------------------------------------------------------------------------------
 *
 */
HtmlEditor.ReceiveFocus = function( type, whereas, func )
{
	if (whereas == null)
		whereas = [];
		
	if (!(whereas instanceof Array))
		whereas = [whereas];

	"receiveFocus".__declare(
		({
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
 * [declarator] HtmlEditor::LostFocus( type, whereas, method_body )
 *
 * This declarator will register an implementation of the method "receiveFocus" with the given method_body.
 * The applicability of the method can be restricted by the parameters <type> and <whereas>. The method
 * declared by this declarator has the following syntax and semantics:
 *
 * --------------------------------------------------------------------------------------------------------
 *
 * Element::receiveFocus( lastFocussed, eventDescription ) ==> [eventAccepted, boolean]
 *
 * Purpose:
 * 		This method will be called, if a view element inside a HTML-Editor is going to lose its focus. The view
 *		object is represented by an Element object (@See DOM). The method will further receive informations
 *		about the circumstances of the focus event and has to return, whether the focus lost was accepted
 *		or not. Normally this method will be used, to remove focus-related controls from the view and show the
 *		view in an unfocussed manner.
 *
 * Applicability:
 *		This method is applicable, if the unfocussed view object is related to a model object tagged with <type>. 
 *		This relation will be tested using the UUID attribute of the view object. The given
 *		parameters have to be correct according to the specification. The applicability of the requires, that
 *		all clauses of <whereas> are satisfied.
 *
 * Parameters:
 *		editor		The editor object associated with the node
 *		newFocus	The view node, that should receive the new focus.
 *
 * Return value:
 *		TRUE, if the focus loss is accepted. FALSE otherwise.
 *
 * --------------------------------------------------------------------------------------------------------
 *
 */
HtmlEditor.LostFocus = function( type, whereas, func )
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


