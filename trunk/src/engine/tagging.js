/*
 * hyJS
 *
 * Object tagging
 *
 * Copyright(C) 2009 by Friedrich Gräter
 * Published under the terms of the GNU General Public License v2
 *
 */
function InvalidTagError(message)
{
//	console.trace();
	this.message = message;
}
InvalidTagError.prototype = new Error();

function AlreadyTaggedError(message)
{
//	console.trace();
	this.message = message;
}
AlreadyTaggedError.prototype = new Error();

var globalUUID = 0;

/*
 * __getJSTypeId(object)
 *
 * Returns an type identifier for the given object. This identifier is
 * "text" for String objects, "number" for Number objects, "boolean" for Boolean
 * objects, "list" for Array objects, "structure" for structured objects and
 * "object" for objects which are instances of 'function'.
 *
 */
function __getJSTypeId(object)
{
	// NOTE: The typeof() are due to a bug in webkit
	
	if ((object instanceof String) || (typeof(object) == "string"))
		return "text";
	
	if ((object instanceof Number) || (typeof(object) == "number"))
		return "number";
		
	if ((object instanceof Boolean) || (typeof(object) == "boolean"))
		return "boolean";
		
	if (object instanceof Array)
		return "list";
		
	if (object instanceof Function)
		return "object";
		
	return "structure";
}

/*
 * Object::__tag(...)
 *
 * Tags an object with the given parameters. The parameters
 * can be an arbitrary number of strings. The order of the paramters
 * will be seen as the inheritance order of the tags. If the object was already
 * tagged, an exception will be thrown. This function will modify
 * the called object and not create a new copy of it.
 *
 * As a side effect, the object will be assigned a global UUID.
 *
 * Return value:
 *		Reference to THIS
 *
 * Exceptions:
 *		InvalidArgumentError		Argument is not a string
 *		AlreadyTaggedError			Object is already tagged
 */
Object.prototype.__tag = function()
{
	if (this.__def != null)
		throw new AlreadyTaggedError("Already tagged - "+this.__def);
	
	this.__def = [];

	for (var idx = 0; idx < arguments.length; idx ++) {
		if (typeof(arguments[idx]) != "string")
			throw new InvalidTagError("Can't tag - "+arguments[idx]);
			
		this.__def.push(arguments[idx]);
	}

	// Set UUID
	this.__uuid = globalUUID ++;

	return this;
}

/*
 * String::__tag(...)
 *
 * Tags an string with the given parameters. The parameters
 * can be an arbitrary number of strings. If the object was already
 * tagged, an exception will be thrown. The string instance will
 * be copied into a String() object that would be tagged.
 *
 * Return value:
 *		Reference to a string object
 *
 * See: Object::__tag
 *
 */
String.prototype.__tag = function()
{
	return Object.__tag.apply(this, arguments);
}

/*
 * Number::__tag(...)
 *
 * Tags an string with the given parameters. The parameters
 * can be an arbitrary number of strings. If the object was already
 * tagged, an exception will be thrown. The string instance will
 * be copied into a String() object that would be tagged.
 *
 * Return value:
 *		Reference to a string object
 *
 * See: Object::__tag
 *
 */
Number.prototype.__tag = function()
{
	return Object.__tag.apply(this, arguments);
}

/*
 * Boolean::__tag(...)
 *
 * Tags an string with the given parameters. The parameters
 * can be an arbitrary number of strings. If the object was already
 * tagged, an exception will be thrown. The string instance will
 * be copied into a String() object that would be tagged.
 *
 * Return value:
 *		Reference to a string object
 *
 * See: Boolean::__tag
 *
 */
Boolean.prototype.__tag = function()
{
	return Boolean.__tag.apply(this, arguments);
}


/*
 * Object::__untag(...)
 *
 * Removes all tags from an object. This function will modify
 * the given object and won't create a new copy of the object.
 *
 * Return value:
 *		none
 */
Object.prototype.__untag = function()
{
	this.__def = null;
}

/*
 * Array::__understoodAs(...)
 *
 * Tests whether the given tags are applying to the tags given in the array.
 *
 * See: Object::__taggedAs
 *
 */
