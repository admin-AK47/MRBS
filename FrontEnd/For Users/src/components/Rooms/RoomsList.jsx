import React, { useState, useEffect } from 'react';
import { Search, Clock, Calendar, MapPin, AlertTriangle } from 'lucide-react';
import Button from '../common/Button';
import StatusBadge from '../common/StatusBadge';
import { roomsAPI, reservationsAPI } from "../../services/api";
import toast from 'react-hot-toast';

export default function RoomsList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('all');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [reservations, setReservations] = useState([]);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchRooms();
    fetchReservations();
  }, []);

  const fetchRooms = async () => {
    const response = await roomsAPI.getAll();
    console.log(response.data);
    try {
      setRooms(response.data);
      // console.log(response);

    } catch (error) {
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    const response = await reservationsAPI.getAll();
    console.log(response.data);
    try {
      setReservations(response.data);
    } catch (error) {
      toast.error('Failed to fetch reservations');
    }
  };

  const handleQuickSearch = () => {
    setLocation('all');
    setDate(today);
    setStartTime('09:00');
    setEndTime('18:00');
    performSearch('all', today, '09:00', '18:00');
  };

  const handleSearch = () => {
    performSearch(location, date, startTime, endTime);
  };

  // const getRoomStatus = (room, selectedDate, startTime, endTime) => {

  //   // Check if room is booked for the selected time slot
  //   const isBooked = reservations.some(reservation => {
  //     return reservation.roomId === room.id &&
  //       reservation.date === selectedDate &&
  //       reservation.status === 'confirmed' &&
  //       !(endTime <= reservation.startTime || startTime >= reservation.endTime);
  //   });

  //   console.log(isBooked);
  //   return isBooked ? 'booked' : 'available';
  // };

  const getRoomStatus = (room, selectedDate, startTime, endTime) => {
    // First check if room is under maintenance
    if (room.availability === 'Under_Maintenance') {
      return 'Under_Maintenance';
    }

    // Convert selected date/times to comparable format
    const selectedStart = new Date(`${selectedDate}T${startTime}`).getTime();
    const selectedEnd = new Date(`${selectedDate}T${endTime}`).getTime();

    // Check if room is booked for the selected time slot
    const isBooked = reservations.some(reservation => {
      if (reservation.status !== 'confirmed' || reservation.room.id !== room.id) {
        return false;
      }

      const reservationStart = new Date(reservation.startTime).getTime();
      const reservationEnd = new Date(reservation.endTime).getTime();
      console.log(reservationStart);

      // Fixed overlap logic:
      // Room is considered booked if:
      // 1. Selected start time falls within an existing reservation OR
      // 2. Selected end time falls within an existing reservation OR
      // 3. Selected time completely encompasses an existing reservation
      return (
        (selectedStart >= reservationStart && selectedStart < reservationEnd) || // Start time overlaps
        (selectedEnd > reservationStart && selectedEnd <= reservationEnd) ||     // End time overlaps
        (selectedStart <= reservationStart && selectedEnd >= reservationEnd)     // Encompasses existing booking
      );
    });

    return (room.availability === 'Available' && isBooked) ? 'booked' : room.availability;
  };



  const performSearch = (loc, dt, start, end) => {
    let results = rooms;

    // Filter by location
    if (loc !== 'all') {
      results = results.filter(room => room.location === loc);
    }

    // Add status to each room
    results = results.map(room => ({
      ...room,
      status: getRoomStatus(room, dt, start, end)
    }));

    console.log('Filtered Rooms:', results);

    setFilteredRooms(results);
    setSearchPerformed(true);
  };

  const handleBooking = async (roomId) => {
    try {
      const title = 'Meeting'; // You might want to add a field for this
      // console.log({ roomId, title, startTime:`${date}T${startTime}:00`, endTime:`${date}T${endTime}:00` });
      await reservationsAPI.create({ roomId, title, startTime: `${date}T${startTime}:00`, endTime: `${date}T${endTime}:00` });

      toast.success('Room booked successfully!');
      fetchRooms(); // Refresh rooms list
    } catch (error) {
      toast.error(error.response.data.startTime);
      toast.error(error.response.data.endTime);
    }
  };

  const getButtonState = (status) => {
    switch (status) {
      case 'Available':
        return {
          enabled: true,
          text: 'Book Now',
          style: 'bg-blue-600 text-white hover:bg-blue-700'
        };
      case 'booked':
        return {
          enabled: false,
          text: 'Booked',
          style: 'bg-red-100 text-red-800 cursor-not-allowed'
        };
      case 'Under_Maintenance':
        return {
          enabled: false,
          text: 'Under Maintenance',
          style: 'bg-yellow-100 text-yellow-800 cursor-not-allowed'
        };
      default:
        return {
          enabled: false,
          text: 'Unavailable',
          style: 'bg-gray-100 text-gray-400 cursor-not-allowed'
        };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Panel */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Find a Meeting Room</h2>

        {/* Quick Search Button */}
        <div className="mb-4">
          <Button
            variant="secondary"
            onClick={handleQuickSearch}
            className="flex items-center"
          >
            <Search className="mr-2 h-4 w-4" />
            Quick Search for Today (All Locations)
          </Button>
        </div>

        {/* Detailed Search Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="inline-block mr-1 h-4 w-4" />
              Location
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Locations</option>
              <option value="Pune_Baner">Pune - Baner</option>
              <option value="Pune_Wadgaonsheri">Pune - Wadgaonsheri</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="inline-block mr-1 h-4 w-4" />
              Date
            </label>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock className="inline-block mr-1 h-4 w-4" />
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock className="inline-block mr-1 h-4 w-4" />
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <Button onClick={handleSearch}>
          Search Rooms
        </Button>
      </div>

      {searchPerformed && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Available Rooms</h2>


          {filteredRooms.length === 0 ? (
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <p className="text-gray-600">No meeting rooms found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map(room => (
                <div key={room.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative">
                    <img
                      src={room.imageURL}
                      alt={room.name}
                      className="w-full h-48 object-cover"
                    />
                    {room.status === 'Under_Maintenance' && (
                      <div className="absolute top-2 right-2">
                        <AlertTriangle className="h-6 w-6 text-yellow-500 bg-white rounded-full p-1" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{room.name}</h3>
                      <StatusBadge status={room.status} />
                    </div>
                    <p className="text-gray-600 mb-2">{room.location.replace('_', ' - ')}</p>
                    <p className="text-gray-600 mb-4">Capacity: {room.capacity} people</p>

                    <Button
                      variant={room.status === 'Available' ? 'primary' : 'secondary'}
                      disabled={room.status !== 'Available'}
                      onClick={() => room.status === 'Available' && handleBooking(room.id)}
                      className="w-full"
                    >
                      {getButtonState(room.status).text}
                    </Button>

                    {room.status === 'Under_Maintenance' && (
                      <p className="text-xs text-yellow-700 mt-2 text-center">
                        This room is currently undergoing maintenance and is unavailable for booking.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}