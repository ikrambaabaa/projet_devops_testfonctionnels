import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function ProjectsPage({ onOpenProject }) {

  const [showModal, setShowModal] = useState(false);

  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);

  const [newProject, setNewProject] = useState({

    name: "",

    description: "",

    type: "",

    status: "Actif",
  });


  // =========================
  // LOAD PROJECTS
  // =========================

  const loadProjects = () => {

    fetch(
      "http://127.0.0.1:8000/api/projects"
    )

      .then((res) => res.json())

      .then((data) => {

        setProjects(data.projects || []);

        setLoading(false);

      })

      .catch((err) => {

        console.log(err);

        setLoading(false);

      });
  };


  useEffect(() => {

    loadProjects();

  }, []);


  // =========================
  // CREATE PROJECT
  // =========================

  const createProject = async () => {

    try {

      const response = await fetch(

        "http://127.0.0.1:8000/api/projects",

        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            name:
              newProject.name,

            description:
              newProject.description,

            stack:
              newProject.type,

            status:
              newProject.status,
          }),
        }
      );

      const data = await response.json();

      console.log(data);

      // RELOAD PROJECTS
      loadProjects();

      // CLOSE MODAL
      setShowModal(false);

      // RESET FORM
      setNewProject({

        name: "",

        description: "",

        type: "",

        status: "Actif",
      });

    } catch (err) {

      console.log(err);
    }
  };


  if (loading) {

    return <h2>Chargement...</h2>;
  }


  return (

    <div
      style={{
        display: "flex",
        background: "#f1f5f9",
        minHeight: "100vh",
      }}
    >

      <Sidebar />

      <div
        style={{
          flex: 1,
          padding: "30px",
        }}
      >

        {/* HEADER */}
        <Header
          title="Gestion Projets QA"
          description="Supervision intelligente des projets QA IA"
        />


        {/* HERO */}
        <div
          style={{
            background:
              "linear-gradient(135deg,#2563eb,#7c3aed)",

            borderRadius: "24px",

            padding: "35px",

            color: "white",

            marginBottom: "30px",
          }}
        >

          <h2 style={{ margin: 0 }}>
            QA AI Projects Dashboard
          </h2>

          <p
            style={{
              marginTop: "12px",
              opacity: 0.85,
            }}
          >
            Gestion centralisée des projets QA IA.
          </p>

        </div>


        {/* FILTERS */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "25px",
            gap: "20px",
          }}
        >

          <input
            type="text"
            placeholder="Rechercher projet..."
            style={{
              flex: 1,
              padding: "15px",
              borderRadius: "14px",
              border: "1px solid #cbd5e1",
              outline: "none",
              background: "white",
            }}
          />

          <button
            onClick={() => setShowModal(true)}
            style={{
              background:
                "linear-gradient(135deg,#2563eb,#7c3aed)",

              color: "white",

              border: "none",

              padding: "14px 22px",

              borderRadius: "14px",

              cursor: "pointer",

              fontWeight: "700",
            }}
          >
            + Nouveau Projet
          </button>

        </div>


        {/* PROJECT GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "25px",
          }}
        >

          {projects.map((project) => (

            <div
              key={project.id}
              style={{
                background: "white",
                borderRadius: "22px",
                padding: "25px",
                boxShadow:
                  "0 4px 14px rgba(0,0,0,0.05)",
              }}
            >

              {/* TOP */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >

                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "18px",
                    background: "#dbeafe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "26px",
                  }}
                >
                  🚀
                </div>

                <span
                  style={{
                    background:
                      project.status === "Actif"
                        ? "#dcfce7"
                        : "#dbeafe",

                    color:
                      project.status === "Actif"
                        ? "#166534"
                        : "#1d4ed8",

                    padding: "8px 14px",

                    borderRadius: "20px",

                    fontWeight: "600",
                  }}
                >
                  {project.status}
                </span>

              </div>


              {/* INFO */}
              <div style={{ marginTop: "25px" }}>

                <h2 style={{ margin: 0 }}>
                  {project.name}
                </h2>

                <p
                  style={{
                    color: "#64748b",
                    marginTop: "10px",
                  }}
                >
                  {project.stack}
                </p>

              </div>


              {/* STATS */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3,1fr)",

                  gap: "15px",

                  marginTop: "25px",
                }}
              >

                <div style={statCard}>

                  <h3>
                    {project.tests || 0}
                  </h3>

                  <p style={statLabel}>
                    Tests
                  </p>

                </div>

                <div style={statCard}>

                  <h3>
                    {project.coverage || "0%"}
                  </h3>

                  <p style={statLabel}>
                    Coverage
                  </p>

                </div>

                <div style={statCard}>

                  <h3>
                    {project.pipelines || 0}
                  </h3>

                  <p style={statLabel}>
                    Pipelines
                  </p>

                </div>

              </div>


              {/* ACTIONS */}
              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  marginTop: "30px",
                }}
              >

                <button
                  onClick={() =>
                    onOpenProject(project)
                  }
                  style={{
                    flex: 1,
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    padding: "14px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Ouvrir Projet
                </button>

              </div>

            </div>

          ))}

        </div>


        {/* MODAL */}
        {
          showModal && (

            <div style={modalOverlay}>

              <div style={modalBox}>

                <h2>
                  Nouveau Projet
                </h2>

                <div style={{ marginTop: "25px" }}>

                  <label style={labelStyle}>
                    Nom Projet
                  </label>

                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) =>
                      setNewProject({

                        ...newProject,

                        name: e.target.value,
                      })
                    }
                    placeholder="Banking Platform"
                    style={inputStyle}
                  />

                </div>


                <div style={{ marginTop: "20px" }}>

                  <label style={labelStyle}>
                    Type Projet
                  </label>

                  <input
                    type="text"
                    value={newProject.type}
                    onChange={(e) =>
                      setNewProject({

                        ...newProject,

                        type: e.target.value,
                      })
                    }
                    placeholder="React + FastAPI"
                    style={inputStyle}
                  />

                </div>


                <div style={{ marginTop: "20px" }}>

                  <label style={labelStyle}>
                    Description
                  </label>

                  <textarea
                    rows="5"
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({

                        ...newProject,

                        description:
                          e.target.value,
                      })
                    }
                    placeholder="Description projet..."
                    style={textareaStyle}
                  ></textarea>

                </div>


                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "15px",
                    marginTop: "30px",
                  }}
                >

                  <button
                    onClick={() =>
                      setShowModal(false)
                    }
                    style={cancelBtn}
                  >
                    Annuler
                  </button>

                  <button
                    onClick={createProject}
                    style={createBtn}
                  >
                    Créer Projet
                  </button>

                </div>

              </div>

            </div>

          )
        }

      </div>

    </div>
  );
}


/* STYLES */

const statCard = {
  background: "#f8fafc",
  padding: "15px",
  borderRadius: "14px",
  textAlign: "center",
};

const statLabel = {
  color: "#64748b",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};

const modalBox = {
  width: "500px",
  background: "white",
  borderRadius: "24px",
  padding: "35px",
};

const labelStyle = {
  fontWeight: "600",
};

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginTop: "10px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  outline: "none",
};

const textareaStyle = {
  width: "100%",
  marginTop: "10px",
  borderRadius: "14px",
  border: "1px solid #cbd5e1",
  padding: "15px",
  resize: "none",
  outline: "none",
};

const cancelBtn = {
  background: "#e2e8f0",
  border: "none",
  padding: "14px 20px",
  borderRadius: "12px",
  cursor: "pointer",
};

const createBtn = {
  background:
    "linear-gradient(135deg,#2563eb,#7c3aed)",

  color: "white",

  border: "none",

  padding: "14px 20px",

  borderRadius: "12px",

  cursor: "pointer",
};

export default ProjectsPage;