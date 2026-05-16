import { useEffect, useState } from "react";

function ExecutionSection({
  projectId
}) {

  const [loading, setLoading] =
    useState(true);

  const [executions, setExecutions] =
    useState([]);

  const [stats, setStats] =
    useState({

      total_runs: 0,

      total_pass: 0,

      total_fail: 0,

      coverage: 0,
    });

  const [logs, setLogs] =
    useState([]);


  // =========================
  // LOAD EXECUTIONS
  // =========================

  const loadExecutions = () => {

    fetch(
      `http://127.0.0.1:8000/api/projects/${projectId}/executions`
    )

      .then((res) => res.json())

      .then((data) => {

        setExecutions(
          data.history || []
        );

        setStats({

          total_runs:
            data.total_runs || 0,

          total_pass:
            data.total_pass || 0,

          total_fail:
            data.total_fail || 0,

          coverage:
            data.coverage || 0,
        });

        setLogs(
          data.logs || []
        );

        setLoading(false);

      })

      .catch((err) => {

        console.log(err);

        setLoading(false);

      });
  };


  useEffect(() => {

    loadExecutions();

  }, [projectId]);


  // =========================
  // RUN EXECUTION
  // =========================

  const runExecution = async () => {

    try {

      const response = await fetch(

        `http://127.0.0.1:8000/api/projects/${projectId}/executions/run`,

        {
          method: "POST",
        }
      );

      const data =
        await response.json();

      console.log(data);

      alert(
        "Exécution terminée"
      );

      loadExecutions();

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
        flexDirection: "column",
        gap: "30px",
      }}
    >

      {/* HERO */}
      <div
        style={{
          background:
            "linear-gradient(135deg,#7c3aed,#2563eb)",

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
                fontSize: "28px",
              }}
            >
              Exécutions QA
            </h2>

            <p
              style={{
                marginTop: "10px",
                opacity: 0.85,
              }}
            >
              Runtime Playwright QA
            </p>

          </div>


          <button
            onClick={runExecution}
            style={runBtn}
          >
            Nouvelle Exécution
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
              {stats.total_runs}
            </h1>

            <p>Total Runs</p>

          </div>


          <div>

            <h1 style={{ margin: 0 }}>
              {stats.total_pass}
            </h1>

            <p>PASS</p>

          </div>


          <div>

            <h1 style={{ margin: 0 }}>
              {stats.total_fail}
            </h1>

            <p>FAIL</p>

          </div>


          <div>

            <h1 style={{ margin: 0 }}>
              {stats.coverage}%
            </h1>

            <p>Coverage</p>

          </div>

        </div>

      </div>


      {/* HISTORY */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Historique Exécutions
            </h3>

            <p style={sectionDesc}>
              Résultats runtime
            </p>

          </div>

          <div style={badgeStyle}>
            LIVE
          </div>

        </div>


        <table width="100%">

          <thead>

            <tr
              style={{
                textAlign: "left",
              }}
            >
              <th>ID</th>
              <th>Pipeline</th>
              <th>Status</th>
              <th>Date</th>
              <th>Coverage</th>
            </tr>

          </thead>

          <tbody>

            {executions.map(

              (execution, index) => (

                <tr key={index}>

                  <td>
                    {execution.id}
                  </td>

                  <td>
                    {execution.pipeline}
                  </td>

                  <td>

                    <span
                      style={

                        execution.status ===
                        "PASS"

                          ? successBadge

                          : failedBadge
                      }
                    >
                      {execution.status}
                    </span>

                  </td>

                  <td>
                    {execution.date}
                  </td>

                  <td>
                    {execution.coverage}%
                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>


      {/* LOGS */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Runtime Logs
            </h3>

            <p style={sectionDesc}>
              Logs Playwright
            </p>

          </div>

          <div style={badgeStyle}>
            LOGS
          </div>

        </div>


        <div style={logsContainer}>

          <pre>

            {logs.length > 0

              ? logs.join("\n")

              : "Aucun log disponible"}

          </pre>

        </div>

      </div>


      {/* SCREENSHOTS */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Screenshots Erreurs
            </h3>

            <p style={sectionDesc}>
              Captures runtime
            </p>

          </div>

          <div style={badgeStyle}>
            MEDIA
          </div>

        </div>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2,1fr)",

            gap: "20px",
          }}
        >

          <div style={screenshotCard}>
            Screenshot OTP
          </div>

          <div style={screenshotCard}>
            Screenshot Login
          </div>

        </div>

      </div>


      {/* ANALYTICS */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Analytics Runtime
            </h3>

            <p style={sectionDesc}>
              Statistiques QA
            </p>

          </div>

          <div style={badgeStyle}>
            QA
          </div>

        </div>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "2fr 1fr",

            gap: "20px",
          }}
        >

          <div style={chartCard}>
            Graphique Runtime QA
          </div>


          <div style={summaryCard}>

            <h4>
              Résumé QA
            </h4>

            <p>
              ✔ {stats.total_runs} runs
            </p>

            <p>
              ✔ {stats.coverage}% coverage
            </p>

            <p>
              ✔ {stats.total_pass} PASS
            </p>

            <p>
              ⚠ {stats.total_fail} FAIL
            </p>

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
  marginBottom: "25px",
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

const runBtn = {
  background: "white",
  color: "#2563eb",
  border: "none",
  padding: "14px 22px",
  borderRadius: "14px",
  cursor: "pointer",
  fontWeight: "700",
};

const successBadge = {
  background: "#dcfce7",
  color: "#166534",
  padding: "6px 12px",
  borderRadius: "20px",
};

const failedBadge = {
  background: "#fee2e2",
  color: "#991b1b",
  padding: "6px 12px",
  borderRadius: "20px",
};

const logsContainer = {
  background: "#020617",
  color: "#e2e8f0",
  padding: "25px",
  borderRadius: "18px",
  overflowX: "auto",
};

const screenshotCard = {
  background: "#e2e8f0",
  height: "180px",
  borderRadius: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const chartCard = {
  background: "#f8fafc",
  height: "260px",
  borderRadius: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const summaryCard = {
  background: "#f8fafc",
  borderRadius: "18px",
  padding: "25px",
};

export default ExecutionSection;