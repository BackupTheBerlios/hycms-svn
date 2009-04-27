/*
 * For testing with non-firebug browsers
 *
 */
if (console == null) {	
	console = new Object();
}

if (console.group == null) {

	console.assert = function( condition )
	{
		console.thisGroup.assertionCount ++;
	
		if (!condition)
			console.thisGroup.innerHTML += "<div style='color:red'>Assertion failed (#"+console.thisGroup.assertionCount+")</div>";
	}

	console.thisGroup = document.body;
	console.thisGroup.assertionCount = 0;

	console.group = function( gName )
	{
		var group = document.createElement("div");
		
		group.assertionCount = 0;
		
		group.style["border"] = "1px solid black";
		group.style["margin-left"] = "5px";
		group.innerHTML += "<b>"+gName+"</b>";

		console.thisGroup.appendChild(group);
		console.thisGroup = group;
	}

	console.groupEnd = function( gName )
	{
		console.thisGroup = console.thisGroup.parentNode;
		
		if (console.thisGroup == null)
			console.thisGroup = document.body;
	}

	console.log = function ()
	{
		var outstr = "<div style='border:1px solid gray'>";
	
		for (var idx = 0; idx < arguments.length; idx ++) {
			outstr += "<span style='margin:4px'>"+arguments[idx]+"</span>";
		}
	
		outstr += "</div>";
	
		console.thisGroup.innerHTML += outstr;
	}
}
