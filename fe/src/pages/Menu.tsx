import {
  ArrowRight,
  Loader2,
  LucideShoppingBag,
  Minus,
  Plus,
  X,
} from "lucide-react"; // Import the X icon
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_CONFIG } from "../config/api";

interface Item {
  name: string;
  price: string;
}

interface Category {
  category: string;
  icon: string;
  items: Item[];
}

interface OrderItem {
  itemName: string;
  quantity: number;
  price: number;
}

const Menu: React.FC = () => {
  const [menuData, setMenuData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);

  document.title = "Menu";

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await fetch(API_CONFIG.ENDPOINTS.MENU);
        if (!response.ok) {
          throw new Error("Failed to fetch menu data");
        }
        const data: Category[] = await response.json();
        setMenuData(data);
      } catch (error: unknown) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  useEffect(() => {
    const savedItems = localStorage.getItem("selectedItems");
    if (savedItems) {
      setSelectedItems(JSON.parse(savedItems));
    }
  }, []);

  const handleItemClick = (itemName: string, price: string) => {
    setSelectedItems((prevSelectedItems) => {
      const existingItem = prevSelectedItems.find(
        (item) => item.itemName === itemName
      );

      let updatedItems;
      if (existingItem) {
        updatedItems = prevSelectedItems.map((item) =>
          item.itemName === itemName
            ? { ...item, quantity: item.quantity + 1 } // Increase quantity
            : item
        );
      } else {
        const newItem: OrderItem = {
          itemName,
          quantity: 1,
          price: parseFloat(price),
        };
        updatedItems = [...prevSelectedItems, newItem];
      }

      localStorage.setItem("selectedItems", JSON.stringify(updatedItems));
      return updatedItems;
    });
  };

  const handleRemoveItem = (itemName: string) => {
    setSelectedItems((prevSelectedItems) => {
      const updatedItems = prevSelectedItems.filter(
        (item) => item.itemName !== itemName
      );

      localStorage.setItem("selectedItems", JSON.stringify(updatedItems));
      return updatedItems;
    });
  };

  const handleDecreaseQuantity = (itemName: string) => {
    setSelectedItems((prevSelectedItems) => {
      const existingItem = prevSelectedItems.find(
        (item) => item.itemName === itemName
      );

      if (existingItem) {
        // If the quantity is 1, remove the item from the selected items
        if (existingItem.quantity === 1) {
          handleRemoveItem(itemName); // Remove the item entirely
          return prevSelectedItems; // Return the previous state (it will be updated in handleRemoveItem)
        } else {
          // Otherwise, decrease the quantity
          const updatedItems = prevSelectedItems.map((item) =>
            item.itemName === itemName
              ? { ...item, quantity: item.quantity - 1 } // Decrease quantity
              : item
          );

          localStorage.setItem("selectedItems", JSON.stringify(updatedItems));
          return updatedItems;
        }
      }

      return prevSelectedItems; // Return the previous state if the item is not found
    });
  };

  const totalPrice = selectedItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (error) {
    return <div className="text-white text-center">Error: {error}</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="p-6 sm:p-14">
        <div className="flex gap-5 items-center">
          <div>
            <img src="/vite.svg" alt="Vite" className="w-12 h-12" />
          </div>
          <div className="text-2xl text-white">ROUSE's</div>
        </div>
        <div className="text-4xl sm:text-7xl text-secondaryColor font-bold">
          Menu
        </div>
      </div>

      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center h-screen w-screen">
          <Loader2 className="animate-spin text-secondaryColor w-20 h-20 " />
        </div>
      ) : (
        ""
      )}

      {/* Menu Categories */}
      <div>
        {/* order items div */}
        <div
          className={`py-2 fixed top-24 z-10 right-0 w-fit transition-all duration-300 transform ${
            selectedItems.length
              ? "scale-100 opacity-100"
              : "scale-75 opacity-0"
          } bg-secondaryColor px-2 py-1 md:px-6 md:py-4 rounded-lg shadow-lg`}
        >
          <div className=" place-content-center flex place-items-center text-primary font-bold mb-4">
            <LucideShoppingBag className="mr-1 w-6 h-6 md:w-8 md:h-8" />
            <div className="text-xl md:text-3xl">Order</div>
          </div>
          <div className="flex flex-col gap-2">
            {selectedItems.length ? (
              selectedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="place-content-center transition-all cursor-pointer flex flex-row justify-between items-center text-[0.8rem] sm:text-lg bg-gray-100 hover:opacity-80 text-black rounded-lg px-2 py-1 shadow-sm"
                  onClick={() => handleRemoveItem(item.itemName)}
                >
                  <div>{`${item.itemName} (x${item.quantity})`}</div>
                  <div className="text-red-500">
                    <X size={20} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-300">No items</div>
            )}
          </div>
          {/* Display Total Price */}
          {selectedItems.length > 0 && (
            <div className="text-sm text-center  md:text-xl text-primary mt-4 mb-2">
              Total Price: ${totalPrice.toFixed(2)}
            </div>
          )}

          <Link
            to="/checkout"
            className="justify-between cursor-pointer text-[0.8rem] md:text-lg bg-blue-600 px-4 py-1 rounded-lg  hover:opacity-85 flex place-items-center"
          >
            <div>Check Out</div>
            <ArrowRight />
          </Link>
        </div>

        {menuData.map((category, index) => (
          <div key={index} className="h-auto w-full px-6 sm:px-14 mb-10">
            {/* Category Header */}
            <div className="flex items-center gap-2">
              <div className="text-secondaryColor text-2xl sm:text-4xl font-categoryFont font-extrabold">
                {category.category.toUpperCase()}
              </div>
            </div>
            {/* Category Items */}
            <div className="pl-0 sm:pl-10 pr-0 sm:pr-5 flex flex-wrap justify-start sm:justify-between w-full h-auto border-t-2 border-secondaryColor mt-2 pt-2">
              {category.items.map((item, idx) => (
                <div
                  key={idx}
                  className={`transition-transform duration-300 transform ${
                    selectedItems.find(
                      (selected) => selected.itemName === item.name
                    )
                      ? "scale-105 opacity-100" // Effect when selected
                      : "scale-100 opacity-80" // Effect when not selected
                  } place-items-center flex text-lg sm:text-2xl text-white w-full sm:w-2/5 justify-between mb-4`}
                >
                  <div className="flex h-12 place-content-end place-items-center">
                    <div className="mr-2 ">
                      {selectedItems.find(
                        (selected) => selected.itemName === item.name
                      ) ? (
                        <div className="flex items-center">
                          <Minus
                            className="h-full bg-secondaryColor active:scale-[85%] transition-transform cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering the item click
                              handleDecreaseQuantity(item.name);
                            }}
                          />
                          <span className="text-secondaryColor  mx-1">
                            {
                              selectedItems.find(
                                (selected) => selected.itemName === item.name
                              )?.quantity
                            }
                          </span>
                          <Plus
                            className="h-full bg-secondaryColor active:scale-[85%] transition-transform cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering the item click
                              handleItemClick(item.name, item.price);
                            }}
                          />
                        </div>
                      ) : (
                        <Plus
                          className=" text-secondaryColor"
                          onClick={() => handleItemClick(item.name, item.price)}
                        />
                      )}
                    </div>
                    <div
                      className="cursor-pointer"
                      onClick={() => handleItemClick(item.name, item.price)}
                    >
                      {item.name}
                    </div>
                  </div>
                  <div className={`w-20 text-left mr-24 md:mr-32`}>
                    <div>${item.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