Array.prototype.__understoodAs = function()
{
	var count = 0;
	var def = this;

	for (var objIdx = 0, argIdx = 0; objIdx < def.length; objIdx ++)
	{
		var objElement = def[objIdx];
		var argElement = arguments[argIdx];
		var argOptional = (argElement[0] == '?')

		// Remove option prefix
		if (argOptional == true) {
			argElement = argElement.substr(1);
		}

		// Process * wildcard
		if (argElement == "*") {
			// There are still tags to test
			if (argIdx + 1 < arguments.length) {
				// Next argument tag is *, just ignore current and try again
				if (arguments[argIdx + 1] == "*") {
					argIdx ++;
					objIdx --;
					continue;
				}
					
				// Next argument tag is +, just ignore current wildcard, since it matches every time
				if (arguments[argIdx + 1] == "+") {
					argIdx ++;
					continue;
				}
			
				// Next argument tag is optional, test if it is the same or there is another fitting element next to it
				if (arguments[argIdx + 1][0] == '?') {
			
					for (var tmpArgIdx = argIdx + 1; tmpArgIdx < arguments.length; tmpArgIdx ++) {
						var tmpElement = arguments[tmpArgIdx];
						var tmpOptional = arguments[tmpArgIdx][0] == '?';
						
						if (tmpOptional) 
							tmpElement = tmpElement.substr(1);
						
						// Found a fitting element
						if (tmpElement == objElement) {
							argIdx = tmpArgIdx;
							objIdx --;

							break;
						}
					}
					
					continue;
				}
			
				// Next object tag is identical to argument tag --> end of wildcard application
				if (arguments[argIdx + 1] == objElement) {
					argIdx ++;
					objIdx --;
					continue;
				}
				
				// Continue using wildcard 
				continue;				
			}
			 else {
				// Last element of argument list --> accept all
				argIdx ++;
				objIdx = def.length;
				break;
			}
		}
		
		// Process + wildcard
		if (argElement == "+") {
			argIdx ++;
			continue;
		}
				
		// Compare, if no wildcard
		if (argElement != objElement) {
			// Ignore, if optional
			if (argOptional) {
				argIdx ++;
				objIdx --;
				continue;
			}

			// Stop, if not optional			
			return -1;
		}

		count ++;
		argIdx ++;

			
		// Not all object elements processed
		if ((argIdx == arguments.length) && (objIdx+1 < def.length))
			return -1;	
	}

	// Not all argument elements processed
	if ((argIdx < arguments.length) && (objIdx+1 >= def.length))
		return -1;

	return count;
}

/*
 * Object::__taggedAs(...)
 *
 * Tets whether the given tags are applying on the given object. The
 * tags can be given as an arbitrary number of strings. The order of
 * the tags will be seen as requirement. The following wildcards exist:
 *
 *		*	At this position, zero or more tags can be placed
 *		+	Exactly one unknown tag can be placed at this position
 *
 * If a tag is marked up with a ? sign, it will be seen as optional.
 * If it is not available at a given position, it will be ignored.
 *
 * Return value:
 *	The function counts all non-wildcard terms of the tagging of the
 *  given object which are in the right order. If there is a term
 *  of the parameter list not existing in the tagging of the object
 *	or not in the right order, the function will return -1.
 *
 */
Object.prototype.__taggedAs = function()
{
	var def = this.__def;

	if (this.__def == null)
		def = [__getJSTypeId(this)];

	return def.__understoodAs.apply(def, arguments);
}

/*
 * Object::__is(tag)
 *
 * Tests whether "tag" is part of the objects tagging or not.
 * If the object is not tagged, the tag will be compared with
 * the outcome of __getJSTypeId.
 *
 */
Object.prototype.__is = function(tag)
{
	if (this.__def == null)
		return tag == __getJSTypeId(this);
		
	for (var idx = 0; idx < this.__def.length; idx ++) {
		if (this.__def[idx] == tag)
			return true;
	}
	
	return false;
}

/*
 * Object::__getClassName()
 *
 * Get the most significant tag of the object. If the 
 * object is not tagged the answer of __getJSTypeId will
 * be used.
 *
 */
Object.prototype.__getClassName = function()
{
	if (this.__def == null)
		return __getJSTypeId(this);
	else
		return this.__def[0];
}

/*
 * Object::__getByClass(name)
 *
 * Returns the first element of an object
 * with the given class name. "null" otherwise.
 *
 */
Object.prototype.__getByClass = function(name)
{
	for (var idx in this) {
		if (idx[0] == '_') continue;
		
		if (this[idx].__is(name))
			return this[idx];
	}
	
	return null;
}

