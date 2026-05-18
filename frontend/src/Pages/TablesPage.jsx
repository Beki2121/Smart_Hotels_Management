import React, { useState } from "react";
import { useTables, useTableMutation, useOrders } from "../api/hooks";
import useCartStore from "../useCartStore";
import {
  Sidebar,
  TopBar,
  TableCard,
  Modal,
  Card,
  CardBody,
  Input,
  Button,
  Badge,
  Loading,
  Alert,
} from "../Components";
import { t } from "../../i18n";

export const TablesPage = () => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const { data: tables, isLoading, error } = useTables();
  const { data: orders } = useOrders();
  const tableUpdateMutation = useTableMutation();

  const handleTableClick = (table) => {
    setSelectedTable(table);
    setShowModal(true);
  };

  const handleSeatTable = async () => {
    if (!guestName.trim() || !guestCount) {
      alert("Please enter guest name and count");
      return;
    }

    try {
      await tableUpdateMutation.mutateAsync({
        tableId: selectedTable.id,
        data: {
          status: "occupied",
          guestName,
          guestCount: parseInt(guestCount),
        },
      });
      setGuestName("");
      setGuestCount("");
      setShowModal(false);
    } catch (err) {
      alert("Error updating table: " + err.message);
    }
  };

  const handleClearTable = async () => {
    try {
      await tableUpdateMutation.mutateAsync({
        tableId: selectedTable.id,
        data: { status: "available" },
      });
      setShowModal(false);
    } catch (err) {
      alert("Error clearing table: " + err.message);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopBar />

        <div className="p-6">
          {error && (
            <Alert
              type="error"
              title="Error loading tables"
              message={error.message}
            />
          )}

          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Table Management
            </h1>
            <div className="flex gap-4">
              <Badge variant="success">Available</Badge>
              <Badge variant="warning">Occupied</Badge>
              <Badge variant="primary">Reserved</Badge>
            </div>
          </div>

          {isLoading ? (
            <Loading />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tables?.map((table) => (
                <TableCard
                  key={table.id}
                  tableId={table.tableNumber}
                  status={table.status}
                  seatsCount={table.capacity}
                  occupants={table.occupants}
                  onClick={() => handleTableClick(table)}
                />
              ))}
            </div>
          )}

          {/* Table Detail Modal */}
          <Modal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setGuestName("");
              setGuestCount("");
            }}
            title={`Table ${selectedTable?.tableNumber}`}
            size="md"
          >
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  Capacity: {selectedTable?.capacity} seats
                </p>
                <p className="text-sm text-gray-600">
                  Status:{" "}
                  <Badge
                    variant={
                      selectedTable?.status === "available"
                        ? "success"
                        : "warning"
                    }
                  >
                    {selectedTable?.status}
                  </Badge>
                </p>
              </div>

              {selectedTable?.status === "available" ? (
                <div className="space-y-3">
                  <Input
                    label="Guest Name"
                    placeholder="Enter guest name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                  <Input
                    label="Number of Guests"
                    type="number"
                    min="1"
                    max={selectedTable?.capacity}
                    placeholder="Enter guest count"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                  />
                </div>
              ) : (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900">
                    Guest: {selectedTable?.guestName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Guests: {selectedTable?.occupants}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                className="flex-1"
              >
                Close
              </Button>
              {selectedTable?.status === "available" ? (
                <Button
                  variant="primary"
                  onClick={handleSeatTable}
                  loading={tableUpdateMutation.isPending}
                  className="flex-1"
                >
                  Seat Guests
                </Button>
              ) : (
                <Button
                  variant="danger"
                  onClick={handleClearTable}
                  loading={tableUpdateMutation.isPending}
                  className="flex-1"
                >
                  Clear Table
                </Button>
              )}
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default TablesPage;
