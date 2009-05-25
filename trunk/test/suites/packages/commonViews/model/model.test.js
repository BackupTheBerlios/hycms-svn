// Basic models
// Suite:		basicModelTest
// Requires:	packages/modelKit/model.js.h
// Tests:		packages/modelKit/basic.js
// Tests:		packages/modelKit/text.js
// Tests:		packages/modelKit/list.js
// Tests:		packages/modelKit/structure.js
// Tests:		packages/commonViews/model/paragraph.js
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
		
	"Insert (text, same type)":
		function()
		{
			var text = "12345";

			var newText = text._insert({path: [text], pathAt: 0, offset: 3, child: "pqr"});

			console.assert(newText instanceof Array);
			console.assert(newText.length == 1);
			console.assert(newText[0] == "123pqr45");
		},
		
	"Insert (text, different type)":
		function()
		{	
			var text = "12345";
			
			var newText = text._insert({path: [text], pathAt: 0, offset: 3, child: "abc".__tag("foo", "text")});

			console.assert(newText instanceof Array);
			console.assert(newText.length == 3);
			console.assert(newText[0] == "123");
			console.assert(newText[1] == "abc");
			console.assert(newText[2] == "45");

			console.assert(newText[0].__taggedAs("text") > -1);
			console.assert(newText[1].__taggedAs("foo", "text") > -1);
			console.assert(newText[2].__taggedAs("text") > -1);
			
			newText = text._insert({path: [text], pathAt: 0, offset: 3, child: [1,2,3]});
	
			console.assert(newText instanceof Array);
			console.assert(newText.length == 3);
			console.assert(newText[0] == "123");
			console.assert(newText[1] instanceof Array);
			console.assert(newText[1].length == 3);
			console.assert(newText[1][0] == 1);
			console.assert(newText[1][1] == 2);
			console.assert(newText[1][2] == 3);	
			console.assert(newText[2] == "45");		
			
			console.assert(newText[0].__taggedAs("text") > -1);
			console.assert(newText[1].__taggedAs("list") > -1);
			console.assert(newText[2].__taggedAs("text") > -1);
		},
		
	"Insert (list, non-recursive)":
		function()
		{
			var list = [1,2,3,4];
			
			var result = list._insert({path: [list], pathAt: 0, offset: 3, child: "pqr"});

			console.assert(result == true);
			console.assert(list instanceof Array);
			console.assert(list.length == 5);
			
			console.assert(list[0] == 1);
			console.assert(list[1] == 2);
			console.assert(list[2] == 3);
			console.assert(list[3] == "pqr");
			console.assert(list[4] == 4);												
		},

	"Insert (list, recursive, no merge)":
		function()
		{
			var list = [1,2,[5,6,[8,9]], 3,4];
	
			var result = list._insert({path: [list, list[2], list[2][2]], pathAt: 0, offset: 0, child: "pqr"});

			console.assert(result == false);
			console.assert(list instanceof Array);
			console.assert(list.length == 5);
			
			console.assert(list[0] == 1);
			console.assert(list[1] == 2);
			console.assert(list[3] == 3);
			console.assert(list[4] == 4);												
			
			console.assert(list[2] instanceof Array);
			console.assert(list[2].length == 3);
			console.assert(list[2][0] == 5);
			console.assert(list[2][1] == 6);
			console.assert(list[2][2] instanceof Array);
			console.assert(list[2][2].length == 3);
			console.assert(list[2][2][0] == "pqr");
			console.assert(list[2][2][1] == 8);
			console.assert(list[2][2][2] == 9);
		},

	"Insert (list, recursive, full merge of text)":
		function()
		{
			var list = [1,2,[5,6, "abcdef"], 3,4];
	
			var result = list._insert({path: [list, list[2], list[2][2]], pathAt: 0, offset: 1, child: "pqr"});

			console.assert(result == false);
			console.assert(list instanceof Array);
			console.assert(list.length == 5);
			
			console.assert(list[0] == 1);
			console.assert(list[1] == 2);
			console.assert(list[3] == 3);
			console.assert(list[4] == 4);												
			
			console.assert(list[2] instanceof Array);
			console.assert(list[2].length == 3);
			console.assert(list[2][0] == 5);
			console.assert(list[2][1] == 6);
			console.assert(list[2][2] instanceof String);
			console.assert(list[2][2] == "apqrbcdef");
		},	
		
	"Insert (list, recursive, splitting merge of text)":
		function()
		{
			var list = [1,2,[5, "abcdef", 6], 3,4];
	
			var result = list._insert({path: [list, list[2], list[2][1]], pathAt: 0, offset: 1, child: "pqr".__tag("important", "text")});

			console.assert(result == false);
			console.assert(list instanceof Array);
			console.assert(list.length == 5);
			
			console.assert(list[0] == 1);
			console.assert(list[1] == 2);
			console.assert(list[3] == 3);
			console.assert(list[4] == 4);												

			console.assert(list[2] instanceof Array);
			console.assert(list[2].length == 5);
			console.assert(list[2][0] == 5);
			console.assert(list[2][1] == "a");
			console.assert(list[2][1].__taggedAs("text"));
			console.assert(list[2][2] == "pqr");
			console.assert(list[2][2].__taggedAs("important", "text"));
			console.assert(list[2][3] == "bcdef");			
			console.assert(list[2][3].__taggedAs("text"));
			console.assert(list[2][4] == 6);
		},				
		
	"Remove (text)":
		function()
		{
			var text = "abcdefghijk";
			
			var result = text._remove({path: [text], pathAt: 0, offset: 3, count: 4});
			
			console.assert(result instanceof Array);
			console.assert(result.length == 1);
			
			console.assert(result[0] == "abchijk");
		},

	"Remove (list, non-recursive)":
		function()
		{
			var list = [1,2,3,4];
			
			var result = list._remove({path: [list], pathAt: 0, offset: 1, count:2});

			console.assert(result == true);
			console.assert(list.length == 2);
			
			console.assert(list[0] == 1);
			console.assert(list[1] == 4);
		},
		
	"Remove (list, recursive)":
		function()
		{
			var list = [1,2,[4,5,6],4];
			
			var result = list._remove({path: [list, list[2]], pathAt: 0, offset: 1, count:2});

			console.assert(result == false);
			console.assert(list.length == 4);

			console.assert(list[0] == 1);
			console.assert(list[1] == 2);			
			console.assert(list[2] instanceof Array);
			console.assert(list[2].length == 1);
			console.assert(list[2][0] == 4);
			console.assert(list[3] == 4);	
		},
		
	"Duplicate (text)":
		function()
		{
			var text = "abcdef".__tag("foo", "text");
			
			var result = text._duplicate({path: [text], offset: 1, endPath: [text], length: 4});
			
			console.assert(result.__taggedAs("foo", "text"));
			console.assert(result == "bcde");
		},

	"Duplicate (list)":
		function()
		{
			// End at different level than start
			var list = ["abc", "def", ["pqr", "stu"], "vwx", ["yz"], "mnop"].__tag("foo", "list");
	
			var result = list._duplicate({path: [list, list[1]], offset: 2, endPath: [list, list[4], list[4][0]], length: 1});

			console.assert(result != list);
			console.assert(result.__taggedAs("foo", "list") == 2);
			console.assert(result[0] == "f");			
			console.assert(result[1][0] == "pqr");
			console.assert(result[1][1] == "stu");
			console.assert(result[2] == "vwx");
			console.assert(result[3] == "y");			

			// Start at different level than end
			var list = ["abc", "def", ["pqr", "stu"], "vwx", ["yz"], "mnop"].__tag("foo", "list");
	
			var result = list._duplicate({path: [list, list[2], list[2][0]], offset: 2, endPath: [list, list[5]], length: 1});

			console.assert(result != list);
			console.assert(result.__taggedAs("foo", "list") == 2);
			console.assert(result[0][0] == "r");			
			console.assert(result[0][1] == "stu");
			console.assert(result[1] == "vwx");
			console.assert(result[2][0] == "yz");
			console.assert(result[3] == "m");		

			// Copy a single element
			var list = ["abc", "def", ["pqr", "stu"], "vwx", ["yz"], "mnop"].__tag("foo", "list");
	
			var result = list._duplicate({path: [list, list[5]], offset: 1, endPath: [list, list[5]], length: 1});

			console.assert(result != list);
			console.assert(result.__taggedAs("foo", "list") == 2);
			console.assert(result[0] == "n");
		},

	"Insert newline to paragraph (text + single nl)":
		function()
		{
			var list = ["abc".__tag("important", "text"), "defghjk"].__tag("paragraph", "list");
			var child = "\n".__tag("important", "text");
			
			var result = list._insert({path: [list, list[1]], offset: 2, child: child});
			
			console.assert(result instanceof Array);

			console.assert(result[0].__is("paragraph"));

			console.assert(result[0].length == 2);
			console.assert(result[0][0] == "abc");
			console.assert(result[0][0].__taggedAs("important", "text") == 2);			
			console.assert(result[0][1] == "de");
			console.assert(result[0][1].__taggedAs("text") == 1);			

			console.assert(result[1].length == 1);
			console.assert(result[1][0] == "fghjk");
			console.assert(result[1][0].__taggedAs("text") == 1);

		},
		
	"Insert newline to paragraph (text + nls)":
		function()
		{
			var list = ["abc".__tag("important", "text"), "defghjk"].__tag("paragraph", "list");
			var child = "1\n2\n3\n4".__tag("important", "text");
			
			var result = list._insert({path: [list, list[1]], offset: 2, child: child});
			
			console.assert(result instanceof Array);

			console.assert(result[0].__is("paragraph"));
			console.assert(result[0].length == 3);			
			console.assert(result[0][0] == "abc");
			console.assert(result[0][0].__taggedAs("important", "text") == 2);			
			console.assert(result[0][1] == "de");
			console.assert(result[0][1].__taggedAs("text") == 1);			
			console.assert(result[0][2] == "1");
			console.assert(result[0][2].__taggedAs("important", "text") == 2);			

			console.assert(result[1].length == 1);
			console.assert(result[1].__is("paragraph"));
			console.assert(result[1][0] == "2");
			console.assert(result[1][0].__taggedAs("important", "text") == 2);

			console.assert(result[2].length == 1);
			console.assert(result[2].__is("paragraph"));
			console.assert(result[2][0] == "3");
			console.assert(result[2][0].__taggedAs("important",  "text") == 2);

			console.assert(result[3].length == 2);
			console.assert(result[3].__is("paragraph"));
			console.assert(result[3][0] == "4");
			console.assert(result[3][0].__taggedAs("important", "text") == 2);
			console.assert(result[3][1] == "fghjk");
			console.assert(result[3][1].__taggedAs("text") == 1);

		}
}

