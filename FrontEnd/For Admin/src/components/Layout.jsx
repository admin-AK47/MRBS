import { Outlet, NavLink, useNavigate } from 'react-router-dom';

function Layout() {

    const navigate = useNavigate();

    const handleLogout = () => {
        try {
            localStorage.removeItem('token');
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    return (
        <div className="flex h-screen">
            <nav className="w-55 bg-[#1F0270] text-white p-4">
                <h1 className="text-xl font-bold mb-8">Admin Panel</h1>
                <NavLink to="/" className={({ isActive }) =>
                    `block py-2 px-4 mb-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-gray-200 hover:text-black'}`}>
                    Dashboard
                </NavLink>
                <NavLink to="/users" className={({ isActive }) =>
                    `block py-2 px-4 mb-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-gray-200 hover:text-black'}`}>
                    Users
                </NavLink>
                <NavLink to="/rooms" className={({ isActive }) =>
                    `block py-2 px-4 mb-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-gray-200 hover:text-black'}`}>
                    Rooms
                </NavLink>
                <NavLink to="/reservations" className={({ isActive }) =>
                    `block py-2 px-4 mb-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-gray-200 hover:text-black'}`}>
                    Reservations
                </NavLink>
                <NavLink to="/feedbacks" className={({ isActive }) =>
                    `block py-2 px-4 mb-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-gray-200 hover:text-black'}`}>
                    Feedbacks
                </NavLink>
                <NavLink
                    onClick={handleLogout}
                    className={({ isActive }) =>
                        `block py-2 px-4 mb-2 rounded ${isActive ? 'bg-red-600' : 'hover:bg-gray-200 hover:text-black'}`}>
                    Logout
                </NavLink>
            </nav>
            <main className="flex-1 p-8 bg-[#84F4DC] overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;
