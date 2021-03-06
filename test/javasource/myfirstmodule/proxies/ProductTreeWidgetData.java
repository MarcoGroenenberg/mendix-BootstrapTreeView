// This file was generated by Mendix Business Modeler.
//
// WARNING: Code you write here will be lost the next time you deploy the project.

package myfirstmodule.proxies;

import com.mendix.core.Core;
import com.mendix.core.CoreException;
import com.mendix.systemwideinterfaces.core.IContext;
import com.mendix.systemwideinterfaces.core.IMendixIdentifier;
import com.mendix.systemwideinterfaces.core.IMendixObject;

/**
 * 
 */
public class ProductTreeWidgetData extends myfirstmodule.proxies.TreeViewWidgetData
{
	/**
	 * Internal name of this entity
	 */
	public static final String entityName = "MyFirstModule.ProductTreeWidgetData";

	/**
	 * Enum describing members of this entity
	 */
	public enum MemberNames
	{
		SelectionType("SelectionType"),
		Action("Action"),
		NewSelectionKey("NewSelectionKey"),
		ProductTreeNodeToDisplay("MyFirstModule.ProductTreeNodeToDisplay"),
		ProductTreeWidgetData_Product_New("MyFirstModule.ProductTreeWidgetData_Product_New");

		private String metaName;

		MemberNames(String s)
		{
			metaName = s;
		}

		@Override
		public String toString()
		{
			return metaName;
		}
	}

	public ProductTreeWidgetData(IContext context)
	{
		this(context, Core.instantiate(context, "MyFirstModule.ProductTreeWidgetData"));
	}

	protected ProductTreeWidgetData(IContext context, IMendixObject productTreeWidgetDataMendixObject)
	{
		super(context, productTreeWidgetDataMendixObject);
		if (!Core.isSubClassOf("MyFirstModule.ProductTreeWidgetData", productTreeWidgetDataMendixObject.getType()))
			throw new IllegalArgumentException("The given object is not a MyFirstModule.ProductTreeWidgetData");
	}

	/**
	 * @deprecated Use 'new ProductTreeWidgetData(Context)' instead. Note that the constructor will not insert the new object in the database.
	 */
	@Deprecated
	public static myfirstmodule.proxies.ProductTreeWidgetData create(IContext context) throws CoreException
	{
		IMendixObject mendixObject = Core.create(context, "MyFirstModule.ProductTreeWidgetData");
		return new myfirstmodule.proxies.ProductTreeWidgetData(context, mendixObject);
	}

	/**
	 * @deprecated Use 'ProductTreeWidgetData.load(IContext, IMendixIdentifier)' instead.
	 */
	@Deprecated
	public static myfirstmodule.proxies.ProductTreeWidgetData initialize(IContext context, IMendixIdentifier mendixIdentifier) throws CoreException
	{
		return myfirstmodule.proxies.ProductTreeWidgetData.load(context, mendixIdentifier);
	}

	/**
	 * Initialize a proxy using context (recommended). This context will be used for security checking when the get- and set-methods without context parameters are called.
	 * The get- and set-methods with context parameter should be used when for instance sudo access is necessary (IContext.getSudoContext() can be used to obtain sudo access).
	 */
	public static myfirstmodule.proxies.ProductTreeWidgetData initialize(IContext context, IMendixObject mendixObject)
	{
		return new myfirstmodule.proxies.ProductTreeWidgetData(context, mendixObject);
	}

	public static myfirstmodule.proxies.ProductTreeWidgetData load(IContext context, IMendixIdentifier mendixIdentifier) throws CoreException
	{
		IMendixObject mendixObject = Core.retrieveId(context, mendixIdentifier);
		return myfirstmodule.proxies.ProductTreeWidgetData.initialize(context, mendixObject);
	}

	/**
	 * Set value of SelectionType
	 * @param selectiontype
	 */
	public final myfirstmodule.proxies.ProductTreeSelectionType getSelectionType()
	{
		return getSelectionType(getContext());
	}

	/**
	 * @param context
	 * @return value of SelectionType
	 */
	public final myfirstmodule.proxies.ProductTreeSelectionType getSelectionType(IContext context)
	{
		Object obj = getMendixObject().getValue(context, MemberNames.SelectionType.toString());
		if (obj == null)
			return null;

		return myfirstmodule.proxies.ProductTreeSelectionType.valueOf((String) obj);
	}

	/**
	 * Set value of SelectionType
	 * @param selectiontype
	 */
	public final void setSelectionType(myfirstmodule.proxies.ProductTreeSelectionType selectiontype)
	{
		setSelectionType(getContext(), selectiontype);
	}

