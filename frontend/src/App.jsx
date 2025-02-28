import react from "react"
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import Login from "./pages/Login"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import Patients from "./pages/Pacientes/Patients"
import CitasPage from "./pages/Citas"
import DetailCita from "./pages/Citas/DetailCita"
import PatientsProfile from "./pages/Pacientes/PatientsProfile"
import Workers from "./pages/Workers/Workers"
import WorkersProfile from "./pages/Workers/WorkersProfile"
import Actividades from "./pages/Actividades/Actividades"
import ActividadesProfile from "./pages/Actividades/ActividadesProfile"
import Ajustes from "./pages/Ajustes"
import FinanzasPage from "./pages/Finanzas"
import ProtectedRoute from "./components/ProtectedRoute"
import Navbar from "./components/Navbar"
import Documentacion from "./pages/Documentacion"

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <ConditionalNavbar/>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/" element={
            <ProtectedRoute >
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="pacientes/" element={
          <ProtectedRoute>
            <Patients />
          </ProtectedRoute>
        }
        />
        <Route path="pacientes/:id" element={
          <ProtectedRoute>
            <PatientsProfile />
          </ProtectedRoute>
        }
        />
        <Route path="citas/" element={
          <ProtectedRoute>
            <CitasPage/>
          </ProtectedRoute>
        }
        />
        <Route path="citas/:id" element={
          <ProtectedRoute>
            <DetailCita/>
          </ProtectedRoute>
        }
        />
        <Route path="workers/" element={
          <ProtectedRoute>
            <Workers />
          </ProtectedRoute>
        }
        />
        <Route path="workers/:id" element={
          <ProtectedRoute>
            <WorkersProfile />
          </ProtectedRoute>
        }
        />
        <Route path="actividades/" element={
          <ProtectedRoute>
            <Actividades />
          </ProtectedRoute>
        }
        />
        <Route path="actividades/:id" element={
          <ProtectedRoute>
            <ActividadesProfile />
          </ProtectedRoute>
        }
        />
        <Route path="ajustes/" element={
          <ProtectedRoute>
            <Ajustes />
          </ProtectedRoute>
        }
        />
        <Route path="finanzas/" element={
          <ProtectedRoute>
            <FinanzasPage/>
          </ProtectedRoute>
        }
        />
        <Route path="documentacion/" element={
          <ProtectedRoute>
            <Documentacion/>
          </ProtectedRoute>
        }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

function ConditionalNavbar() {
  const location = useLocation();

  const noNavbarRoutes = ["/login"];

  return !noNavbarRoutes.includes(location.pathname) ? <Navbar /> : null;

}

export default App