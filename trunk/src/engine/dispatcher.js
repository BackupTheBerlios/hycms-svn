/*
 * hyObjects(js)
 *
 * Dispatcher handling
 *
 * Copyright(C) 2009 by Friedrich Gräter
 * Published under the terms of the GNU General Public License v2
 *
 */
function MissingDefinitionError(message)
{
	this.message = message;
}
MissingDefinitionError.prototype = new Error();

function InvalidFunctionError(message)
{
	this.message = message;
}
InvalidFunctionError.prototype = new Error();

function ReceiverNotAvailable(message)
{
	this.message = message;
}
ReceiverNotAvailable.prototype = new Error();

function ParameterTypeNotUnique(message)
{
	this.message = message;
}
ParameterTypeNotUnique.prototype = new Error();

function InvalidPointcutError(message)
{
	this.message = message;
}
InvalidPointcutError.prototype = new Error();

/*
 * [class] Dispatcher
 *
 * Public members:
 *		function			List of available functions
 *
 * Public methods:
 *		register			Registers a function
 *		find				Finds a function according to its description
 *		exec				Executes a function
 *		watch				Sets a watch to a function
 *
 */
function Dispatcher()
{
	this.functions = new Array();
}

/*
 * Dispatcher::register(function_object)
 *
 * Registers the given function object to the database of the
 * dispatcher. The function needs to be assigned to a
 * definition using the "_as" call.
 *
 * Exceptions:
 *		MissingDefinitionError		Function not assigned to a definition
 *		NotAFunction				Not a function
 */
Dispatcher.prototype.register = function(func)
{
	// Not a function
	if (!(func instanceof Function))
		throw new InvalidFunctionError(func);

	// Not assigned to a definition
	if ((func.__orderedRelations == null) && (func.__unorderedRelations == null)) {
		throw new MissingDefinitionError(func.name);
	}

		
	// Register
	this.functions.push(func);
}

/*
 * Dispatcher::find(definition, ...,[, all = false, return_definition = false, ignore_function_sat = false])
 *
 * Finds a function fitting to the given definition with the
 * highest option count. 
 *
 * The definition can be passed as a set of multiple parameters
 * (see Object._as for further explanation).
 * 
 * If the parameter "all" is true, it returns a list of
 * all functions satisfying the definition.
 *
 * If the parameter "ignore_function_sat" is ture, it accepts also functions,
 * which are not satisfied by the request, but satisfying the request.
 *
 * A function fits to a definition iff.
 *		- The function's description is satisfied by the given user definition
 *		- The given user definition is satisfied by the functions definition
 *
 * The option count used to rank the function is the count of options
 * satisfied in the given user definition by the function definition.
 *
 * Return value:
 *		- If "all" is true, a array of the function is given 
 *
 *		- The function with the highest rank
 *
 *		- "null" if no function was found.
 *
 *		- If "return_definition is true, a tuple with the original
 *		  return value and the definition object will be returned:
 *
 *		  {"definition": USER_DEFINITION, "found": null }					no function found
 *		  {"definition": USER_DEFINITION, "found": FOUND_FUNCTION }			all =false
 *		  {"definition": USER_DEFINITION, "found": FOUND_FUNCTION_ARRAY }	all =true
 *
 */
