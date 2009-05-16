/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 * General view-related methods
 *
 */

/*
 * Node::getView
 * Element::getView
 *
 * Returns the view that is responsible for the given DOM element. If
 * the element itself is a view, the element itself will be returned. A
 * responsible view is characterized by the UUID DOM-attribute.
 *
 */
"getView".__declare({
	_features:	["use_uuid_attribute", "stop_at_head_container"],
	
	_whereas:	"(this instanceof Node) || (this instanceof Element)",
	
	_prototype_getView:		{_features: ["use_uuid_attribute", "stop_at_head_container"]},
	
_does:
	function getView()
	{
		if (this.isHeadContainer)
			return this;
	
		if ((this.getAttribute == null) || (this.getAttribute("uuid") == null)) {
			// No view? Propagate upwards, if not a head container
			if ((!this.isHeadContainer) && (this.parentNode != null))
				return this.parentNode._getView();
			else
				return null;
		}
		
		return this;
	}
});

/*
 * Node::getHeadContainer
 * Element::getHeadContainer
 *
 * Returns the view that is associated with the model database
 * and is the head container of the element.
 *
 */
"getHeadContainer".__declare({
	_features:	["use_uuid_attribute"],
	
	_whereas:	"(this instanceof Node) || (this instanceof Element)",
	
	_prototype_getHeadContainer:		{_features: ["use_uuid_attribute"]},
	
_does:
	function getHeadContainer()
	{
		if (this.isHeadContainer)
			return this;
	
		if (this.parentNode != null)
			return this.parentNode._getHeadContainer();
		else
			return null;
	}
});

/*
 * Node::getModel
 * Element::getModel
 *
 * Returns the model object associated with the view of the current
 * DOM element or node.
 *
 * The head container of the view has to provide a property "relatedContentHash",
 * that contains a map between a UUID and an object of the following form:
 *
 * {link: MODEL_OBJECT_REFERENCE}
 *
 */
"getModel".__declare({
	_features:	["use_uuid_attribute", "use_head_container", "cache_model"],
	
	_whereas:	"(this instanceof Node) || (this instanceof Element)",
	
_does:
	function getModel()
	{
		var view = this._getView();
		if (view == null) return null;

		var uuid = view.getAttribute("uuid");
	
		// Cache model
		if ((view.__cachedModel == null) || (view.__cachedModel.__uuid != uuid)) {
			headContainer = this._getHeadContainer();
	
			if ((headContainer == null) || (headContainer.relatedContentHash == null) || (headContainer.relatedContentHash[uuid] == null))
				return null;
				
			view.__cachedModel = headContainer.relatedContentHash[uuid].link;
		}

		return view.__cachedModel;
	}
});

