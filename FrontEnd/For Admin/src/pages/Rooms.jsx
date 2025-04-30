import { useState, useEffect } from 'react';
import { getRooms, createRoom, updateRoom } from '../services/api';
import { toast } from 'react-hot-toast';

function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        capacity: '',
        availability: true,
        description: '',
        imageURL: ''
    });

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await getRooms();
            setRooms(response.data);
        } catch (error) {
            toast.error('Failed to fetch rooms');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateRoom(formData.id, formData);
                toast.success('Room updated successfully');
            } else {
                await createRoom(formData);
                toast.success('Room created successfully');
            }
            fetchRooms();
            resetForm();
        } catch (error) {
            toast.error(isEditing ? 'Failed to update room' : 'Failed to create room');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            location: '',
            capacity: '',
            availability: true,
            description: '',
            imageURL: ''
        });
        setIsEditing(false);
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Room Management</h1>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Form Section - Takes 2/5 of the screen on large displays */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                            <h2 className="text-2xl font-bold text-white">
                                {isEditing ? 'Edit Room' : 'Add New Room'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter room name"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input
                                    type="text"
                                    placeholder="Building/Floor"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                                <input
                                    type="number"
                                    placeholder="Number of people"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    placeholder="Room details and features"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-h-24"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <input
                                    type="text"
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    value={formData.imageURL}
                                    onChange={(e) => setFormData({ ...formData, imageURL: e.target.value })}
                                />
                            </div>
                            {console.log(formData.imageURL)}

                            <div className="mb-6">
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.availability}
                                        onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
                                        className="rounded text-blue-600 focus:ring-blue-500 h-5 w-5"
                                    />
                                    <span className="ml-2 text-gray-700">Available</span>
                                </label>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    {isEditing ? 'Update Room' : 'Create Room'}
                                </button>
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 bg-gray-100 text-gray-800 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Rooms List Section - Takes 3/5 of the screen on large displays */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-lg p-6 h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Rooms List</h2>
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {rooms.length} {rooms.length === 1 ? 'Room' : 'Rooms'}
                            </span>
                        </div>

                        {rooms.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                </svg>
                                <p>No rooms available. Create your first room!</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                                {rooms.map(room => (
                                    <div key={room.id} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-md">
                                        {room.imageURL && (
                                            <div className="h-40 overflow-hidden">
                                                <img
                                                    src={room.imageURL}
                                                    alt={room.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = "/api/placeholder/400/200";
                                                        e.target.alt = "Image not available";
                                                    }}
                                                />
                                            </div>
                                        )}

                                        <div className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-800">{room.name}</h3>
                                                    <div className="flex items-center text-gray-600 text-sm mt-1">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                        </svg>
                                                        {room.location.replace("_", ", ")}
                                                    </div>

                                                    <div className="flex items-center text-sm mt-2">
                                                        <svg className="w-4 h-4 mr-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                                        </svg>
                                                        <span>Capacity: {room.capacity}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${room.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {room.availability ? 'Available' : 'Unavailable'}
                                                    </span>

                                                    <button
                                                        onClick={() => {
                                                            setFormData(room);
                                                            setIsEditing(true);
                                                            // Scroll to form
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                        className="mt-3 text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                        </svg>
                                                        Edit
                                                    </button>
                                                </div>
                                            </div>

                                            {room.description && (
                                                <div className="mt-3 text-sm text-gray-600 border-t border-gray-200 pt-3">
                                                    {room.description.length > 100
                                                        ? `${room.description.substring(0, 100)}...`
                                                        : room.description
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Rooms;