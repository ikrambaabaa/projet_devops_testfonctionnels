import { useEffect, useState } from "react";

function ValidationSection({
  projectId
}) {

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [tests, setTests] =
    useState([]);

  const [comment, setComment] =
    useState("");

  const [stats, setStats] =
    useState({

      validated: 0,

      pending: 0,

      rejected: 0,

      validation_rate: 0,
    });


  // =========================
  // LOAD VALIDATION
  // =========================

  const loadValidation =
    () => {

      setLoading(true);

      fetch(
        `http://127.0.0.1:8000/api/projects/${projectId}/validation`
      )

        .then(async (res) => {

          if (!res.ok) {

            throw new Error(
              "Erreur API Validation"
            );
          }

          return res.json();
        })

        .then((data) => {

          console.log(data);

          setTests(
            data.tests || []
          );

          setStats({

            validated:
              data.validated || 0,

            pending:
              data.pending || 0,

            rejected:
              data.rejected || 0,

            validation_rate:
              data.validation_rate || 0,
          });

          setLoading(false);
        })

        .catch((err) => {

          console.log(err);

          setError(
            "Erreur chargement validation"
          );

          setLoading(false);
        });
    };


  useEffect(() => {

    loadValidation();

  }, [projectId]);


  // =========================
  // UPDATE STATUS
  // =========================

  const updateStatus =
    async (
      testId,
      status
    ) => {

      try {

        const response =
          await fetch(

            `http://127.0.0.1:8000/api/projects/${projectId}/validation/${testId}`,

            {

              method: "PUT",

              headers: {

                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({

                status,
              }),
            }
          );

        const data =
          await response.json();

        console.log(data);

        loadValidation();

      } catch (err) {

        console.log(err);
      }
    };


  // =========================
  // VALIDATE ALL
  // =========================

  const validateAll =
    async () => {

      try {

        const response =
          await fetch(

            `http://127.0.0.1:8000/api/projects/${projectId}/validation/validate-all`,

            {
              method: "POST",
            }
          );

        const data =
          await response.json();

        console.log(data);

        alert(
          "Tous les tests validés"
        );

        loadValidation();

      } catch (err) {

        console.log(err);
      }
    };


  // =========================
  // SAVE COMMENT
  // =========================

  const saveComment =
    async () => {

      try {

        const response =
          await fetch(

            `http://127.0.0.1:8000/api/projects/${projectId}/validation/comments`,

            {

              method: "POST",

              headers: {

                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({

                comment,
              }),
            }
          );

        const data =
          await response.json();

        console.log(data);

        alert(
          "Commentaire sauvegardé"
        );

        setComment("");

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
          Chargement Validation...
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
              Validation QA
            </h2>

            <p
              style={{
                marginTop: "10px",
                opacity: 0.85,
              }}
            >
              Vérification et approbation des tests IA
            </p>

          </div>


          <button
            onClick={validateAll}
            style={approveBtn}
          >
            Valider Tous
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
                stats.validated
              }
            </h1>

            <p>Tests Validés</p>

          </div>


          <div>

            <h1 style={{ margin: 0 }}>
              {
                stats.pending
              }
            </h1>

            <p>En Attente</p>

          </div>


          <div>

            <h1 style={{ margin: 0 }}>
              {
                stats.rejected
              }
            </h1>

            <p>Rejetés</p>

          </div>


          <div>

            <h1 style={{ margin: 0 }}>
              {
                stats.validation_rate
              }%
            </h1>

            <p>Validation QA</p>

          </div>

        </div>

      </div>


      {/* TABLE */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Tests en Validation
            </h3>

            <p style={sectionDesc}>
              Contrôle qualité des tests générés
            </p>

          </div>

          <div style={badgeStyle}>
            QA REVIEW
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
              <th>Scénario</th>
              <th>Priorité</th>
              <th>Status</th>
              <th>Framework</th>
              <th>Action</th>
            </tr>

          </thead>

          <tbody>

            {

              tests.length > 0

                ? tests.map(

                    (
                      test,
                      index
                    ) => (

                      <tr key={index}>

                        <td>
                          {test.id}
                        </td>

                        <td>
                          {test.title}
                        </td>

                        <td>

                          <span
                            style={

                              test.priority ===
                              "Haute"

                                ? criticalBadge

                                : mediumBadge
                            }
                          >
                            {
                              test.priority
                            }
                          </span>

                        </td>

                        <td>

                          <span
                            style={

                              test.status ===
                              "Validated"

                                ? successBadge

                                : test.status ===
                                  "Rejected"

                                  ? rejectedBadge

                                  : pendingBadge
                            }
                          >
                            {
                              test.status
                            }
                          </span>

                        </td>

                        <td>
                          Playwright
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
                                updateStatus(
                                  test.id,
                                  "Validated"
                                )
                              }
                              style={approveBtn}
                            >
                              Approuver
                            </button>


                            <button
                              onClick={() =>
                                updateStatus(
                                  test.id,
                                  "Rejected"
                                )
                              }
                              style={rejectBtn}
                            >
                              Rejeter
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )

                : (

                  <tr>

                    <td colSpan="6">
                      Aucun test
                    </td>

                  </tr>
                )
            }

          </tbody>

        </table>

      </div>


      {/* COMMENTS */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Commentaires QA
            </h3>

            <p style={sectionDesc}>
              Feedback qualité
            </p>

          </div>

          <div style={badgeStyle}>
            COMMENTS
          </div>

        </div>


        <div style={{ marginTop: "25px" }}>

          <label style={labelStyle}>
            Commentaire QA
          </label>

          <textarea
            rows="6"
            value={comment}
            onChange={(e) =>
              setComment(
                e.target.value
              )
            }
            placeholder="Ajouter commentaire..."
            style={textareaStyle}
          ></textarea>

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
            onClick={saveComment}
            style={saveBtn}
          >
            Sauvegarder Commentaire
          </button>

        </div>

      </div>


      {/* FLOW */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Workflow Validation QA
            </h3>

            <p style={sectionDesc}>
              Processus qualité
            </p>

          </div>

          <div style={badgeStyle}>
            QA FLOW
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
            Tests IA
          </div>

          <div style={arrowStyle}>
            →
          </div>

          <div style={flowCard}>
            QA Review
          </div>

          <div style={arrowStyle}>
            →
          </div>

          <div style={flowCard}>
            Validation
          </div>

          <div style={arrowStyle}>
            →
          </div>

          <div style={flowCard}>
            Pipeline GitLab
          </div>

          <div style={arrowStyle}>
            →
          </div>

          <div style={flowCard}>
            Runtime QA
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

const labelStyle = {
  fontWeight: "600",
};

const textareaStyle = {
  width: "100%",
  marginTop: "10px",
  borderRadius: "14px",
  border: "1px solid #cbd5e1",
  padding: "15px",
  resize: "none",
  outline: "none",
  background: "#f8fafc",
};

const successBadge = {
  background: "#dcfce7",
  color: "#166534",
  padding: "6px 12px",
  borderRadius: "20px",
};

const pendingBadge = {
  background: "#fef3c7",
  color: "#92400e",
  padding: "6px 12px",
  borderRadius: "20px",
};

const rejectedBadge = {
  background: "#fee2e2",
  color: "#991b1b",
  padding: "6px 12px",
  borderRadius: "20px",
};

const criticalBadge = {
  background: "#fee2e2",
  color: "#991b1b",
  padding: "6px 12px",
  borderRadius: "20px",
};

const mediumBadge = {
  background: "#dbeafe",
  color: "#1d4ed8",
  padding: "6px 12px",
  borderRadius: "20px",
};

const approveBtn = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: "10px",
  cursor: "pointer",
};

const rejectBtn = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: "10px",
  cursor: "pointer",
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

export default ValidationSection;