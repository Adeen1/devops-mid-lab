import { LucideShoppingBag, MapPinCheckInside } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_CONFIG from "../config/api";

interface Item {
  name: string;
  price: string;
}

interface Category {
  category: string;
  icon: string;
  items: Item[];
}

interface SelectedItem {
  name: string;
  quantity: number;
}

const Order: React.FC = () => {
  const [menuData, setMenuData] = useState<Category[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [extraNote] = useState("");
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [step, setStep] = useState(1); // Step 1: Menu, Step 2: User Info, Step 3: Success
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const BACKEND_URI = `${API_CONFIG.BASE_URL}/api/menu`;

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await fetch(BACKEND_URI);
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

  const handleItemChange = (itemName: string, checked: boolean) => {
    setCheckedItems((prevCheckedItems) => ({
      ...prevCheckedItems,
      [itemName]: checked,
    }));

    if (checked) {
      setSelectedItems((prevSelectedItems) => {
        const existingItem = prevSelectedItems.find(
          (item) => item.name === itemName
        );
        if (!existingItem) {
          return [...prevSelectedItems, { name: itemName, quantity: 1 }];
        }
        return prevSelectedItems;
      });
    } else {
      setSelectedItems((prevSelectedItems) =>
        prevSelectedItems.filter((item) => item.name !== itemName)
      );
    }
  };

  const handleQuantityChange = (itemName: string, quantity: number) => {
    if (checkedItems[itemName]) {
      setSelectedItems((prevSelectedItems) => {
        const updatedItems = prevSelectedItems.map((item) =>
          item.name === itemName ? { ...item, quantity } : item
        );
        return updatedItems;
      });
    }
  };

  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo((prevUserInfo) => ({ ...prevUserInfo, [name]: value }));
  };

  // const handleSubmitOrder = () => {
  //   // Handle submitting the order, e.g., send data to the backend.
  //   console.log("Order submitted", {
  //     userInfo,
  //     selectedItems,
  //     extraNote,
  //   });
  //   setStep(3); // Go to success page
  // };

  const handleSubmitOrder = async () => {
    const BACKEND_URI = `${API_CONFIG.BASE_URL}/api/orders`;

    const orderItems = selectedItems.map((item) => {
      const menuItem = menuData
        .flatMap((category) => category.items)
        .find((menuItem) => menuItem.name === item.name);

      if (!menuItem) {
        throw new Error(`Menu item not found for selected item: ${item.name}`);
      }

      return {
        itemName: item.name,
        quantity: item.quantity,
        price: parseFloat(menuItem.price), // Ensure price is parsed correctly
      };
    });

    const order = {
      customerName: userInfo.name,
      customerEmail: userInfo.email,
      customerNote: extraNote,
      orderItems, // Use the mapped orderItems
      totalAmount: orderItems.reduce(
        (total, item) => total + item.quantity * item.price,
        0
      ),
      status: "Pending",
      statusInfo: "We will call you for order confirmation shortly.",
    };

    console.log(extraNote);

    try {
      const response = await fetch(`${BACKEND_URI}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });

      const result = await response.json();
      console.log(result);

      if (!response.ok)
        throw new Error(result.message || "Failed to submit order");

      setStep(3); // Success step
    } catch (error: unknown) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  if (loading) {
    return <div className="text-white text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-white text-center">Error: {error}</div>;
  }

  if (step === 1) {
    return (
      <div>
        {/* Menu Step */}
        <div className="pb-0 p-6 sm:p-14 ">
          <div className="flex gap-5 items-center">
            <div>
              <img src="/vite.svg" alt="Vite" className="w-12 h-12" />
            </div>
            <div className="text-2xl text-white">ROUSE's</div>
          </div>
          <div className="text-4xl sm:text-7xl text-secondaryColor font-bold">
            Order
          </div>
        </div>

        {/* Menu Categories */}
        <div>
          {menuData.map((category, index) => (
            <div key={index} className="h-auto w-full px-6 sm:px-14 mb-10">
              <div className="flex items-center gap-2">
                <div className="text-secondaryColor text-2xl sm:text-4xl font-categoryFont font-extrabold">
                  {category.category.toUpperCase()}
                </div>
              </div>
              <div className="pl-0 sm:pl-10 pr-0 sm:pr-5 flex flex-wrap justify-start sm:justify-between w-full h-auto border-t-2 border-secondaryColor mt-2 pt-2">
                {category.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center text-lg sm:text-2xl text-white w-full sm:w-2/5 justify-between mb-4"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="w-8 aspect-square accent-secondaryColor"
                        checked={!!checkedItems[item.name]}
                        onChange={(e) =>
                          handleItemChange(item.name, e.target.checked)
                        }
                      />
                      <div
                        onClick={() =>
                          handleItemChange(item.name, !checkedItems[item.name])
                        }
                        className="cursor-pointer"
                      >
                        {item.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className={`w-20 text-black p-2 bg-[#a09add] ${
                          !checkedItems[item.name]
                            ? "text-gray-500 bg-gray-700"
                            : ""
                        }`}
                        min="1"
                        defaultValue="1"
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value > 0) {
                            handleQuantityChange(item.name, value);
                          }
                        }}
                        disabled={!checkedItems[item.name]}
                      />
                      <div className="w-20 text-left">${item.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Next Step */}
        <div className="fixed flex flex-col gap-4 top-32 right-0 ">
          <button
            className={`${
              selectedItems.length === 0 ? "bg-gray-500" : "bg-secondaryColor"
            }  text-background py-2 px-4 rounded flex place-content-center items-center flex-col`}
            onClick={() => setStep(2)}
            disabled={selectedItems.length === 0}
          >
            Place Order
            <LucideShoppingBag className="w-16 h-16" />
            <div
              className={`${
                selectedItems.length === 0 ? "hidden" : ""
              } absolute top-8 right-6 text-white bg-red-600 flex place-content-center items-center rounded-full w-6 h-6`}
            >
              {selectedItems.length}
            </div>
          </button>
          <Link
            to={"/trackorder"}
            className={`bg-secondaryColor text-background py-2 px-4 rounded flex place-content-center items-center flex-col`}
          >
            Track Order
            <MapPinCheckInside className="w-16 h-16" />
          </Link>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="p-10 ">
        <h2 className="text-4xl font-bold text-secondaryColor">Your Order</h2>

        {/* Show selected items and their prices */}
        <div className="mt-4">
          <h3 className="font-bold">Selected Items:</h3>
          {selectedItems.map((item, idx) => {
            const itemPrice = menuData
              .flatMap((category) => category.items)
              .find((menuItem) => menuItem.name === item.name)?.price;

            const totalItemCost = itemPrice
              ? item.quantity * parseFloat(itemPrice)
              : 0;

            return (
              <div key={idx}>
                {item.quantity}x {item.name} (${totalItemCost.toFixed(2)})
              </div>
            );
          })}
          <div className="mt-4 font-bold">
            Total Cost: $
            {selectedItems
              .reduce((acc, item) => {
                const itemPrice = menuData
                  .flatMap((category) => category.items)
                  .find((menuItem) => menuItem.name === item.name)?.price;

                return (
                  acc + (itemPrice ? item.quantity * parseFloat(itemPrice) : 0)
                );
              }, 0)
              .toFixed(2)}
          </div>
        </div>

        {/* User Information Form */}
        <div className="mt-4">
          <label className="block font-bold">Name</label>
          <input
            type="text"
            name="name"
            value={userInfo.name}
            onChange={handleUserInfoChange}
            className="w-full bg-white p-2 "
            placeholder="Enter your name"
          />
        </div>
        <div className="mt-4">
          <label className="block font-bold">Email</label>
          <input
            type="email"
            name="email"
            value={userInfo.email}
            onChange={handleUserInfoChange}
            className="w-full bg-white p-2 "
            placeholder="Enter your email"
          />
        </div>
        <div className="mt-4">
          <label className="block font-bold">Phone</label>
          <input
            type="text"
            name="phone"
            value={userInfo.phone}
            onChange={handleUserInfoChange}
            className="w-full p-2 bg-white "
            placeholder="Enter your phone number"
          />
        </div>
        <div className="mt-4">
          <label className="block font-bold">Full Address</label>
          <input
            type="text"
            name="address"
            value={userInfo.address}
            onChange={handleUserInfoChange}
            className="w-full bg-white p-2 "
            placeholder="Enter your address"
          />
        </div>

        <div className="mt-4">
          <button
            className={`
              ${
                !userInfo.name ||
                !userInfo.email ||
                !userInfo.phone ||
                !userInfo.address
                  ? "bg-gray-500"
                  : ""
              }
              bg-green-500 text-white py-2 px-4 rounded`}
            onClick={handleSubmitOrder}
            disabled={
              !userInfo.name ||
              !userInfo.email ||
              !userInfo.phone ||
              !userInfo.address
            }
          >
            Submit Order
          </button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="p-4 h-[100svh] text-center flex place-content-center flex-col items-center">
        <h2 className="text-4xl font-bold">Order Placed Successfully!</h2>
        <div className="h-1/4 md:w-1/5 p-10 my-2 md:m-10 bg-green-500 aspect-square rounded-full">
          <img src="/check.svg" alt="_tickpng" className="w-full h-full" />
        </div>
        <p className="mt-4 text-2xl">
          Thank you,
          <span className=""> {userInfo.name}</span>! Your order has been
          placed. You will receive a confirmation email/call from us.
        </p>
        <Link
          to={"/trackOrder"}
          className="mt-4 text-2xl text-secondaryColor border-secondaryColor border-2 px-6 py-2 rounded-md active:bg-secondaryColor hover:bg-secondaryColor active:text-white hover:text-white transition-all"
        >
          Track your order
        </Link>
      </div>
    );
  }

  return null;
};

export default Order;
