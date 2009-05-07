/*
 * hyJS
 *
 * Predicate dispatcher
 *
 * Copyright(C) 2009 by Friedrich Gräter
 * Published under the terms of the GNU General Public License v2
 *
 */
function MethodNotExistsError(message)
{
	this.message = message;
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
 * aspectTable
 *
 * List of all aspects applied in the system.
 *
 */
var aspectTable = new Array();

/*
 * String::__declare(method)
 *
 * Declarates a method with name of "THIS" according to the
 * methods parameter specification "method":
 *
 *	{
 *		input:		[name_of_parameter_1, ..., name_of_parameter_n] OR NULL,
 *		output:		tagging_of_return_value OR NULL,
 *
 *		features:	[available_feature_term_1, ..., available_feature_term_m] OR NULL,
 *		
 *		max:		[numeric_instruction_1, ..., numeric_instruction_k] OR NULL,
 *		whereas:	[boolean_instruction_1, ..., boolean_instruction_l] OR NULL,
 *
 *		does:		function(name_of_parameter_1, ..., name_of_parameter_n) { ... };
 *	}
 *
 * Whereas:
 *	"name_of_parameter_N" 		is the identifier of the n-th parameter of the function.
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

	// Register dispatcher globally for this method
	if (Object.prototype[identifier] == null)
		Object.prototype[identifier] = function __internalCaller() { return __callMethod(identifier.substr(1), this, arguments); };

	// Set all empty fields as empty arrays
	if (method.input == null)
		method.input = [];
	if (method.output == null)
		method.output = [];
	if (method.features == null)
		method.features = [];
	if (method.whereas == null)
		method.whereas = [];
	if (method.max == null)
		method.max = [];
	if (method.options == null)
		method.options = new Object();
	
	// Arrayify non-array elements
	if (!(method.input instanceof Array))
		method.input = [method.input];
	if (!(method.output instanceof Array))
		method.output = [method.output];
	if (!(method.features instanceof Array))
		method.features = [method.features];
	if (!(method.whereas instanceof Array))
		method.whereas = [method.whereas];
	if (!(method.max instanceof Array))
		method.max = [method.max];
	
	// Search for undefined fields
	for (var idx in method) {
		if (idx[0] == '_') continue;
		
		switch(idx) {
			case 'input':
			case 'output':
			case 'features':
			case 'whereas':
			case 'max':
			case 'options':
			case 'does':
				break;
				
			default:
				throw new Error("Invalid declarator - "+idx);
		}
	}
			
	// Precompile boolean and max instructions
	method.whereas_precompiled = __precompile(method.whereas, method.input);
	method.max_precompiled = __precompile(method.max, method.input);

	// Set name
	method.name = this.valueOf();

	// Install asspects
	__registerAspects(method);

	// Register method inside the dispatcher
	if (methodHash[identifier.substr(1)] == null)
		methodHash[identifier.substr(1)] = [];

	methodHash[identifier.substr(1)].push(method);
		
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
		functionHeader = inputList.concat(["__request", "__options"]).join(",");
	else
		functionHeader = "";

	if (typeof(functionList) == "string")
		functionList = [functionList];
	
	for (var idx = 0; idx < functionList.length; idx ++) {
		var body = "return ("+functionList[idx]+");";

		funcList.push(new Function(functionHeader, body));
	}
	
	return funcList;
}

/*
 * class Requesting(returnTypeRequest, [optionMap,] [featureRequest1, ...])
 *
 * Specifies certain requests to a method call. "returnTypeRequest" specifies
 * the requested return type as a list of tags (see __taggedAs). The optional parameter
 * optionMap may contain a map of named optional parameters. All parameters 
 * following it describing features the function should provide. If a feature
 * is prefixed by an "?", it is seen as optional feature.
 *
 * Properties:
 *	returnTypeRequest				Requested return type
 *	featureRequests					Requested features
 *	options							List of available options
 *
 * Methods:
 *	copy()							Creates a copy of the request object
 *	test(returnType, features)		Tests, whether the given parameters are satisfying
 *									the requested features.
 *	initOptions(optionMap)			Initializes all unitialized options using the given option map
 *
 *	addOption(name, value)			Appends the list of optionally requested parameters by a further parameter
 *  removeOption(name)				Removes a parameter from the request list
 *
 */
function Requesting(returnTypeRequest, optionMap)
{
	var fIdx = 1;

	this.returnTypeRequest = returnTypeRequest;
	this.featureRequests = [];
	
	// If option map is given
	if ((optionMap != null) && (typeof(optionMap) != "string")) {
		this.options = optionMap;
		fIdx ++;
	}
	 else {
	 	this.options = new Object();
	}

	// Create feature map
	for (var idx = fIdx; idx < arguments.length; idx ++)
		this.featureRequests.push(arguments[idx]);
}

/*
 * Requesting::copy()
 *
 * Returns a copy of the request object.
 *
 */
Requesting.prototype.copy = function()
{
	var nRequest = new Requesting();
	
	// Copy return type request
	if (this.returnTypeRequest != null)
		nRequest.returnTypeRequest = this.returnTypeRequest.concat([]);
		
	// Copy features
	nRequest.featureRequests = this.featureRequests.concat([]);
	
	// Copy option map
	nRequest.options = new Object();
	
	for (var idx in this.options) {
		if (idx[0] == "_") continue;
		
		if (this.options[idx] != null)
			nRequest.options[idx] = this.options[idx].__clone();
		else
			nRequest.options[idx] = null;
	}

	return nRequest;
}

/*
 * Requesting::test(returnType, features, optionMap)
 *
 * Tests whether the given returnType, features and optionMap are satisfying
 * the request object.
 *
 * Return value:
 *		-1		If a required feature is missing or the return type is wrong
 *		> 0		Number of satisfied features
 *		0		Return type valid
 *
 */
Requesting.prototype.test = function(returnType, features, optionMap)
{
	var tagCount = 0;

	// Test return type
	if (this.returnTypeRequest != null) {
		tagCount = returnType.__understoodAs.apply(returnType, this.returnTypeRequest);

		if (tagCount == -1)
			return -1;
	}

	// Test features
	var featuresCount = 0;
	
	if ((features != null) && (this.featureRequests.length > 0)) {
		for (var rIdx = 0; rIdx < this.featureRequests.length; rIdx ++) {
			var rFeature = this.featureRequests[rIdx];
			var rIsOption = (rFeature[0] == "?");
			var found = false;
			
			if (rIsOption)
				rFeature = rFeature.substr(1);
		
			for (var tIdx = 0; tIdx < features.length; tIdx++) {
				if (rFeature == features[tIdx])
					found = true;
			}
			
			if ((!found) && (!rIsOption))
				return -1;
				
			featuresCount ++;
		}
	}

	// Test available options
	var optionsCount = 0;

	if (optionMap != null) {
		for (var tOpt in this.options) {
			if ((tOpt[0] != "_") && (tOpt in optionMap))
				optionsCount ++;
		}
	}

	return tagCount + featuresCount + optionsCount;
}

/*
 * Requesting::initOptions(optionMap)
 *
 * Initializes all unitialized options using the given optionMap.
 * The initialization will be done using the __clone()-Method of
 * each element object.
 *
 */
Requesting.prototype.initOptions = function(optionMap)
{
	if (optionMap instanceof Array)
		throw new Error("Invalid argument for optionMap");

	for (var idx in optionMap) {
		if (idx[0] == "_") continue;

		if (this.options[idx] == null) {
			this.options[idx] = optionMap[idx].__clone();
		}
	}
}

/*
 * Requesting::addOption(name, value)
 *
 * Appends the list of optional parameters by the named parameter ('name', 'value').
 * If a parameter with the same name already exists, it will be overwritten.
 *
 * Returns: reference to "this"
 *
 */
Requesting.prototype.addOption = function(name, value)
{
	this.options[name] = value;

	return this;
}

/*
 * Requesting::removeOption(name, value)
 *
 * Removes the named parameter 'name' from the list of optional parameters.
 *
 * Returns: reference to "this"
 *
 */
Requesting.prototype.removeOption = function(name, value)
{
	delete this.options[name];
	
	return this;
}

/*
 * Requesting::extendOption(name, value)
 *
 * Copies the request object and extends the copy using addOption(name, value)
 *
 * See: addOption
 *
 * Returns: Copied instance of the request
 *
 */
Requesting.prototype.extendOption = function(name, value)
{
	return this.copy().addOption(name, value);
}

/*
 * Requesting::reduceOption(name, ...)
 *
 * Copies the request object and reduces the copy using removeOption(name).
 * The function can receive an arbitrary number of options to remove.
 *
 * See: removeOption
 *
 * Returns: Copied instance of the request
 *
 */
Requesting.prototype.reduceOption = function()
{
	var cp = this.copy();
	
	for (var idx = 0; idx < arguments.length; idx ++) {
		cp.removeOption(arguments[idx]);
	}
	
	return cp;
}

/*
 * Request(...)
 *
 * Creates a new request object by calling the Requesting constructor
 * with the given parameters.
 *
 * See: Requesting
 *
 */
function Request()
{
	var request = new Requesting();
	request.constructor.apply(request, arguments);
	
	return request;
}


/*
 * __callMethod(methodName, object, arguments)
 *
 * Calls a given method "methodName" for the object "object" as THIS and the
 * given argument list.
 *
 */
function __callMethod(methodName, object, args)
{
	var maxValue = -1;
	var maxFunction = [];
	var maxBoolVal = -1;
	var maxBoolFunc = 0;
	var requestBase;

	if (methodHash[methodName] == null)
		throw new MethodNotExistsError("Method not known: "+methodName);

	// Convert "args" to array, if not done
	if (!(args instanceof Array)) {
		var tmpArgs = [];
			
		for (var argIdx = 0; argIdx < args.length; argIdx ++)
			tmpArgs[argIdx] = args[argIdx];
			
		args = tmpArgs;
	}

	// Get return type and feature list
	if ((args.length > 0) && (args[args.length - 1] instanceof Requesting)) {
		requestBase = args[args.length - 1];
	}
	 else 
	{
		requestBase = new Requesting();
		args.push(requestBase);
	}

	args.push(0);

	// Find best method
	for (var idx = 0; idx < methodHash[methodName].length; idx ++) {
		var method = methodHash[methodName][idx];
		var value = 0;
		var boolCount = 0;

		// Test expected return type and features
		var requestCount = requestBase.test(method.output, method.features, method.options);

		if (requestCount == -1)
			continue;

		value += requestCount;

		// Set default values to optional parameters
		requestInfo = requestBase.copy();
		requestInfo.initOptions(method.options);
		
		args[args.length - 2] = requestInfo;
		args[args.length - 1] = requestInfo.options;
		if (args[args.length-1] == null) console.log("NULLOPTIONSARRAY!");
		// If any boolean condition evaluates to false, ignore the function
		boolCount = __evaluateBoolConditions(method, object, args);

		if (boolCount == -1)
			continue;

		// Maximize any conditions
		var tmpValue = __evaluateMaxConditions(method, object, args);

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

	// No method found...
	if (maxFunction.length == 0)
		throw new MethodNotExistsError("Method not available: "+methodName)	

	// Select method
	var method = methodHash[methodName][maxFunction[maxBoolFunc]];

	// Prepare request parameter
	requestInfo = requestBase.copy();
	requestInfo.initOptions(method.options);	
	args[args.length - 2] = requestInfo;
	args[args.length - 1] = requestInfo.options;

	// Call before aspects
	args = __callBeforeAspects(method, object, args);

	// Call method
	var retval = method.does.apply(object, args);

	// Call after aspects
	retval = __callAfterAspects(method, object, args, retval);

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
			if (!miniFunc.apply(object, args))
				return -1;
		} catch(e) {
			console.log("ERROR: ", e);
			console.log("Evaluation failed:", miniFunc.toSource());
			console.log("Of Method:", method);
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
			console.log("ERROR: ", e);
			console.log("Evaluation failed:", miniFunc.toSource());
			console.log("Of Method:", method);			
			console.log("Called with:", args);
		}

		if (addVal == -1)
			return -1;
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
 * They may receive the parameters 'name', 'input', 'output', 'whereas', 'max', 'options'
 * from all methods tested with the conditions.
 *
 */
Function.prototype.__observes = function( advice )
{
	var conditions = [];
	var conditions_precompiled = [];

	// Build conditions list
	for (var idx = 1; idx < arguments.length; idx ++) {
		conditions.push(arguments[idx]);
		conditions_precompiled.push(new Function("name, input, output, whereas, max, options", "return ("+arguments[idx]+");"));
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

		if (!condition(method.name, method.input, method.output, method.whereas, method.max, method.options)) {
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

