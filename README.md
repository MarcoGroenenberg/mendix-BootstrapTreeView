mendix-BootstrapTreeView
========================

Mendix Tree view widget

##Description
Mendix Tree view widget. Rather than configuring the data model in the widget, the widget calls a microflow which returns a list of (non-persistent) objects. To distinguish between the different data types, inheritance of a common entity can be used.

##Features and limitations
- Create any structure you need.
- Top level objects do not have a parent
- Lower lever objects have a parent; the tree is build by linking objects using their parent reference
- Set the currently selected item from a microflow
- Fully reload the tree or only perform an incremental update, to update or add nodes without re-rendering the tree.


##Dependencies

Mendix 5.x Environment

##Configuration
The entity configuration may look complex but it really isn't.
It is advised to create common base entities and specializations for each tree view, even when the application contains only one tree view. This prevents unexpected errors about specializations that are not covered by an inheritance split. 
Please look at the demo project domain model for more details.

###Application key values

After a refresh of the tree, the complete object data will have been replaced. To select a node in the tree, some sort of identification is necessary. Each node object should have a key that is unique across the entire tree. If your entity does not have a key, you can use CommunityCommons.getGuid() to get the object ID and use that as key.  

###Entities

####The widget data entity
The widget data entity is used as context entity. It contains the action attribute and the key attribute used for selecting objects in the tree.
Create a specialization of this entity for each tree view.

####The node data entity
The node data entity is used to represent the nodes in the tree. Usually, a tree view will display different types of data. To handle node clicks, create a specialization of the node data entity for each entity that is displayed in the tree. Each of these specializations should use a common specialization.  

###Pages
The widget should be placed inside a dataview connected to the widget data entity, or a specialization of it.

###Properties

####Base CSS class
The Base CSS class can be used to adjust the styling for a specific tree view. Please check the widget CSS for the CSS classes that need to be duplicated.

####Action attribute
The Action attribute tells the widget to perform a task:

- refresh: Fully rebuild the tree
- update: Add or replace one or more nodes
- setSelection: Select a node.

Only an enumeration is allowed here. The demo project contains a ready to use example. 

####Selection attribute
The Selection attribute can be set to the key of the object that must be selected next. The widget will clear the value after setting the selection.

####Data entity
The Data entity is the common node data generalization for the treeview. The Get data microflow should return a list of this entity.

####Caption attribute
The Caption attribute is the attribute that is shown in the node.

####CSS class attribute
Optional. A node can have a specific CSS class added, can be used to set colors, backgrounds, or icons depending on the data type.

####Key attribute
The Key attribute specifies which attribute uniquely identifies an object across the entire tree. 

####Parent reference
The Parent reference is a self reference on the node data entity. This reference can be created on the most generic entity. 

####Get data microflow
The Get data microflow is called for a full or partial build of the tree. It receives the widget data entity as parameter and should return a list of the entity specified at the Data entity property.

####On click microflow
Optional. The On click microflow is called when a node is clicked and after the setSelection action selects the node.