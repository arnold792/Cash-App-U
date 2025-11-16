import React, { useState, useEffect, useMemo, useCallback } from "react";

// Load transactions from localStorage or use default
const loadTransactionsFromStorage = () => {
  const saved = localStorage.getItem("cashapp-transactions");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return getDefaultTransactions();
    }
  }
  return getDefaultTransactions();
};

// Default transactions
const getDefaultTransactions = () => [
  {
    id: 1,
    name: "Ariya Shingles",
    desc: "Fro buying $20 load",
    time: "9:18PM",
    amount: "$1,000",
    avatar: "AS",
    imageUrl: null,
  },
  {
    id: 2,
    name: "Guillermo Galvan",
    desc: "Fro buying $20 load",
    time: "9:18PM",
    amount: "$1,000",
    avatar: "GG",
    imageUrl: null,
  },
  {
    id: 3,
    name: "Crystal Ligon",
    desc: "Fro buying $20 load",
    time: "9:18PM",
    amount: "$1,000",
    avatar: "CL",
    imageUrl: null,
  },
  {
    id: 4,
    name: "jsosa",
    desc: "Fro buying $20 load",
    time: "9:18PM",
    amount: "$1,000",
    avatar: "JS",
    imageUrl: null,
  },
  {
    id: 5,
    name: "Crystal Ligon",
    desc: "H",
    time: "5:41PM",
    amount: "$8,000",
    avatar: "CL",
    imageUrl: null,
  },
];

