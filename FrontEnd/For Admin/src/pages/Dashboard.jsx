import { useState, useEffect } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { getUsers, getRooms, getReservations, getFeedbacks } from '../services/api';
import { toast } from 'react-hot-toast';

ChartJS.register(...registerables);

function Dashboard() {
    const [stats, setStats] = useState({
        users: 0,
        rooms: 0,
        reservations: 0,
        recentFeedbacks: []
    });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('week'); // week, month, year

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [usersRes, roomsRes, reservationsRes, feedbacksRes] = await Promise.all([
                getUsers(),
                getRooms(),
                getReservations(),
                getFeedbacks()
            ]);

            setStats({
                users: usersRes.data.length,
                rooms: roomsRes.data.length,
                reservations: reservationsRes.data.length,
                recentFeedbacks: feedbacksRes.data.slice(0, 5)
            });
        } catch (error) {
            toast.error('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // Dynamic data based on selected time range
    const getReservationLabels = () => {
        switch (timeRange) {
            case 'week':
                return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            case 'month':
                return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            case 'year':
                return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            default:
                return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        }
    };

    const getReservationData = () => {
        switch (timeRange) {
            case 'week':
                return [12, 19, 15, 25, 22, 14, 10];
            case 'month':
                return [45, 60, 52, 70];
            case 'year':
                return [120, 135, 170, 190, 210, 250, 220, 230, 200, 185, 195, 240];
            default:
                return [12, 19, 15, 25, 22, 14, 10];
        }
    };

    const reservationData = {
        labels: getReservationLabels(),
        datasets: [{
            label: 'Reservations',
            data: getReservationData(),
            fill: true,
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderColor: 'rgb(99, 102, 241)',
            tension: 0.4,
            pointBackgroundColor: 'rgb(99, 102, 241)',
        }]
    };

    const roomUsageData = {
        labels: ['In Use', 'Available', 'Maintenance'],
        datasets: [{
            data: [12, 8, 3],
            backgroundColor: [
                'rgba(99, 102, 241, 0.8)',  // Indigo
                'rgba(52, 211, 153, 0.8)',  // Green
                'rgba(251, 191, 36, 0.8)'   // Yellow
            ],
            borderColor: [
                'rgb(99, 102, 241)',
                'rgb(52, 211, 153)',
                'rgb(251, 191, 36)'
            ],
            borderWidth: 1
        }]
    };

    const popularRoomsData = {
        labels: ['Conference A', 'Meeting B', 'Training C', 'Executive D', 'Brainstorm E'],
        datasets: [{
            label: 'Reservations',
            data: [65, 50, 40, 30, 20],
            backgroundColor: 'rgba(79, 70, 229, 0.8)',
            borderColor: 'rgb(79, 70, 229)',
            borderWidth: 1
        }]
    };

    const renderRatingStars = (rating) => {
        return Array.from({ length: 5 }).map((_, index) => (
            <span
                key={index}
                className={`${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            >
                ★
            </span>
        ));
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 mb-8 shadow-lg">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                        <p className="text-indigo-100 mt-1">Welcome to your meeting room management system</p>
                    </div>
                    <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                        <div className="text-black text-sm font-medium">
                            Last updated: {new Date().toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="bg-indigo-100 rounded-lg p-3">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-gray-500 font-medium">Total Users</h3>
                                <p className="text-3xl font-bold text-gray-800">{stats.users}</p>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-sm flex items-center text-green-600">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                                </svg>
                                <span>12% increase</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="bg-green-100 rounded-lg p-3">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-gray-500 font-medium">Total Rooms</h3>
                                <p className="text-3xl font-bold text-gray-800">{stats.rooms}</p>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-sm flex items-center text-green-600">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                                </svg>
                                <span>5% increase</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="bg-purple-100 rounded-lg p-3">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-gray-500 font-medium">Reservations</h3>
                                <p className="text-3xl font-bold text-gray-800">{stats.reservations}</p>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-sm flex items-center text-green-600">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                                </svg>
                                <span>18% increase</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="bg-yellow-100 rounded-lg p-3">
                                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-gray-500 font-medium">Avg. Rating</h3>
                                <p className="text-3xl font-bold text-gray-800">4.7</p>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-sm flex items-center text-green-600">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                                </svg>
                                <span>8% increase</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Reservation Trends</h3>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setTimeRange('week')}
                                    className={`px-3 py-1 text-xs rounded-full ${timeRange === 'week' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                    Week
                                </button>
                                <button
                                    onClick={() => setTimeRange('month')}
                                    className={`px-3 py-1 text-xs rounded-full ${timeRange === 'month' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                    Month
                                </button>
                                <button
                                    onClick={() => setTimeRange('year')}
                                    className={`px-3 py-1 text-xs rounded-full ${timeRange === 'year' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                    Year
                                </button>
                            </div>
                        </div>
                        <div className="h-72">
                            <Line
                                data={reservationData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: false
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            grid: {
                                                drawBorder: false,
                                            }
                                        },
                                        x: {
                                            grid: {
                                                display: false
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6">Room Usage Status</h3>
                        <div className="h-72 flex justify-center">
                            <Pie
                                data={roomUsageData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                            labels: {
                                                boxWidth: 12,
                                                padding: 20
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Popular Rooms & Recent Feedbacks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6">Most Popular Rooms</h3>
                        <div className="h-64">
                            <Bar
                                data={popularRoomsData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: false
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            grid: {
                                                drawBorder: false
                                            }
                                        },
                                        x: {
                                            grid: {
                                                display: false
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Recent Feedbacks</h3>
                            <a href="/feedbacks" className="text-indigo-600 text-sm font-medium hover:text-indigo-500">View All</a>
                        </div>
                        <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {stats.recentFeedbacks.length > 0 ? (
                                stats.recentFeedbacks.map(feedback => (
                                    <div key={feedback.id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-500">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-gray-800">{feedback.user.name}</p>
                                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                                    </svg>
                                                    {feedback.meetingRoom.name}
                                                </div>
                                            </div>
                                            <div className="flex">
                                                {renderRatingStars(feedback.rating)}
                                            </div>
                                        </div>
                                        <p className="mt-2 text-gray-700 italic">{feedback.comment}</p>
                                        <p className="mt-2 text-xs text-gray-500">
                                            {new Date(feedback.createdAt).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                    </svg>
                                    <p>No feedback data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style >{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #c7c7c7;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #a0a0a0;
                }
            `}</style>
        </div>
    );
}

export default Dashboard;