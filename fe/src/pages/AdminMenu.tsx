import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";

interface Item {
  _id: string;
  name: string;
  price: string;
}

interface Category {
  _id: string;
  category: string;
  icon: string;
  items: Item[];
}

const AdminMenu: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newItems, setNewItems] = useState<{
    [key: string]: { name: string; price: string };
  }>({});
  // newItemName/newItemPrice were unused — use `newItems` map instead
  // const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [categoryEditValue, setCategoryEditValue] = useState("");
  const [itemEditName, setItemEditName] = useState("");
  const [itemEditPrice, setItemEditPrice] = useState("");
  const [itemOldPrice, setItemOldPrice] = useState("");
  const [itemOldName, setItemOldName] = useState("");

  document.title = "Update Menu";

  // New state for confirmation
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<{
    categoryId: string;
    itemId?: string;
  } | null>(null);

  const BACKEND_URI = "http://localhost:5000/api";

  // Fetch categories from the server
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${BACKEND_URI}/menu`);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setLoading(false);

        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const addCategory = async () => {
    if (newCategory.trim()) {
      try {
        const response = await fetch(`${BACKEND_URI}/menu`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category: newCategory,
            icon: "default-icon",
            items: [],
          }),
        });
        if (!response.ok) throw new Error("Network response was not ok");
        const newCategoryData = await response.json();
        setCategories([...categories, newCategoryData]);
        setNewCategory("");
      } catch (error) {
        console.error("Error adding category:", error);
      }
    }
  };

  const addItem = async (propCategory: string) => {
    const { name, price } = newItems[propCategory] || {};
    if (propCategory && name?.trim() && price?.trim()) {
      try {
        const response = await fetch(
          `${BACKEND_URI}/menu/${propCategory}/items`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: name,
              price: price,
            }),
          }
        );
        if (!response.ok) throw new Error("Network response was not ok");
        const updatedCategory = await response.json();
        setCategories(
          categories.map((cat) =>
            cat._id === updatedCategory._id ? updatedCategory : cat
          )
        );
        // clear the new item inputs for this category
        setNewItems((prev) => {
          const copy = { ...prev };
          delete copy[propCategory];
          return copy;
        });
      } catch (error) {
        console.error("Error adding item:", error);
      }
    }
  };

  const deleteCategory = (categoryId: string) => {
    setItemToDelete({ categoryId });
    setConfirmDelete(true);
  };

  const deleteItem = (categoryId: string, itemId: string) => {
    setItemToDelete({ categoryId, itemId });
    setConfirmDelete(true);
  };

  const confirmDeleteAction = async () => {
    if (itemToDelete) {
      const { categoryId, itemId } = itemToDelete;
      try {
        if (itemId) {
          // Delete item
          const response = await fetch(
            `${BACKEND_URI}/menu/${categoryId}/items/${itemId}`,
            {
              method: "DELETE",
            }
          );
          if (!response.ok) throw new Error("Network response was not ok");
          setCategories(
            categories.map((category) =>
              category._id === categoryId
                ? {
                    ...category,
                    items: category.items.filter((item) => item._id !== itemId),
                  }
                : category
            )
          );
        } else {
          // Delete category
          const response = await fetch(`${BACKEND_URI}/menu/${categoryId}`, {
            method: "DELETE",
          });
          if (!response.ok) throw new Error("Network response was not ok");
          setCategories(
            categories.filter((category) => category._id !== categoryId)
          );
        }
      } catch (error) {
        console.error("Error deleting category or item:", error);
      } finally {
        setConfirmDelete(false);
        setItemToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(false);
    setItemToDelete(null);
  };

  const startEditCategory = (category: Category) => {
    setEditingCategoryId(category._id);
    setCategoryEditValue(category.category);
  };

  const saveCategoryEdit = async (categoryId: string) => {
    try {
      const response = await fetch(`${BACKEND_URI}/menu/${categoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: categoryEditValue,
        }),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const updatedCategory = await response.json();
      setCategories(
        categories.map((category) =>
          category._id === categoryId ? updatedCategory : category
        )
      );
      setEditingCategoryId(null);
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const startEditItem = (item: Item) => {
    setItemOldPrice(item.price);
    setItemOldName(item.name);

    setEditingItemId(item._id);
    setItemEditName(item.name);
    setItemEditPrice(item.price);
  };

  const saveItemEdit = async (categoryId: string, itemId: string) => {
    if (itemEditName == itemOldName && itemEditPrice === itemOldPrice) {
      setEditingItemId(null);
    }
    try {
      const response = await fetch(
        `${BACKEND_URI}/menu/${categoryId}/items/${itemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: itemEditName,
            price: itemEditPrice,
          }),
        }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      setCategories(
        categories.map((category) =>
          category._id === categoryId
            ? {
                ...category,
                items: category.items.map((item) =>
                  item._id === itemId
                    ? { ...item, name: itemEditName, price: itemEditPrice }
                    : item
                ),
              }
            : category
        )
      );
      setEditingItemId(null);
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleNewItemChange = (
    categoryId: string,
    field: string,
    value: string
  ) => {
    setNewItems((prevNewItems) => ({
      ...prevNewItems,
      [categoryId]: {
        ...prevNewItems[categoryId],
        [field]: value,
      },
    }));
  };

  // if (loading) {
  //   return (

  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Category and Item Manager
      </h1>
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center h-screen w-screen">
          <Loader2 className="animate-spin text-secondaryColor w-20 h-20 " />
        </div>
      ) : (
        ""
      )}

      {/* Confirmation Modal */}
      {confirmDelete && itemToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              Confirm
              {itemToDelete.itemId ? " item" : " whole Category"} deletion?
            </h2>
            <p>
              Are you sure you want to delete{" "}
              {itemToDelete.itemId
                ? categories
                    .find((cat) => cat._id === itemToDelete.categoryId)
                    ?.items.find((item) => item._id === itemToDelete.itemId)
                    ?.name
                : categories.find((cat) => cat._id === itemToDelete.categoryId)
                    ?.category}{" "}
            </p>

            <div className="flex justify-end mt-4">
              <button
                onClick={cancelDelete}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg mr-2"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAction}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category List */}
      <div className="mb-4">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category name"
          className="border p-2 w-full bg-white py-2 rounded-md"
        />
        <button
          onClick={addCategory}
          className="w-full active:opacity-80 bg-blue-500 text-white px-4 py-2 mt-2 rounded-lg"
        >
          Add Category
        </button>
      </div>

      {categories.map((category) => (
        <div
          key={category._id}
          className="bg-white shadow-md rounded-lg p-4 mb-4 "
        >
          <div className="flex justify-between items-center ">
            <div className="w-full">
              {editingCategoryId === category._id ? (
                <div className="flex ">
                  <input
                    type="text"
                    value={categoryEditValue}
                    onChange={(e) => setCategoryEditValue(e.target.value)}
                    className="border-2 rounded-md p-1 active:opacity-80 bg-white w-full"
                  />
                  <button
                    onClick={() => saveCategoryEdit(category._id)}
                    className="bg-green-500 active:opacity-80 text-white px-2 py-1 ml-2 rounded-lg"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex justify-between ">
                  <h2 className="text-xl font-semibold">{category.category}</h2>
                  {/* edit category */}

                  <div className="md:w-36 flex">
                    <button
                      onClick={() => startEditCategory(category)}
                      className="w-1/2 bg-yellow-500 active:opacity-80 text-white px-2 py-1 rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCategory(category._id)}
                      className="w-1/2 bg-red-500 active:opacity-80 text-white px-2 py-1 rounded-lg ml-2"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Items List */}
          <div className="mt-4">
            {category.items.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center  mt-2"
              >
                {editingItemId === item._id ? (
                  <>
                    <input
                      type="text"
                      value={itemEditName}
                      onChange={(e) => setItemEditName(e.target.value)}
                      className="border-2 rounded-lg p-1 w-1/2 bg-white"
                    />
                    <input
                      type="number"
                      value={itemEditPrice}
                      onChange={(e) => setItemEditPrice(e.target.value)}
                      className="p-1 w-1/4 ml-2 bg-white border-2 rounded-lg"
                    />
                    <button
                      onClick={() => saveItemEdit(category._id, item._id)}
                      className="bg-green-500 active:opacity-80 text-white px-2 py-1 ml-2 rounded-lg"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-1/2">{item.name}</div>
                    <div className="w-1/4">$ {item.price}</div>
                    <div className="flex w-36 gap-2">
                      <button
                        onClick={() => startEditItem(item)}
                        className="bg-yellow-500 w-1/2 active:opacity-80 text-white px-2 py-1 rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteItem(category._id, item._id)}
                        className="bg-red-500 w-1/2 active:opacity-80 text-white px-2 py-1 rounded-lg "
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Add New Item */}
            <div className="w-full flex flex-col md:flex-row justify-between mt-4">
              <div className="w-full flex ">
                <input
                  type="text"
                  value={newItems[category._id]?.name || ""}
                  onChange={(e) =>
                    handleNewItemChange(category._id, "name", e.target.value)
                  }
                  placeholder="New item name"
                  className="p-2 md:flex-1 bg-white border-2 rounded-lg w-1/2"
                />
                <input
                  type="number"
                  value={newItems[category._id]?.price || ""}
                  onChange={(e) =>
                    handleNewItemChange(category._id, "price", e.target.value)
                  }
                  placeholder="New item price"
                  className="p-2 md:flex-1 ml-2 bg-white border-2 rounded-lg w-1/2"
                />
              </div>

              <button
                onClick={() => addItem(category._id)}
                className="bg-blue-500 active:opacity-80 text-white w-full  md:w-40  py-2 mt-2 md:mt-0 md:ml-2 rounded-lg"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminMenu;
