/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 * Common models helper functions
 *
 */
var Model = new Package();

/*
 * [declarator]<type, initializer>	Tagging::construct( [initializer == <initializer>] ) ==> [<type>]
 *
 * Declarator:
 *		The declarator is parameterized by <type>, which specifies the type of the object to create.
 *
 * Purpose:
 * 		Creates and initializes a new object. The method can be called on all arrays,
 *		containing a tagging describing the object to create. An additional initializer can be passed for
 *		prototyping the object.
 *
 * Applicability:
 *		This method is applicable on all arrays containing the tagging <type>.
 *
 * Parameters:
 *		initializer		A prototype for the object or 'null', if a build-in prototype should be used.
 *
 * Return value:
 *		The constructed object tagged by the given <type>.
 *
 * Example:
 *		var addr = ["?address_book", "list"]._construct();
 *
 *		Creates a new object tagged with 'address_book' according to its construction function. If there
 *		is no constructor available for 'address_book' a list will be created.
 *
 * --------------------------------------------------------------------------------------------------------
 *
 */
Model.Construct = buildDeclarator("construct", 
{
	_this: 				"list",
	
	_generic_type:		function(type) {
							return {
									_output:					type,
									_max: 						"this.__understoodAs('"+type.join("', '")+"')",
									
									_optional_initializer:		type,
							};
						},
						
	_generic_initializer:	function(initializer) {
								return { _default_initializer: initializer };
							}
});

/*
 * [declarator]<type, child_type, depth>	<type>::insert( path, offset, child, [pathAt = 0] )
 *
 * Declarator:
 *		The declarator is parameterized by <type>, which specifies the type of the object that should be
 *		be merged with another object of "child_type". <depth> specifies how far the current element should
 *		be away from the destination element (e.g. if you specify "0", the element is the element to be merged
 *		to. If you specify "1" it is its directy parent etc.). If <depth> is null, the condition will be ignored.
 *
 * Purpose:
 * 		Inserts the object "child" into the object at the position "path"/"offset", whereas "path" is the
 *		list of objects along the path to the destination object that should insert the child. "offset" is an numerical or textual
 *		offset at the destination object (e.g. a text position).
 *
 *		This method works recursively. Normally the first object of the path (which is the head of a content tree)
 *		will be called with insert. The method of this object will normally make an recursive call to its child object:
 *
 *		path[pathAt + 1]._insert( path, pathAt+1, offset, child)
 *	
 *		The delegation of the method call will be then continued by the child object's method, until the destination object is reached,
 *		or a method in between decides to handle the insertion by itself.
 *
 *		Using this recursive approach, the parent object is able, to control the insert operation. For example, if a "\n" should
 *		be inserted in to a text object inside a paragraph, the paragraph object can prevent the insertion of the character and split
 *		the text object instead to create a new paragraph.
 *
 *		The return value indicates whether a view, representing the object should be updated or not. It also indicates, if
 *		an immutable child object should be replaced by a new variant. This is required, because the insertion of an object into
 *		another can lead to a creation of a new object. This might happen if the destination object is immutable (Strings) or
 *		if it is not directly possible to merge the destination object with "child" (for example if the user tries to insert
 *		a "important text" into a "normal text").
 *
 *		If the function returns an object, the caller method has to replace the child at path[pathAt + 1] with the new object.
 *
 *		Whenever a function returns a value that is not "null" or "false", it will indicate that all views of this object should
 *		be updated. The return value of a method will not automatically transfered back to a higher level. To update a view, it
 *		is recommended to use an aspect on "_insert".
 *
 * Parameters:
 *		path:		List of objects along the path to the destination object
 *		pathAt:		The position of THIS in "path"
 *		offset:		The offset of the object
 *		child:		The object to insert		
 *
 * Return value:
 *		null		If inserting is not possible
 *
 *		TRUE		If inserting of the child object requires an update of the view of the current object
 *
 *		FALSE		If inserting of the child object does not require an immediate update of the view
 *
 *		[list]		If the child object could not be inserted because the parent is immutable or direct
 *					insertion is not possible for any other reason. The list contains an arbitrary number
 *					 of objects, that should replace the child object.
 *
 * --------------------------------------------------------------------------------------------------------
 *
 */
