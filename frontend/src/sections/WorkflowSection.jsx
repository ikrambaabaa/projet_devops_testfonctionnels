import { useEffect, useState } from "react";

function WorkflowSection({
  projectId
}) {

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [steps, setSteps] =
    useState([]);

  const [flow, setFlow] =
    useState([]);

  const [stats, setStats] =
    useState({

      total_workflows: 0,

      total_steps: 0,

      coverage: 0,
    });

  const [formData, setFormData] =
    useState({

      workflow_id: "",

      title: "",

      module: "",

      status: "Actif",

      step_order: 1,
    });


  // =========================
  // LOAD WORKFLOW
  // =========================

  const loadWorkflow =
    () => {

      setLoading(true);

      fetch(
        `http://127.0.0.1:8000/api/projects/${projectId}/workflow`
      )

        .then(async (res) => {

          if (!res.ok) {

            throw new Error(
              "Erreur API Workflow"
            );
          }

          return res.json();
        })

        .then((data) => {

          console.log(data);

          setSteps(
            data.steps || []
          );

          setFlow(
            data.flow || []
          );

          setStats({

            total_workflows:
              data.total_workflows || 0,

            total_steps:
              data.total_steps || 0,

            coverage:
              data.coverage || 0,
          });

          setLoading(false);
        })

        .catch((err) => {

          console.log(err);

          setError(
            "Erreur chargement workflow"
          );

          setLoading(false);
        });
    };


  useEffect(() => {

    loadWorkflow();

  }, [projectId]);


  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange =
    (e) => {

      setFormData({

        ...formData,

        [e.target.name]:
          e.target.value,
      });
    };


  // =========================
  // CREATE WORKFLOW
  // =========================

  const createWorkflow =
    async () => {

      try {

        const response =
          await fetch(

            `http://127.0.0.1:8000/api/projects/${projectId}/workflow`,

            {

              method: "POST",

              headers: {

                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify(
                formData
              ),
            }
          );

        const data =
          await response.json();

        console.log(data);

        alert(
          "Workflow ajouté"
        );

        setFormData({

          workflow_id: "",

          title: "",

          module: "",

          status: "Actif",

          step_order: 1,
        });

        loadWorkflow();

      } catch (err) {

        console.log(err);
      }
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
          Chargement Workflow...
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

        <h2
          style={{
            margin: 0,
            fontSize: "30px",
          }}
        >
          Workflow Métier
        </h2>

        <p
          style={{
            marginTop: "10px",
            opacity: 0.85,
          }}
        >
          Processus métier et parcours utilisateur
        </p>

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
                stats.total_workflows
              }
            </h1>

            <p>Workflows</p>

          </div>


          <div>

            <h1 style={{ margin: 0 }}>
              {
                stats.total_steps
              }
            </h1>

            <p>Étapes</p>

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


      {/* WORKFLOW FLOW */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Processus Métier
            </h3>

            <p style={sectionDesc}>
              Workflow fonctionnel du système
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
            gap: "18px",
            marginTop: "30px",
            flexWrap: "wrap",
          }}
        >

          {

            flow.length > 0

              ? flow.map(

                  (
                    item,
                    index
                  ) => (

                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "18px",
                      }}
                    >

                      <div style={flowCard}>
                        {item}
                      </div>

                      {

                        index !==
                        flow.length - 1 && (

                          <div style={arrowStyle}>
                            →
                          </div>
                        )
                      }

                    </div>
                  )
                )

              : (

                <div style={flowCard}>
                  Aucun workflow
                </div>
              )
          }

        </div>

      </div>


      {/* WORKFLOW TABLE */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Étapes Métier
            </h3>

            <p style={sectionDesc}>
              Description détaillée des processus
            </p>

          </div>

          <div style={badgeStyle}>
            BUSINESS
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
              <th>Étape</th>
              <th>Module</th>
              <th>Status</th>
            </tr>

          </thead>

          <tbody>

            {

              steps.length > 0

                ? steps.map(

                    (
                      step,
                      index
                    ) => (

                      <tr key={index}>

                        <td>
                          {
                            step.workflow_id
                          }
                        </td>

                        <td>
                          {step.title}
                        </td>

                        <td>
                          {step.module}
                        </td>

                        <td>

                          <span
                            style={

                              step.status ===
                              "Actif"

                                ? successBadge

                                : inactiveBadge
                            }
                          >
                            {
                              step.status
                            }
                          </span>

                        </td>

                      </tr>
                    )
                  )

                : (

                  <tr>

                    <td colSpan="4">
                      Aucun workflow
                    </td>

                  </tr>
                )
            }

          </tbody>

        </table>

      </div>


      {/* CREATE */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Ajouter Workflow
            </h3>

            <p style={sectionDesc}>
              Nouveau processus métier
            </p>

          </div>

          <div style={badgeStyle}>
            NEW FLOW
          </div>

        </div>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2,1fr)",

            gap: "20px",

            marginTop: "25px",
          }}
        >

          <input
            name="workflow_id"
            value={
              formData.workflow_id
            }
            onChange={handleChange}
            placeholder="WF-001"
            style={inputStyle}
          />

          <input
            name="title"
            value={
              formData.title
            }
            onChange={handleChange}
            placeholder="Login"
            style={inputStyle}
          />

          <input
            name="module"
            value={
              formData.module
            }
            onChange={handleChange}
            placeholder="Auth"
            style={inputStyle}
          />

          <select
            name="status"
            value={
              formData.status
            }
            onChange={handleChange}
            style={inputStyle}
          >
            <option>
              Actif
            </option>

            <option>
              Inactif
            </option>

          </select>

        </div>


        <div
          style={{
            marginTop: "20px",
          }}
        >

          <input
            type="number"
            name="step_order"
            value={
              formData.step_order
            }
            onChange={handleChange}
            placeholder="Ordre étape"
            style={inputStyle}
          />

        </div>


        <div
          style={{
            display: "flex",
            justifyContent:
              "flex-end",

            marginTop: "25px",
          }}
        >

          <button
            onClick={createWorkflow}
            style={saveBtn}
          >
            Sauvegarder Workflow
          </button>

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

const flowCard = {
  background: "#f8fafc",
  padding: "16px 24px",
  borderRadius: "14px",
  fontWeight: "600",
};

const arrowStyle = {
  fontSize: "24px",
};

const successBadge = {
  background: "#dcfce7",
  color: "#166534",
  padding: "6px 12px",
  borderRadius: "20px",
};

const inactiveBadge = {
  background: "#fee2e2",
  color: "#991b1b",
  padding: "6px 12px",
  borderRadius: "20px",
};

const inputStyle = {
  width: "100%",
  padding: "15px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  outline: "none",
  background: "#f8fafc",
};

const saveBtn = {
  background:
    "linear-gradient(135deg,#2563eb,#7c3aed)",

  color: "white",

  border: "none",

  padding: "14px 24px",

  borderRadius: "12px",

  cursor: "pointer",
};

export default WorkflowSection;