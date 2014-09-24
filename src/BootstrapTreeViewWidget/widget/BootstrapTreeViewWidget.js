/**
    Widget Name
    ========================

    @file      : BootstrapTreeViewWidget.js
    @version   : 1.0
    @author    : Marcel Groeneweg
    @date      : 10-09-2014
    @copyright : Synobsys
    @license   : Apache License, Version 2.0, January 2004

    Documentation
    =============
    Mendix Tree view widget

*/
dojo.provide('BootstrapTreeViewWidget.widget.BootstrapTreeViewWidget');

dojo.declare('BootstrapTreeViewWidget.widget.BootstrapTreeViewWidget', [ mxui.widget._WidgetBase, mxui.mixin._Contextable ], {

    /**
     * Internal variables.
     * ======================
     */
    _contextObj                         : null,
    _handle                             : null,

    // Extra variables
    _objMap                             : {},       // The objects as returned by the microflow
    _appKeyMap                          : {},       // Application key map
    _nodeClassMap                       : {},       // The node classes as set on the widget. These are kept separately because we need to
                                                    // remove the previous value from the DOM element when updating the tree.
                                                    // The Mendix object has already been changed when the node is updated
    _parentObjMap                       : {},
    _collapsedElementMap                : {},
    _ulMainElement                      : null,
    _currentDepth                       : 0,
    _parentReferenceName                : null,
    _getDataMicroflowCallPending        : null,
    _progressDialogId                   : null,

    // Fixed values
    MAX_DEPTH                           : 50,
    ATTR_LEVEL                          : 'data-level',
    ATTR_OBJ_ID                         : 'data-objId',
    ACTION_REFRESH                      : 'refresh',
    ACTION_UPDATE                       : 'update',
    ACTION_SET_SELECTION                : 'setSelection',

    /**
     * Mendix Widget methods.
     * ======================
     */

    // DOJO.WidgetBase -> PostCreate is fired after the properties of the widget are set.
    postCreate: function () {
        'use strict';

        // postCreate
//        console.log('BootstrapTreeViewWidget - postCreate');

        // Load CSS ... automatically from ui directory

        // Setup widget
        this._setupWidget();

        // Setup events
        this._setupEvents();

    },

    // DOJO.WidgetBase -> Startup is fired after the properties of the widget are set.
    startup: function () {
        'use strict';

        // postCreate
//        console.log('BootstrapTreeViewWidget - startup');
    },

    /**
     * What to do when data is loaded?
     */

    update : function (obj, callback) {
        'use strict';

        if (this._handle) {
            mx.data.unsubscribe(this._handle);
        }

        this._contextObj = obj;

        if (obj === null) {
            // Sorry no data no show!
            console.log('BootstrapTreeViewWidget  - update - We did not get any context object!');
        } else {
            // Almost all data is cleared with each refresh of the widget.
            // The collapsed element map is kept to collaps nodes that were collapsed before the refresh.
            // When we get a new context object, the map must be cleared.
            this._collapsedElementMap = {};
            // Load data
            this._loadData();
            this._handle = mx.data.subscribe({
                guid: this._contextObj.getGuid(),
                callback: dojo.hitch(this, this._loadData)
            });
        }

        if (callback !== 'undefined') {
            callback();
        }
    },

    /**
     * How the widget re-acts from actions invoked by the Mendix App.
     */
    suspend : function () {
        'use strict';

    },

    resume : function () {
        'use strict';

    },

    enable : function () {
        'use strict';

    },

    disable : function () {
        'use strict';

    },

    unintialize: function () {
        'use strict';
        if (this._handle) {
            mx.data.unsubscribe(this._handle);
        }
    },

    /**
     * Extra setup widget methods.
     * ======================
     */
    _setupWidget: function () {
        'use strict';

        this._parentReferenceName = this.parentReference.substr(0, this.parentReference.indexOf('/'));

        dojo.addClass(this.domNode, this.baseClass);
    },

    // Attach events to newly created nodes.
    _setupEvents: function () {
        'use strict';

    },

    /**
     * Interaction widget methods.
     * ======================
     */
    _loadData : function () {
        'use strict';

//        console.log('_loadData: ' + this._contextObj.get(this.actionAttr));

        switch (this._contextObj.get(this.actionAttr)) {
        case this.ACTION_REFRESH:
        case this.ACTION_UPDATE:
            // Reload or update data
            if (this._getDataMicroflowCallPending) {
                // When the microflow commits the context object, we might go into an endless loop!
                console.log('Skipped microflow call as we did not get an answer from a previous call.');
            } else {
                this._getDataMicroflowCallPending = true;
                this._progressDialogId = mx.ui.showProgress();
                mx.data.action({
                    params: {
                        applyto: 'selection',
                        actionname: this.getDataMicroflow,
                        guids: [this._contextObj.getGuid()]
                    },
                    callback: dojo.hitch(this, this._showData),
                    error: function (error) {
                        mx.ui.hideProgress(this._progressDialogId);
                        this._getDataMicroflowCallPending = false;
                        console.log(error.description);
                    }
                }, this);
            }
            break;

        case this.ACTION_SET_SELECTION:
            this._setSelection(this._contextObj.get(this.selectionKeyAttr));
            this._resetAction();

            break;

        default:
        }

//        console.log('_loadData end');

    },

    _showData : function (objList) {
        'use strict';
        var
            action,
            selectedKey;

//        console.log('_showData');

        action = this._contextObj.get(this.actionAttr);
        switch (action) {
        case this.ACTION_REFRESH:
            // Reload entire tree
            this._reloadTree(objList);
            break;

        case this.ACTION_UPDATE:
            // Update data, add or update nodes
            this._updateTree(objList);
            break;

        }

        // If a selection was passed in, select it again
        selectedKey = this._contextObj.get(this.selectionKeyAttr);
        if (selectedKey) {
            this._setSelection(selectedKey);
        }

        // Reset the action before processing the selection to prevent a loop
        this._resetAction();
        this._getDataMicroflowCallPending = false;
        mx.ui.hideProgress(this._progressDialogId);

//        console.log('_showData end');
    },

    _resetAction : function () {
        'use strict';

        this._contextObj.set(this.actionAttr, '');
        this._contextObj.set(this.selectionKeyAttr, '');
        mx.data.commit({
            mxobj    : this._contextObj,
            callback : function (obj) {},
            error    : function (error) {
                console.log(error.description);
                console.dir(error);
            }
        });
    },

    _reloadTree : function (objList) {
        'use strict';
        var
            appKey,
            element,
            mainObjMap = {},
            obj,
            objId,
            objIndex,
            parentId;

        // Destroy any old data.
        dojo.empty(this.domNode);
        this._objMap = {};
        this._appKeyMap = {};
        this._parentObjMap = {};
        this._nodeClassMap = {};

        // Process all nodes, group by parent node and find the nodes with no parent.
        for (objIndex = 0; objIndex < objList.length; objIndex = objIndex + 1) {
            obj = objList[objIndex];
            objId = obj.getGuid();
            parentId = obj.getReference(this._parentReferenceName);
            this._updateObjMaps(obj);
            if (parentId) {
                // No action
            } else {
                mainObjMap[objId] = obj;
            }
        }

        // Create the list(s)
        this._ulMainElement = document.createElement('ul');
        this._ulMainElement.id = 'ul' + this._contextObj.getGuid();
        dojo.addClass(this._ulMainElement, this.baseClass);
        this._currentDepth = 0;
        this._showObjList(this._ulMainElement, mainObjMap, 'treeview-main');

        // Show the tree
        this.domNode.appendChild(this._ulMainElement);

        // Set collapsed status on nodes that were collapsed before the refresh
        for (appKey in this._collapsedElementMap) {
            if (this._collapsedElementMap.hasOwnProperty(appKey)) {
                obj = this._appKeyMap[appKey];
                element = dojo.byId('li' + obj.getGuid());
                if (element) {
                    this._hideNode(element);
                } else {
                    // No longer exists
                    delete this._collapsedElementMap[appKey];
                }
            }
        }

    },

    _updateTree : function (objList) {
        'use strict';
        var
            elementCreated,
            existingObjList = [],
            newObjList = [],
            obj,
            objId,
            objIndex,
            parentElement,
            parentId,
            spanClass,
            spanElement,
            skippedObjList;

        // No data returned
        if (objList === null) {
            return;
        }

        // No array returned
        if (Object.prototype.toString.call(objList) !== '[object Array]') {
            return;
        }


        // First split the list in new and existing objects and update the object maps
        for (objIndex = 0; objIndex < objList.length; objIndex = objIndex + 1) {
            obj = objList[objIndex];
            objId = obj.getGuid();
            if (this._objMap.hasOwnProperty(objId)) {
                existingObjList.push(obj);
            } else {
                newObjList.push(obj);
            }
        }

        // Process the existing objects
        for (objIndex = 0; objIndex < existingObjList.length; objIndex = objIndex + 1) {
            obj = existingObjList[objIndex];
            objId = obj.getGuid();

            // Find the element and set the caption
            spanElement = dojo.byId('span' + objId);
            spanElement.firstChild.nodeValue = obj.get(this.captionAttr);

            // Remove the node class if there is one.
            spanClass = this._nodeClassMap[objId];
            if (spanClass) {
                dojo.removeClass(spanElement, spanClass);
            }

            // If the new object has a node class, set it.
            spanClass = obj.get(this.classAttr);
            spanElement.id = 'span' + objId;
            if (spanClass) {
                dojo.addClass(spanElement, spanClass);
                this._nodeClassMap[objId] = spanClass;
            }

            // Update the object maps.
            this._updateObjMaps(obj);
        }

        // Process the new objects, these may be in any order.
        // To prevent an endless loop, a flag is set during each run whether an element was created.
        do {
            elementCreated = false;
            skippedObjList = [];
            for (objIndex = 0; objIndex < newObjList.length; objIndex = objIndex + 1) {
                obj = newObjList[objIndex];
                objId = obj.getGuid();
                // Add object in the tree
                parentId = obj.getReference(this._parentReferenceName);
                if (parentId) {
                    // Attempt to find list item node. If the objects are not ordered correctly, the parent may not be in the tree yet.
                    parentElement = dojo.byId('li' + parentId);
                    if (parentElement) {
                        // Is parent element currently a leaf node? If so, transform to expandable node
                        if (dojo.hasClass(parentElement, 'treeview-leaf')) {
                            dojo.replaceClass(parentElement, 'treeview-expandable treeview-expanded', 'treeview-leaf');
                        }
                        this._createNode(parentElement, obj, 'treeview-sub');
                        elementCreated = true;
                        // Update the object maps.
                        this._updateObjMaps(obj);
                    } else {
                        skippedObjList.push(obj);
                    }
                } else {
                    // No parent, add at highest level
                    this._createNode(this._ulMainElement, obj, 'treeview-main');
                    elementCreated = true;
                }
            }
            // In the next run, only process the objects that were skipped.
            newObjList = skippedObjList;

        } while (elementCreated);


    },

    _updateObjMaps : function (obj) {
        'use strict';
        var
            appKey,
            objId,
            objMap,
            parentId;

        objId = obj.getGuid();
        parentId = obj.getReference(this._parentReferenceName);
        this._objMap[objId] = obj;
        if (parentId) {
            if (this._parentObjMap[parentId]) {
                objMap = this._parentObjMap[parentId];
                objMap[objId] = obj;
            } else {
                objMap = {};
                objMap[objId] = obj;
                this._parentObjMap[parentId] = objMap;
            }
        }
        appKey = obj.get(this.appKeyAttr);
        if (appKey) {
            this._appKeyMap[appKey] = obj;
        }
    },

    _showObjList : function (parentElement, objMap, extraLiClass) {
        'use strict';
        var
            liElement,
            obj,
            objId;

        if (this._currentDepth === this.MAX_DEPTH) {
            console.log(this.domNode.id + ': Recursion depth exceeded maximum: ' + this.MAX_DEPTH);
            return;
        }
        this._currentDepth = this._currentDepth + 1;
        for (objId in objMap) {
            if (objMap.hasOwnProperty(objId)) {
                obj = objMap[objId];
                liElement = this._createNode(parentElement, obj, extraLiClass);

                // Object has child objects?
                if (this._parentObjMap[objId]) {
                    this._showObjList(liElement, this._parentObjMap[objId], 'treeview-sub');
                }
            }
        }

        this._currentDepth = this._currentDepth - 1;
    },

    _createNode : function (parentElement, obj, extraLiClass) {
        'use strict';
        var
            liElement,
            objId,
            spanClass,
            spanElement;

        objId = obj.getGuid();

        // Create the list item element
        liElement = document.createElement('li');
        liElement.setAttribute(this.ATTR_LEVEL, this._currentDepth);
        liElement.setAttribute(this.ATTR_OBJ_ID, objId);
        liElement.id = 'li' + objId;
        if (extraLiClass) {
            dojo.addClass(liElement, extraLiClass);
        }

        // Create the span with the caption
        spanElement = mxui.dom.create('span', obj.get(this.captionAttr));
        spanElement.setAttribute(this.ATTR_LEVEL, this._currentDepth);
        spanElement.setAttribute(this.ATTR_OBJ_ID, objId);
        spanClass = obj.get(this.classAttr);
        spanElement.id = 'span' + objId;
        if (spanClass) {
            dojo.addClass(spanElement, spanClass);
            // Save the node class value separately as we need it when updating tree nodes.
            this._nodeClassMap[objId] = spanClass;
        }

        // Add onClick handlers
        dojo.on(liElement, 'click', dojo.hitch(this, this._handleExpandCollapse));
        if (this.onClickMicroflow) {
            dojo.on(spanElement, 'click', dojo.hitch(this, this._handleItemClick));
            dojo.addClass(spanElement, 'treeview-clickable');
        } else {
            dojo.addClass(spanElement, 'treeview-not-clickable');
        }

        // Put the pieces together
        liElement.appendChild(spanElement);
        parentElement.appendChild(liElement);

        // Object has child objects?
        if (this._parentObjMap[objId]) {
            dojo.addClass(liElement, 'treeview-expandable treeview-expanded');
        } else {
            dojo.addClass(liElement, 'treeview-leaf');
        }

        return liElement;
    },

    _handleExpandCollapse : function (evt) {
        'use strict';
        var
            appKey,
            obj,
            objId,
            target,
            targetId;

        target = evt.target;
        targetId = target.id;
        objId = target.getAttribute(this.ATTR_OBJ_ID);
        obj = this._objMap[objId];
        appKey = obj.get(this.appKeyAttr);

        if (dojo.hasClass(target, 'treeview-expanded')) {
            this._hideNode(target);
            this._collapsedElementMap[appKey] = appKey;
        } else if (dojo.hasClass(target, 'treeview-collapsed')) {
            this._showNode(target);
            delete this._collapsedElementMap[appKey];
        }
        evt.stopPropagation();
    },

    _hideNode : function (target) {
        'use strict';
        // Hide all li elements but not the span under the clicked element
        dojo.query('#' + target.id + ' > li').forEach(function (liElement) {
            dojo.query('#' + liElement.id).style('display', 'none');
        });
        dojo.replaceClass(target, 'treeview-collapsed', 'treeview-expanded');
    },

    _showNode : function (target) {
        'use strict';
        dojo.query('#' + target.id + ' > li').style('display', '');
        dojo.replaceClass(target, 'treeview-expanded', 'treeview-collapsed');
    },

    _handleItemClick : function (evt) {
        'use strict';
        this._setSelectionById(evt.target.getAttribute(this.ATTR_OBJ_ID));
        evt.stopPropagation();
    },

    _setSelection : function (selectedKey) {
        'use strict';
        var
            obj;
        // Mark the selected node
        obj = this._appKeyMap[selectedKey];
        if (obj) {
            this._setSelectionById(obj.getGuid());
        } else {
            this._setSelectionById(null);
        }
    },

    _setSelectionById : function (objId) {
        'use strict';
        var
            node,
            nodeList,
            selectedNode,
            targetId;

        // Remove the mark on any other node
        dojo.query('#' + this._ulMainElement.id + ' span.treeview-selected').forEach(function (element) {
            dojo.removeClass(element, 'treeview-selected');
        });

        selectedNode = null;
        if (objId) {
            targetId = 'span' + objId;
            nodeList = dojo.query('#' + targetId);
            if (nodeList.length > 0) {
                // Expand parent nodes if necessary
                selectedNode = nodeList[0];
                node = selectedNode.parentElement;
                while (node.nodeName === 'LI') {
                    if (dojo.hasClass(node, 'treeview-collapsed')) {
                        this._showNode(node);
                    }
                    node = node.parentElement;
                }
                // Set the selected class and scroll into view
                dojo.addClass(selectedNode, 'treeview-selected');
                dojo.window.scrollIntoView(selectedNode);
                // Call the microflow
                mx.data.action({
                    params: {
                        applyto: 'selection',
                        actionname: this.onClickMicroflow,
                        guids: [objId]
                    },
                    error: function (error) {
                        console.log(error.description);
                    }
                }, this);
            }
        }
    }

});