Dispatcher.prototype.find = function()
{
	var definition = "";
	var bool_ctr = 0;
	var all = false;
	var return_definition = false;
	var ignore_function_sat = false;

	// Get parameters
	for (var idx = 0; idx < arguments.length; idx ++) {
	
		// Scan boolean parameters
		if ((typeof(arguments[idx]) == "boolean") || (arguments[idx] instanceof Boolean)) {
		
			if (bool_ctr == 0)
				all = arguments[idx];
			else if (bool_ctr == 1)
				return_definition = arguments[idx];
			else if (bool_ctr == 2)
				ignore_function_sat = arguments[idx];
				
			bool_ctr ++;
				
			continue;
		}
	
		// Bool parameters must be the last in the list
		if (bool_ctr > 0)
			throw new Error("Invalid parameters in Dispatcher.find().");

		// Null given...	
		if (arguments[idx] == null) {
			definition = null;
			break;
		}
		
		if (idx + 1 == arguments.length)
			sym = "";

		// Concatenate parameters
		if ((arguments[idx].charAt(0) == "|") && (idx > 0))
			arg = arguments[idx].substr(1);
		else
			arg = arguments[idx];

		definition += arg + "; ";
	}

	// Remove ; at the end
	definition = definition.substr(0, definition.length - 2);

	var user_def = {}._as(definition);
	var list = new Array();
	var highest_count = -1, highest_idx = 0;
	
	for (var idx = 0; idx < this.functions.length; idx ++) {
		var func = this.functions[idx];
		var count;

		// Is the function def satisfied by the user def?
		if (!ignore_function_sat)
			if (_satisfy_internal(user_def, func) == -1)
				continue;

		// Is the user def satisfied by the function def?
		count = _satisfy_internal(func, user_def);

		if (count == -1)
			continue;
		
		// Remember the function
		list.push(func);

		// Use the highest
		if (count > highest_count) {
			highest_count = count;
			highest_idx = list.length - 1;
		}
	}

	// Return list or function?
	var retval;

	if (highest_count == -1) {
		// No function found
		retval = null;
	}
	 else {
		// Decide whether to return a list or a single element
		if (all == true)
			retval = list;
		else
			retval = list[highest_idx];
	}

	// Tuple with definition?
	if (return_definition == true)
		return {definition: user_def, found: retval};
	else
		return retval;
}

/*
 * Dispatcher::send( definitions, params )
 *
 * Sends a message to a function that fits best to "definitions". 
 * "definitions" is a list of string which will be concatenated
 * to a single definition.
 *
 * The parameters of the function can be given to "params".
 * The function will derive all relations required to describe
 * the parameters from the parameters themselves.
 *
 * For each parameter object, the inheritance hierarchy of the
 * parameter will be added to the ">( )<" inlet relation as variadic term.
 * Optional elements of the inheritance hierarchy of the parameter object
 * will be stored as optional elements in the inlet relation.
 *
 * If a parameter is extended by _extend, the receiver can access the object
 * using the extended term. 
 *
 * The function will return the result of the function. And
 * pass all exceptions.
 *
 * Exceptions
 *	ReceiverNotAvailable		No receiver found
 *	ParameterTypeNotUnique		Parameter type is not unique
 *
 * Example
 *	Parameter:	a < ?b, c < ?d	results in ">(~a, ~c)<; a < ?b, c < ?d"
 */
Dispatcher.prototype.send = function(definitions, params)
{
	var inlet_descs = new Array();
	var param_descs = new Array();
	var input = new Object();

	// Analyze parameters
	for (var idx = 0; idx < params.length; idx++) {
		var param = params[idx];
		var paramValue = param;
	
		// Is it null? => ignore it
		if (param == null)
			continue;
	
		// Is it a usable object?
		if (param.__orderedRelations == null)
			param = param._as();

		// Has it a primary inheritance relation?
		if (param.__orderedRelations["<"] == null) {
			if (input["structure"] != null)
				throw new ParameterTypeNotUnique("Parameter not unique - object");

			inlet_descs.push("structure");
			param_descs.push("null < structure");
			
			input["|structure"] = paramValue;
		}
		 else {
		 	var param_type = new Array();

			// Extend the inlet descriptor			
			inlet_descs.push("~"+param.__orderedRelations["<"][0][0].name);

			// Add the parameter descriptor
			var param_str = param._def_string();
			param_descs.push(param_str);
			
			if (input[param_str] != null)
				throw new ParameterTypeNotUnique("Parameter not unique - "+param_str);
				
			input[param_str] = paramValue;
		}
	}

	// Search function
	var defs = definitions.concat(param_descs, [">("+inlet_descs.join(", ")+")<"]);

	var found = this.find.apply(this, defs.concat([false, true]));
	var func = found.found;

	if (func == null)
		throw new ReceiverNotAvailable("No receiver found - "+defs.join(" -- "));
	
	// Transform input message
	input = input._as("|message < structure");
	
	// Call before observers
	if (func[":before"] != null) {
		for (var idx = 0; idx < func[":before"].length; idx ++) {
			var n_input = func[":before"][idx](func, input, found.definition);

			if (n_input != null)
				input = n_input;
		}
	}
	
	// Call function
	var result = func(input, found.definition);
		
	// Call after observers
	if (func[":after"] != null) {
		for (var idx = 0; idx < func[":after"].length; idx ++) {
			var n_result = func[":after"][idx](func, result, input, found.definition);
		
			if (n_result != null)
				result = n_result;
		}
	}
	
	return result;
}

