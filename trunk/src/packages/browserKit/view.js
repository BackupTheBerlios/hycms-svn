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
 * Element::removeControllerReferences
 *
 * Removes all references of the view and its child from the controller.
 * This function traverses the view hierarchy and calls 'unregisterView'
 * for each child node.
 *
 */
"removeControllerReferences".__declare({
	_this:		"@Element",
	_features:	["use_uuid_attribute"],
	
_does:
	function removeControllerReferences()
	{
		// Remove child references from controller
		this._postOrderOperation({
			nodeOperation:	function(node) { 
				if ((node.getAttribute) && (node.getAttribute("uuid"))) {
					node.__controller._unregisterView({view: node, _features: "use_uuid_attribute"});
				}
			}
		});	
	}
});

/*
 * Element::inheritControllerReferences
 *
 * Inherits the controller references of the current node to all of its
 * children and sets the model reference.
 *
 */
"inheritControllerReferences".__declare({
	_this:		"@Element",
	_features:	["use_uuid_attribute", "set_model_reference"],
	
_does:
	function inheritControllerReferences()
	{
		var controller = this.__controller;
	
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
 * Element::setInnerHtml
 *
 * Changes the inner HTML of a view and inherits the controller reference
 * to all child nodes. Also the model reference will be set up.
 *
 */
"setInnerHtml".__declare({
	html:		["*", "?html", "text"],

	_this:		"@Element",
	_features:	["use_uuid_attribute", "inherit_controller", "set_model_reference"],
	
	_whereas:	["this.__controller != undefined"],
	
_does:
	function setInnerHtml(html)
	{
		var controller = this.__controller;
		
		this._removeControllerReferences({_features: "use_uuid_attribute"});
	
		this.innerHTML = html;

		this._inheritControllerReferences({_features: ["use_uuid_attribute", "set_model_reference"]});
	}
});

/*
 * Element::setOuterHtml
 *
 * Changes the entire HTML of a view and restores/inherits the controller reference to
 * all child nodes. Also the model references will be set up.
 *
 */
"setOuterHtml".__declare({
	html:		["*", "?html", "text"],

	_this:		"@Element",
	_features:	["use_uuid_attribute", "inherit_controller", "set_model_reference"],
	
	_whereas:	["this.__controller != undefined"],
	
_does:
	function setOuterHtml(html)
	{
		var controller = this.__controller;
	
		this._removeControllerReferences({_features: "use_uuid_attribute"});
	
		// Save caret
		var savedCaret = window._saveCaret();	
		
		if (window._isFocussed({node: this})) {
			window._clearFocus();
		}

		// Create new child node
		var tmpParent = document.createElement("div");
		tmpParent.innerHTML = html;
		var newChild = tmpParent.firstChild;
	
		// Apply content change
		this.parentNode.replaceChild(newChild, this);

		// Inherit controller property and register at controller
		newChild.__controller = controller;
		newChild._inheritControllerReferences({_features: ["use_uuid_attribute", "set_model_reference"]});

		// Restore caret
		window._restoreCaret({path: savedCaret});
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
			var model;
			
			if (parentView == null) break;
		
			model = parentView._getModel();
		
			if (model != null)
				list.unshift( model );
			
			view = parentView;
		}
		
		return list;
	}
});

/*
 * Node::getNeighbourView
 *
 * Returns the view that is the optical neighbour of the current view.
 *
 */
"getNeighbourView".__declare({
	_this:		"@Node",
	
_does:
	function getNeighbourView()
	{
		var xmlResult = document.evaluate("following::text()[position()=1]", this, null, XPathResult.ANY_TYPE, null);
		return xmlResult.iterateNext();   
	}
});

