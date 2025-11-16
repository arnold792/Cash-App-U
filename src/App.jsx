import React, { useState } from "react";

export default function App() {
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      name: "Ariya Shingles",
      desc: "Fro buying $20 load",
      time: "9:18PM",
      amount: "$1,000",
      avatar: "AS",
    },
    {
      id: 2,
      name: "Guillermo Galvan",
      desc: "Fro buying $20 load",
      time: "9:18PM",
      amount: "$1,000",
      avatar: "GG",
    },
    {
      id: 3,
      name: "Crystal Ligon",
      desc: "Fro buying $20 load",
      time: "9:18PM",
      amount: "$1,000",
      avatar: "CL",
    },
    {
      id: 4,
      name: "jsosa",
      desc: "Fro buying $20 load",
      time: "9:18PM",
      amount: "$1,000",
      avatar: "JS",
    },
    {
      id: 5,
      name: "Crystal Ligon",
      desc: "H",
      time: "5:41PM",
      amount: "$8,000",
      avatar: "CL",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    desc: "",
    time: "",
    amount: "",
  });

  const stories = [
    { name: "Ariya Shingles", avatar: "AS" },
    { name: "Guillermo Galvan", avatar: "GG" },
    { name: "Crystal Ligon", avatar: "CL" },
    { name: "jsosa", avatar: "JS" },
  ];

  // Get avatar image URL
  const getAvatarUrl = (initials) => {
    return `https://ui-avatars.com/api/?name=${initials}&background=00D26A&color=fff&size=128&bold=true`;
  };

  // Filter transactions based on search
  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.amount.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format current time
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes}${ampm}`;
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle create transaction
  const handleCreate = () => {
    setEditingTransaction(null);
    setFormData({
      name: "",
      desc: "",
      time: getCurrentTime(),
      amount: "",
    });
    setShowModal(true);
  };

  // Handle edit transaction
  const handleEdit = (tx) => {
    setEditingTransaction(tx);
    setFormData({
      name: tx.name,
      desc: tx.desc,
      time: tx.time,
      amount: tx.amount.replace("$", "").replace(",", ""),
    });
    setShowModal(true);
  };

  // Handle delete transaction
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      setTransactions(transactions.filter((tx) => tx.id !== id));
    }
  };

  // Handle save (create or update)
  const handleSave = () => {
    if (!formData.name || !formData.amount) {
      alert("Please fill in name and amount");
      return;
    }

    const initials = formData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    if (editingTransaction) {
      // Update existing transaction
      setTransactions(
        transactions.map((tx) =>
          tx.id === editingTransaction.id
            ? {
                ...formData,
                id: editingTransaction.id,
                amount: `$${parseInt(formData.amount).toLocaleString()}`,
                avatar: initials,
              }
            : tx
        )
      );
    } else {
      // Create new transaction
      const newTransaction = {
        id: Date.now(),
        name: formData.name,
        desc: formData.desc || "",
        time: formData.time || getCurrentTime(),
        amount: `$${parseInt(formData.amount).toLocaleString()}`,
        avatar: initials,
      };
      setTransactions([newTransaction, ...transactions]);
    }

    setShowModal(false);
    setFormData({ name: "", desc: "", time: "", amount: "" });
    setEditingTransaction(null);
  };

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

        {stories.map((story, index) => (
          <div key={index} className="flex flex-col items-center flex-shrink-0">
            <img
              src={getAvatarUrl(story.avatar)}
              alt={story.name}
              className="w-16 h-16 rounded-full border-2 border-transparent hover:border-green-500 transition"
            />
            <p className="text-xs text-gray-400 mt-1 truncate max-w-[60px]">
              {story.name.split(" ")[0]}
            </p>
          </div>
        ))}
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
                src={getAvatarUrl(tx.avatar)}
                alt={tx.name}
                className="w-12 h-12 rounded-full flex-shrink-0"
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
              <div>
                <label className="block text-gray-400 text-sm mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-800 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter name"
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
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-800 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter amount (e.g., 1000)"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingTransaction(null);
                  setFormData({ name: "", desc: "", time: "", amount: "" });
                }}
                className="flex-1 bg-neutral-800 text-white p-3 rounded-lg hover:bg-neutral-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition font-semibold"
              >
                {editingTransaction ? "Update" : "Create"}
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
