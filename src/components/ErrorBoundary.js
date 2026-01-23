import React from "react";
import Button from "@mui/material/Button";
import RefreshIcon from "@mui/icons-material/Refresh";

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
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
              sx={{
                padding: "12px 32px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                fontSize: "1em",
                fontWeight: "600",
                borderRadius: "12px",
                textTransform: "none",
                boxShadow: "0 4px 6px -1px rgba(99, 102, 241, 0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #5568d3 0%, #653a8b 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 16px -4px rgba(99, 102, 241, 0.4)",
                },
              }}
            >
              Оновити сторінку
            </Button>
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
