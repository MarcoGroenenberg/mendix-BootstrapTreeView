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
	_contextObj				: null,
    _handle                 : null,

	// Extra variables
    _objMap                 : {},
    _parentObjMap           : {},
    _ulMainElement          : null,
    _currentDepth           : 0,

    // Fixed values
    MAX_DEPTH               : 50,
    ATTR_LEVEL              : 'data-level',
    ATTR_OBJ_ID             : 'data-objId',
    ACTION_REFRESH          : 'refresh',
    ACTION_UPDATE           : 'update',
    ACTION_SET_SELECTION    : 'setSelection',

	/**
	 * Mendix Widget methods.
	 * ======================
	 */

	// DOJO.WidgetBase -> PostCreate is fired after the properties of the widget are set.
	postCreate: function () {
		'use strict';

        // postCreate
        console.log('BootstrapTreeViewWidget - postCreate');

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
        console.log('BootstrapTreeViewWidget - startup');
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

        mx.data.action({
            params: {
                applyto: 'selection',
                actionname: this.getDataMicroflow,
                guids: [this._contextObj.getGuid()]
            },
            callback: dojo.hitch(this, this._showData),
            error: function (error) {
                console.log(error.description);
            }
        }, this);


    },

    _showData : function (objList) {
        'use strict';
        var
            action;

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

        case this.ACTION_SET_SELECTION:

            break;

        default:
        }

        // Reset the action
        this._contextObj.set(this.actionAttr, '');
        mx.data.commit({
            mxobj    : this._contextObj,
            error    : function (error) {
                console.log(error.description);
                console.dir(error);
			}
        });

    },

    _reloadTree : function (objList) {
        'use strict';
        var
            mainObjList,
            obj,
            objIndex,
            parentId;

        // Destroy any old data.
        dojo.empty(this.domNode);
        this._objMap = {};
        this._parentObjMap = {};

        mainObjList = this._loadObjList(objList);

        // Create the list(s)
        this._ulMainElement = document.createElement('ul');
        dojo.addClass(this._ulMainElement, this.baseClass);
        this._currentDepth = 0;
        this._showObjList(this._ulMainElement, mainObjList, 'treeview-main');
        this.domNode.appendChild(this._ulMainElement);
    },

    _updateTree : function (objList) {
        'use strict';
        var
            currentObj,
            mainObjList,
            obj,
            objId,
            objIndex;

        // No data returned
        if (objList === null) {
            return;
        }
        // No array returned
        if (Object.prototype.toString.call(objList) === '[object Array]') {
            return;
        }

        mainObjList = this._loadObjList(objList);

        this._currentDepth = 0;
        this._showObjList(this._ulMainElement, mainObjList, 'treeview-main');

        // Objecten zijn mogelijk al verwerkt tijdens _showObjList
        for (objIndex = 0; objIndex < objList.length; objIndex = objIndex + 1) {
            obj = objList[objIndex];
            objId = obj.getGuid();
        }
    },
    _loadObjList : function (objList) {
        'use strict';
        var
            mainObjList = [],
            obj,
            objIndex,
            parentId;

        // Process all nodes, group by parent node and find the nodes with no parent.
        for (objIndex = 0; objIndex < objList.length; objIndex = objIndex + 1) {
            obj = objList[objIndex];
            parentId = obj.getReference(this.parentReference.substr(0, this.parentReference.indexOf('/')));
            this._objMap[obj.getGuid()] = obj;
            if (parentId) {
                if (this._parentObjMap[parentId]) {
                    this._parentObjMap[parentId].push(obj);
                } else {
                    this._parentObjMap[parentId] = [obj];
                }
            } else {
                mainObjList.push(obj);
            }
        }
        return mainObjList;
    },

    _showObjList : function (parentElement, objList, extraLiClass) {
        'use strict';
        var
            liElement,
            obj,
            objId,
            objIndex,
            spanClass,
            spanElement;

        if (this._currentDepth === this.MAX_DEPTH) {
            console.log(this.domNode.id + ': Recursion depth exceeded maximum: ' + this.MAX_DEPTH);
            return;
        }
        this._currentDepth = this._currentDepth + 1;
        for (objIndex = 0; objIndex < objList.length; objIndex = objIndex + 1) {
            obj = objList[objIndex];
            this._createNode(parentElement, obj, extraLiClass);
        }

        this._currentDepth = this._currentDepth - 1;
    },

    _createNode : function (parentElement, obj, extraLiClass) {
        'use strict';
        var
            liElement,
            objId,
            objIndex,
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

        // Object had child objects?
        if (this._parentObjMap[objId]) {
            dojo.addClass(liElement, 'treeview-expandable treeview-expanded');
            this._showObjList(liElement, this._parentObjMap[objId], 'treeview-sub');
        } else {
            dojo.addClass(liElement, 'treeview-leaf');
        }

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
        var
            objId = evt.target.getAttribute(this.ATTR_OBJ_ID);
        //
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

        evt.stopPropagation();
    }


});