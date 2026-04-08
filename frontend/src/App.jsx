// ----- IMPORTS ----- //
import { Outlet } from "react-router-dom";
import Header from "./common/Header";
import "./App.css";


function App() {
  return (
    <div className="appContainer">
      <Header />
      <main className="mainContent">
        <Outlet />
      </main>
    </div>
  );
}

export default App;