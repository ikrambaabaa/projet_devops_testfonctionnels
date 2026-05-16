import { useEffect, useState } from "react";

function ReportsSection({
  projectId
}) {

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [reports, setReports] =
    useState([]);

  const [defects, setDefects] =
    useState([]);

  const [stats, setStats] =
    useState({

      taux_reussite: 0,

      total_executions: 0,

      coverage: 0,

      total_defects: 0,

      total_pass: 0,

      total_fail: 0,

      total_pipelines: 0,
    });


  // =========================
  // LOAD REPORTS
  // =========================

  const loadReports = () => {

    setLoading(true);

    fetch(
      `http://127.0.0.1:8000/api/projects/${projectId}/reports`
    )

      .then(async (res) => {

        if (!res.ok) {

          throw new Error(
            "Erreur API Reports"
          );
        }

        return res.json();
      })

      .then((data) => {

        console.log(data);

        setReports(
          data.history || []
        );

        setDefects(
          data.defects || []
        );

        setStats({

          taux_reussite:
            data.taux_reussite || 0,

          total_executions:
            data.total_executions || 0,

          coverage:
            data.coverage || 0,

          total_defects:
            data.total_defects || 0,

          total_pass:
            data.total_pass || 0,

          total_fail:
            data.total_fail || 0,

          total_pipelines:
            data.total_pipelines || 0,
        });

        setLoading(false);
      })

      .catch((err) => {

        console.log(err);

        setError(
          "Erreur chargement reports"
        );

        setLoading(false);
      });
  };


  useEffect(() => {

    loadReports();

  }, [projectId]);


  // =========================
  // EXPORT PDF
  // =========================

  const exportPDF = () => {

    const url =

      `http://127.0.0.1:8000/api/projects/${projectId}/reports/export/pdf`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };


  // =========================
  // EXPORT EXCEL
  // =========================

  const exportExcel = () => {

    const url =

      `http://127.0.0.1:8000/api/projects/${projectId}/reports/export/excel`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };


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
          Chargement Reports...
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
            "linear-gradient(135deg,#2563eb,#7c3aed)",

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
              Rapports QA
            </h2>

            <p
              style={{
                marginTop: "10px",
                opacity: 0.85,
              }}
            >
              Reporting QA Fonctionnel
            </p>

          </div>


          <div
            style={{
              display: "flex",
              gap: "15px",
            }}
          >

            <button
              onClick={exportPDF}
              style={primaryBtn}
            >
              Export PDF
            </button>


            <button
              onClick={exportExcel}
              style={secondaryBtn}
            >
              Export Excel
            </button>

          </div>

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
                stats.taux_reussite
              }%
            </h1>

            <p>Taux Réussite</p>

          </div>


          <div>

            <h1 style={{ margin: 0 }}>
              {
                stats.total_executions
              }
            </h1>

            <p>Tests Exécutés</p>

          </div>


          <div>

            <h1 style={{ margin: 0 }}>
              {
                stats.coverage
              }%
            </h1>

            <p>Coverage</p>

          </div>


          <div>

            <h1 style={{ margin: 0 }}>
              {
                stats.total_defects
              }
            </h1>

            <p>Defects</p>

          </div>

        </div>

      </div>


      {/* KPI */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4,1fr)",

          gap: "20px",
        }}
      >

        <div style={cardStyle}>

          <div style={iconBox}>
            ✔
          </div>

          <div>

            <h3 style={cardTitle}>
              Tests PASS
            </h3>

            <h1 style={cardValue}>
              {
                stats.total_pass
              }
            </h1>

          </div>

        </div>


        <div style={cardStyle}>

          <div style={iconBox}>
            ⚠
          </div>

          <div>

            <h3 style={cardTitle}>
              Tests FAIL
            </h3>

            <h1 style={cardValue}>
              {
                stats.total_fail
              }
            </h1>

          </div>

        </div>


        <div style={cardStyle}>

          <div style={iconBox}>
            📊
          </div>

          <div>

            <h3 style={cardTitle}>
              Coverage
            </h3>

            <h1 style={cardValue}>
              {
                stats.coverage
              }%
            </h1>

          </div>

        </div>


        <div style={cardStyle}>

          <div style={iconBox}>
            🚀
          </div>

          <div>

            <h3 style={cardTitle}>
              Pipelines
            </h3>

            <h1 style={cardValue}>
              {
                stats.total_pipelines
              }
            </h1>

          </div>

        </div>

      </div>


      {/* HISTORY */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Historique Rapports
            </h3>

            <p style={sectionDesc}>
              Rapports générés
            </p>

          </div>

          <div style={badgeStyle}>
            REPORTS
          </div>

        </div>


        <table width="100%">

          <thead>

            <tr
              style={{
                textAlign: "left",
              }}
            >
              <th>Rapport</th>
              <th>Projet</th>
              <th>Date</th>
              <th>Status</th>
              <th>Export</th>
            </tr>

          </thead>

          <tbody>

            {

              reports.length > 0

                ? reports.map(

                    (
                      report,
                      index
                    ) => (

                      <tr key={index}>

                        <td>
                          {report.title}
                        </td>

                        <td>
                          {report.project}
                        </td>

                        <td>
                          {report.date}
                        </td>

                        <td>

                          <span
                            style={

                              report.status ===
                              "Généré"

                                ? successBadge

                                : draftBadge
                            }
                          >
                            {
                              report.status
                            }
                          </span>

                        </td>

                        <td>

                          <button
                            style={actionBtn}
                          >
                            Télécharger
                          </button>

                        </td>

                      </tr>
                    )
                  )

                : (

                  <tr>

                    <td colSpan="5">

                      Aucun rapport disponible

                    </td>

                  </tr>
                )
            }

          </tbody>

        </table>

      </div>


      {/* ANALYTICS */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Analytics QA
            </h3>

            <p style={sectionDesc}>
              Runtime Analytics
            </p>

          </div>

          <div style={badgeStyle}>
            ANALYTICS
          </div>

        </div>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "2fr 1fr",

            gap: "20px",

            marginTop: "25px",
          }}
        >

          <div style={chartCard}>
            Graphique Analytics QA
          </div>


          <div style={summaryCard}>

            <h4>
              Résumé QA
            </h4>

            <p>
              ✔ {
                stats.taux_reussite
              }% réussite
            </p>

            <p>
              ✔ {
                stats.total_executions
              } exécutions
            </p>

            <p>
              ✔ {
                stats.coverage
              }% coverage
            </p>

            <p>
              ⚠ {
                stats.total_defects
              } defects
            </p>

          </div>

        </div>

      </div>


      {/* DEFECTS */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Analyse Défauts
            </h3>

            <p style={sectionDesc}>
              Défauts runtime
            </p>

          </div>

          <div style={badgeStyle}>
            DEFECTS
          </div>

        </div>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3,1fr)",

            gap: "20px",

            marginTop: "25px",
          }}
        >

          {

            defects.length > 0

              ? defects.map(

                  (
                    defect,
                    index
                  ) => (

                    <div
                      key={index}
                      style={defectCard}
                    >
                      ⚠ {
                        defect.description
                      }
                    </div>
                  )
                )

              : (

                <div style={defectCard}>
                  Aucun défaut détecté
                </div>
              )
          }

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

