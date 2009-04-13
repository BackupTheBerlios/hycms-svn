/*
 * hyObjects(js)
 *
 * Object accessors
 *
 * Copyright(C) 2009 by Friedrich Gräter
 * Published under the terms of the GNU General Public License v2
 *
 */
function ElementNotExistsError(message)
{
	this.message = message;
}
ElementNotExistsError.prototype = new Error();

function ElementAlreadyExistsError(message)
{
	this.message = message;
}
ElementAlreadyExistsError.prototype = new Error();

/*
 * class __TypeWrap(description, object)
 *
 * Used for temporary type extensions.
 *
 * See: _extend
 *
 */
function __TypeWrap(description, object)
{
	this.description = description;
	this.object = object;

	this._as(description);
}	

/*
 * Object::_extend(term, object)
 *
 * Extends the class name of the given "object" by "term".
 *
 */
Object.prototype._extend = function (term) 
{
	var descr = this._def_string();
	
	descr = "|"+ term+" < "+this._relationToString("<", 0, true);

	return new __TypeWrap(descr, this);
}

/*
 * Object::_get(term)
 *
 * Returns the first element, that has "term" in its
 * primary inheritance hierarchy.
 *
 * If an element is of the type __TypeWrap the wraped
 * object will be returned.
 *
 * Return value:
 *	The element or "null"
 *
 */
Object.prototype._get = function(term)
{
	for (var key in this) {
		if (key.charAt(0) == "|") {
			element = this[key];		

			if (element._instanceOf(term)) {
				if (element instanceof __TypeWrap)
					return element.object;
				else
					return element;
			}
		}
	}
	
	return null;
}

/*
 * Object::_getAll(term)
 *
 * Returns all elements, which have "term" in their primary
 * inheritance hierarchy.
 *
 * It will return the wraped object for all elements which are
 * instance of __TypeWrap.
 *
 * Return value:
 *	An array of elements
 *
 */
Object.prototype._getAll = function(term)
{
	var out = new Array();

	for (var key in this) {
		if (key.charAt(0) == "|") {
			element = this[key];		

			if (element._instanceOf(term)) {
			
				if (element instanceof __TypeWrap)
					out.push(element.object);
				else
					out.push(element);
			}
		}
	}
	
	return out;
}

/*
 * Object::_iterate(callback(element,key))
 *
 * Iterates over all elements and calls "callback" for each element.
 * If callback returns -1, the iteration will be stopped.
 *
 * Return value:
 *	Count of iterated elements
 *
 */
Object.prototype._iterate = function(callback)
{
	var i = 0;

	for (var key in this) {
		if (key.charAt(0) == "|") {
			var element = this[key];		
			i ++;
			
			if (callback(element, key) == -1)
				break;
		}
	}
	
	return i;
}

/*
 * Array::_iterate(callback(element,key))
 *
 * Iterates over all elements and calls "callback" for each element.
 * If callback returns -1, the iteration will be stopped.
 *
 * Return value:
 *	Count of iterated elements
 *
 */
Array.prototype._iterate = function(callback)
{
	var self = this;
	var i = 0;

	for (var key in this) {
		if (/[0-9]/.test(key)) {
			var element = this[key];		
			i ++;
			
			if (callback(element, key) == -1)
				break;
		}
	}
	
	return i;
}

/*
 * Object::_set(term, value)
 *
 * Sets the first element, that fits to "term"
 * to the given value, without changing the 
 * definition of the term. If the definition was
 * not already applied to "value", the function will
 * apply it.
 *
 * This requires, that such an element exists.
 *
 * Exceptions:
 *	ElementNotExistsError
 *
 */
Object.prototype._set = function(term, value)
{
	var self = this;
	var set_key = null;

	for (var key in this) {
		if (key.charAt(0) == "|") {
			element = this[key];		

			if (element._instanceOf(term)) {
				set_key = key;
				break;	
			}
		}
	}
	
	if (set_key == null)
		throw new ElementNotExistsError(term);
	
	if (value.__orderedRelations == null)
		value = value._as(set_key);
		
	this[set_key] = value;
}

/*
 * Object::_append(value)
 *
 * Appends the given value to the object. The key will be
 * derived from the value's type. If the value has no
 * defintion, the definition will be derived and the value
 * will be transformed to a valid object.
 *
 * This requires, that such an element doesn't already exists.
 *
 * Exceptions:
 *	ElementAlreadyExistsError
 *
 */
Object.prototype._append = function(value)
{
	if (value.__orderedRelations == null)
		value = value._as();
	
	if (this[value._def_string()] != null)
		throw new ElementAlreadyExistsError(value._def_string());
		
	this[value._def_string()] = value;
}

/*
 * Native(object)
 *
 * Wraps a native object, to be compatible to the typing system.
 * The native object can be accessed by the method "valueOf".
 *
 */
function Native(obj)
{
	this.__encapsulated_native = obj;
}

Native.prototype.valueOf = function()
{
	return this.__encapsulated_native;
}