	/**
	 * Set value of SelectionType
	 * @param context
	 * @param selectiontype
	 */
	public final void setSelectionType(IContext context, myfirstmodule.proxies.ProductTreeSelectionType selectiontype)
	{
		if (selectiontype != null)
			getMendixObject().setValue(context, MemberNames.SelectionType.toString(), selectiontype.toString());
		else
			getMendixObject().setValue(context, MemberNames.SelectionType.toString(), null);
	}

	/**
	 * @return value of ProductTreeNodeToDisplay
	 */
	public final myfirstmodule.proxies.ProductTreeNodeData getProductTreeNodeToDisplay() throws CoreException
	{
		return getProductTreeNodeToDisplay(getContext());
	}

	/**
	 * @param context
	 * @return value of ProductTreeNodeToDisplay
	 */
	public final myfirstmodule.proxies.ProductTreeNodeData getProductTreeNodeToDisplay(IContext context) throws CoreException
	{
		myfirstmodule.proxies.ProductTreeNodeData result = null;
		IMendixIdentifier identifier = getMendixObject().getValue(context, MemberNames.ProductTreeNodeToDisplay.toString());
		if (identifier != null)
			result = myfirstmodule.proxies.ProductTreeNodeData.load(context, identifier);
		return result;
	}

	/**
	 * Set value of ProductTreeNodeToDisplay
	 * @param producttreenodetodisplay
	 */
	public final void setProductTreeNodeToDisplay(myfirstmodule.proxies.ProductTreeNodeData producttreenodetodisplay)
	{
		setProductTreeNodeToDisplay(getContext(), producttreenodetodisplay);
	}

	/**
	 * Set value of ProductTreeNodeToDisplay
	 * @param context
	 * @param producttreenodetodisplay
	 */
	public final void setProductTreeNodeToDisplay(IContext context, myfirstmodule.proxies.ProductTreeNodeData producttreenodetodisplay)
	{
		if (producttreenodetodisplay == null)
			getMendixObject().setValue(context, MemberNames.ProductTreeNodeToDisplay.toString(), null);
		else
			getMendixObject().setValue(context, MemberNames.ProductTreeNodeToDisplay.toString(), producttreenodetodisplay.getMendixObject().getId());
	}

	/**
	 * @return value of ProductTreeWidgetData_Product_New
	 */
	public final myfirstmodule.proxies.Product getProductTreeWidgetData_Product_New() throws CoreException
	{
		return getProductTreeWidgetData_Product_New(getContext());
	}

	/**
	 * @param context
	 * @return value of ProductTreeWidgetData_Product_New
	 */
	public final myfirstmodule.proxies.Product getProductTreeWidgetData_Product_New(IContext context) throws CoreException
	{
		myfirstmodule.proxies.Product result = null;
		IMendixIdentifier identifier = getMendixObject().getValue(context, MemberNames.ProductTreeWidgetData_Product_New.toString());
		if (identifier != null)
			result = myfirstmodule.proxies.Product.load(context, identifier);
		return result;
	}

	/**
	 * Set value of ProductTreeWidgetData_Product_New
	 * @param producttreewidgetdata_product_new
	 */
	public final void setProductTreeWidgetData_Product_New(myfirstmodule.proxies.Product producttreewidgetdata_product_new)
	{
		setProductTreeWidgetData_Product_New(getContext(), producttreewidgetdata_product_new);
	}

	/**
	 * Set value of ProductTreeWidgetData_Product_New
	 * @param context
	 * @param producttreewidgetdata_product_new
	 */
	public final void setProductTreeWidgetData_Product_New(IContext context, myfirstmodule.proxies.Product producttreewidgetdata_product_new)
	{
		if (producttreewidgetdata_product_new == null)
			getMendixObject().setValue(context, MemberNames.ProductTreeWidgetData_Product_New.toString(), null);
		else
			getMendixObject().setValue(context, MemberNames.ProductTreeWidgetData_Product_New.toString(), producttreewidgetdata_product_new.getMendixObject().getId());
	}

	@Override
	public boolean equals(Object obj)
	{
		if (obj == this)
			return true;

		if (obj != null && getClass().equals(obj.getClass()))
		{
			final myfirstmodule.proxies.ProductTreeWidgetData that = (myfirstmodule.proxies.ProductTreeWidgetData) obj;
			return getMendixObject().equals(that.getMendixObject());
		}
		return false;
	}

	@Override
	public int hashCode()
	{
		return getMendixObject().hashCode();
	}

	/**
	 * @return String name of this class
	 */
	public static String getType()
	{
		return "MyFirstModule.ProductTreeWidgetData";
	}

	/**
	 * @return String GUID from this object, format: ID_0000000000
	 * @deprecated Use getMendixObject().getId().toLong() to get a unique identifier for this object.
	 */
	@Override
	@Deprecated
	public String getGUID()
	{
		return "ID_" + getMendixObject().getId().toLong();
	}
}
