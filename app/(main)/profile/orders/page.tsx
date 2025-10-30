"use client";

import React from "react";
import { Package, Search, Filter } from "lucide-react";

export default function OrdersPage() {
  // Mock orders data
  const orders = [
    {
      id: "#12345",
      date: "2024-01-15",
      status: "Delivered",
      total: "$299.99",
      items: 2,
    },
    {
      id: "#12346",
      date: "2024-01-10",
      status: "Shipped",
      total: "$149.99",
      items: 1,
    },
    {
      id: "#12347",
      date: "2024-01-05",
      status: "Processing",
      total: "$89.99",
      items: 1,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "text-green-600 bg-green-100";
      case "Shipped":
        return "text-blue-600 bg-blue-100";
      case "Processing":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="bg-white rounded-xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom focus:border-custom"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-custom/10 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-custom" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{order.id}</h3>
                  <p className="text-sm text-gray-500">Ordered on {order.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{order.total}</p>
                <p className="text-sm text-gray-500">{order.items} item(s)</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
              <div className="flex items-center space-x-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                  View Details
                </button>
                {order.status === "Delivered" && (
                  <button className="px-4 py-2 bg-custom text-white rounded-lg hover:bg-custom/90 transition-colors duration-200 cursor-pointer">
                    Reorder
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
          <button className="px-6 py-3 bg-custom text-white rounded-lg hover:bg-custom/90 transition-colors duration-200 cursor-pointer">
            Start Shopping
          </button>
        </div>
      )}
    </div>
  );
}
