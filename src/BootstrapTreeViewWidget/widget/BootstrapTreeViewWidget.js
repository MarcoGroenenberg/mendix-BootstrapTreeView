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
    _objMap                             : {},
    _parentObjMap                       : {},
    _ulMainElement                      : null,
    _currentDepth                       : 0,
    _parentReferenceName                : null,
    _selectionReferenceName             : null,
    _getDataMicroflowCallPending	: null,

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
        this._selectionReferenceName = this.selectionReference.substr(0, this.selectionReference.indexOf('/'));

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
        var
            selectedId;

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
                mx.data.action({
                    params: {
                        applyto: 'selection',
                        actionname: this.getDataMicroflow,
                        guids: [this._contextObj.getGuid()]
                    },
                    callback: dojo.hitch(this, this._showData),
                    error: function (error) {
                        this._getDataMicroflowCallPending = false;
                        console.log(error.description);
                    }
                }, this);
            }
            break;

        case this.ACTION_SET_SELECTION:
            selectedId = 'span' + this._contextObj.getReference(this._selectionReferenceName);
            this._setSelection(selectedId);
            this._resetAction();

            break;

        default:
        }

//        console.log('_loadData end');

    },

    _showData : function (objList) {
        'use strict';
        var
            selectedId;

//        console.log('_showData');

        switch (this._contextObj.get(this.actionAttr)) {
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
        selectedId = this._contextObj.getReference(this._selectionReferenceName);
        if (selectedId) {
            this._setSelection('span' + selectedId);
        }

        // Reset the action
        this._resetAction();
        this._getDataMicroflowCallPending = false;

//        console.log('_showData end');
    },

    _resetAction : function () {
        'use strict';
        var
            selectedId;
        
        this._contextObj.set(this.actionAttr, '');
        selectedId = this._contextObj.getReference(this._selectionReferenceName);
        if (selectedId) {
            this._contextObj.removeReferences(this._selectionReferenceName, [selectedId]);
        }
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
            mainObjMap = {},
            obj,
            objId,
            objIndex,
            objMap,
            parentId;

        // Destroy any old data.
        dojo.empty(this.domNode);
        this._objMap = {};
        this._parentObjMap = {};

        // Process all nodes, group by parent node and find the nodes with no parent.
        for (objIndex = 0; objIndex < objList.length; objIndex = objIndex + 1) {
            obj = objList[objIndex];
            objId = obj.getGuid();
            parentId = obj.getReference(this._parentReferenceName);
            this._updateObjMaps(obj);
            if (parentId) {
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
        this.domNode.appendChild(this._ulMainElement);
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
            spanNode,
            skippedObjList,
            updateSpanElement;

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
            // Update the object maps.
            this._updateObjMaps(obj);
        }

        // Process the existing objects
        for (objIndex = 0; objIndex < existingObjList.length; objIndex = objIndex + 1) {
            obj = existingObjList[objIndex];
            objId = obj.getGuid();
            spanNode = dojo.byId('span' + objId);
            spanNode.firstChild.nodeValue = obj.get(this.captionAttr);
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
            target = evt.target;

        if (dojo.hasClass(target, 'treeview-expanded')) {
            // Hide all li elements but not the span under the clicked element
            dojo.query('#' + target.id + ' > li').forEach(function (liElement) {
                dojo.query('#' + liElement.id).style('display', 'none');
            });
            dojo.replaceClass(target, 'treeview-collapsed', 'treeview-expanded');
        } else if (dojo.hasClass(target, 'treeview-collapsed')) {
            dojo.query('#' + target.id + ' > li').style('display', '');
            dojo.replaceClass(target, 'treeview-expanded', 'treeview-collapsed');
        }
        evt.stopPropagation();
    },

    _handleItemClick : function (evt) {
        'use strict';
        this._setSelection(evt.target.id);
        evt.stopPropagation();
    },

    _setSelection : function (targetId) {
        'use strict';
        var
            nodeList,
            objId;

        // Remove the mark on any other node
        dojo.query('#' + this._ulMainElement.id + ' span.treeview-selected').forEach(function (element) {
            dojo.removeClass(element, 'treeview-selected');
        });
        // Mark the selected node
        nodeList = dojo.query('#' + targetId);
        if (nodeList.length > 0) {
            dojo.addClass(nodeList[0], 'treeview-selected');
            objId = nodeList[0].getAttribute(this.ATTR_OBJ_ID);
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

});