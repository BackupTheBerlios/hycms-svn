/*
 * hyJS
 *
 * Predicate dispatcher
 *
 * Copyright(C) 2009 by Friedrich Gräter
 * Published under the terms of the GNU General Public License v2
 *
 */
function MethodNotExistsError(message, args)
{
	this.message = message;
	if (traceEvals == true) {console.log(args); console.trace();}
}
MethodNotExistsError.prototype = new Error();


/*
 * methodHash
 *
 * Dictionary that references to each method name a list of
 * method descriptors.
 *
 */
var methodHash = new Object();

/*
 * requestStack
 *
 * Stack of current requests
 *
 */
var requestStack = new Array();

/*
 * aspectTable
 *
 * List of all aspects applied in the system.
 *
 */
var aspectTable = new Array();


/*
 * topRequest()
 *
 * Returns the request responsible for the call of the current
 * function. If "null", than no function was called by the dispatcher.
 *
 */
function topRequest()
{
	if (requestStack.length == 0)
		return null;
		
	return requestStack[requestStack.length - 1];
}

/*
 * [static] __getMandatoryParameters(method)
 *
 * Returns the list of all mandatory parameters of a method description.
 * The "this" parameter will be ignored.
 *
 */
function __getMandatoryParameters(method)
{
	var inputs = [];

	for (var idx in method) {
		if (idx[0] == '_') continue;
		if (idx == "_this") continue;
		
		inputs.push(idx);	
	}
	
	return inputs;
}

/*
 * [static] __getOptionalParameters(method)
 *
 * Returns the list of input parameters of a method description
 *
 */
function __getOptionalParameters(method)
{
	var options = [];
	var operator = "_optional_";
	var operatorLen = operator.length;

	for (var idx in method) {
		if (idx.substr(0, operatorLen) != operator) continue;
		
		options.push(idx.substr(operatorLen));	
	}
	
	return options;
}

/*
 * [static] __getParameterPredicate(object, setting)
 *
 * Returns a type-checking predicate for parameter "object"
 * according to "setting". Depending on the value one of the
 * following predicates will be created:
 *
 *	- If 'setting' is a list or a single string, without trailing "@" or "~":
 *		OBJECT.__taggedAs( setting )
 *
 *  - If 'setting' is a single string with a trailing "@":
 *		OBJECT instanceof setting || (typeof(OBJECT) == 'setting'.toLowerCase())
 *
 *	- If 'setting' is a single string with a trailing "~":
 *		(OBJECT instanceof setting) 
 *
 */
function __getParameterPredicate(object, setting)
{
	if (typeof(setting.valueOf()) == 'string') {
	
		if ((setting[0] != "@") && (setting[0] != "~")) {
			// Just a single element of a tagging
			setting = [setting];
		}
		 else if (setting[0] == "@") {
		 	// A instanceof predicate
		 	return "( ( " +object+" instanceof "+setting.substr(1) + ") || (typeof("+object+") == '"+setting.substr(1).toLowerCase()+"' )) ? 0 : -1";
		}
		 else if (setting[0] == "~") {
			return "( " +object+" instanceof "+setting.substr(1) + ") ? 0 : -1";
		}
	}
	
	if (setting instanceof Array) {
		return object + ".__taggedAs('" + setting.join("', '") + "')";
	}
	
	throw new Error("Invalid declaration - "+setting);
	
	return null;
}

/*
 * [static] __getMandatoryRules(method)
 *
 * Returns the list of max-rules for all mandatory parameters
 *
 */
function __getMandatoryRules(method)
{
	var inputs = [];

	function __add_instr(idx, element) {		
		inputs.push(__getParameterPredicate(idx, element));				
	}

	// Add rules
	for (var idx in method) {
		var selector;
	
		if (idx[0] == '_') continue;

		__add_instr(idx, method[idx]);		
	}
	
	// Add rule for _this
	if (method["_this"] != undefined)
		__add_instr("this", method["_this"]);	
		
	return inputs;
}

/*
 * [static] __getOptionsRules(method)
 *
 * Returns the list of max-rules for all optional parameters
 *
 */
