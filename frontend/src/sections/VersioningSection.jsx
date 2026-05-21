import { useEffect, useState } from "react";

function VersioningSection({
  projectId
}) {

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [versions, setVersions] =
    useState([]);

  const [logs, setLogs] =
    useState([]);

  const [modules, setModules] =
    useState([]);

  const [showReadyOnly, setShowReadyOnly] =
    useState(false);

  const [stats, setStats] =
    useState({

      versions: 0,

      releases: 0,

      stability: 0,
    });


  // =========================
  // LOAD VERSIONING
  // =========================

  const loadVersioning =
    () => {

      setLoading(true);

      fetch(
        `http://127.0.0.1:8000/api/projects/${projectId}/versioning`
      )

        .then(async (res) => {

          if (!res.ok) {

            throw new Error(
              "Erreur API Versioning"
            );
          }

          return res.json();
        })

        .then((data) => {

          setVersions(
            data.versions || []
          );

          setLogs(
            data.logs || []
          );

          setModules(
            data.modules || []
          );

          setStats({

            versions:
              data.total_versions || 0,

            releases:
              data.total_releases || 0,

            stability:
              data.stability || 0,
          });

          setLoading(false);
        })

        .catch((err) => {

          console.log(err);

          setError(
            "Erreur chargement versioning"
          );

          setLoading(false);
        });
    };


  useEffect(() => {

    loadVersioning();

  }, [projectId]);


  // =========================
  // CREATE VERSION
  // =========================

  const createVersion =
    async () => {

      try {

        await fetch(

          `http://127.0.0.1:8000/api/projects/${projectId}/versioning/create`,

          {
            method: "POST",
          }
        );

        alert(
          "Nouvelle version créée"
        );

        loadVersioning();

      } catch (err) {

        console.log(err);
      }
    };


  // =========================
  // DELETE VERSION
  // =========================

  const deleteVersion =
    async (id) => {

      try {

        await fetch(

          `http://127.0.0.1:8000/api/version/${id}`,

          {
            method: "DELETE",
          }
        );

        loadVersioning();

      } catch (err) {

        console.log(err);
      }
    };


  // =========================
  // RUN QA
  // =========================
  const runQA =
  async (versionId) => {

    try {

      const response =
        await fetch(

          `http://127.0.0.1:8000/api/projects/${projectId}/version/${versionId}/run`,

          {
            method: "POST",
          }
        );

      const data =
        await response.json();

      alert(data.message);

    } catch (err) {

      console.log(err);
    }
  };


  // =========================
  // FILTER MODULES
  // =========================

  const displayedModules =

    showReadyOnly

      ? modules.filter(

          (m) =>
            m.status === "Ready"
        )

      : modules;


  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (

      <div
        style={{
          padding: "40px",
        }}
      >
        <h2>
          Chargement Versioning...
        </h2>
      </div>
    );
  }


  // =========================
  // ERROR
  // =========================

  if (error) {

    return (

      <div
        style={{
          background: "#fee2e2",
          color: "#991b1b",
          padding: "25px",
          borderRadius: "18px",
        }}
      >
        {error}
      </div>
    );
  }


  return (

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "30px",
      }}
    >

      {/* HERO */}
      <div
        style={{
          background:
            "linear-gradient(135deg,#0f172a,#2563eb)",

          borderRadius: "22px",

          padding: "35px",

          color: "white",
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",

            alignItems: "center",
          }}
        >

          <div>

            <h2
              style={{
                margin: 0,
                fontSize: "30px",
              }}
            >
              QA Release Center
            </h2>

            <p
              style={{
                marginTop: "10px",
                opacity: 0.85,
              }}
            >
              Gestion avancée des releases QA
            </p>

          </div>


          <button
            onClick={createVersion}
            style={createBtn}
          >
            + Nouvelle Version
          </button>

        </div>


        {/* STATS */}
        <div
          style={{
            display: "flex",
            gap: "40px",
            marginTop: "35px",
          }}
        >

          <div>

            <h1 style={{ margin: 0 }}>
              {
                stats.versions
              }
            </h1>

            <p>Versions</p>

          </div>


          <div>

            <h1 style={{ margin: 0 }}>
              {
                stats.releases
              }
            </h1>

            <p>Releases</p>

          </div>


          <div>

            <h1 style={{ margin: 0 }}>
              {
                stats.stability
              }%
            </h1>

            <p>Stabilité</p>

          </div>

        </div>

      </div>


      {/* VERSION TABLE */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Historique Versions
            </h3>

            <p style={sectionDesc}>
              Releases QA du projet
            </p>

          </div>

        </div>


        <table width="100%">

          <thead>

            <tr
              style={{
                textAlign: "left",
              }}
            >
              <th>Version</th>
              <th>Type</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>

          </thead>

          <tbody>

            {

              versions.length > 0

                ? versions.map(

                    (
                      version,
                      index
                    ) => (

                      <tr key={index}>

                        <td>
                          {
                            version.version
                          }
                        </td>

                        <td>
                          {
                            version.type
                          }
                        </td>

                        <td>
                          {
                            version.date
                          }
                        </td>

                        <td>

                          <span
                            style={

                              version.status ===
                              "Stable"

                                ? successBadge

                                : version.status ===
                                  "Blocked"

                                ? blockedBadge

                                : progressBadge
                            }
                          >
                            {
                              version.status
                            }
                          </span>

                        </td>

                        <td>

                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                            }}
                          >

                            <button
                              onClick={() =>
                                runQA(
                                  version.id
                                )
                              }
                              style={runBtn}
                            >
                              Run QA
                            </button>

                            <button
                              onClick={() =>
                                deleteVersion(
                                  version.id
                                )
                              }
                              style={deleteBtn}
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )

                : (

                  <tr>

                    <td colSpan="5">
                      Aucune version
                    </td>

                  </tr>
                )
            }

          </tbody>

        </table>

      </div>


      {/* CHANGELOG */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Release Notes
            </h3>

            <p style={sectionDesc}>
              Historique QA
            </p>

          </div>

        </div>


        <div
          style={{
            marginTop: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >

          {

            logs.length > 0

              ? logs.map(

                  (
                    log,
                    index
                  ) => (

                    <div
                      key={index}
                      style={logCard}
                    >
                      ✔ {log.message}
                    </div>
                  )
                )

              : (

                <div style={logCard}>
                  Aucun log disponible
                </div>
              )
          }

        </div>

      </div>


      {/* MODULES */}

      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Modules Status
            </h3>

            <p style={sectionDesc}>
              Avancement développement
            </p>

          </div>


          <button
            onClick={() =>
              setShowReadyOnly(
                !showReadyOnly
              )
            }
            style={filterBtn}
          >
            {

              showReadyOnly

                ? "Afficher Tous"

                : "Ready Only"
            }
          </button>

        </div>

        <table width="100%">

          <thead>

            <tr>

              <th>Module</th>

              <th>Status</th>

            </tr>

          </thead>

          <tbody>

            {

              displayedModules?.length > 0

                ? displayedModules?.map(

                    (
                      module,
                      index
                    ) => (

                      <tr key={index}>

                        <td>
                          {module.name}
                        </td>

                        <td>

                          <span
                            style={

                              module.status ===
                              "Ready"

                                ? successBadge

                                : module.status ===
                                  "Blocked"

                                ? blockedBadge

                                : progressBadge
                            }
                          >
                            {module.status}
                          </span>

                        </td>

                      </tr>
                    )
                  )

                : (

                  <tr>

                    <td colSpan="2">
                      Aucun module
                    </td>

                  </tr>
                )
            }

          </tbody>

        </table>

      </div>


      {/* FLOW */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Workflow QA
            </h3>

            <p style={sectionDesc}>
              Lifecycle release QA
            </p>

          </div>

        </div>


        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            marginTop: "30px",
            flexWrap: "wrap",
          }}
        >

          <div style={flowCard}>
            SFD
          </div>

          <div style={arrowStyle}>
            →
          </div>

          <div style={flowCard}>
            Tests IA
          </div>

          <div style={arrowStyle}>
            →
          </div>

          <div style={flowCard}>
            Validation QA
          </div>

          <div style={arrowStyle}>
            →
          </div>

          <div style={flowCard}>
            Modules Ready
          </div>

          <div style={arrowStyle}>
            →
          </div>

          <div style={flowCard}>
            Pipeline QA
          </div>

          <div style={arrowStyle}>
            →
          </div>

          <div style={flowCard}>
            Playwright
          </div>

        </div>

      </div>

    </div>
  );
}


