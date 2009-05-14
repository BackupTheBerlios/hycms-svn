// Basic models
// Suite:		basicModelTest
// Requires:	packages/commonViews/model/model.js.h
// Tests:		packages/commonViews/model/basic.js
var basicModelTest =
{
	"Construction (Structure)":
		function()
		{
			var bare = ["structure"]._construct();
			
			console.assert( bare instanceof Object);

			var tagged = ["?anything", "structure"]._construct();
			
			console.assert( tagged instanceof Object);

			var preinit = ["structure"]._construct({initializer: {a: 123, b: "456"}});
			
			console.assert( preinit instanceof Object);
			console.assert( preinit.a == 123);
			console.assert( preinit.b == "456");
			
			var preinitTagged = ["?anything", "structure"]._construct({initializer: {a: 123, b: "456"}});
			
			console.assert( preinitTagged instanceof Object);
			console.assert( preinitTagged.a == 123);
			console.assert( preinitTagged.b == "456");			
		},

	"Construction (List)":
		function()
		{
			var bare = ["list"]._construct();
			
			console.assert( bare instanceof Array);
			console.assert( bare.length == 0);

			var tagged = ["?anything", "list"]._construct();
			
			console.assert( tagged instanceof Array);
			console.assert( tagged.length == 0);
			
			var preinit = ["list"]._construct({initializer:[1,2,3]});
			
			console.assert( preinit instanceof Array);
			console.assert( preinit.length == 3);
			console.assert( preinit[0] == 1);
			console.assert( preinit[1] == 2);
			console.assert( preinit[2] == 3);
			
			var preinitTagged = ["?anything", "list"]._construct({initializer:[1,2,3]});
			
			console.assert( preinitTagged instanceof Array);
			console.assert( preinitTagged.length == 3);
			console.assert( preinitTagged[0] == 1);
			console.assert( preinitTagged[1] == 2);
			console.assert( preinitTagged[2] == 3);					
		},

	"Construction (Text)":
		function()
		{
			var bare = ["text"]._construct();
			
			console.assert( bare instanceof String );

			var tagged = ["?anything", "text"]._construct();
			
			console.assert( tagged instanceof String );
			
			var preinit = ["text"]._construct({initializer:"Hello World!"});
			
			console.assert( preinit instanceof String );
			console.assert( preinit == "Hello World!" );
			
			var preinitTagged = ["?anything", "text"]._construct({initializer:"Hello World!"});
			
			console.assert( preinitTagged instanceof String);
			console.assert( preinitTagged == "Hello World!" );			
		},
}

