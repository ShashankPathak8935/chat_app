import "./App.css";
import SignUp from "./SignUp";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Home from "./Home";
import Chat from "./Chat";
import PrivateRoute from "./PrivateRoute"; // Import PrivateRoute

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignUp />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/navbar" element={<Navbar />}></Route>
        <Route path="/sidebar" element={<Sidebar />}></Route>
        <Route path="/chat" element={<Chat />}></Route>
        <Route path="/home"element={<PrivateRoute><Home /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