/* STYLES */

const sectionCard = {
  background: "white",
  borderRadius: "20px",
  padding: "30px",
};

const sectionHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const sectionTitle = {
  margin: 0,
};

const sectionDesc = {
  marginTop: "8px",
  color: "#64748b",
};

const successBadge = {

  background: "#dcfce7",

  color: "#166534",

  padding: "6px 12px",

  borderRadius: "20px",
};

const progressBadge = {

  background: "#dbeafe",

  color: "#1d4ed8",

  padding: "6px 12px",

  borderRadius: "20px",
};

const blockedBadge = {

  background: "#fee2e2",

  color: "#991b1b",

  padding: "6px 12px",

  borderRadius: "20px",
};

const createBtn = {

  background:
    "linear-gradient(135deg,#2563eb,#7c3aed)",

  color: "white",

  border: "none",

  padding: "14px 22px",

  borderRadius: "14px",

  cursor: "pointer",

  fontWeight: "700",
};

const deleteBtn = {

  background: "#ef4444",

  color: "white",

  border: "none",

  padding: "8px 12px",

  borderRadius: "10px",

  cursor: "pointer",
};

const runBtn = {

  background: "#2563eb",

  color: "white",

  border: "none",

  padding: "8px 12px",

  borderRadius: "10px",

  cursor: "pointer",
};

const filterBtn = {

  background: "#e2e8f0",

  border: "none",

  padding: "10px 14px",

  borderRadius: "10px",

  cursor: "pointer",
};

const logCard = {

  background: "#f8fafc",

  padding: "16px",

  borderRadius: "14px",
};

const flowCard = {

  background: "#f8fafc",

  padding: "16px 24px",

  borderRadius: "14px",

  fontWeight: "600",
};

const arrowStyle = {

  fontSize: "24px",

  color: "#64748b",
};

export default VersioningSection;