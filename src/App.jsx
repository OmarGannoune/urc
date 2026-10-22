import './App.css';
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import {Login} from "./user/Login";
import {Register} from "./user/Register";
import {Home} from "./user/Home";

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/" element={<Home/>}/>
          <Route path="*" element={<Navigate to="/"/>}/>
        </Routes>
      </BrowserRouter>
  );
}

export default App;
