// Dispatcher test
// Suite: dispatcherTest
var dispatcherTest =
{
	"Registering a method (empty)":
		function()
		{
			methodHash = new Object();
		
			"view".__declare({
				_features:	null,
				
				_max:		null,
				_whereas:	null
			});

			console.assert(methodHash["view"].length == 1);
			console.assert(methodHash["view"][0].input.length == 0);
			console.assert(methodHash["view"][0].output.length == 0);
			console.assert(methodHash["view"][0].features.length == 0);
			console.assert(methodHash["view"][0].max_precompiled.length == 0);
			console.assert(methodHash["view"][0].whereas_precompiled.length == 0);

		},

	"Registering a method (no parameters)":
		function()
		{
			methodHash = new Object();
		
			"view".__declare({
				_output:	["html", "text"],
				
				_max:		["this.length"],
				_whereas:	["this instanceof String"]
			});
			
			console.assert(methodHash["view"].length == 1);
			console.assert(methodHash["view"][0].input.length == 0);
			console.assert(methodHash["view"][0].output[0] == "html");
			console.assert(methodHash["view"][0].output[1] == "text");
			console.assert(methodHash["view"][0].whereas_precompiled[0].apply(String("abc")) == true);
			console.assert(methodHash["view"][0].max_precompiled[0].apply("abc") == "3");
		},
	
	"Registering a method (no parameters, but features)":
		function()
		{
			methodHash = new Object();
		
			"view".__declare({
				_output:	["html", "text"],
				_features:	["myFeatures"],
				
				_max:		["this.length"],
				_whereas:	["this instanceof String"]
			});
			
			console.assert(methodHash["view"].length == 1);
			console.assert(methodHash["view"][0].input.length == 0);
			console.assert(methodHash["view"][0].inputAll.length == 0);
			console.assert(methodHash["view"][0].output[0] == "html");
			console.assert(methodHash["view"][0].output[1] == "text");
			console.assert(methodHash["view"][0].features[0] == "myFeatures");			
			console.assert(methodHash["view"][0].whereas_precompiled[0].apply(String("abc")) == true);
			console.assert(methodHash["view"][0].max_precompiled[0].apply("abc") == "3");
		},		

	"Registering a method (this)":
		function()
		{
			methodHash = new Object();

			"view".__declare({
				_this:		["list"],
				
				_output:	["html", "text"],
				_max:		["parentList.length"],
			});

			console.assert(methodHash["view"].length == 1);
			console.assert(methodHash["view"][0].input.length == 0);
			console.assert(methodHash["view"][0].max_precompiled[0].apply([[1,2,3]]) == 1);
		},

	"Registering a method (one parameter)":
		function()
		{
			methodHash = new Object();

			"view".__declare({
				parentList:	["list"],
				
				_output:	["html", "text"],
				_max:		["parentList.length"],
			});

			console.assert(methodHash["view"].length == 1);
			console.assert(methodHash["view"][0].input[0] == "parentList");
			console.assert(methodHash["view"][0].inputAll[0] == "parentList");			
			console.assert(methodHash["view"][0].output[0] == "html");
			console.assert(methodHash["view"][0].output[1] == "text");
			console.assert(methodHash["view"][0].max_precompiled[0].apply("abc", [[1,2,3]]) == 1);
			console.assert(methodHash["view"][0].max_precompiled[1].apply("abc", [[1,2,3]]) == 3);			
		},
		
	"Registering a method (multiple parameters - array and string)":
		function()
		{
			methodHash = new Object();

			"view".__declare({
				parentList:	"list",
				secondPar:	["goo", "number"],

				_output:	["html", "text"],
				_max:		["parentList.length", "secondPar"],
			});
			
			var num = (123).__tag("goo", "number");
			
			console.assert(methodHash["view"].length == 1);
			console.assert(methodHash["view"][0].input[0] == "parentList");
			console.assert(methodHash["view"][0].input[1] == "secondPar");
			console.assert(methodHash["view"][0].inputAll[0] == "parentList");
			console.assert(methodHash["view"][0].inputAll[1] == "secondPar");
			console.assert(methodHash["view"][0].output[0] == "html");
			console.assert(methodHash["view"][0].output[1] == "text");
			console.assert(methodHash["view"][0].max_precompiled[0].apply("abc", [[1,2,3], num]) == 1);
			console.assert(methodHash["view"][0].max_precompiled[1].apply("abc", [[1,2,3], num]) == 2);
			console.assert(methodHash["view"][0].max_precompiled[2].apply("abc", [[1,2,3], num]) == 3);
			console.assert(methodHash["view"][0].max_precompiled[3].apply("abc", [[1,2,3], num]) == 123);			
		},
	
	"Registering a method (optional parameters)":
		function()
		{
			methodHash = new Object();

			"view".__declare({
				parentList:					["list"],
				_optional_secondPar:		["goo", "number"],
				
				_output:	["html", "text"],
				_max:		["parentList.length", "secondPar"],
			});
			
			var num = (123).__tag("goo", "number");
			
			console.assert(methodHash["view"].length == 1);
			console.assert(methodHash["view"][0].input[0] == "parentList");
			console.assert(methodHash["view"][0].options[0] == "secondPar");
			console.assert(methodHash["view"][0].inputAll[0] == "parentList");
			console.assert(methodHash["view"][0].inputAll[1] == "secondPar");			
			console.assert(methodHash["view"][0].output[0] == "html");
			console.assert(methodHash["view"][0].output[1] == "text");
			console.assert(methodHash["view"][0].max_precompiled[0].apply("abc", [[1,2,3], num]) == 1);
			console.assert(methodHash["view"][0].max_precompiled[1].apply("abc", [[1,2,3], num]) == 2);
			console.assert(methodHash["view"][0].max_precompiled[2].apply("abc", [[1,2,3], num]) == 3);
			console.assert(methodHash["view"][0].max_precompiled[3].apply("abc", [[1,2,3], num]) == 123);			
		},		

	"Registering a method (default values)":
		function()
		{
			methodHash = new Object();

			"view".__declare({
				parentList:				["list"],
				
				_default_parentList:	"foobar",
			});
			
			console.assert(methodHash["view"].length == 1);
			console.assert(methodHash["view"][0].defaults.parentList == "foobar");
		},		

	"Registering a method (parameter delegation)":
		function()
		{
			methodHash = new Object();

			"view".__declare({
				parentList:				["list"],
				
				_prototype_view:		{_returns: Evaluates("[parentList,2,3]"), _features: Transfer("parentList"), foo: "1234"},
			});
			
			console.assert(methodHash["view"].length == 1);
			console.assert(methodHash["view"][0].prototypes["view"]._returns(1)[0] == 1);
			console.assert(methodHash["view"][0].prototypes["view"]._returns(1)[1] == 2);
			console.assert(methodHash["view"][0].prototypes["view"]._returns(1)[2] == 3);	
			console.assert(methodHash["view"][0].prototypes["view"]._features("abc") == "abc");
			console.assert(methodHash["view"][0].prototypes["view"].foo() == "1234");			
		},	
			
	"Calling a method (no conditions)":
		function()
		{
			methodHash = new Object();
		
			"view".__declare({
				_output:		["html", "text"],
				_does:	function xy() { return "abcdef"; }
			});

			"edit".__declare({
				_output:		["html", "text"],
				_does:	function() { return "pqrst"; }
			});

			console.assert( "ooo"._view() == "abcdef" );
			console.assert( "ooo"._edit() == "pqrst" );
		},
			
	"Calling a method (return type)":
		function()
		{
			methodHash = new Object();
		
			"view".__declare({
				_output:		["html", "text"],
				_does:	function xy() { return "abcdef"; }
			});

			"view".__declare({
				_output:		["xml", "text"],
				_does:	function() { return "pqrst"; }
			});

			console.assert( "ooo"._view({_returns: ["html", "text"]}) == "abcdef" );
			console.assert( "ooo"._view({_returns: ["xml", "text"]}) == "pqrst" );
		},
		
	"Calling a method (features)":
		function()
		{
			methodHash = new Object();
		
			"view".__declare({
				_features:		["abc", "def"],
				_does:	function xy() { return "abcdef"; }
			});

			"view".__declare({
				_features:		["abc", "xyz"],
				_does:	function() { return "pqrst"; }
			});

			console.assert( "ooo"._view({_features: ["abc", "def"]}) == "abcdef" );
			console.assert( "ooo"._view({_features: ["abc", "?xyz"]}) == "pqrst" );
			console.assert( "ooo"._view({_features: ["abc", "def", "?xyz"]}) == "abcdef" );			
		},

	"Calling a method (access to request stack)":
		function()
		{
			methodHash = new Object();
		
			"view".__declare({
				_output:		["html", "text"],
				_does:	function xy() { return topRequest()._features[0]; }
			});

			console.assert( "ooo"._view({_features: "?abcdef"}) == "?abcdef" );
		},
				
	"Calling a method (boolean conditions, type-check)":
		function()
		{
			methodHash = new Object();
		
			"view".__declare({
				_output:		["html", "text"],
				_whereas:		"this == 1234",
				
				_does:	function () { return "abcdef"; }
			});
			
			"view".__declare({
				_output:	["html", "text"],
				_whereas:	"this == 5678",
				
				_does:	function () { return "lmnop"; }
			});			

			"view".__declare({
				_output:	["html", "text"],
				_whereas:	"this == 'abcd'",
								
				_does:	function() { return "pqrst"; }
			});

			console.assert( (1234)._view() == "abcdef" );
			console.assert( "abcd"._view() == "pqrst" );
		},

	"Calling a method (maximum constraints)":
		function()
		{
			methodHash = new Object();
		
			"view".__declare({
				_this:		['foo', 'bar'],
				
				_output:	["html", "text"],
				_does:		function() { return "abcdef"; }
			});

			"view".__declare({
				_this:		['*', 'bar'],
				
				_output:	["html", "text"],
				_does:		function() { return "pqrst"; }
			});

			var objA = "abc".__tag("foo", "bar");
			var objB = "def".__tag("bar");
			var objC = "hij".__tag("goo", "bar");			

			console.assert( objA._view() == "abcdef" );
			console.assert( objB._view() == "pqrst" );
			console.assert( objC._view() == "pqrst" );			
		},
	
	"Calling a method (parameter transmission)":
		function()
		{
			methodHash = new Object();
		
			"view".__declare({
				_this:		"text",
				parentList:	['foo', '*'],
				
				_whereas:	"parentList instanceof String",
				
				_output:	["html", "text"],
				_does:	function(parentList) { return parentList+"def"; }
			});

			var objA = "abc".__tag("foo", "bar");

			console.assert( "abc"._view({parentList: objA}) == "abcdef" );
			assertException( function() { (1234)._view({parentList: objA}); }, MethodNotExistsError );
		},		
	
	"Calling a method (optional parameter transmission)":
		function()
		{
			methodHash = new Object();

			// FUNCTION WITHOUT OPTIONS
			"view".__declare({
				_this:		"text",
				standard:	"text",
				_output:	["html", "text"],
			
				_does:	function() 		{ return "one_arg"; }
			});
		
			// BETTER FUNCTION: Provides an handler for that option
			"view".__declare({
				_this:						"text",
				standard:					"text",
				_optional_parentList:		"text",

				_output:					["html", "text"],				
				_does:						function( standard, parentList ) { return this + "-" + standard + "-" + parentList; }
			});

			// Test optional parameter transmission
			console.assert( "abc"._view({standard: "def", parentList: "foobar"}) == "abc-def-foobar" );
		},
				
	"Calling a method (preset optional parameters)":		
		function()
		{
			methodHash = new Object();
		
			"view".__declare({
				_this:						"text",
				standard:					"text",
				_optional_parentList:		"text",
				
				_default_parentList:		"default",

				_output:					["html", "text"],				
				_does:						function( standard, parentList ) { return this + "-" + standard + "-" + parentList; }
			});

			console.assert( "abc"._view({standard: "def", parentList: "foobar"}) == "abc-def-foobar" );
			console.assert( "abc"._view({standard: "def"}) == "abc-def-default" );
		},

	"Calling a method (delegation prototyping)":
		function()
		{
			methodHash = new Object();

			"view".__declare({
				_this:						"text",
				standard:					"text",
				goo:						"text",
				_features:					["def"],
				
				_output:					["xml", "text"],				
				_does:						function( standard, goo ) {  return goo+" with "+standard; }
			});	
		
			"view".__declare({
				_this:						"text",
				standard:					"text",
				parentList:					"list",
				goo:						"text",
				_features:					["abc"],								
				
				_prototype_view:			{_features: Evaluates("['def']"), _returns:  Transfer("parentList"),	goo: Keep(), standard: "delegation"},
				
				_output:					["html", "text"],				
				_does:						function( standard, parentList ) {
												var foo ={}; 
												
												if (standard != "non") foo = {standard: standard}; 
												
												return "123"._view(foo); 
											}
			});		
		
			console.assert( "abc"._view({_features: "abc", standard: "non", parentList: ["xml", "text"], goo: "done"}) == "done with delegation" );
			console.assert( "abc"._view({_features: "abc", standard: "parameter", parentList: ["xml", "text"], goo: "done"}) == "done with parameter" );
		},

	"Registering an aspect to a method":
		function()
		{
			methodHash = new Object();
		
			"view".__declare({
				parentList:		"text",
				_output:		["foo", "text"],
				
				_does:			function( parentList ) { return "1"; }
			});		
		
			"view".__declare({
				parentList:		"text",
				_output:		["html", "text"],
				
				_does:			function( parentList ) { return "2"; }
			});


			function beforeAspect ( aspect, method, subject, arguments ) { };
			beforeAspect.__observes( "before", "name == 'view'", "input.indexOf('parentList') > -1", "output.__understoodAs('foo', 'text') > -1" );

			function afterAspect ( aspect, method, subject, arguments, retVal ) { };
			afterAspect.__observes( "after", "name == 'view'", "input.indexOf('parentList') > -1", "output.__understoodAs('foo', 'text') > -1" );		

			console.assert(methodHash['view'][0].aspects.before[0].handler == beforeAspect);
			console.assert(methodHash['view'][0].aspects.after[0].handler == afterAspect);
			
			console.assert(methodHash['view'][1].aspects.before.length == 0);
			console.assert(methodHash['view'][1].aspects.before.length == 0);
			
		},
	
	"Using an aspect on a method":
		function()
		{
			methodHash = new Object();
		
			"view".__declare({
				parentList:	["text"],
				_output:	["html", "text"],
				
				_does:	function( parentList ) { return parentList; }
			});		

			function beforeAspect ( aspect, method, subject, arguments ) { arguments[0] = "before-"+subject+"-"+arguments[0]; return arguments; };
			beforeAspect.__observes( "before", "name == 'view'", "input.indexOf('parentList') > -1", "output.__understoodAs('html', 'text') > -1" );

			function afterAspect ( aspect, method, subject, arguments, retVal ) { return retVal+"-"+subject+"-after" };
			afterAspect.__observes( "after", "name == 'view'", "input.indexOf('parentList') > -1", "output.__understoodAs('html', 'text') > -1" );		

			console.assert("anything"._view({parentList: "call"}) == "before-anything-call-anything-after");
			
		}	
}

