import { BrowserRouter, Routes, Route } from "react-router-dom";
import InvitationScreen from './Components/invitationpage';
import FaceAuth from './Components/FaceAuth';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';
import ExamScreen from "./Components/ExamScreen";

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex" }}>
        {/* Sidebar always visible */}
        <Sidebar />

        <div style={{ flex: 1,backgroundColor: "#E8E8E8"}}>
          {/* Navbar always visible */}
          <Navbar />

          {/* Page Content */}
          <Routes>
            <Route path="/" element={<InvitationScreen />} />
            <Route path="/face-auth" element={<FaceAuth />} />
            <Route path="/exam-screen" element={<ExamScreen/>} />
            {/* <Route path="/mock-interview" element={<MockInterview />} /> */}
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
