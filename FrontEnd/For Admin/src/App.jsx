import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Rooms from './pages/Rooms';
import Reservations from './pages/Reservations';
import Feedbacks from './pages/Feedbacks';
import Layout from './components/Layout';

function App() {
    const isAuthenticated = !!localStorage.getItem('token');

    return (
        <BrowserRouter>
            <Toaster position="top-right" />
            <Routes>
                <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
                <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/rooms" element={<Rooms />} />
                    <Route path="/reservations" element={<Reservations />} />
                    <Route path="/feedbacks" element={<Feedbacks />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
