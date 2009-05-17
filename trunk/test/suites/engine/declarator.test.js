// Declartor test
// Suite:	declaratorTest
var declaratorTest =
{
	"Extending existing parameters":
		function()
		{
			methodHash = new Object();
		
			var decl = buildDeclarator(
				"myMethod",
				{ _output:		["text"],
				
				  _this:		["this", "text"],
				  foo:			["foo", "text"],
				  bar:			["bar", "text"],
				
				  _optional_goo:		["opt", "text"],
				  _default_goo:			"foobar is good!",
				  
				  _features:	["1", "2"],
				  
				  _whereas:		["foo = 'A'"],
				  _max:			["foo.length"],
				  
				  _prototype_bar:	{_returns: "123"}
				}
			);

			decl({
				  	_this:			["that"],
			
					foo:			["foo_ext"],
			
					_optional_goo:	["opt_extended"],
					_default_goo:	"foobar is better!",
					  
				 	_features:		["3"],
				 	_whereas:		"bar = 'B'",
				 	_output:		["*"],
				 	_max:			["bar.length"],

				  _prototype_bar:	{_returns: "456"},

				_does:
					function() {}
			});

			console.assert(methodHash["myMethod"].length == 1);
			
			console.assert(methodHash["myMethod"][0].output.length == 2);			
			console.assert(methodHash["myMethod"][0].output[0] == "*");
			console.assert(methodHash["myMethod"][0].output[1] == "text");

			console.assert(methodHash["myMethod"][0].input.length == 2);			
			console.assert(methodHash["myMethod"][0].input[0] == "foo");
			console.assert(methodHash["myMethod"][0].input[1] == "bar");

			console.assert(methodHash["myMethod"][0].options.length == 1);			
			console.assert(methodHash["myMethod"][0].options[0] == "goo");

			console.assert(methodHash["myMethod"][0].inputAll.length == 3);			
			console.assert(methodHash["myMethod"][0].inputAll[0] == "foo");
			console.assert(methodHash["myMethod"][0].inputAll[1] == "bar");
			console.assert(methodHash["myMethod"][0].inputAll[2] == "goo");

			console.assert(methodHash["myMethod"][0].defaults.goo == "foobar is better!");

			console.assert(methodHash["myMethod"][0].whereas.length == 2);
			console.assert(methodHash["myMethod"][0].whereas[0] == "foo = 'A'");
			console.assert(methodHash["myMethod"][0].whereas[1] == "bar = 'B'");

			console.assert(methodHash["myMethod"][0].max.length == (3 + 1 + 2));
			console.assert(methodHash["myMethod"][0].max[0] == "foo.__taggedAs('foo_ext', 'foo', 'text')");
			console.assert(methodHash["myMethod"][0].max[1] == "bar.__taggedAs('bar', 'text')");
			console.assert(methodHash["myMethod"][0].max[2] == "this.__taggedAs('that', 'this', 'text')");
			console.assert(methodHash["myMethod"][0].max[3] == "goo.__taggedAs('opt_extended', 'opt', 'text')");

			console.assert(methodHash["myMethod"][0].max[4] == "foo.length");
			console.assert(methodHash["myMethod"][0].max[5] == "bar.length");

			console.assert(methodHash["myMethod"][0].prototypes["bar"]._returns() == "456");			
		},

	"Adding new parameters":
		function()
		{
			methodHash = new Object();
		
			var decl = buildDeclarator(
				"myMethod",
				{ _output:		["text"],
				
				  _this:		["this", "text"],
				  foo:			["foo", "text"],
				  bar:			["bar", "text"],
				
				  _optional_goo:		["opt", "text"],
				  _default_goo:			"foobar is good!",
				  
				  _prototype_bar:		{_returns: "123"}
				}
			);

			decl({
					third:				["third", "text"],

					_optional_other:	["opt_other", "text"],
					_default_other:		"other is better!",

					 _prototype_boo:		{_returns: "456"},
				_does:				
					function() {}
			});
			
			console.assert(methodHash["myMethod"].length == 1);
			
			console.assert(methodHash["myMethod"][0].output.length == 1);			
			console.assert(methodHash["myMethod"][0].output[0] == "text");

			console.assert(methodHash["myMethod"][0].input.length == 3);			
			console.assert(methodHash["myMethod"][0].input[0] == "foo");
			console.assert(methodHash["myMethod"][0].input[1] == "bar");
			console.assert(methodHash["myMethod"][0].input[2] == "third");							

			console.assert(methodHash["myMethod"][0].options.length == 2);			
			console.assert(methodHash["myMethod"][0].options[0] == "goo");
			console.assert(methodHash["myMethod"][0].options[1] == "other");

			console.assert(methodHash["myMethod"][0].inputAll.length == 5);			
			console.assert(methodHash["myMethod"][0].inputAll[0] == "foo");
			console.assert(methodHash["myMethod"][0].inputAll[1] == "bar");
			console.assert(methodHash["myMethod"][0].inputAll[2] == "third");	
			console.assert(methodHash["myMethod"][0].inputAll[3] == "goo");
			console.assert(methodHash["myMethod"][0].inputAll[4] == "other");
			
			console.assert(methodHash["myMethod"][0].defaults.goo == "foobar is good!");
			console.assert(methodHash["myMethod"][0].defaults.other == "other is better!");

			console.assert(methodHash["myMethod"][0].max.length == (3 + 1 + 1 + 1));
			console.assert(methodHash["myMethod"][0].max[0] == "foo.__taggedAs('foo', 'text')");
			console.assert(methodHash["myMethod"][0].max[1] == "bar.__taggedAs('bar', 'text')");
			console.assert(methodHash["myMethod"][0].max[2] == "third.__taggedAs('third', 'text')");	
			console.assert(methodHash["myMethod"][0].max[3] == "this.__taggedAs('this', 'text')");
			console.assert(methodHash["myMethod"][0].max[4] == "goo.__taggedAs('opt', 'text')");
			console.assert(methodHash["myMethod"][0].max[5] == "other.__taggedAs('opt_other', 'text')");			

			console.assert(methodHash["myMethod"][0].prototypes["bar"]._returns() == "123");
			console.assert(methodHash["myMethod"][0].prototypes["boo"]._returns() == "456");
		},	
	
	"Generic parameters":
		function()
		{
			methodHash = new Object();
		
			var decl = buildDeclarator("myMethod",
				{
					_generic_anything:		function(foobar) { return   {_max: ["this.__taggedAs('"+foobar.join("', '")+"')"]}; },
					_generic_multithing:	function(foo, bar) { return {_max: "this.__taggedAs('"+foo+"', '"+bar+"')"} },
					_generic_direct:		function(goo) { return {direct: goo} }
				}
			);
			
			decl({
					anything:	["12", "34"],
					multithing:	["multi", "params"],
					direct:		["text"],
				
				_does:
					function() {}
			});

			console.assert(methodHash["myMethod"].length == 1);
			console.assert(methodHash["myMethod"][0].max.length == 3);

			console.assert(methodHash["myMethod"][0].input.length == 1);			
			console.assert(methodHash["myMethod"][0].input[0] == "direct");

			console.assert(methodHash["myMethod"][0].inputAll.length == 1);			
			console.assert(methodHash["myMethod"][0].inputAll[0] == "direct");

			console.assert(methodHash["myMethod"][0].max[0] == "direct.__taggedAs('text')");			
			console.assert(methodHash["myMethod"][0].max[1] == "this.__taggedAs('12', '34')");
			console.assert(methodHash["myMethod"][0].max[2] == "this.__taggedAs('multi', 'params')");			
		}
}

