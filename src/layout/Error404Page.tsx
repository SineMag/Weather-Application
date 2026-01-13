export default function Error404Page() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 560,
          width: "100%",
          background: "white",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ fontSize: 36, marginBottom: 8 }}>404 — Page Not Found</h1>
        <p style={{ color: "#555", marginBottom: 20 }}>
          The page you are looking for doesn’t exist or may have been moved.
        </p>
        <div>
          <a
            href="/"
            style={{
              display: "inline-block",
              background: "#667eea",
              color: "white",
              textDecoration: "none",
              padding: "10px 16px",
              borderRadius: 10,
            }}
          >
            Go back Home
          </a>
        </div>
      </div>
    </div>
  );
}