function __getOptionsRules(method)
{
	var options = [];
	var operator = "_optional_";
	var operatorLen = operator.length;

	for (var idx in method) {
		var selector;
	
		if (idx.substr(0, operatorLen) != operator) continue;

		selector = idx.substr(operatorLen);
		
		options.push(__getParameterPredicate(selector, method[idx]));	
	}
	
	return options;
}

/*
 * [static] __getDefaultValues(method)
 *
 * Returns the default values for all parameters
 *
 */
function __getDefaultValues(method)
{
	var defaults = {};
	var operator = "_default_";
	var operatorLen = operator.length;

	for (var idx in method) {
		var selector;
	
		if (idx.substr(0, operatorLen) != operator) continue;
		selector = idx.substr(operatorLen);

		if (method[idx] == null)
			defaults[selector] = null;
		else
			defaults[selector] = method[idx];	
	}
	
	return defaults;
}

/*
 * Transfer(name)
 *
 * Indicates that the parameter 'name' should be replaced by this object.
 *
 */
function __transfer(name) { this.transfer = name; }
 
function Transfer(name)
{
	return new __transfer(name);
}

/*
 * Transfer(name)
 *
 * Indicates that the parameter 'name' should be replaced by the value of the caller.
 *
 */
function __keep(name) { return; }

function Keep()
{
	return new __keep();
}

/*
 * Evaluates(codestring)
 *
 * Indicates, that the evaluation of "codestring" should be placed inside a function.
 *
 */
function __evaluates(codestring) { this.evaluates = codestring; }
 
function Evaluates(codestring)
{
	return new __evaluates(codestring);
}

/*
 * __getPrototypeFunction(inputAll, expression)
 *
 * Evaluates the given parameter prototyping expression and
 * returns a function, that can be used to prototype the parameter of a call.
 *
 */
function __getPrototypeFunction(inputAll, expression, id)
{
	var inputFull = inputAll.concat(["_request", "_returns", "_features"]);

	if (expression instanceof __evaluates) {
		return new Function(inputFull.join(","), "return ("+expression.evaluates+");");
	}
	 else if (expression instanceof __keep) {
 		return new Function(inputFull.join(","), "return ("+id+");");
	}
	 else if (expression instanceof __transfer) {
		return new Function(inputFull.join(","), "return ("+expression.transfer+")");
	}
	 else {
		return function() { return expression; };
	}
}

/*
 * [static] __getCallPrototypes(method, inputAll)
 *
 * Returns all call prototypes for a given method with input List "inputAll".
 *
 */
function __getCallPrototypes(method, inputAll)
{
	var prototypes = ({});
	var operator = "_prototype_";
	var operatorLen = operator.length;
	
	for (var idx in method) {
		if (idx.substr(0, operatorLen) == operator) {
			var selector = idx.substr(operatorLen);
			var builder = method[idx];
			
			prototypes[selector] = ({
				_returns:	__getPrototypeFunction(inputAll, builder._returns, "_returns"),
				_features:	__getPrototypeFunction(inputAll, builder._features, "_features")
			});

			for (var b_idx in builder) {
				if (b_idx[0] == "_") continue;

				prototypes[selector][b_idx] = __getPrototypeFunction(inputAll, builder[b_idx], b_idx);
			}
		}
	}
	
	return prototypes;
}

