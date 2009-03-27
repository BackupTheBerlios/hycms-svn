/*
 * hyObjects(js)
 *
 * Test suite
 *
 * Copyright(C) 2009 by Friedrich Gräter
 * Published under the terms of the GNU General Public License v2
 *
 */
var relationTest =
{
	"Convert a relation to string (leave options)":
		function()
		{
			var test_object_ordered = {a: "b"};
			var test_object_unordered = {a: "b"};
			
			test_object_ordered._as("|a << ?b << c");
			test_object_unordered._as("|[a, ?b, c]");
			
			console.assert(test_object_ordered._relationToString("<<", 0, true) == "a << ?b << c");
			console.assert(test_object_unordered._relationToString("[]", 0, false) == "[a, ?b, c]");

			var test_object_ordered = {a: "b"};
			var test_object_unordered = {a: "b"};
			
			test_object_ordered._as("|. << a");
			test_object_unordered._as("|[a]");

			console.assert(test_object_ordered._relationToString("<<", 0, true) == ". << a");
			console.assert(test_object_unordered._relationToString("[]", 0, false) == "[a]");
		},
		
	"Convert a relation to string (remove options)":
		function()
		{
			var test_object_ordered = {a: "b"};
			var test_object_unordered = {a: "b"};
			
			test_object_ordered._as("|a << ?b << c");
			test_object_unordered._as("|[a, ?b, c]");
			
			console.assert(test_object_ordered._relationToString("<<", 0, true, "!") == "a << b << c");
			console.assert(test_object_unordered._relationToString("[]", 0, false, "!") == "[a, b, c]");
		},

	"Convert a relation to string (enforce options)":
		function()
		{
			var test_object_ordered = {a: "b"};
			var test_object_unordered = {a: "b"};
			
			test_object_ordered._as("|a << ?b << c");
			test_object_unordered._as("|[a, ?b, c]");
			
			console.assert(test_object_ordered._relationToString("<<", 0, true, "?") == "?a << ?b << ?c");
			console.assert(test_object_unordered._relationToString("[]", 0, false, "?") == "[?a, ?b, ?c]");
		},

	"Convert a relation to string (enforce options and variadics)":
		function()
		{
			var test_object_ordered = {a: "b"};
			var test_object_unordered = {a: "b"};
			
			test_object_ordered._as("|a << ?b << c");
			test_object_unordered._as("|[a, ?b, c]");
			
			console.assert(test_object_ordered._relationToString("<<", 0, true, "?~") == "?~a << ?~b << ?~c");
			console.assert(test_object_unordered._relationToString("[]", 0, false, "?~") == "[?~a, ?~b, ?~c]");
		},
		
	"Convert a relation to string (preconditions)":
		function()
		{
			var test_object_ordered = {a: "b"};
			var test_object_unordered = {a: "b"};
			
			test_object_ordered._as("|a: a << ?b << c");
			test_object_unordered._as("|b,c: [a, ?b, c]");
			
			console.assert(test_object_ordered._relationToString("<<", 0, true, "?~") == "a: ?~a << ?~b << ?~c");
			console.assert(test_object_unordered._relationToString("[]", 0, false, "?~") == "b, c: [?~a, ?~b, ?~c]");
		},		
		
	"hasTerm":
		function()
		{
			var test_object = {a: "b"};
			
			test_object._as("|a << ?b << c; [x, y, z]");
			
			console.assert(test_object._hasTerm("<<", 0, true, "b") == true);
			console.assert(test_object._hasTerm("[]", 0, false, "x") == true);			
		},
		
	"instanceOf / inOrderOf / insideOf":
		function()
		{
			var test_object = {a: "b"};
			
			test_object._as("|a << ?b << c; x < y < z; p << w; t < q; [a,b,c]; [p,q,r]");
			
			console.assert(test_object._instanceOf("y") == true);
			console.assert(test_object._instanceOf("q", 1) == true);
			console.assert(test_object._inOrderOf("b", "<<") == true);
			console.assert(test_object._inOrderOf("w", "<<", 1) == true);
			console.assert(test_object._insideOf("a", "[]") == true);
			console.assert(test_object._insideOf("p", "[]", 1) == true);
		},
		
	"Variation to Array":
		function()
		{
			var test_object = {a: "b"};
			
			test_object._as("|a < b; c < d; e < f < g");
			
			var list = test_object._variationsToArrays("f", "?");

			console.assert(list[0][0] == "?e");
			console.assert(list[0][1] == "?f");
			console.assert(list[0][2] == "?g");
		},
		
	"Access to relation elements":
		function()
		{
			var test_object = {a: "xy"};
			
			test_object._as("|a < b < c; e < d; [f, g]; (xy); (aa, bb)");

			console.assert(test_object._getClassName() == "a");
			console.assert(test_object._getOrderedRelationElement("<").name == "a");
			console.assert(test_object._getOrderedRelationElement("<", 1).name == "b");
			console.assert(test_object._getOrderedRelationElement("<", 1, 1).name == "d");
			console.assert(test_object._getUnorderedRelationElement("[]").name == "f");
			console.assert(test_object._getUnorderedRelationElement("[]", 1).name == "g");
			console.assert(test_object._getUnorderedRelationElement("()").name == "xy");
			console.assert(test_object._getUnorderedRelationElement("()", 1, 1).name == "bb");
		}
		
}

