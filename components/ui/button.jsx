// /components/ui/button.jsx
export function Button({ children, ...props }) {
    return (
      <button
        {...props}
        style={{
          padding: "8px 16px",
          backgroundColor: "#4F46E5",
          color: "#fff",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        {children}
      </button>
    );
  }
  