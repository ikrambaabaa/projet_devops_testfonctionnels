function Header({ title, description }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
      }}
    >
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <button
        style={{
          background: "#7c3aed",
          color: "white",
          border: "none",
          padding: "12px 18px",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        + Nouveau Projet
      </button>
    </div>
  );
}

export default Header;