import { useState, useEffect } from 'react';
import { getReservations } from '../services/api';
import { Search, Calendar, Users, Home, RefreshCw, Filter } from 'lucide-react';

function Reservations() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ 
        userName: '', 
        roomName: '',
        status: '', 
        date: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            setLoading(true);
            const response = await getReservations();
            setReservations(response.data);
        } catch (error) {
            showToast('Failed to fetch reservations', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        // Simulated toast functionality
        console.log(`${type}: ${message}`);
    };

    const handleReset = () => {
        setFilters({ userName: '', roomName: '', status: '', date: '' });
    };

    const filteredReservations = reservations.filter(reservation => {
        const matchesUser = reservation.user.name.toLowerCase().includes(filters.userName.toLowerCase());
        const matchesRoom = reservation.room.name.toLowerCase().includes(filters.roomName.toLowerCase());
        const matchesStatus = filters.status === '' || reservation.status === filters.status;
        
        let matchesDate = true;
        if (filters.date) {
            const filterDate = new Date(filters.date).toDateString();
            const startDate = new Date(reservation.startTime).toDateString();
            matchesDate = filterDate === startDate;
        }
        
        return matchesUser && matchesRoom && matchesStatus && matchesDate;
    });

    const getStatusColor = (status) => {
        switch(status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className=" max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Reservations Management</h1>
                <button 
                    onClick={fetchReservations}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="p-4 border-b flex justify-between items-center">
                    <div className="flex items-center">
                        <Search className="h-5 w-5 text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search all reservations..."
                            className="p-2 outline-none"
                            value={filters.userName || filters.roomName}
                            onChange={(e) => {
                                const value = e.target.value;
                                setFilters({ ...filters, userName: value, roomName: value });
                            }}
                        />
                    </div>
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center px-3 py-1 text-gray-600 border rounded-md hover:bg-gray-50"
                    >
                        <Filter className="h-4 w-4 mr-1" />
                        Filters
                    </button>
                </div>

                {showFilters && (
                    <div className="p-4 bg-gray-50 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-600 mb-1">User</label>
                            <div className="relative">
                                <Users className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Filter by user..."
                                    className="p-2 pl-8 border rounded w-full"
                                    value={filters.userName}
                                    onChange={(e) => setFilters({ ...filters, userName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-600 mb-1">Room</label>
                            <div className="relative">
                                <Home className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Filter by room..."
                                    className="p-2 pl-8 border rounded w-full"
                                    value={filters.roomName}
                                    onChange={(e) => setFilters({ ...filters, roomName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-600 mb-1">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="date"
                                    className="p-2 pl-8 border rounded w-full"
                                    value={filters.date}
                                    onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-600 mb-1">Status</label>
                            <select
                                className="p-2 border rounded w-full"
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            >
                                <option value="">All statuses</option>
                                <option value="completed">Completed</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="md:col-span-4">
                            <button 
                                onClick={handleReset}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                Reset filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : filteredReservations.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <p className="text-gray-500 text-lg">No reservations found matching your filters.</p>
                    <button 
                        onClick={handleReset}
                        className="mt-4 text-blue-600 hover:text-blue-800"
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredReservations.map(reservation => (
                                    <tr key={reservation.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{reservation.user.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-gray-900">{reservation.room.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900 max-w-xs truncate">{reservation.title}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-gray-500">
                                                {new Date(reservation.startTime).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-gray-500">
                                                {new Date(reservation.endTime).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                                                {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="bg-gray-50 px-6 py-3 border-t">
                        <div className="text-gray-500 text-sm">
                            Showing {filteredReservations.length} of {reservations.length} reservations
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reservations;