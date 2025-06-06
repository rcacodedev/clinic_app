import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import CitasPage from "./pages/Citas/Citas";
import DetailCita from "./pages/Citas/DetailCita";
import PatientsProfile from "./pages/Pacientes/PatientsProfile";
import Workers from "./pages/Workers/Workers";
import WorkersProfile from "./pages/Workers/WorkersProfile";
import Actividades from "./pages/Actividades/Actividades";
import ActividadesProfile from "./pages/Actividades/ActividadesProfile";
import Ajustes from "./pages/Ajustes";
import Formacion from "./pages/Formacion/Formacion";
import FormacionDetail from "./pages/Formacion/FormacionDetail";
import FacturasPage from "./pages/Facturas/Facturacion";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Documentacion from "./pages/Documentacion";
import ForgotPassword from "./components/Login/ForgotPassword";
import ResetPassword from "./components/Login/ResetPassword";
import Pacientes from "./pages/Pacientes/Pacientes";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function App() {
  return (
    <>
      <BrowserRouter>
        <ConditionalNavbar />

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/reset-password/:uid/:token"
            element={<ResetPassword />}
          />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<NotFound />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pacientes/"
            element={
              <ProtectedRoute>
                <Pacientes />
              </ProtectedRoute>
            }
          />
          <Route
            path="pacientes/:id"
            element={
              <ProtectedRoute>
                <PatientsProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="api/citas/"
            element={
              <ProtectedRoute>
                <CitasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="api/citas/:id"
            element={
              <ProtectedRoute>
                <DetailCita />
              </ProtectedRoute>
            }
          />
          <Route
            path="api/workers/"
            element={
              <ProtectedRoute>
                <Workers />
              </ProtectedRoute>
            }
          />
          <Route
            path="api/workers/:id"
            element={
              <ProtectedRoute>
                <WorkersProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/actividades/"
            element={
              <ProtectedRoute>
                <Actividades />
              </ProtectedRoute>
            }
          />
          <Route
            path="/actividades/:id"
            element={
              <ProtectedRoute>
                <ActividadesProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="api/formacion/"
            element={
              <ProtectedRoute>
                <Formacion />
              </ProtectedRoute>
            }
          />
          <Route
            path="api/formacion/:id"
            element={
              <ProtectedRoute>
                <FormacionDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="api/facturacion/"
            element={
              <ProtectedRoute>
                <FacturasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="api/ajustes"
            element={
              <ProtectedRoute>
                <Ajustes />
              </ProtectedRoute>
            }
          />
          <Route
            path="api/documentacion"
            element={
              <ProtectedRoute>
                <Documentacion />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

// ✅ Aquí decides en qué rutas **NO** quieres mostrar la Navbar
function ConditionalNavbar() {
  const location = useLocation();

  const noNavbarRoutes = [
    "/login",
    "/logout",
    "/forgot-password",
    "/reset-password", // si tienes esta ruta también
  ];

  const shouldHideNavbar = noNavbarRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  return !shouldHideNavbar ? <Navbar /> : null;
}

export default App;
