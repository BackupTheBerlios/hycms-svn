/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
 
//
// Structure model
//
Model.Construct(
	["*", "structure"], ({}), null,

	function structure(request, options) 
	{
		var newObject = new Object();
		var initializer = options.initializer;
		
		for (var idx in initializer) {
			if (idx[0] == "_") continue;
			
			newObject[idx] = initializer[idx];
		}
		
		return newObject;
	}
);

/* Merge anything to structure */
Model.Merge(
	["*", "structure"], ["*"], ["*"], null,
	
	function structure(part, position)
	{
		this[position] = part;
		return [this];
	}
);

/* Remove elements from structure */
Model.Remove(
	["*", "structure"], ["*", "text"], null,
	
	function structure(position, count)
	{
		var ctr = 0;
	
		for (var idx in this) {
			if (idx[0] == "_") continue;
			
			if (count == ctr) break;
			
			if ((idx == position) || (ctr > 0)) {
				delete this[idx];
				ctr ++;
			}
		}

		return this;
	}
);

//
// List model
//
Model.Construct(
	["*", "list"], [], null,

	function list(request, options) 
	{
		var newObject = [];
		var initializer = options.initializer;		
		
		for (var idx = 0; idx < initializer.length; idx++) {
			newObject[idx] = initializer[idx];
		}
		
		return newObject;
	}
);

/* Merge anything to list */
Model.Merge(
	["*", "list"], ["*"], ["*", "number"], null,
	
	function list(part, position)
	{
		this.splice(position, 0, part);
		return [this];
	}
);

/* Remove elements from list */
Model.Remove(
	["*", "list"], ["*", "number"], null,
	
	function list(position, count)
	{
		this.splice(position, count);
		
		return this;
	}
);

//
// Plain text model
//		 
Model.Construct(
	["*", "text"], "", null,

	function text(request, options) 
	{
		var initializer = options.initializer;

		return initializer.valueOf();
	}
);

/* Merge text with identical markups */
Model.Merge(
	["*", "text"], ["*", "text"], ["*", "number"], "part.__taggedAs(this.__def) > -1",
	
	function text(part, position)
	{
		return [this.substr(0, position) + part + this.substr(position)];
	}
);

/* Merge text with differing markups */
Model.Merge(
	["*", "text"], ["*", "text"], ["*", "number"], "part.__taggedAs(this.__def) == -1",
	
	function text(part, position)
	{
		return [this.substr(0, position).__tag(this.__def), part, this.substr(position).__tag(this.__def)];
	}
);


/* Merge list to text */
Model.Merge(
	["*", "text"], ["*", "list"], ["*", "number"], null,
	
	function text(part, position)
	{
		return [this.substr(0, position).__tag(this.__def), part, this.substr(position).__tag(this.__def)];
	}
);

/* Merge structure to text */
Model.Merge(
	["*", "text"], ["*", "structure"], ["*", "number"], null,
	
	function text(part, position)
	{
		return [this.substr(0, position).__tag(this.__def), part, this.substr(position).__tag(this.__def)];
	}
);

/* Remove chars from text */
Model.Remove(
	["*", "text"], ["*", "number"], null,
	
	function text(position, count)
	{
		return this.substr(0, position) + this.substr(position+count);
	}
);