/*
 * String::__declare(method)
 *
 * Declarates a method with name of "THIS" according to the
 * methods parameter specification "method":
 *
 *	{
 *		*:				tagging_of_parameter_*,
 *
 *		_optional_*:	tagging_of_parameter_* (for optional parameters),
 *		_default_*:		default_vale_of_*,
 *
 *		_output:		tagging_of_return_value OR NULL,
 *
 *		_features:		[available_feature_term_1, ..., available_feature_term_m] OR NULL,
 *		
 *		_max:			[numeric_instruction_1, ..., numeric_instruction_k] OR NULL,
 *		_whereas:		[boolean_instruction_1, ..., boolean_instruction_l] OR NULL,
 *
 *		_prototype_*:	request_descriptor_for_*,
 *
 *		_does:			function(name_of_parameter_1, ..., name_of_parameter_n) { ... };
 *	}
 *
 * For all specifiers which are accepting lists, also a single string can be given. The function will
 * automatically create an array of the form [string].
 *
 * Whereas:
 *	"tagging_of_parameter_*"	specifies the tagging constraint on parameter *. This will be evaluated
 *								using a _max-Clause "*.__taggedAs(tagging_of_parameter_*)". For optional
 *								parameter a default value should be given, that satisfies this tagging.
 *
 *	"default_value_of_*"		specifies the default value of the given parameter, that should be used,
 *								if the user didn't pass it to the function. The value will be copied using 
 *								"default_value_of_*.__clone()" before passing as parameter.
 *
 *  "tagging_of_return_value"	is a list of tags describing the return value. After returning,
 *								of the function these tags will be applied to the return value (if the
 *								return value isn't already tagged).
 *
 *	"available_feature_term_N"	is a feature provided by the method. The feature is described by a string.
 *
 *	"max_instruction_N"			is a instruction returning an integer value > 0 or -1. The instruction is
 *								encoded inside a string and can use any of the parameter identifiers of the
 *								method. Whenever a method with the given name is called, the dispatcher executes
 *								all max_instruction_N. It will choose the method implementation, whith the highest
 *								sum of all instruction inside "max". If one instruction inside "max" evaluates to
 *								-1 the method won't be called.
 *
 *	"boolean_instruction_N"		is a instruction retuning a boolean value. Whenever a method with the given name
 *								is called, the dispatcher will evaluate all boolean_instructions. If one boolean
 *								instruction evaluates to "false", the method will not be used for the method call.
 *
 *	"request_descriptor_for_*"	this defines a default request for all calls to method "*" inside the declared method.
 *								The definition is an object of the following form:
 *
 *								{
 *									_returns:		tagging of the expected return type,
 *									_features:		expected features,
 *									*:				default value for parameter "*"
 *								}
 *
 *								If one of these fields is set to Transfer(NAME) the value will be delegatet from the
 *								parameter NAME. If it is set to Evaluates(CODESTRING) the given CODESTRING will be evaluated
 *								to set the parameter. The CODESTRING has access to all parameters of the declared method.
 *
 *	does						contains the actual implementation of the method. All parameters given to the dispatcher
 *								will be passed to the method. The "this" reference of the method inside the call is
 *								the object which was referenced at the call of the method.
 *
 * The parameter "method" will be modified by this function.
 *
 * Return value:
 *	True
 */
String.prototype.__declare = function(method)
{
	var identifier = "_"+this.valueOf();
	var newMethod = ({name: "", 
	
					  input: [], 
					  options: [], 
					  allInput: [],
					  defaults: ({}), 
					  
					  output: [], 

					  features: [], 

					  whereas: [], 
					  max: [], 
					  
					  prototypes: ({}),
					  
					  whereas_precompiled: null,
					  max_precompiled: null,
					  
					  does: null
					});

	// Register dispatcher globally for this method
	if (Object.prototype[identifier] == null)
		Object.prototype[identifier] = function __internalCaller() { return __callMethod(identifier.substr(1), this, arguments[0]); };

	// Set all empty fields as empty arrays
	if (method._output == null)
		method._output = [];
	if (method._features == null)
		method._features = [];
	if (method._whereas == null)
		method._whereas = [];
	if (method._max == null)
		method._max = [];
	
	// Arrayify non-array elements
	if (!(method._output instanceof Array))
		method._output = [method._output];
	if (!(method._features instanceof Array))
		method._features = [method._features];
	if (!(method._whereas instanceof Array))
		method._whereas = [method._whereas];
	if (!(method._max instanceof Array))
		method._max = [method._max];

	// Create input and options list
	newMethod.input = __getMandatoryParameters(method);
	newMethod.options = __getOptionalParameters(method);
	newMethod.inputAll = newMethod.input.concat(newMethod.options);
	
	// Create input and options rules
	var input_rules = __getMandatoryRules(method);
	var option_rules = __getOptionsRules(method);
		
	// Create default values
	newMethod.defaults = __getDefaultValues(method);

	// Set up call prototypes
	newMethod.prototypes = __getCallPrototypes(method, newMethod.inputAll);

	// Set whereas / max clauses as string
	newMethod.whereas = method._whereas;
	newMethod.max = input_rules.concat(option_rules, method._max);
	
	// Precompile boolean and max instructions
	newMethod.whereas_precompiled = __precompile(newMethod.whereas, newMethod.inputAll);
	newMethod.max_precompiled = __precompile(newMethod.max, newMethod.inputAll);

	// Set defaults and features
	newMethod.output = method._output;
	newMethod.features = method._features;

	// Set name
	newMethod.name = this.valueOf();
	
	// Set specification
	newMethod.specification = method;
	
	// Set implementation
	newMethod.does = method._does;

	// Install asspects
	__registerAspects(method);

	// Register method inside the dispatcher
	if (methodHash[identifier.substr(1)] == null)
		methodHash[identifier.substr(1)] = [];

	methodHash[identifier.substr(1)].push(newMethod);
		
	return true;
}