Model.Insert = buildDeclarator("insert", 
{
	path:				"list",
	offset:				"*",

	_optional_pathAt:	"number",
	_default_pathAt:	0,

	_whereas:			["offset.__is('number') || offset.__is('text')"],
	
	_generic_type:		function(type) {
							return {
									_this:						type,
							};
						},
	_generic_child_type:
						function(child_type) {
							return {
									child:						child_type,
							};
						},
	_generic_depth:	
						function(depth) {
							if (depth == null) return {};
							
							return {
									_whereas:		"(path.length - pathAt - 1) == "+depth
							};
						}
});

/*
 * [declarator]<type, child_type, depth>	<type>::remove( path,  offset, [count = 1, pathAt = 0] )
 *
 * Declarator:
 *		The declarator is parameterized by <type>, which specifies the type of the object which has a
 *		child to be removed. 
 *
 * Purpose:
 * 		Removes the "count" child objects at position path/offset. Whereas 'path' is the list of objects
 *		along the path to the object, which should remove the child. 'offset' describes the position of
 *		the child to remove inside the destination. "pathAt" describes the position of 'this' inside the
 *		path.
 *
 *		This method works recursively. Normally the first object of the path (which is the head of a content tree)
 *		will be called with remove. The method of this object will normally make an recursive call to its child object:
 *
 *		path[pathAt + 1]._remove( path, pathAt+1, offset, count)
 *	
 *		The delegation of the method call will be then continued by the child object's method, until the destination object is reached,
 *		or a method in between decides to handle the removal by itself.
 *
 *		Using this recursive approach, the parent object is able, to control the remove operation. For example, it is possible
 *		for a paragraph, to delete a text element, if it got empty by a certain operation.
 *
 *		The return value indicates whether a view, representing the object should be updated or not. It also indicates, if
 *		an immutable child object should be replaced by a new variant. This is required, because the insertion of an object into
 *		another can lead to a creation of a new object. This might happen if the destination object is immutable (Strings) or
 *		if it is not directly possible to merge the destination object with "child" (for example if the user tries to insert
 *		a "important text" into a "normal text").
 *
 *		If the function returns an object, the caller method has to replace the child at path[pathAt + 1] with the new object.
 *
 *		Whenever a function returns a value that is not "null" or "false", it will indicate that all views of this object should
 *		be updated. The return value of a method will not automatically transfered back to a higher level. To update a view, it
 *		is recommended to use an aspect on "_insert".	
 *
 * Parameters:
 *		path:		List of objects along the path to the destination object
 *		pathAt:		The position of THIS in "path"
 *		offset:		The offset of the object
 *		child:		The object to insert		
 *
 * Return value:
 *		null		If inserting is not possible
 *
 *		TRUE		If inserting of the child object requires an update of the view of the current object
 *
 *		FALSE		If inserting of the child object does not require an immediate update of the view
 *
 *		[list]		If the child object could not be inserted because the parent is immutable or direct
 *					insertion is not possible for any other reason. The list contains an arbitrary number
 *					 of objects, that should replace the child object.
 *
 * --------------------------------------------------------------------------------------------------------
 *
 */
Model.Remove = buildDeclarator("remove", 
{
	path:				"list",
	offset:				"*",

	_optional_count:	"number",
	_default_count:		1,

	_optional_pathAt:	"number",
	_default_pathAt:	0,

	_whereas:			["offset.__is('number') || offset.__is('text')"],
	
	_generic_type:		function(type) {
							return {
									_this:						type,
							};
						},

	_generic_depth:	
						function(depth) {
							if (depth == null) return {};
							
							return {
									_whereas:		"(path.length - pathAt - 1) == "+depth
							};
						}
});

