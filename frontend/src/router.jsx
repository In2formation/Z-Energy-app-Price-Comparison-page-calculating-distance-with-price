// ----- IMPORTS ----- //
import { createBrowserRouter } from "react-router-dom";
import App from "./App";

// Central router config for the app
// Each developer should add/update their own screen route here if needed

// Pages
import Home from "./pages/home/Home";
import FindAStation from "./pages/findAStation/FindAStation";
import GasBuddy from "./pages/gasBuddy/GasBuddy";
import GetDirections from "./pages/getDirections/GetDirections";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // shared layout
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "find-a-station",
        element: <FindAStation />,
      },
      {
        path: "compare-prices",
        element: <GasBuddy />,
      },
      {
        path: "get-directions",
        element: <GetDirections />,
      },
    ],
  },
]);

export default router;