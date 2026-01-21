import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "20px",
            background:
              "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "48px",
              borderRadius: "24px",
              maxWidth: "500px",
              textAlign: "center",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <h1
              style={{
                fontSize: "2em",
                marginBottom: "16px",
                color: "#1e293b",
                fontWeight: "700",
              }}
            >
              😔 Щось пішло не так
            </h1>
            <p
              style={{
                marginBottom: "24px",
                color: "#475569",
                fontSize: "1.1em",
              }}
            >
              Виникла неочікувана помилка. Будь ласка, оновіть сторінку.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "12px 32px",
                background: "#6366f1",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "1em",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 6px -1px rgba(99, 102, 241, 0.3)",
              }}
            >
              Оновити сторінку
            </button>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details style={{ marginTop: "24px", textAlign: "left" }}>
                <summary style={{ cursor: "pointer", color: "#6366f1" }}>
                  Деталі помилки (dev)
                </summary>
                <pre
                  style={{
                    marginTop: "12px",
                    padding: "12px",
                    background: "#f1f5f9",
                    borderRadius: "8px",
                    fontSize: "0.85em",
                    overflow: "auto",
                  }}
                >
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
