import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DoctorSelection from "../components/DoctorSelection";

/**
 * Сторінка вибору лікаря з роутінгом
 * @param {function} onDoctorSelect - Callback після вибору лікаря
 */
const DoctorSelectionPage = ({ onDoctorSelect }) => {
  const navigate = useNavigate();

  const handleDoctorSelect = useCallback(
    (doctor) => {
      onDoctorSelect(doctor);
      // Перенаправляємо на головну сторінку після вибору
      navigate("/", { replace: true });
    },
    [onDoctorSelect, navigate],
  );

  return <DoctorSelection onDoctorSelect={handleDoctorSelect} />;
};

export default DoctorSelectionPage;