/*
 * __precompile(functionList, inputList)
 *
 * Precompiles the given "functionList". Each of this function receives "inputList" as parameters.
 *
 */
function __precompile(functionList, inputList)
{
	var functionHeader;
	var funcList = [];
	
	if (inputList != null)
		functionHeader = inputList.concat(["__request"]).join(",");
	else
		functionHeader = "";

	if (typeof(functionList.valueOf()) == "string")
		functionList = [functionList];
	else if (functionList.valueOf() instanceof Function)
		functionList = [functionList];	
	
	for (var idx = 0; idx < functionList.length; idx ++) {
		if (typeof(functionList[idx]) != "string")
			funcList.push(functionList[idx]);
		
		var body = "return ("+functionList[idx]+");";

		funcList.push(new Function(functionHeader, body));
	}
	
	return funcList;
}

/*
 * [static] __argsToArray(inputAll, argument_object[, defaults])
 *
 * Converts an argument object to an array according to the
 * order in "inputAll_def". The function will preset all
 * undefined arguments to a copy of a value in "defaults". Additionally
 * the 'argument_object' will be added as the last element of the list.
 *
 */
function __argsToArray(inputAll, argument_object, defaults)
{
	var list = [];

	if (defaults == null) defaults = ({});

	for (var idx = 0; idx < inputAll.length; idx ++) {
		var selector = inputAll[idx];

		if (argument_object[selector] == undefined) {
			if (defaults[selector] != null)
				list.push(defaults[selector].__clone());
			else
				list.push(null);
		}
		else {
			list.push(argument_object[selector]);
		}
	}
	
	list.push(argument_object);
	
	return list;
}

/*
 * [static] __checkRequest(method, returnRequest, featureRequest)
 *
 * Tests how much the method applies to the given return type and feature request.
 *
 */
function __checkRequest(method, returnRequest, featureRequest)
{
	var returnCount = 0;
	var featureCount = 0;
	
	if (returnRequest != null) {
		if (!(returnRequest instanceof Array))
			returnRequest = [returnRequest];
	
		returnCount = method.output.__understoodAs(returnRequest);
		
		if (returnCount == -1) return -1;
	}
		
	if (featureRequest != null) {
		if (!(featureRequest instanceof Array))
			featureRequest = [featureRequest];

 	 	for (var idx = 0; idx < featureRequest.length; idx ++) {
 	 		var featureExpression, featureName, featureOptional;
 	 		
 	 		featureExpression = featureRequest[idx];
 	 		featureOptional = featureExpression[0] == '?';
 	 		featureName = featureOptional ? (featureExpression.substr(1)) : featureExpression;
 	 		
 	 		if (method.features.indexOf(featureName) > -1) {
 	 			featureCount ++;
 	 		}
 	 		 else if (!featureOptional) {
 	 		 	return -1;
 	 		}
 	 	}
 	}
 	
 	return returnCount + featureCount;
}


/*
 * [static] __prototypeDelegation(callerRequest, methodName, object, arguments)
 *
 * Mixes in the call prototype for a certain method
 *
 */
