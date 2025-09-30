import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { store } from "./redux/store.ts";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.tsx";

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <App />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  </Provider>
);
