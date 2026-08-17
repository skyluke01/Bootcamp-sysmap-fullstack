import { Toaster } from "sonner";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "leaflet/dist/leaflet.css";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { ActivitiesByCategoryPage } from "./pages/ActivitiesByCategoryPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { MyActivitiesPage } from "./pages/MyActivitiesPage";
import { EditProfilePage } from "./pages/EditProfilePage";

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />

      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          path="/cadastro"
          element={<RegisterPage />}
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/minhas-atividades"
          element={
            <ProtectedRoute>
              <MyActivitiesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/perfil/editar"
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/atividades/:category"
          element={
            <ProtectedRoute>
              <ActivitiesByCategoryPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;