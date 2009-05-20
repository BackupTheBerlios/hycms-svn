/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 * General view-related methods
 *
 */
/*
 * Node::postOrderOperation( nodeOperation[, leafOperation] )
 *
 * Executes "nodeOperation" for each node in post-order on the given
 * DOM-Tree. If 'leafOperation' is given the leafOperation will be
 * executed instead on each leaf node of the DOM tree.
 *
 * The nodeOperation and leafOperation have the signature "function(node)"
 *
 */
"postOrderOperation".__declare({
	_this:				"@Node",
	nodeOperation:		"function",

	_optional_leafOperation:	"?function",

_does:
	function (nodeOperation, leafOperation)
	{
		function __recursor(node) {
			if ((!(node instanceof Element)) || (node.childNodes.length == 0)) {
				return (leafOperation != null) ? leafOperation(node) : nodeOperation(node);
			}
			 else {
			 	for (var idx = 0; idx < node.childNodes.length; idx ++) {
			 		__recursor(node.childNodes[idx]);

			 		nodeOperation(node);
			 	}
			}
		}

		__recursor(this);
	}
});
 
/*
 * Element::setInnerHTML
 *
 * Changes the inner HTML of a view and inherits the controller, con
 *
 */
"setInnerHTML".__declare({
	html:		["*", "?html", "text"],

	_this:		"@Element",
	_features:	["use_uuid_attribute", "inherit_controller"],
	
	_whereas:	["this.__controller != undefined"],
	
_does:
	function setInnerHTML(html)
	{
		var controller = this.__controller;
	
		// Remove child references from controller
		this._postOrderOperation({
			nodeOperation:	function(node) { 
				if ((node.getAttribute) && (node.getAttribute("uuid"))) {
					node.__controller._unregisterView({view: node, _features: "use_uuid_attribute"});
				}
			}
		});
	
		// Apply content change
		this.innerHTML = html;

		// Inherit controller property and register at controller
		this._postOrderOperation({
				nodeOperation:	function(node) { 
					if ((node.getAttribute) && (node.getAttribute("uuid"))) {
						node.__controller = controller; 
						node.__controller._registerView({view: node, _features: "use_uuid_attribute"});

						node.__model = node.__controller._getModel({uuid: node.getAttribute("uuid")});
					}
				}
		});
	}
});


/*
 * Node::getView
 *
 * Returns the view that is responsible for the given DOM element. If
 * the element itself is a view, the element itself will be returned. A
 * responsible view is characterized by the UUID DOM-attribute.
 *
 */
"getView".__declare({
	_this:		"@Node",
	_features:	["use_uuid_attribute", "stop_at_head_container"],
	
	_prototype_getView:		{_features: ["use_uuid_attribute", "stop_at_head_container"]},
	
_does:
	function getView()
	{
		if (this.__isHeadContainer)
			return this;
	
		if ((this.getAttribute == null) || (this.getAttribute("uuid") == null)) {
			// No view? Propagate upwards, if not a head container
			if ((!this.__isHeadContainer) && (this.parentNode != null))
				return this.parentNode._getView();
			else
				return null;
		}
		
		return this;
	}
});

/*
 * Node::getController
 *
 * Returns the controller, that is responsible for this view.
 *
 */
"getController".__declare({
	_this:		"@Node",
	_features:	["use_uuid_attribute"],
	
_does:
	function getController()
	{
		return this.__controller;
	}
});

/*
 * Node::getModel
 *
 * Returns the model object associated with the view of the current
 * DOM element or node.
 *
 */
"getModel".__declare({
	_this:		"@Node",
	_features:	["use_uuid_attribute", "use_model_reference"],
	
_does:
	function getModel()
	{
		var view = this._getView();
		
		return view.__model;
	}
});

/*
 * Node::getModelContext
 *
 * Returns the list of the model objects of all parent objects of the given
 * view object.
 *
 */
"getModelContext".__declare({
	_this:		"@Node",

	_output:	["list"],
	_features:	["use_uuid_attribute", "use_head_container"],
	
_does:
	function getModelContext()
	{
		var list = [];
		var view = this._getView();
		if (view == null) return null;

		while (view.parentNode != null) {
			var parentView = view.parentNode._getView();
			
			if (parentView == null) break;
		
			list.push(parentView._getModel());
			
			view = parentView;
		}
		
		return list;
	}
});
 
