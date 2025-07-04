import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Auth from './Pages/Auth';
import Events from './Pages/Events';
import Booking from './Pages/Booking';
import NavigationBar from './Components/NavigationBar';


const App = () => {
  return (
    <BrowserRouter>
      <NavigationBar />
      <Routes>
        <Route path="/" element={<Navigate to="/auth" />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/events" element={<Events />} />
        <Route path="/bookings" element={<Booking />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