function __prototypeDelegation(callerRequest, methodName, object, arguments)
{
	var newArgs;
	var proto;
	var pars;
	var lastRequest = callerRequest;

	// Called from outside a method
	if (lastRequest == null)
		return arguments;

	// No prototype given
	if (lastRequest._method.prototypes[methodName] == null)
		return arguments;
		
	// Load prototype
	proto = lastRequest._method.prototypes[methodName];
	newArgs = ({});
	
	pars = lastRequest._parameters.concat([lastRequest._returns, lastRequest._features]);
	
	// Apply prototypes
	for (var idx in proto) {

		if ((idx[0] == "_") && (idx != "_features") && (idx != "_returns")) continue;

		if ((proto[idx] != null) && (arguments[idx] == undefined))
			newArgs[idx] = proto[idx].apply(object, pars);
	}
	
	// Apply arguments
	for (var idx in arguments) {
		if ((idx[0] == "_") && (idx != "_features") && (idx != "_returns")) continue;
		
		newArgs[idx] = arguments[idx];
	}

	return newArgs;	
}

/*
 * [static] __callMethod(methodName, object, arguments)
 *
 * Calls a given method "methodName" for the object "object" as THIS and the
 * given argument list.
 *
 */
var traceEvals = false; 

function __callMethod(methodName, object, args)
{
	var arguments;
	var returnRequest = null;
	var featureRequest = null;
	
	var maxValue = -1;
	var maxFunction = [];
	var maxBoolVal = -1;
	var maxBoolFunc = 0;
	var requestBase;

	if (traceEvals) console.group(methodName);

	if (methodHash[methodName] == null)
		throw new MethodNotExistsError("Method not known: "+methodName);

	// Autodefine arguments
	if (args == null) args = ({});	

	// Apply parameter prototype from caller
	args = __prototypeDelegation(topRequest(), methodName, object, args);

	// Evaluate argument object
	returnRequest = args._returns;
	featureRequest = args._features;

	// Arrayfy requests, if given
	if ((returnRequest != null) && (!(returnRequest instanceof Array)))
		returnRequest = [returnRequest];

	if ((featureRequest != null) && (!(featureRequest instanceof Array)))
		featureRequest = [featureRequest];


	// Find best method
	for (var idx = 0; idx < methodHash[methodName].length; idx ++) {
		var method = methodHash[methodName][idx];
		var value = 0;
		var boolCount = 0;

		// Test expected return type and features
		var requestCount = __checkRequest(method, returnRequest, featureRequest);

		if (requestCount == -1)
			continue;

		value += requestCount;

		// Test whether all mandatory parameters existing in the request
		var missing = false;
		
		for (var in_idx = 0; in_idx < method.input.length; in_idx ++) {
			if (args[method.input[in_idx]] == undefined) {
				missing = true;
				break;
			}
		}
		
		if (missing == true) continue;

		// Set parameter array
		var testArgs = __argsToArray(method.inputAll, args, method.defaults);

		// If any boolean condition evaluates to false, ignore the function
		boolCount = __evaluateBoolConditions(method, object, testArgs);

		if (boolCount == -1)
			continue;

		// Maximize any conditions
		var tmpValue = __evaluateMaxConditions(method, object, testArgs);

		if (tmpValue == -1)
			continue;

		value += tmpValue;

		if (value > maxValue) {
			maxValue = value;
			maxFunction = [];
			maxBoolFunc = 0;
			maxBoolVal = -1;
		}
		
		if (value >= maxValue) {
			maxFunction.push(idx);
			
			// Ties are broken by boolean count
			if (maxBoolVal < boolCount) {
				maxBoolVal = boolCount;
				maxBoolFunc = maxFunction.length - 1;
			}
		}
	}

	if (traceEvals) console.groupEnd();

	// No method found...
	if (maxFunction.length == 0)
		throw new MethodNotExistsError("Method not available: "+methodName, args)	

	// Select method
	var method = methodHash[methodName][maxFunction[maxBoolFunc]];

	// Prepare request parameter
	var methodArgs = __argsToArray(method.inputAll, args, method.defaults);

	// Call before aspects
	methodArgs = __callBeforeAspects(method, object, methodArgs);
	
	// Set request stack
	requestStack.push({_returns: returnRequest, _features: featureRequest, _parameters: methodArgs, _method: method});

	// Call method
	var retval = method.does.apply(object, methodArgs);

	// Remove from request stack
	requestStack.pop(args);

	// Call after aspects
	retval = __callAfterAspects(method, object, methodArgs, retval);

	// Apply return value
	if (retval != null) {
		if (retval.__def == null)
			return retval.__tag.apply(retval, method.output);
		else
			return retval;
	}
	else
		return null;
}

