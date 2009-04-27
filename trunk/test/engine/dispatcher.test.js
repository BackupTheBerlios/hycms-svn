/*
 * hyJS
 *
 * Test suite
 *
 * Copyright(C) 2009 by Friedrich Gräter
 * Published under the terms of the GNU General Public License v2
 *
 */
var dispatcherTest =
{
	"Registering a method (empty)":
		function()
		{
			methodHash = new Object();
		
			"view".__declare({
				input:		null,
				output:		null,
				features:	null,
				
				max:		null,
				whereas:	null
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
				input:		null,
				output:		["html", "text"],
				
				max:		["this.length"],
				whereas:	["this instanceof String"]
			});
			
			console.assert(methodHash["view"].length == 1);
			console.assert(methodHash["view"][0].input.length == 0);
			console.assert(methodHash["view"][0].output[0] == "html");
			console.assert(methodHash["view"][0].output[1] == "text");
			console.assert(methodHash["view"][0].whereas_precompiled[0].apply(String("abc")) == true);
			console.assert(methodHash["view"][0].max_precompiled[0].apply("abc") == "3");
		},

	"Registering a method (one parameter)":
		function()
		{
			methodHash = new Object();

			"view".__declare({
				input:		["parentList"],
				output:		["html", "text"],
				
				max:		["parentList.length"],
				whereas:	["parentList instanceof Array"]
			});
			
			console.assert(methodHash["view"].length == 1);
			console.assert(methodHash["view"][0].input[0] == "parentList");
			console.assert(methodHash["view"][0].output[0] == "html");
			console.assert(methodHash["view"][0].output[1] == "text");
			console.assert(methodHash["view"][0].whereas_precompiled[0].apply(String("abc"), [[1,2,3]]) == true);
			console.assert(methodHash["view"][0].max_precompiled[0].apply("abc", [[1,2,3]]) == "3");
		},
		
	"Registering a method (multiple parameters)":
		function()
		{
			methodHash = new Object();

			"view".__declare({
				input:		["parentList", "secondPar"],
				output:		["html", "text"],
				
				max:		["parentList.length", "secondPar"],
				whereas:	["parentList instanceof Array", "typeof(secondPar)=='number'"]
			});
			
			console.assert(methodHash["view"].length == 1);
			console.assert(methodHash["view"][0].input[0] == "parentList");
			console.assert(methodHash["view"][0].input[1] == "secondPar");
			console.assert(methodHash["view"][0].output[0] == "html");
			console.assert(methodHash["view"][0].output[1] == "text");
			console.assert(methodHash["view"][0].whereas_precompiled[0].apply(String("abc"), [[1,2,3], 456]) == true);
			console.assert(methodHash["view"][0].max_precompiled[0].apply("abc", [[1,2,3], 4]) == 3);
			console.assert(methodHash["view"][0].whereas_precompiled[1].apply(String("abc"), [[1,2,3], 456]) == true);
			console.assert(methodHash["view"][0].max_precompiled[1].apply("abc", [[1,2,3], 4]) == 4);
		},
		
	"Testing returnType":
		function()
		{
			var returnType = ["very_cool_stuff", "html", "text"];
			var requestingSome = new Requesting(["*", "text"]);
			var requestingAll  = new Requesting(["very_cool_stuff", "html", "text"]);
			var requestingWrong = new Requesting(["number"]);
			var requestingNone = new Requesting(null);
			
			console.assert( requestingSome.test(returnType) == 1 );
			console.assert( requestingAll.test(returnType) == 3 );
			console.assert( requestingWrong.test(returnType) == -1 );
			console.assert( requestingNone.test(returnType) == 0 );
		},

	"Testing Feature Request":
		function()
		{
			var features = ["very_cool_stuff", "required_stuff"];
			var requestingSome  = new Requesting(null, "required_stuff");
			var requestingAll   = new Requesting(null, "?very_cool_stuff", "required_stuff");
			var requestingWrong = new Requesting(null, "stuff");
			
			console.assert( requestingSome.test(null, features) == 1 );
			console.assert( requestingAll.test(null, features) == 2 );
			console.assert( requestingWrong.test(null, features) == -1 );
		},
		
	"Testing request copying":
		function()
		{
			var request = new Requesting(["foo", "bar"], {"boo": ["bar"]}, "abc", "def");
			var nRequest = request.copy();
			
			console.assert (nRequest.returnTypeRequest != request.returnTypeRequest );
			console.assert (nRequest.returnTypeRequest[0] == request.returnTypeRequest[0] );
			console.assert (nRequest.returnTypeRequest[1] == request.returnTypeRequest[1] );
			
			console.assert (nRequest.featureRequests != request.featureRequests );
			console.assert (nRequest.featureRequests[0] == request.featureRequests[0] );
			console.assert (nRequest.featureRequests[1] == request.featureRequests[1] );

			console.assert (nRequest.options != request.options );
			console.assert (nRequest.options["boo"] != request.options["boo"] );
		},

	"Calling a method (no conditions)":
		function()
		{
			methodHash = new Object();
		
			"view".__declare({
				input:		null,
				output:		["html", "text"],
				
				does:	function() { return "abcdef"; }
			});

			"edit".__declare({
				input:		null,
				output:		["html", "text"],
				
				does:	function() { return "pqrst"; }
			});

			console.assert( "ooo"._view() == "abcdef" );
			console.assert( "ooo"._edit() == "pqrst" );
		},

	"Calling a method (boolean conditions)":
		function()
		{
			methodHash = new Object();
		
			"view".__declare({
				input:		null,
				output:		["html", "text"],
				
				whereas:	"this instanceof Number",
				
				does:	function() { return "abcdef"; }
			});

			"view".__declare({
				input:		null,
				output:		["html", "text"],
				
				whereas:	"this instanceof String",
				
				does:	function() { return "pqrst"; }
			});

			console.assert( (1234)._view() == "abcdef" );
			console.assert( "abcd"._view() == "pqrst" );
		},

	"Calling a method (maximum constraints)":
		function()
		{
			methodHash = new Object();
		
			"view".__declare({
				input:		null,
				output:		["html", "text"],
				
				max:		"this.__taggedAs('foo', 'bar')",
				
				does:	function() { return "abcdef"; }
			});

			"view".__declare({
				input:		null,
				output:		["html", "text"],
				
				max:		"this.__taggedAs('*', 'bar')",
				
				does:	function() { return "pqrst"; }
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
				input:		["parentList"],
				output:		["html", "text"],

				whereas:	["parentList instanceof String", "this instanceof String"],
				max:		"parentList.__taggedAs('foo', '*')",
				
				does:	function() { return "abcdef"; }
			});

			var objA = "abc".__tag("foo", "bar");

			console.assert( "abc"._view(objA) == "abcdef" );
			assertException( function() { (1234)._view(objA); }, MethodNotExistsError );
		},		
		
	"Calling a method (optional parameter transmission)":
		function()
		{
			methodHash = new Object();

			// FUNCTION WITHOUT OPTIONS
			"view".__declare({
				input:		["parentList"],
				output:		["html", "text"],

				whereas:	["parentList instanceof String", "this instanceof String"],
				max:		"parentList.__taggedAs('foo', '*')",
				
				does:	function( parentList, request ) { return "one_arg"; }
			});
		
			// BETTER FUNCTION: Provides an handler for that option
			"view".__declare({
				input:		["parentList"],
				output:		["html", "text"],
				options:	{"additional": "none"},

				whereas:	["parentList instanceof String", "this instanceof String"],
				max:		"parentList.__taggedAs('foo', '*')",
				
				does:	function( parentList, request ) { return parentList + "-" + request.options["additional"]; }
			});

			var objA = "abc".__tag("foo", "bar");

			// Test optional parameter transmission
			console.assert( "abc"._view(objA, Request(["html", "text"], {"additional": "foobar"})) == "abc-foobar" );

			// Test no optional parameter (remember: this works only, because both function have the same count of boolean conditions!)
			console.assert( "abc"._view(objA, Request(["html", "text"])) == "one_arg" );
		},
		
	"Calling a method (preset optional parameters)":		
		function()
		{
			methodHash = new Object();
		
			"view".__declare({
				input:		["parentList"],
				output:		["html", "text"],
				options:	{"additional": "none"},

				whereas:	["parentList instanceof String", "this instanceof String", "__request.options.additional instanceof String"],
				max:		"parentList.__taggedAs('foo', 'bar')",
				
				does:	function( parentList, request ) { return parentList + "-" + request.options.additional; }
			});

			var objA = "abc".__tag("foo", "bar");

			// Test no optional parameter
			console.assert( "abc"._view(objA) == "abc-none" );
		},
}