const badgeStyle = {
  background: "#dbeafe",
  color: "#2563eb",
  padding: "8px 14px",
  borderRadius: "20px",
};

const cardStyle = {
  background: "white",
  borderRadius: "20px",
  padding: "25px",
  display: "flex",
  alignItems: "center",
  gap: "20px",
};

const iconBox = {
  width: "55px",
  height: "55px",
  borderRadius: "16px",
  background: "#dbeafe",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px",
};

const cardTitle = {
  margin: 0,
  color: "#64748b",
};

const cardValue = {
  marginTop: "8px",
  marginBottom: 0,
};

const successBadge = {
  background: "#dcfce7",
  color: "#166534",
  padding: "6px 12px",
  borderRadius: "20px",
};

const draftBadge = {
  background: "#fef3c7",
  color: "#92400e",
  padding: "6px 12px",
  borderRadius: "20px",
};

const primaryBtn = {
  background: "white",
  color: "#2563eb",
  border: "none",
  padding: "12px 18px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "700",
};

const secondaryBtn = {
  background: "#0f172a",
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "700",
};

const actionBtn = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: "10px",
  cursor: "pointer",
};

const chartCard = {
  background: "#f8fafc",
  height: "280px",
  borderRadius: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const summaryCard = {
  background: "#f8fafc",
  borderRadius: "20px",
  padding: "25px",
};

const defectCard = {
  background: "#f8fafc",
  padding: "20px",
  borderRadius: "16px",
  fontWeight: "600",
};

export default ReportsSection;