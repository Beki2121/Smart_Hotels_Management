import React, { useState } from "react";
import { useRooms, useCreateBookingMutation } from "../api/hooks";
import {
  Sidebar,
  TopBar,
  RoomCard,
  Modal,
  Card,
  CardBody,
  Input,
  Button,
  Badge,
  DataGrid,
  Loading,
  Alert,
} from "../Components";
import { t } from "../../i18n";

export const RoomsPage = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [nights, setNights] = useState(1);
  const { data: rooms, isLoading, error } = useRooms();
  const bookingMutation = useCreateBookingMutation();

  const handleRoomClick = (room) => {
    if (room.status === "available") {
      setSelectedRoom(room);
      setShowModal(true);
    }
  };

  const handleCheckIn = async () => {
    if (!guestName.trim() || !checkInDate || !checkOutDate) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const bookingData = {
        roomId: selectedRoom.id,
        guestName,
        checkInDate,
        checkOutDate,
        numberOfNights: nights,
        pricePerNight: selectedRoom.pricePerNight,
        totalPrice: selectedRoom.pricePerNight * nights,
      };

      await bookingMutation.mutateAsync(bookingData);
      setShowModal(false);
      setGuestName("");
      setCheckInDate("");
      setCheckOutDate("");
      setNights(1);
      alert("Room booked successfully!");
    } catch (err) {
      alert("Error booking room: " + err.message);
    }
  };

  const columns = [
    { key: "roomNumber", label: "Room #", sortable: true },
    { key: "roomType", label: "Type", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge variant={value === "available" ? "success" : "warning"}>
          {value}
        </Badge>
      ),
    },
    {
      key: "pricePerNight",
      label: "Price/Night",
      render: (value) => `ETB ${value?.toLocaleString()}`,
    },
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopBar />

        <div className="p-6">
          {error && (
            <Alert
              type="error"
              title="Error loading rooms"
              message={error.message}
            />
          )}

          <h1 className="text-3xl font-bold text-gray-900 mb-6">Hotel Rooms</h1>

          {isLoading ? (
            <Loading />
          ) : (
            <div className="space-y-6">
              {/* Room Cards View */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Available Rooms
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {rooms
                    ?.filter((r) => r.status === "available")
                    .map((room) => (
                      <RoomCard
                        key={room.id}
                        roomNumber={room.roomNumber}
                        status={room.status}
                        type={room.roomType}
                        price={room.pricePerNight}
                        onClick={() => handleRoomClick(room)}
                      />
                    ))}
                </div>
              </div>

              {/* Occupied Rooms */}
              {rooms?.filter((r) => r.status === "occupied").length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Occupied Rooms
                  </h2>
                  <Card>
                    <CardBody>
                      <DataGrid
                        data={
                          rooms?.filter((r) => r.status === "occupied") || []
                        }
                        columns={columns}
                      />
                    </CardBody>
                  </Card>
                </div>
              )}

              {/* All Rooms Table */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  All Rooms
                </h2>
                <Card>
                  <CardBody>
                    <DataGrid data={rooms || []} columns={columns} />
                  </CardBody>
                </Card>
              </div>
            </div>
          )}

          {/* Booking Modal */}
          <Modal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setGuestName("");
              setCheckInDate("");
              setCheckOutDate("");
              setNights(1);
            }}
            title={`Book Room ${selectedRoom?.roomNumber}`}
            size="md"
          >
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Room Type:</strong> {selectedRoom?.roomType}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Price:</strong> ETB{" "}
                  {selectedRoom?.pricePerNight?.toLocaleString()}/night
                </p>
              </div>

              <Input
                label={t("rooms.guest_name")}
                placeholder="Enter guest name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
              />

              <Input
                label={t("rooms.check_in_date")}
                type="date"
                value={checkInDate}
                onChange={(e) => {
                  setCheckInDate(e.target.value);
                  if (checkOutDate) {
                    const days = Math.ceil(
                      (new Date(checkOutDate) - new Date(e.target.value)) /
                        (1000 * 60 * 60 * 24),
                    );
                    setNights(Math.max(1, days));
                  }
                }}
                required
              />

              <Input
                label={t("rooms.check_out_date")}
                type="date"
                value={checkOutDate}
                onChange={(e) => {
                  setCheckOutDate(e.target.value);
                  if (checkInDate) {
                    const days = Math.ceil(
                      (new Date(e.target.value) - new Date(checkInDate)) /
                        (1000 * 60 * 60 * 24),
                    );
                    setNights(Math.max(1, days));
                  }
                }}
                required
              />

              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Nights:</strong> {nights}
                </p>
                <p className="text-lg font-bold text-gray-900 mt-2">
                  Total: ETB{" "}
                  {(selectedRoom?.pricePerNight * nights)?.toLocaleString()}
                </p>
              </div>
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
                onClick={handleCheckIn}
                loading={bookingMutation.isPending}
                className="flex-1"
              >
                Confirm Booking
              </Button>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default RoomsPage;
