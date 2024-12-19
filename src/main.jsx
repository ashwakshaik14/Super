import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DashboardPage from "./routes/dashboard";
import ErrorPage from "./routes/404";
import LoginPage from "./routes/login";
import Categories from "./routes/categories";
import EntertainmentPage from "./routes/entertainment";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/categories",
    element: <Categories />,
  },
  {
    path: "/entertainment",
    element: <EntertainmentPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
