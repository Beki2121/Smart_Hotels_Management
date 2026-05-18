import React, { useState } from "react";
import { useInventory, useUpdateInventoryMutation } from "../api/hooks";
import {
  Sidebar,
  TopBar,
  Card,
  CardBody,
  SearchInput,
  DataGrid,
  Button,
  Input,
  Modal,
  Alert,
  Loading,
} from "../Components";
import { Edit2 } from "lucide-react";

export const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const { data: inventory, isLoading, error } = useInventory();
  const updateMutation = useUpdateInventoryMutation();

  const filteredInventory =
    inventory?.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setQuantity(item.quantity.toString());
    setNotes("");
    setShowModal(true);
  };

  const handleUpdateQuantity = async () => {
    if (!quantity) {
      alert("Please enter quantity");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        itemId: selectedItem.id,
        data: {
          quantity: parseInt(quantity),
          lastUpdated: new Date().toISOString(),
          notes,
        },
      });
      setShowModal(false);
      alert("Inventory updated successfully!");
    } catch (err) {
      alert("Error updating inventory: " + err.message);
    }
  };

  const columns = [
    { key: "name", label: "Item Name", sortable: true },
    { key: "sku", label: "SKU", sortable: true },
    {
      key: "quantity",
      label: "Quantity",
      sortable: true,
      render: (value) => <strong>{value}</strong>,
    },
    { key: "minQuantity", label: "Min Stock", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (_, item) => {
        const status =
          item.quantity <= item.minQuantity ? "Low Stock" : "In Stock";
        const color =
          item.quantity <= item.minQuantity ? "text-red-600" : "text-green-600";
        return <span className={color}>{status}</span>;
      },
    },
    {
      key: "unitPrice",
      label: "Unit Price",
      render: (value) => `ETB ${value?.toLocaleString()}`,
    },
    {
      key: "id",
      label: "Actions",
      render: (_, item) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleEditItem(item)}
        >
          <Edit2 size={14} /> Edit
        </Button>
      ),
    },
  ];

  const lowStockItems =
    inventory?.filter((item) => item.quantity <= item.minQuantity) || [];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopBar />

        <div className="p-6">
          {error && (
            <Alert
              type="error"
              title="Error loading inventory"
              message={error.message}
            />
          )}

          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            📦 Inventory Management
          </h1>

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <Alert
              type="warning"
              title="Low Stock Items"
              message={`${lowStockItems.length} items are below minimum stock level`}
            />
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardBody>
                <p className="text-gray-600 text-sm mb-2">Total Items</p>
                <p className="text-3xl font-bold text-gray-900">
                  {inventory?.length || 0}
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-gray-600 text-sm mb-2">Low Stock Items</p>
                <p className="text-3xl font-bold text-red-600">
                  {lowStockItems.length}
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-gray-600 text-sm mb-2">Total Value</p>
                <p className="text-3xl font-bold text-gray-900">
                  ETB{" "}
                  {(
                    inventory?.reduce(
                      (sum, item) => sum + item.quantity * item.unitPrice,
                      0,
                    ) || 0
                  ).toLocaleString()}
                </p>
              </CardBody>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-6">
            <SearchInput
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm("")}
            />
          </div>

          {/* Inventory Table */}
          <Card>
            <CardBody>
              {isLoading ? (
                <Loading />
              ) : (
                <DataGrid data={filteredInventory} columns={columns} />
              )}
            </CardBody>
          </Card>

          {/* Edit Modal */}
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={`Update ${selectedItem?.name}`}
            size="md"
          >
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Current Quantity:</strong> {selectedItem?.quantity}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Minimum Stock:</strong> {selectedItem?.minQuantity}
                </p>
              </div>

              <Input
                label="New Quantity"
                type="number"
                min="0"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />

              <Input
                label="Notes"
                placeholder="Optional notes (e.g., received stock, damaged items)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateQuantity}
                loading={updateMutation.isPending}
                className="flex-1"
              >
                Update
              </Button>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
