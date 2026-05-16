import { useEffect, useState } from "react";

function ConfigSection({ projectId }) {

  const [loading, setLoading] = useState(true);

  const [config, setConfig] = useState({

    gitlab_repository: "",

    branch_pipeline: "",

    gitlab_token: "",

    pipeline_yaml: "",

    frontend_url: "",

    backend_url: "",

    database_host: "",

    database_name: "",

    frontend_framework: "",

    backend_framework: "",

    automation_framework: "",

    ai_model: "",

    workflow_runtime: "",

    base_url: "",

    browser: "Chromium",

    environment: "Development",

    timeout: "",

    tests_folder: "",

    screenshots_folder: "",

    reports_folder: "",

    execution_mode: "Headless",
  });


  // =========================
  // LOAD CONFIG
  // =========================

  useEffect(() => {

    fetch(
      `http://127.0.0.1:8000/api/projects/${projectId}/config`
    )

      .then((res) => res.json())

      .then((data) => {

        if (
          !data.message
        ) {

          setConfig(data);
        }

        setLoading(false);

      })

      .catch((err) => {

        console.log(err);

        setLoading(false);

      });

  }, [projectId]);


  // =========================
  // SAVE CONFIG
  // =========================

  const saveConfig = async () => {

    try {

      const response = await fetch(

        `http://127.0.0.1:8000/api/projects/${projectId}/config`,

        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(config),
        }
      );

      const data = await response.json();

      console.log(data);

      alert(
        "Configuration sauvegardée"
      );

    } catch (err) {

      console.log(err);
    }
  };


  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (
    e
  ) => {

    setConfig({

      ...config,

      [e.target.name]:
        e.target.value,
    });
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

      {/* HEADER */}
      <div
        style={{
          background:
            "linear-gradient(135deg,#2563eb,#7c3aed)",

          borderRadius: "20px",

          padding: "30px",

          color: "white",
        }}
      >

        <h2 style={{ margin: 0 }}>
          Configuration Projet
        </h2>

        <p
          style={{
            marginTop: "10px",
            opacity: 0.8,
          }}
        >
          Paramètres QA IA et Runtime
        </p>

      </div>


      {/* GITLAB */}
      <div style={sectionCard}>

        <h3>
          GitLab & Repository
        </h3>

        <div style={gridStyle}>

          <input
            name="gitlab_repository"
            value={
              config.gitlab_repository
            }
            onChange={handleChange}
            placeholder="Repository"
            style={inputStyle}
          />

          <input
            name="branch_pipeline"
            value={
              config.branch_pipeline
            }
            onChange={handleChange}
            placeholder="Branch"
            style={inputStyle}
          />

          <input
            name="gitlab_token"
            value={
              config.gitlab_token
            }
            onChange={handleChange}
            placeholder="Token"
            style={inputStyle}
          />

          <input
            name="pipeline_yaml"
            value={
              config.pipeline_yaml
            }
            onChange={handleChange}
            placeholder=".gitlab-ci.yml"
            style={inputStyle}
          />

        </div>

      </div>


      {/* URLS */}
      <div style={sectionCard}>

        <h3>
          Application URLs
        </h3>

        <div style={gridStyle}>

          <input
            name="frontend_url"
            value={
              config.frontend_url
            }
            onChange={handleChange}
            placeholder="Frontend URL"
            style={inputStyle}
          />

          <input
            name="backend_url"
            value={
              config.backend_url
            }
            onChange={handleChange}
            placeholder="Backend URL"
            style={inputStyle}
          />

          <input
            name="database_host"
            value={
              config.database_host
            }
            onChange={handleChange}
            placeholder="Database Host"
            style={inputStyle}
          />

          <input
            name="database_name"
            value={
              config.database_name
            }
            onChange={handleChange}
            placeholder="Database Name"
            style={inputStyle}
          />

        </div>

      </div>


      {/* STACK */}
      <div style={sectionCard}>

        <h3>
          Frameworks & Stack
        </h3>

        <div style={gridStyle}>

          <input
            name="frontend_framework"
            value={
              config.frontend_framework
            }
            onChange={handleChange}
            placeholder="Frontend"
            style={inputStyle}
          />

          <input
            name="backend_framework"
            value={
              config.backend_framework
            }
            onChange={handleChange}
            placeholder="Backend"
            style={inputStyle}
          />

          <input
            name="automation_framework"
            value={
              config.automation_framework
            }
            onChange={handleChange}
            placeholder="Automation"
            style={inputStyle}
          />

          <input
            name="ai_model"
            value={
              config.ai_model
            }
            onChange={handleChange}
            placeholder="AI Model"
            style={inputStyle}
          />

        </div>

      </div>


      {/* WORKFLOW */}
      <div style={sectionCard}>

        <h3>
          Workflow Runtime
        </h3>

        <textarea

          rows="6"

          name="workflow_runtime"

          value={
            config.workflow_runtime
          }

          onChange={handleChange}

          placeholder="Workflow métier..."

          style={textareaStyle}
        />

      </div>


      {/* RUNTIME */}
      <div style={sectionCard}>

        <h3>
          Runtime Environment
        </h3>

        <div style={gridStyle}>

          <input
            name="base_url"
            value={config.base_url}
            onChange={handleChange}
            placeholder="Base URL"
            style={inputStyle}
          />

          <select
            name="browser"
            value={config.browser}
            onChange={handleChange}
            style={inputStyle}
          >
            <option>
              Chromium
            </option>

            <option>
              Firefox
            </option>

            <option>
              Webkit
            </option>
          </select>

          <select
            name="environment"
            value={
              config.environment
            }
            onChange={handleChange}
            style={inputStyle}
          >
            <option>
              Development
            </option>

            <option>
              Staging
            </option>

            <option>
              Production
            </option>
          </select>

          <input
            name="timeout"
            value={config.timeout}
            onChange={handleChange}
            placeholder="Timeout"
            style={inputStyle}
          />

        </div>

      </div>


      {/* QA */}
      <div style={sectionCard}>

        <h3>
          QA Automation
        </h3>

        <div style={gridStyle}>

          <input
            name="tests_folder"
            value={
              config.tests_folder
            }
            onChange={handleChange}
            placeholder="Tests Folder"
            style={inputStyle}
          />

          <input
            name="screenshots_folder"
            value={
              config.screenshots_folder
            }
            onChange={handleChange}
            placeholder="Screenshots Folder"
            style={inputStyle}
          />

          <input
            name="reports_folder"
            value={
              config.reports_folder
            }
            onChange={handleChange}
            placeholder="Reports Folder"
            style={inputStyle}
          />

          <select
            name="execution_mode"
            value={
              config.execution_mode
            }
            onChange={handleChange}
            style={inputStyle}
          >
            <option>
              Headless
            </option>

            <option>
              UI Mode
            </option>
          </select>

        </div>

      </div>


      {/* SAVE BUTTON */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >

        <button
          onClick={saveConfig}
          style={saveBtn}
        >
          Enregistrer Configuration
        </button>

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

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2,1fr)",
  gap: "20px",
};

const inputStyle = {
  width: "100%",
  padding: "15px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  outline: "none",
  background: "#f8fafc",
};

const textareaStyle = {
  width: "100%",
  borderRadius: "14px",
  border: "1px solid #cbd5e1",
  padding: "15px",
  resize: "none",
  outline: "none",
  background: "#f8fafc",
};

const saveBtn = {
  background:
    "linear-gradient(135deg,#2563eb,#7c3aed)",

  color: "white",

  border: "none",

  padding: "16px 28px",

  borderRadius: "14px",

  cursor: "pointer",

  fontWeight: "700",
};

export default ConfigSection;