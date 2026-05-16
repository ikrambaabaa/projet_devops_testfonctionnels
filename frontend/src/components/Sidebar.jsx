function Sidebar() {

  const menus = [
    "Dashboard",
    "Projets",
    "Pipelines",
    "Exécutions",
    "Rapports",
    "Paramètres",
  ];

  return (
    <div
      style={{
        width: "260px",
        background: "#0f172a",
        color: "white",
        minHeight: "100vh",
        padding: "25px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "4px 0 12px rgba(0,0,0,0.1)",
      }}
    >
      {/* TOP */}
      <div>

        {/* LOGO */}
        <div
          style={{
            marginBottom: "50px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "700",
            }}
          >
            QA AI Platform
          </h2>

          <p
            style={{
              color: "#94a3b8",
              marginTop: "8px",
              fontSize: "14px",
            }}
          >
            Smart QA Automation
          </p>
        </div>

        {/* MENU */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {menus.map((menu, index) => (

            <div
              key={index}
              style={{
                padding:
                  menu === "Projets"
                    ? "14px 18px"
                    : "12px 18px",

                background:
                  menu === "Projets"
                    ? "#2563eb"
                    : "transparent",

                borderRadius: "12px",

                cursor: "pointer",

                fontWeight:
                  menu === "Projets"
                    ? "600"
                    : "400",

                transition: "0.3s",
              }}
            >
              {menu}
            </div>

          ))}
        </div>

      </div>

      {/* USER CARD */}
      <div
        style={{
          background: "#1e293b",
          padding: "15px",
          borderRadius: "14px",
        }}
      >
        <h4 style={{ margin: 0 }}>
          QA Engineer
        </h4>

        <p
          style={{
            marginTop: "6px",
            color: "#94a3b8",
            fontSize: "14px",
          }}
        >
          admin@qa-ai.com
        </p>
      </div>
    </div>
  );
}

export default Sidebar;