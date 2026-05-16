import { useEffect, useState } from "react";

function PipelineSection({
  projectId
}) {

  const [loading, setLoading] =
    useState(true);

  const [pipelines, setPipelines] =
    useState([]);

  const [stats, setStats] =
    useState({

      total_pipelines: 0,

      total_success: 0,

      total_failed: 0,

      coverage: 0,
    });

  const [yamlConfig, setYamlConfig] =
    useState("");


  // =========================
  // LOAD PIPELINES
  // =========================

  const loadPipelines = () => {

    fetch(
      `http://127.0.0.1:8000/api/projects/${projectId}/pipelines`
    )

      .then((res) => res.json())

      .then((data) => {

        console.log(data);

        setPipelines(
          data.history || []
        );

        setStats({

          total_pipelines:
            data.total_pipelines || 0,

          total_success:
            data.total_success || 0,

          total_failed:
            data.total_failed || 0,

          coverage:
            data.coverage || 0,
        });

        setYamlConfig(

          data.pipeline_yaml ||

`stages:
  - install
  - build
  - test
  - report

test_functional:
  script:
    - npm install
    - playwright test`
        );

        setLoading(false);

      })

      .catch((err) => {

        console.log(err);

        setLoading(false);

      });
  };


  useEffect(() => {

    loadPipelines();

  }, [projectId]);


  // =========================
  // RUN PIPELINE
  // =========================

  const runPipeline = async () => {

    try {

      const response = await fetch(

        `http://127.0.0.1:8000/api/projects/${projectId}/pipelines/run`,

        {
          method: "POST",
        }
      );

      const data =
        await response.json();

      console.log(data);

      alert(
        "Pipeline exécuté"
      );

      loadPipelines();

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
              Pipelines CI/CD
            </h2>

            <p
              style={{
                marginTop: "10px",
                opacity: 0.85,
              }}
            >
              GitLab QA Automation
            </p>

          </div>


          <button
            onClick={runPipeline}
            style={runBtn}
          >
            Run Pipeline
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
                stats.total_pipelines
              }
            </h1>

            <p>Total Pipelines</p>

          </div>


          <div>

            <h1 style={{ margin: 0 }}>
              {
                stats.total_success
              }
            </h1>

            <p>SUCCESS</p>

          </div>


          <div>

            <h1 style={{ margin: 0 }}>
              {
                stats.total_failed
              }
            </h1>

            <p>FAILED</p>

          </div>


          <div>

            <h1 style={{ margin: 0 }}>
              {
                stats.coverage
              }%
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
              Historique Pipelines
            </h3>

            <p style={sectionDesc}>
              GitLab CI/CD Runtime
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
              <th>Pipeline</th>
              <th>Branch</th>
              <th>Status</th>
              <th>Date</th>
              <th>Coverage</th>
              <th>Action</th>
            </tr>

          </thead>

          <tbody>

            {pipelines.map(

              (pipeline, index) => (

                <tr key={index}>

                  <td>
                    {
                      pipeline.pipeline
                    }
                  </td>

                  <td>
                    {
                      pipeline.branch
                    }
                  </td>

                  <td>

                    <span
                      style={

                        pipeline.status ===
                        "SUCCESS"

                          ? successBadge

                          : failedBadge
                      }
                    >
                      {
                        pipeline.status
                      }
                    </span>

                  </td>

                  <td>
                    {pipeline.date}
                  </td>

                  <td>
                    {
                      pipeline.coverage
                    }%
                  </td>

                  <td>

                    <button
                      style={actionBtn}
                    >
                      Logs
                    </button>

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>


      {/* PIPELINE FLOW */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Pipeline Workflow
            </h3>

            <p style={sectionDesc}>
              QA Runtime Flow
            </p>

          </div>

          <div style={badgeStyle}>
            FLOW
          </div>

        </div>


        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            marginTop: "25px",
            flexWrap: "wrap",
          }}
        >

          <div style={stageStyle}>
            Install
          </div>

          <div style={arrowStyle}>
            →
          </div>

          <div style={stageStyle}>
            Build
          </div>

          <div style={arrowStyle}>
            →
          </div>

          <div style={stageStyle}>
            Generate Tests
          </div>

          <div style={arrowStyle}>
            →
          </div>

          <div style={stageStyle}>
            Run QA
          </div>

          <div style={arrowStyle}>
            →
          </div>

          <div style={stageStyle}>
            Reports
          </div>

        </div>

      </div>


      {/* YAML */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              GitLab YAML
            </h3>

            <p style={sectionDesc}>
              Pipeline Configuration
            </p>

          </div>

          <div style={badgeStyle}>
            YAML
          </div>

        </div>


        <div style={yamlContainer}>

          <pre>
            {yamlConfig}
          </pre>

        </div>

      </div>


      {/* ANALYTICS */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Analytics Pipelines
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
            Graphique Pipelines
          </div>


          <div style={summaryCard}>

            <h4>
              Résumé Pipeline
            </h4>

            <p>
              ✔ {
                stats.total_pipelines
              } pipelines
            </p>

            <p>
              ✔ {
                stats.total_success
              } SUCCESS
            </p>

            <p>
              ⚠ {
                stats.total_failed
              } FAILED
            </p>

            <p>
              ✔ {
                stats.coverage
              }% coverage
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

const stageStyle = {
  background: "#e2e8f0",
  padding: "14px 22px",
  borderRadius: "14px",
  fontWeight: "600",
};

const arrowStyle = {
  fontSize: "22px",
  color: "#64748b",
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

const actionBtn = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: "10px",
  cursor: "pointer",
};

const yamlContainer = {
  background: "#020617",
  color: "#e2e8f0",
  padding: "25px",
  borderRadius: "18px",
  overflowX: "auto",
  marginTop: "20px",
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

export default PipelineSection;