/*
 * __evaluateBoolConditions(method, object, args)
 *
 * Evaluates all "whereas" clauses of "method" for the given "object" and the
 * given arguments. The last element of the args array should contain the
 * requestInfo.
 *
 * Return value:
 *	Count of satisfied conditions
 *
 */
function __evaluateBoolConditions(method, object, args)
{
	for (var idx = 0; idx < method.whereas_precompiled.length; idx ++) {
		var miniFunc = method.whereas_precompiled[idx];

		try {
			if (!miniFunc.apply(object, args)) {
				if (traceEvals) console.log("Failed bool", miniFunc.toSource());
				return -1;
			}
			
		} catch(e) {
			console.log("ERROR: ", e);
			
			if (miniFunc.toSource != undefined)
				console.log("Evaluation failed:", miniFunc.toSource());
			else
				console.log("Evaluation failed:", console.log(miniFunc));
				
			console.log("Of Method:", method);
			console.log("On object: ", object);
			console.log("Called with:", args);
			console.trace();
			
			return -1;
		}

	}

	return method.whereas_precompiled.length;
}

/*
 * __evaluateMaxConditions(method, object, args)
 *
 * Evaluates all "max" clauses of "method" for the given "object" and the
 * given arguments. The last element of the args array should contain the
 * requestInfo.
 *
 */
function __evaluateMaxConditions(method, object, args)
{
	var val = 0;

	for (var idx = 0; idx < method.max_precompiled.length; idx ++) {
		var miniFunc = method.max_precompiled[idx];

		try {
			var addVal = miniFunc.apply(object, args);
		} catch (e) {
			addVal = -1;
		
			console.log("ERROR: ", e.message);
			
			if (miniFunc.toSource != undefined)
				console.log("Evaluation failed:", miniFunc.toSource());
			else
				console.log("Evaluation failed:", console.log(miniFunc));
				
			console.log("Of Method:", method);			
			console.log("On object: ", object);
			console.log("Called with:", args);
		}

		if (addVal == -1) {
			if (traceEvals)
				console.log("Failed max", miniFunc.toSource());
		
			return -1;
		}
		else
			val += addVal;
	}

	return val;
}

/*
 * Function::__observes( advice, condition_1, ..., condition_n )
 *
 * Registers the current function as aspect of all functions satisfying
 * the arbitrary number of pointcuts "condition_N".The parameter 'advice'
 * specifies when to execute the function. There are currently two possibilities:
 * before, after.
 *
 * If the same function is already added to a certain pointcut, it won't
 * be added twice.
 *
 * The function for the before advice receives the following parameters:
 *		aspect		-	The descriptor of the aspect
 *		method		-	The descriptor of the message
 *		subject		-	The 'this' parameter of the method
 *		arguments	-	List of argumetns passed to the watched function
 * It has to return "arguments" or a modified version of arguments. 
 *
 * The function for the before advice receives the following parameters:
 *		aspect		-	The descriptor of the aspect
 *		method		-	The descriptor of the message
 *		subject		-	The 'this' parameter of the method
 *		arguments	-	List of argumest passed to the watched function
 *		returnValue	-	The value returned from the watched function
 * It has to return the returnValue of the watched function or a modified
 * version of it.
 *
 * The conditions are javascript instruction strings evaluating to 'true' or 'false'.
 * They may receive the following parameters:
 *		name			- The name of the method to observe
 *		output			- The output type definition
 *		features		- The list of method features
 *
 *		input			- The list of all mandatory input parameters
 *		options			- The list of all optional input parameters
 *		inputAll		- The list of all parameters (mandatory + optional)
 *		defaults		- The default values for parameters
 *
 *		whereas			- All whereas clauses
 *		max				- All max clauses
 *
 *		specifaction	- The specification as given by the programmer
 *		does			- The implementation of the method
 *
 */
