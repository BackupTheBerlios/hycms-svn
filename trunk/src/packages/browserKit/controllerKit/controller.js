/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 * Controller-related methods
 *
 */

/*
 * <"*", "html_controller", "controller">::registerView(node)
 *
 * Registers a given view element to the editor.
 *
 */
"registerView".__declare({
	_this:		["*", "html_controller", "controller"],

	node:		"@Node",
	model:		"*",
	
	_features:	"use_uuid_attribute",
	
	_whereas:	"model.__uuid == node._getView().getAttribute('uuid')",
	
_does: 
	function(node, model)
	{
		var view = node._getView();
		var uuid = view.getAttribute("uuid");
		
		if (this.viewMap == null)
			this.viewMap = ({});
			
		if (this.viewMap[uuid] == null)
			this.viewMap[uuid] = {model: model, views: []};

		var viewList = this.viewMap[uuid].views;
		
		if (viewList.indexOf(view) > -1) return;
		
		viewList.push(view);
		
		model.__views = viewList;
	}
});

/*
 * <"*", "html_controller", "controller">::unregisterView(node)
 *
 * Unregisters a view. If there is no view referencing to a model
 * object anymore, the model object will also be freed.
 *
 */
"unregisterView".__declare({
	_this:		["*", "html_controller", "controller"],

	node:		"@Node",
	
	_features:	"use_uuid_attribute",
	
	_whereas:	"node._getView().getAttribute('uuid') != null",
	
_does: 
	function(node)
	{
		var view = node._getView();
		var uuid = view.getAttribute("uuid");

		if ((this.viewMap == null) || (this.viewMap[uuid] == null))
			return;

		var refEntry = this.viewMap[uuid];
		var index = refEntry.views.indexOf(view);
		
		if (index == -1) return;
		
		refEntry.views.splice(index, 1);

		// Garbage-collect reference
		if (refEntry.views.length == 0)
			delete this.viewMap[uuid];
	}
});


/*
 * <"*", "html_controller", "controller">::getModel(uuid)
 *
 * Returns the model reference to an UUID.
 *
 */
"getModel".__declare({
	_this:		["*", "html_controller", "controller"],

	uuid:		"text",
	
	_whereas:	"this.viewMap != undefined",
	
_does:
	function(uuid)
	{
		return this.viewMap[uuid].model;
	}
});

/*
 * htmlUpdateAspect(aspect, method, subject, arguments, returnValue)
 *
 * Called after all insert/remove operations. It will be used to update all affected
 * views, if a call returns "true". If a new model object was created, the new object
 * will be automatically registered by the called view() method, which is used for the
 * update.
 *
 */
function htmlUpdateAspect(aspect, method, subject, arguments, returnValue)
{
	if (returnValue == true) {
		var uuid = subject.__uuid;
		var views = subject.__views;
		
		for (var idx = 0; idx < views.length; idx ++) {
			var view = views[idx];

			view._updateHtmlView( { content: subject, html: subject._view( {parentList: view._getModelContext() } ) } );
		}
	}

	return returnValue;
}

htmlUpdateAspect.__observes("after", "name == 'insert'");
htmlUpdateAspect.__observes("after", "name == 'remove'");


/*
 * <"*", "html_controller", "controller">::show(content)
 *
 * Shows a given content object
 *
 */
"show".__declare({
	_this:		["*", "html_controller", "controller"],
	content:	"*",

_does:
	function(content)
	{
		// Flush old content tree
		this.content = content;

		// We only accept those HTML views, that can set us the uuid_attribute
		var html = content._view({_returns: ["*", "html", "text"], _features: ["?recursive_context", "keep_method_conditions", "set_uuid_attribute"]});

		this.viewContainer._installHtmlViews({html: html, content: content});
	}

});

/*
 * <"*", "html_controller", "controller">::showReference(contentPath)
 *
 * Shows a given content reference
 *
 */
"showReference".__declare({
	_this:		["*", "html_controller", "controller"],
	contentPath:	"text",

_does:
	function(contentPath)
	{
		var self = this;

		// Prepare callback
		function viewContentCallback(content)
		{
			self._show({content: content});
		}
	
		// Call data provider
		contentPath._downloadContent({ callback: viewContentCallback });
	}

});

