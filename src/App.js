import React, { useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./assets/App.css";
import Modal from "react-modal";
import Swal from "sweetalert2";

// Hooks
import { useBalance } from "./hooks/useBalance";

// Pages
import MainPage from "./pages/MainPage";
import SettingsPage from "./pages/SettingsPage";
import DoctorSelectionPage from "./pages/DoctorSelectionPage";

// Route Guards
import ProtectedRoute from "./routes/ProtectedRoute";
import DoctorGuard from "./routes/DoctorGuard";

// Utils
import { SWAL_CONFIG } from "./utils/constants";

// Встановлюю root для accessibility
Modal.setAppElement("#root");

function App() {
  // State для вибору лікаря
  const [selectedDoctor, setSelectedDoctor] = useState(() => {
    return localStorage.getItem("selectedDoctor") || null;
  });

  // Hooks для завантаження балансів після зміни налаштувань
  const personnelBalance = useBalance("personnel");
  const operationalBalance = useBalance("operational");

  // Обробник вибору лікаря
  const handleDoctorSelect = useCallback((doctor) => {
    setSelectedDoctor(doctor);
    localStorage.setItem("selectedDoctor", doctor);
  }, []);

  // Обробник виходу
  const handleLogout = useCallback(() => {
    Swal.fire({
      title: "Вийти з системи?",
      text: "Ви впевнені, що хочете вийти?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
      cancelButtonColor: SWAL_CONFIG.cancelButtonColor,
      confirmButtonText: "Так, вийти",
      cancelButtonText: "Скасувати",
    }).then((result) => {
      if (result.isConfirmed) {
        setSelectedDoctor(null);
        localStorage.removeItem("selectedDoctor");
        Swal.fire({
          icon: "success",
          title: "До побачення!",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  }, []);

  // Обробник оновлення налаштувань
  const handleSettingsUpdate = useCallback(() => {
    // Перезавантажуємо обидва баланси
    personnelBalance.loadBalance();
    operationalBalance.loadBalance();
  }, [personnelBalance, operationalBalance]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Сторінка вибору лікаря */}
        <Route
          path="/doctor-selection"
          element={
            <DoctorGuard selectedDoctor={selectedDoctor}>
              <DoctorSelectionPage onDoctorSelect={handleDoctorSelect} />
            </DoctorGuard>
          }
        />

        {/* Головна сторінка (захищена) */}
        <Route
          path="/"
          element={
            <ProtectedRoute selectedDoctor={selectedDoctor}>
              <MainPage
                selectedDoctor={selectedDoctor}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />

        {/* Сторінка налаштувань (захищена) */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute selectedDoctor={selectedDoctor}>
              <SettingsPage onSettingsUpdate={handleSettingsUpdate} />
            </ProtectedRoute>
          }
        />

        {/* Редирект на головну для невідомих роутів */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
