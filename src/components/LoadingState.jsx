import React from "react";
import "./LoadingState.css";

/**
 * Компонент skeleton loading state
 */
const LoadingState = () => {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="header-icon skeleton-icon"></div>
          <div className="header-text">
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-subtitle"></div>
          </div>
        </div>
      </header>

      <div className="tabs-container">
        <div className="skeleton skeleton-tab"></div>
        <div className="skeleton skeleton-tab"></div>
      </div>

      <div className="balance-cards">
        <div className="balance-card">
          <div className="balance-card-header">
            <div className="skeleton skeleton-icon-small"></div>
            <div className="skeleton skeleton-text"></div>
          </div>
          <div className="skeleton skeleton-amount"></div>
        </div>
        <div className="balance-card">
          <div className="balance-card-header">
            <div className="skeleton skeleton-icon-small"></div>
            <div className="skeleton skeleton-text"></div>
          </div>
          <div className="skeleton skeleton-amount"></div>
          <div className="skeleton skeleton-trend"></div>
        </div>
      </div>

      <div className="skeleton skeleton-button"></div>

      <div className="days-section">
        <div className="skeleton skeleton-heading"></div>
        <div className="days-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="day-card-compact skeleton-card">
              <div className="skeleton skeleton-card-header"></div>
              <div className="skeleton skeleton-card-body"></div>
              <div className="skeleton skeleton-card-footer"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
