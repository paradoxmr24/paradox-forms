import { Route, Routes } from "react-router-dom";
import Register from "./Pages/Register";

function App() {
    return (
        <Routes>
            <Route path="/register" element={<Register />} />
        </Routes>
    );
}

export default App;
