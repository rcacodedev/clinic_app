import react from "react"
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import Login from "./pages/Login"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import Patients from "./pages/Pacientes/Patients"
import CitasPage from "./pages/Citas/Citas"
import DetailCita from "./pages/Citas/DetailCita"
import PatientsProfile from "./pages/Pacientes/PatientsProfile"
import Workers from "./pages/Workers/Workers"
import WorkersProfile from "./pages/Workers/WorkersProfile"
import Actividades from "./pages/Actividades/Actividades"
import ActividadesProfile from "./pages/Actividades/ActividadesProfile"
import Ajustes from "./pages/Ajustes"
import FinanzasPage from "./pages/Finanzas"
import Formacion from "./pages/Formacion/Formacion"
import FormacionDetail from "./pages/Formacion/FormacionDetail"
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
        <Route path="api/pacientes/" element={
          <ProtectedRoute>
            <Patients />
          </ProtectedRoute>
        }
        />
        <Route path="api/pacientes/:id" element={
          <ProtectedRoute>
            <PatientsProfile />
          </ProtectedRoute>
        }
        />
        <Route path="api/citas/" element={
          <ProtectedRoute>
            <CitasPage/>
          </ProtectedRoute>
        }
        />
        <Route path="api/citas/:id" element={
          <ProtectedRoute>
            <DetailCita/>
          </ProtectedRoute>
        }
        />
        <Route path="api/workers/" element={
          <ProtectedRoute>
            <Workers />
          </ProtectedRoute>
        }
        />
        <Route path="api/workers/:id" element={
          <ProtectedRoute>
            <WorkersProfile />
          </ProtectedRoute>
        }
        />
        <Route path="api/actividades/" element={
          <ProtectedRoute>
            <Actividades />
          </ProtectedRoute>
        }
        />
        <Route path="api/actividades/:id" element={
          <ProtectedRoute>
            <ActividadesProfile />
          </ProtectedRoute>
        }
        />
        <Route path="api/formacion/" element={
          <ProtectedRoute>
            <Formacion />
          </ProtectedRoute>
        }
        />
        <Route path="api/formacion/:id" element={
          <ProtectedRoute>
            <FormacionDetail />
          </ProtectedRoute>
        }
        />
        <Route path="api/ajustes" element={
          <ProtectedRoute>
            <Ajustes />
          </ProtectedRoute>
        }
        />
        <Route path="api/finanzas" element={
          <ProtectedRoute>
            <FinanzasPage/>
          </ProtectedRoute>
        }
        />
        <Route path="api/documentacion" element={
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