/*
 * Dispatcher::watch(definitions, pointcut, observer)
 *
 * Applies the given observer function to the given pointcut (":before" or ":after") to
 * all functions fitting to "definitions".
 *
 * The observer function has the following signature:
 *
 *		before_handler(watched_function, input, def) => new_input
 *		after_handler(watched_function, result, input, def) => new_result
 *
 * Return value
 *	Count of functions observed by "watch".
 *
 * Exceptions
 *	InvalidPointcutError		Pointcut not known
 *
 */
Dispatcher.prototype.watch = function(definitions, pointcut, observer)
{
	var observed = this.find.apply(this, definitions.concat([true, false, true]));
	
	if ((pointcut != ":before") && (pointcut != ":after"))
		throw new InvalidPointcutError(pointcut);
	
	if (observed == null)
		return 0;
	
	for (var idx = 0; idx < observed.length; idx ++) {
		if (observed[idx][pointcut]  == null)
			observed[idx][pointcut] = new Array();
				
		observed[idx][pointcut].push(observer);
	}
	
	return observed.length;
}

/*
 * Dispatcher __dispatcher
 *
 * The globaly used dispatcher.
 *
 */
var __dispatcher = new Dispatcher();


/*
 * String::_send(parameter1, ..., parameterN)
 *
 * Sends the given parameters to a function, that fits to the
 * definition string in "this".
 *
 * The function uses the dispatcher object stored in the
 * global variable "__dispatcher".
 *
 * See
 *	Dispatcher::send
 *
 */
String.prototype._send = function()
{
	var argArray = new Array();
	
	for (var idx = 0; idx < arguments.length; idx ++)
		argArray.push(arguments[idx]);

	return __dispatcher.send([this.valueOf()], argArray);
}

/*
 * Function::_observe(definitions, pointcut)
 *
 * Sets the function as observer for all functions satisfying "definitions"
 * at the given pointcut.
 *
 * The function uses the dispatcher object stored in the
 * global variable "__dispatcher".
 *
 * See
 *	Dispatcher::watch
 *
 */
Function.prototype._observe = function(definitions, pointcut)
{
	return __dispatcher.watch(definitions, pointcut, this);
}

/*
 * Function::_register(definition1, ..., definitionN)
 *
 * Applies the given definitions to the function object and
 * registers it at the global dispatcher.
 *
 * The function uses the dispatcher object stored in the
 * global variable "__dispatcher".
 *
 * See
 *	Dispatcher::register
 *
 */
Function.prototype._register = function()
{
	this._as.apply(this, arguments);
	
	return __dispatcher.register(this);
}

/*
 * Array::_function(function)
 *
 * The array contains a set of definitions used to register
 * the "function" to the dispatcher.
 *
 * The function uses the dispatcher object stored in the
 * global variable "__dispatcher".
 *
 * See
 *	Dispatcher::register
 *
 */
Array.prototype._function = function(func)
{
	func._as.apply(func, this);
	
	return __dispatcher.register(func);
}

/*
 * String::_function(function)
 *
 * The string contains a definition used to register
 * the "function" to the dispatcher.
 *
 * The function uses the dispatcher object stored in the
 * global variable "__dispatcher".
 *
 * See
 *	Dispatcher::register
 *
 */
String.prototype._function = function(func)
{
	func._as.apply(func, [this]);

	return __dispatcher.register(func);
}

/*
 * Object::_function(function)
 *
 * The objects contains definitions used to register
 * the "function" to the dispatcher.
 *
 * The function uses the dispatcher object stored in the
 * global variable "__dispatcher".
 *
 * See
 *	Dispatcher::register
 *
 */
Object.prototype._function = function(func)
{
	var defs = [];
	var idx = 0;

	for (var key in this) {
		if ((typeof(this[key]) != "string") && !(this[key] instanceof String))
			continue;
	
		var element = this[key];
	
		if ((element.charAt(0) != "|") && (idx == 0))
			defs.push("|"+element);
		else
			defs.push(element);
			
		idx ++;
	}

	func._as.apply(func, defs);

	return __dispatcher.register(func);
}

Array.prototype._ = Array.prototype._function;
String.prototype._ = String.prototype._function;
Object.prototype._ = Object.prototype._function;

