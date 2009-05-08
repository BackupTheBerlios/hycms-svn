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

			var preinit = ["structure"]._construct(Request(null, {initializer: {a: 123, b: "456"}}));
			
			console.assert( preinit instanceof Object);
			console.assert( preinit.a == 123);
			console.assert( preinit.b == "456");
			
			var preinitTagged = ["?anything", "structure"]._construct(Request(null, {initializer: {a: 123, b: "456"}}));
			
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
			
			var preinit = ["list"]._construct(Request(null, {initializer:[1,2,3]}));
			
			console.assert( preinit instanceof Array);
			console.assert( preinit.length == 3);
			console.assert( preinit[0] == 1);
			console.assert( preinit[1] == 2);
			console.assert( preinit[2] == 3);
			
			var preinitTagged = ["?anything", "list"]._construct(Request(null, {initializer:[1,2,3]}));
			
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
			
			var preinit = ["text"]._construct(Request(null, {initializer:"Hello World!"}));
			
			console.assert( preinit instanceof String );
			console.assert( preinit == "Hello World!" );
			
			var preinitTagged = ["?anything", "text"]._construct(Request(null, {initializer:"Hello World!"}));
			
			console.assert( preinitTagged instanceof String);
			console.assert( preinitTagged == "Hello World!" );			
		},
		
	"Merge (Text into Text)":
		function()
		{
			var data = "Hello World!".__tag("text");

			var new_data = data._merge("Foo ", 6);
			
			console.assert(new_data instanceof Array);
			console.assert(new_data.length == 1);

			console.assert(new_data[0] == "Hello Foo World!");
		},
		
	"Merge (Markup-Text into Text)":
		function()
		{
			var data = "Hello World!".__tag("text");

			var new_data = data._merge("Foo ".__tag("other_text", "text"), 6);
			
			console.assert(new_data instanceof Array);
			console.assert(new_data.length == 3);

			console.assert(new_data[0] == "Hello ");
			console.assert(new_data[1] == "Foo ");		
			console.assert(new_data[2] == "World!");						
			
			console.assert(new_data[0].__taggedAs("text") > -1);
			console.assert(new_data[1].__taggedAs("text") == -1);
			console.assert(new_data[1].__taggedAs("other_text", "text") > -1);
			console.assert(new_data[2].__taggedAs("text") > -1);
		},	
		
	"Merge (Markup-Text into Markup-Text)":
		function()
		{
			var data = "Hello World!".__tag("other_text", "text");

			var new_data = data._merge("Foo ".__tag("other_text", "text"), 6);

			console.assert(new_data instanceof Array);
			console.assert(new_data.length == 1);

			console.assert(new_data[0] == "Hello Foo World!");
		},	
		
	"Merge (Text into Markup-Text)":
		function()
		{
			var data = "Hello World!".__tag("other_text", "text");

			var new_data = data._merge("Foo ".__tag("text"), 6);
		
			console.assert(new_data instanceof Array);
			console.assert(new_data.length == 3);

			console.assert(new_data[0] == "Hello ");
			console.assert(new_data[1] == "Foo ");		
			console.assert(new_data[2] == "World!");						

			console.assert(new_data[0].__taggedAs("other_text", "text") > -1);
			console.assert(new_data[1].__taggedAs("other_text", "text") == -1);
			console.assert(new_data[1].__taggedAs("text") > -1);
			console.assert(new_data[2].__taggedAs("other_text", "text") > -1);
		},				
		
	"Merge (List into Text)":
		function()
		{
			var data = "Hello World!".__tag("other_text", "text");

			var new_data = data._merge([1,2,3], 6);
			
			console.assert(new_data instanceof Array);
			console.assert(new_data.length == 3);

			console.assert(new_data[0] == "Hello ");
			console.assert(new_data[1] instanceof Array);
			console.assert(new_data[1].length == 3);			
			console.assert(new_data[1][0] == 1);
			console.assert(new_data[1][1] == 2);
			console.assert(new_data[1][2] == 3);			
			console.assert(new_data[2] == "World!");	
			
			console.assert(new_data[0].__taggedAs("other_text", "text") > -1);
			console.assert(new_data[1].__taggedAs("other_text", "text") == -1);
			console.assert(new_data[1].__taggedAs("list") > -1);
			console.assert(new_data[2].__taggedAs("other_text", "text") > -1);								
		},
		
	"Merge (Structure into Text)":
		function()
		{
			var data = "Hello World!".__tag("other_text", "text");

			var new_data = data._merge({a: "bcd"}, 6);
			
			console.assert(new_data instanceof Array);
			console.assert(new_data.length == 3);

			console.assert(new_data[0] == "Hello ");
			console.assert(new_data[1] instanceof Object);
			console.assert(new_data[1].a == "bcd");
			console.assert(new_data[2] == "World!");	
			
			console.assert(new_data[0].__taggedAs("other_text", "text") > -1);
			console.assert(new_data[1].__taggedAs("other_text", "text") == -1);
			console.assert(new_data[1].__taggedAs("structure") > -1);
			console.assert(new_data[2].__taggedAs("other_text", "text") > -1);									
		},
		
	"Merge (Anyting into List)":
		function()
		{
			var data = [1,2,3].__tag("list");

			var new_data = data._merge("Foo", 1);

			console.assert(new_data instanceof Array);
			console.assert(new_data.length == 1);

			console.assert(new_data[0] == data);
			console.assert(new_data[0].length == 4);
			console.assert(new_data[0][0] == 1);
			console.assert(new_data[0][1] == "Foo");
			console.assert(new_data[0][2] == 2);
			console.assert(new_data[0][3] == 3);			
		},	
		
	"Merge (Anyting into Structure)":
		function()
		{
			var data = {a: "bcd"}.__tag("structure");

			var new_data = data._merge("Foo", "b");

			console.assert(new_data instanceof Array);
			console.assert(new_data.length == 1);

			console.assert(new_data[0] == data);
			console.assert(new_data[0].a == "bcd");
			console.assert(new_data[0].b == "Foo");

			var new_data = data._merge("Goo", "a");

			console.assert(new_data instanceof Array);
			console.assert(new_data.length == 1);

			console.assert(new_data[0] == data);
			console.assert(new_data[0].a == "Goo");
			console.assert(new_data[0].b == "Foo");
		},
		
	"Remove (Text)":
		function()
		{
			var data = "abc".__tag("text");
			
			var new_data = data._remove(0,2);
			
			console.assert(new_data == "c");
			console.assert(new_data != data);
		},		
		
	"Remove (List)":
		function()
		{
			var data = [1,2,3].__tag("list");
			
			var new_data = data._remove(0,1);

			console.assert(new_data == data);
			
			console.assert(new_data[0] == 2);
			console.assert(new_data[1] == 3);
		},
		
	"Remove (Structure)":
		function()
		{
			var data = {a: "bcd", b: "efg", c: "dhj"}.__tag("structure");
			
			var new_data = data._remove("b",2);

			console.assert(new_data == data);
			
			console.assert(new_data["a"] == "bcd");
			console.assert(new_data["b"] == undefined);
			console.assert(new_data["c"] == undefined);			
		},		
}