export default function App() {
  const [transactions, setTransactions] = useState(loadTransactionsFromStorage);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    desc: "",
    time: "",
    amount: "",
    imageUrl: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Save to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem("cashapp-transactions", JSON.stringify(transactions));
  }, [transactions]);

  // Get unique users from transactions for stories - dynamically generated
  const stories = useMemo(() => {
    // Get unique users based on name, keeping track of the most recent transaction
    const uniqueUsersMap = new Map();
    
    transactions.forEach((tx) => {
      if (!uniqueUsersMap.has(tx.name)) {
        // First occurrence is the most recent (transactions are added to beginning)
        uniqueUsersMap.set(tx.name, {
          name: tx.name,
          avatar: tx.avatar,
          imageUrl: tx.imageUrl || null,
          id: tx.id, // Use the most recent transaction ID for this user
        });
      }
    });
    
    // Convert map to array - already sorted by most recent since we iterate transactions in order
    // Transactions at the beginning of the array are most recent
    return Array.from(uniqueUsersMap.values());
  }, [transactions]);

  // Get avatar image URL - uses custom image if available, otherwise generates from initials
  const getAvatarUrl = useCallback((initials, imageUrl = null) => {
    if (imageUrl && imageUrl.trim() !== "") {
      return imageUrl;
    }
    return `https://ui-avatars.com/api/?name=${initials}&background=00D26A&color=fff&size=128&bold=true`;
  }, []);

  // Filter transactions based on search - memoized for performance
  const filteredTransactions = useMemo(
    () =>
      transactions.filter(
        (tx) =>
          tx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.amount.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [transactions, searchQuery]
  );

  // Format current time
  const getCurrentTime = useCallback(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes}${ampm}`;
  }, []);

  // Handle form input change
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Update image preview when image URL changes
    if (name === "imageUrl") {
      if (value && value.trim() !== "") {
        setImagePreview(value);
        setImageError(false);
      } else {
        setImagePreview(null);
      }
    }
  }, []);

  // Handle image file upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      // Create object URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        setFormData((prev) => ({ ...prev, imageUrl }));
        setImagePreview(imageUrl);
        setImageError(false);
      };
      reader.onerror = () => {
        setImageError(true);
        alert("Error reading image file");
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Handle create transaction
  const handleCreate = useCallback(() => {
    setEditingTransaction(null);
    setFormData({
      name: "",
      desc: "",
      time: getCurrentTime(),
      amount: "",
      imageUrl: "",
    });
    setImagePreview(null);
    setImageError(false);
    setShowModal(true);
  }, [getCurrentTime]);

  // Handle edit transaction
  const handleEdit = useCallback((tx) => {
    setEditingTransaction(tx);
    setFormData({
      name: tx.name,
      desc: tx.desc,
      time: tx.time,
      amount: tx.amount.replace("$", "").replace(/,/g, ""),
      imageUrl: tx.imageUrl || "",
    });
    setImagePreview(tx.imageUrl || null);
    setImageError(false);
    setShowModal(true);
  }, []);

  // Handle delete transaction
  const handleDelete = useCallback(
    (id) => {
      if (window.confirm("Are you sure you want to delete this transaction?")) {
        setTransactions((prev) => prev.filter((tx) => tx.id !== id));
      }
    },
    []
  );

  // Handle image error
  const handleImageError = useCallback(() => {
    setImageError(true);
    setImagePreview(null);
  }, []);

  // Handle save (create or update)
  const handleSave = useCallback(() => {
    // Validation
    if (!formData.name || !formData.name.trim()) {
      alert("Please enter a name");
      return;
    }

    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);

    // Generate initials for fallback avatar
    const initials = formData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    // Format amount
    const formattedAmount = `$${parseInt(formData.amount).toLocaleString()}`;

    setTimeout(() => {
      if (editingTransaction) {
        // Update existing transaction
        setTransactions((prev) =>
          prev.map((tx) =>
            tx.id === editingTransaction.id
              ? {
                  ...tx,
                  name: formData.name.trim(),
                  desc: formData.desc.trim(),
                  time: formData.time || getCurrentTime(),
                  amount: formattedAmount,
                  avatar: initials,
                  imageUrl: formData.imageUrl.trim() || null,
                }
              : tx
          )
        );
      } else {
        // Create new transaction
        const newTransaction = {
          id: Date.now(),
          name: formData.name.trim(),
          desc: formData.desc.trim() || "",
          time: formData.time || getCurrentTime(),
          amount: formattedAmount,
          avatar: initials,
          imageUrl: formData.imageUrl.trim() || null,
        };
        setTransactions((prev) => [newTransaction, ...prev]);
      }

      setIsSubmitting(false);
      setShowModal(false);
      setFormData({ name: "", desc: "", time: "", amount: "", imageUrl: "" });
      setImagePreview(null);
      setImageError(false);
      setEditingTransaction(null);
    }, 300); // Small delay for better UX
  }, [formData, editingTransaction, getCurrentTime]);

  return (
    <div className="max-w-sm mx-auto p-4 pb-20 bg-black min-h-screen">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-4 text-white">Activity</h1>

      {/* Search */}
      <div className="flex items-center bg-neutral-900 p-3 rounded-xl mb-4">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search transactions"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ml-2 bg-transparent outline-none text-gray-200 w-full placeholder-gray-500"
        />
      </div>

      {/* Stories */}
      <div className="flex overflow-x-auto gap-4 py-6 mb-4 scrollbar-hide">
        <div
          className="flex flex-col items-center flex-shrink-0 cursor-pointer"
          onClick={handleCreate}
        >
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white text-3xl font-bold">
            +
          </div>
          <p className="text-xs text-gray-400 mt-1">Get $20</p>
        </div>

        {stories.map((story) => {
          return (
            <div key={story.id || story.name} className="flex flex-col items-center flex-shrink-0">
              <img
                src={getAvatarUrl(story.avatar, story.imageUrl)}
                alt={story.name}
                className="w-16 h-16 rounded-full border-2 border-transparent hover:border-green-500 transition object-cover cursor-pointer"
                onError={(e) => {
                  e.target.src = getAvatarUrl(story.avatar);
                }}
                onClick={() => {
                  // Filter to show only this user's transactions when clicked
                  setSearchQuery(story.name);
                }}
                title={`Click to filter ${story.name}'s transactions`}
              />
              <p className="text-xs text-gray-400 mt-1 truncate max-w-[60px]">
                {story.name.split(" ")[0]}
              </p>
            </div>
          );
        })}
      </div>

      {/* Section Header */}
      <div className="mb-4">
        <h2 className="text-white font-semibold">Today</h2>
      </div>

      {/* Transactions */}
      <div className="space-y-4 mb-6">
        {filteredTransactions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No transactions found</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center border-b border-neutral-800 pb-4 group"
            >
              <img
                src={getAvatarUrl(tx.avatar, tx.imageUrl)}
                alt={tx.name}
                className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
                onError={(e) => {
                  // Fallback to avatar initials if custom image fails
                  if (tx.imageUrl) {
                    e.target.src = getAvatarUrl(tx.avatar);
                  }
                }}
              />

              <div className="ml-4 flex-1 min-w-0">
                <p className="font-semibold text-white">{tx.name}</p>
                <p className="text-sm text-gray-400 truncate">{tx.desc}</p>
                <p className="text-xs text-gray-500">{tx.time}</p>
              </div>

              <div className="flex items-center gap-2">
                <p className="font-bold text-white">{tx.amount}</p>
                <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition">
                  <button
                    onClick={() => handleEdit(tx)}
                    className="text-blue-500 hover:text-blue-400 text-sm p-1"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="text-red-500 hover:text-red-400 text-sm p-1"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Money Section */}
      <div className="flex items-center border-b border-neutral-800 pb-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          $
        </div>
        <div className="ml-4 flex-1">
          <p className="font-semibold text-white">Add money</p>
          <p className="text-sm text-gray-400">Chase Bank</p>
        </div>
        <p className="font-bold text-green-500">+ $50,000</p>
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4">
              {editingTransaction ? "Edit Transaction" : "Add Transaction"}
            </h2>

            <div className="space-y-4">
              {/* Profile Image Upload Section */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Profile Image
                </label>
                <div className="space-y-3">
                  {/* Image Preview */}
                  {imagePreview && !imageError && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-green-500"
                        onError={handleImageError}
                      />
                      <button
                        onClick={() => {
                          setImagePreview(null);
                          setFormData((prev) => ({ ...prev, imageUrl: "" }));
                        }}
                        className="absolute top-0 right-[calc(50%-3rem)] w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* Upload File Button */}
                  <div>
                    <label className="block w-full bg-neutral-800 text-white p-3 rounded-lg cursor-pointer hover:bg-neutral-700 transition text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      📷 Upload Image File
                    </label>
                  </div>

                  {/* Or URL Input */}
                  <div className="text-center text-gray-500 text-xs">OR</div>

                  {/* Image URL Input */}
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-800 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                  />
                  {imageError && (
                    <p className="text-red-400 text-xs">
                      Invalid image. Will use generated avatar instead.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-800 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter name"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="desc"
                  value={formData.desc}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-800 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter description"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Time</label>
                <input
                  type="text"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-800 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 9:18PM"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  Amount <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-800 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter amount (e.g., 1000)"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingTransaction(null);
                  setFormData({ name: "", desc: "", time: "", amount: "", imageUrl: "" });
                  setImagePreview(null);
                  setImageError(false);
                }}
                className="flex-1 bg-neutral-800 text-white p-3 rounded-lg hover:bg-neutral-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  editingTransaction ? "Update" : "Create"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 w-full bg-black border-t border-neutral-800 py-4 flex justify-around items-center">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold">$44.9K</span>
          <div className="w-6 h-6 bg-neutral-800 rounded"></div>
        </div>
        <div className="flex gap-6">
          <div className="text-green-500 text-xl cursor-pointer">$</div>
          <svg
            className="w-6 h-6 text-gray-400 cursor-pointer"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <svg
            className="w-6 h-6 text-gray-400 cursor-pointer"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
