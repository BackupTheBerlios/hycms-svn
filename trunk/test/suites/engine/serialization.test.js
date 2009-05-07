// Name:		Serialization test

var serializationTest =
{
	"Building objects (string)":
		function()
		{
			var someObject = ({__def:	["abc", "def", "hij"],
							   __value:	"abcdef"
							 });
							 
			var someString = someObject.__build();

			console.assert( someString.__def != someObject.__def );
			
			console.assert( someString instanceof String );
			console.assert( typeof(someString) == "object" );
			
			console.assert( someString == "abcdef" );
		},

	"Building objects (number)":
		function()
		{
			var someObject = ({__def:	["abc", "def", "hij"],
							   __value:	1234
							 });
							 
			var someNumber = someObject.__build();

			console.assert( someObject.__def != someNumber.__def );
			
			console.assert( someNumber instanceof Number );
			console.assert( typeof(someNumber) == "object" );
			
			console.assert( someNumber == 1234 );
		},

	"Building objects (boolean)":
		function()
		{
			var someObject = ({__def:	["abc", "def", "hij"],
							   __value:	true
							 });
							 
			var someBool = someObject.__build();
			
			console.assert( someBool.__def != someObject.__def );
			
			console.assert( someBool instanceof Boolean );
			console.assert( typeof(someBool) == "object" );
			
			console.assert( someBool == true );
		},

	"Building objects (object, recursive)":
		function()
		{
			var someObject = ({__def:	["abc", "def", "hij"],
							   foo:		({__def:	["xyz"],
							   			  __value:	true
							   			 }),
							   bar:		({__def:	["mnop"],
							   			  __value:	1234
							   			 }),
							   goo:		"abcd"
							 });
							 
			var deserialized = someObject.__build();
			
			console.assert( deserialized.__def != someObject.__def );
			
			console.assert( deserialized instanceof Object );
			console.assert( typeof(deserialized) == "object" );
			
			console.assert( deserialized.foo instanceof Boolean );
			console.assert( typeof(deserialized.foo) == "object" );
			console.assert( deserialized.foo.__def[0] == "xyz" );
			console.assert( deserialized.foo.__def.length == 1 );

			console.assert( deserialized.bar instanceof Number );
			console.assert( typeof(deserialized.bar) == "object" );
			console.assert( deserialized.bar.__def[0] == "mnop" );
			console.assert( deserialized.bar.__def.length == 1 );
			
			console.assert( deserialized.foo == true );
			console.assert( deserialized.bar == 1234 );
			console.assert( deserialized.goo == "abcd" );
		},
		
	"Building objects (array, recursive)":
		function()
		{
			var someArray = ({__def: 	["abc", "def", "hij"],
							  __value:	
							  	[
								  	({__def:	["xyz"],
								  	  __value:	true
								  	}),
								  	({__def:	["mnop"],
								  	  __value:	1234
								  	}),
								  	"abcd"
							  	]
							});
							
			var deserialized = someArray.__build();
			
			console.assert( deserialized.__def != someArray.__def );
			
			console.assert( deserialized instanceof Array );
			console.assert( typeof(deserialized) == "object" );
			
			console.assert( deserialized[0] instanceof Boolean );
			console.assert( typeof(deserialized[0]) == "object" );
			console.assert( deserialized[0].__def[0] == "xyz" );
			console.assert( deserialized[0].__def.length == 1 );

			console.assert( deserialized[1] instanceof Number );
			console.assert( typeof(deserialized[1]) == "object" );
			console.assert( deserialized[1].__def[0] == "mnop" );
			console.assert( deserialized[1].__def.length == 1 );			

			console.assert( deserialized[2] instanceof String );
			console.assert( typeof(deserialized[2]) == "object" );
			console.assert( deserialized[2].__def[0] == "text" );
			console.assert( deserialized[2].__def.length == 1 );
							  	
			console.assert( deserialized[0] == true );
			console.assert( deserialized[1] == 1234 );
			console.assert( deserialized[2] == "abcd" );
		},
	
	"Hibernating objects (string)":
		function()
		{
			var someString = "some nice string";
			someString = someString.__tag("abc", "def", "ghi");
			
			var hibernatedObject = someString.__hibernate();

			console.assert( hibernatedObject.__def != someString.__def );
			
			console.assert( hibernatedObject.__def[0] == "abc" );
			console.assert( hibernatedObject.__def[1] == "def" );
			console.assert( hibernatedObject.__def[2] == "ghi" );			
			console.assert( hibernatedObject.__value == "some nice string" );
		},
		
	"Hibernating objects (number)":
		function()
		{
			var someNumber = 1234;
			someNumber = someNumber.__tag("abc", "def", "ghi");
			
			var hibernatedObject = someNumber.__hibernate();

			console.assert( hibernatedObject.__def != someNumber.__def );
			
			console.assert( hibernatedObject.__def[0] == "abc" );
			console.assert( hibernatedObject.__def[1] == "def" );
			console.assert( hibernatedObject.__def[2] == "ghi" );			
			console.assert( hibernatedObject.__value == 1234 );
		},
		
	"Hibernating objects (boolean)":
		function()
		{
			var someBool = true;
			someBool = someBool.__tag("abc", "def", "ghi");
			
			var hibernatedObject = someBool.__hibernate();
			
			console.assert( hibernatedObject.__def != someBool.__def );
			
			console.assert( hibernatedObject.__def[0] == "abc" );
			console.assert( hibernatedObject.__def[1] == "def" );
			console.assert( hibernatedObject.__def[2] == "ghi" );			
			console.assert( hibernatedObject.__value == true );
		},	

	"Hibernating objects (array, recursive)":
		function()
		{
			var someArray = [1,2,3,"abcd"];
			someArray.__tag("abc", "def", "ghi");
			someArray[3] = someArray[3].__tag("qrs", "tuv");
			
			var hibernatedObject = someArray.__hibernate();
			
			console.assert( hibernatedObject.__def != someArray.__def );
			
			console.assert( hibernatedObject.__def[0] == "abc" );
			console.assert( hibernatedObject.__def[1] == "def" );
			console.assert( hibernatedObject.__def[2] == "ghi" );		
			console.assert( hibernatedObject.__value[0] == 1 );
			console.assert( hibernatedObject.__value[1] == 2 );
			console.assert( hibernatedObject.__value[2] == 3 );
			console.assert( hibernatedObject.__value[3].__def[0] == "qrs");
			console.assert( hibernatedObject.__value[3].__def[1] == "tuv");
			console.assert( hibernatedObject.__value[3].__value == "abcd" );
		},

	"Hibernating objects (object)":
		function()
		{
			var someObject = ({foo: 1234, bar: "abcd"})
			someObject.__tag("abc", "def", "ghi");
			someObject.bar = someObject.bar.__tag("qrs", "tuv");
			
			var hibernatedObject = someObject.__hibernate();
			
			console.assert( hibernatedObject.__def != someObject.__def );
			
			console.assert( hibernatedObject.__def[0] == "abc" );
			console.assert( hibernatedObject.__def[1] == "def" );
			console.assert( hibernatedObject.__def[2] == "ghi" );			
			console.assert( hibernatedObject.foo == 1234 );
			console.assert( hibernatedObject.bar.__def[0] == "qrs");
			console.assert( hibernatedObject.bar.__def[1] == "tuv");
			console.assert( hibernatedObject.bar.__value == "abcd" );
		}		
}

