import React, { useState } from "react";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import "./DoctorSelection.css";

const DOCTORS = [
  "Заброварна Т.М.",
  "Герега С.Р.",
  "Гудловська М.А.",
  "Кожемяченко В.С.",
  "Коротіна Х.В.",
  "Левків В.А.",
  "Линда Б.Л.",
  "Раба Б.М.",
  "Семенюк О.О.",
  "Чорній Д.І.",
];

/**
 * Компонент вибору лікаря
 * @param {function} onDoctorSelect - Callback при виборі лікаря
 */
const DoctorSelection = ({ onDoctorSelect }) => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [hoveredDoctor, setHoveredDoctor] = useState(null);

  const handleDoctorClick = (doctor) => {
    setSelectedDoctor(doctor);
    // Додаємо невелику затримку для анімації
    setTimeout(() => {
      onDoctorSelect(doctor);
    }, 300);
  };

  return (
    <div className="doctor-selection-container">
      <div className="background-decorations">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>

      <div className="doctor-selection-card">
        <div className="card-decoration"></div>

        <div className="doctor-selection-header">
          <div className="header-icon-wrapper">
            <PersonIcon className="header-icon" />
            <div className="icon-glow"></div>
          </div>
          <h1>Оберіть лікаря</h1>
          <p>Виберіть ваше ім'я зі списку для входу в систему</p>
          <div className="header-divider"></div>
        </div>

        <div className="doctors-grid">
          {DOCTORS.map((doctor) => (
            <button
              key={doctor}
              className={`doctor-card ${selectedDoctor === doctor ? "selected" : ""} ${hoveredDoctor === doctor ? "hovered" : ""}`}
              onClick={() => handleDoctorClick(doctor)}
              onMouseEnter={() => setHoveredDoctor(doctor)}
              onMouseLeave={() => setHoveredDoctor(null)}
            >
              <div className="doctor-avatar">
                <PersonIcon className="avatar-icon" />
              </div>
              <div className="doctor-name">{doctor}</div>
              {selectedDoctor === doctor && (
                <CheckCircleIcon className="check-icon" />
              )}
            </button>
          ))}
        </div>

        <div className="doctor-selection-footer">
          <div className="footer-icon">🏥</div>
          <p className="footer-title">Система обліку медичного закладу</p>
          <p className="footer-subtitle">Безпечно • Швидко • Надійно</p>
        </div>
      </div>
    </div>
  );
};

export default DoctorSelection;