Function.prototype.__observes = function( advice )
{
	var conditions = [];
	var conditions_precompiled = [];

	// Build conditions list
	for (var idx = 1; idx < arguments.length; idx ++) {
		conditions.push(arguments[idx]);
		conditions_precompiled.push(new Function("name, output, features, input, options, inputAll, defaults, whereas, max, specification, does", 
												 "return ("+arguments[idx]+");"
												)
								   );
	}

	// Register aspect
	aspectTable.push( { advice: advice, conditions: conditions, conditions_precompiled: conditions_precompiled, handler: this} );
	
	// Apply aspect to all methods
	for (var methodName in methodHash) {
		if (methodName[0] == '_') continue;

		for (var idx = 0; idx < methodHash[methodName].length; idx ++) {
			__registerAspects( methodHash[methodName][idx] );
		}
	}
}

/*
 * __registerAspects( method )
 *
 * Tests all aspects on their applicability of 'method'. If a aspect
 * is applicable, it will be registered. If the same function is already
 * registered to a method, it will not be registered twice.
 *
 */
function __registerAspects(method)
{
	// Register administrative structures
	if (method.aspects == null)
		method.aspects = new Object();
	if (method.aspects.before == null)
		method.aspects.before = new Array();
	if (method.aspects.after == null)
		method.aspects.after = new Array();

	// Test and add all aspects
	for (var idx = 0; idx < aspectTable.length; idx ++) {
		var aspect = aspectTable[idx];
		
		if (__aspectApplicable(method, aspect)) {
			var methodAspects = method.aspects[aspect.advice];
			
			// Register only, if not already done
			if (methodAspects.indexOf(aspect) == -1)
				methodAspects.push(aspect);
		}
	}
}

/*
 * __aspectApplicable(method, aspect)
 *
 * Tests whether the given aspect is applicable to a method,
 * and returns 'true' if so.
 *
 */
function __aspectApplicable(method, aspect)
{
	for (var idx = 0; idx < aspect.conditions_precompiled.length; idx ++) {
		var condition = aspect.conditions_precompiled[idx];

		if (!condition(method.name, 
					   method.output, 
					   method.features, 
					   method.input, 
					   method.options, 
					   method.inputAll, 
					   method.defaults, 
					   method.whereas, 
					   method.max, 
					   method.specification,
					   method.does
					  )
			) 
		{
			return false;
		}
	}

	return true;
}

/*
 * __callBeforeAspects(method, subject, args)
 *
 * Calls all before aspects of the given 'method' and passes
 * the given parameter list 'args' to it. The 'this' parameter
 * of the function to be called is 'subject'.
 *
 * Return value:
 *		The new argument list of the method
 */
function __callBeforeAspects(method, subject, args)
{
	// No aspects registered
	if (method.aspects == null)
		return args;

	for (var idx = 0; idx < method.aspects.before.length; idx ++) {
		var aspect = method.aspects.before[idx];
	
		args = aspect.handler(aspect, method, subject, args);
		
		if (args == null) return null;
	}
	
	return args;
}

/*
 * __callAfterAspects(method, subject, args, returnValue)
 *
 * Calls all after aspects of the given 'method' and passes
 * the given parameter list 'args' and returnValue to it.
 * The 'this' parameter of the function to be called is 'subject'.
 *
 * Return value:
 *		The new argument list of the method
 */
function __callAfterAspects(method, subject, args, returnValue)
{
	// No aspects registered
	if (method.aspects == null)
		return returnValue;
	
	for (var idx = 0; idx < method.aspects.after.length; idx ++) {
		var aspect = method.aspects.after[idx];

		returnValue = aspect.handler(aspect, method, subject, args, returnValue);
	}

	return returnValue;
}

/*
 * [class] Package
 *
 * Package abstraction.
 *
 */
function Package()
{
}

/*
 * Object::__with(request)
 *
 * Creates a new request, that inherits return type, features and
 * all parameters from "request". Parameters specified in "Object"
 * will override all parameters in request.
 *
 */
Object.prototype.__with = function(request)
{
	var newObj = ({});
	
	for (var idx in request) {
		if (idx[0] != "_")
			newObj[idx] = request[idx];
	}
	
	newObj._returns = request._returns;
	newObj._features = request._features;
	
	for (var idx in this) {
		if (idx[0] != "_")
			newObj[idx] = this[idx];
	}
	
	return newObj;
}

