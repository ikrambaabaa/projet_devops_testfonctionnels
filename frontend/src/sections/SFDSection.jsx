import { useEffect, useState } from "react";

function SFDSection({ projectId }) {

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [requirements, setRequirements] =
    useState([]);

  const [stats, setStats] =
    useState({

      total: 0,

      validated: 0,

      draft: 0,

      critical: 0,
    });

  const [formData, setFormData] =
    useState({

      requirement_id: "",

      priority: "Haute",

      module: "",

      version: "v1.0",

      title: "",

      description: "",

      validation_conditions: "",

      status: "Draft",
    });


  // =========================
  // LOAD SFD
  // =========================

  const loadSFD = () => {

    setLoading(true);

    fetch(
      `http://127.0.0.1:8000/api/projects/${projectId}/sfd`
    )

      .then(async (res) => {

        if (!res.ok) {

          throw new Error(
            "Erreur API SFD"
          );
        }

        return res.json();
      })

      .then((data) => {

        console.log(data);

        setRequirements(
          data.requirements || []
        );

        setStats({

          total:
            data.total || 0,

          validated:
            data.validated || 0,

          draft:
            data.draft || 0,

          critical:
            data.critical || 0,
        });

        setLoading(false);
      })

      .catch((err) => {

        console.log(err);

        setError(
          "Erreur chargement SFD"
        );

        setLoading(false);
      });
  };


  useEffect(() => {

    loadSFD();

  }, [projectId]);


  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (
    e
  ) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value,
    });
  };


  // =========================
  // CREATE SFD
  // =========================

  const createSFD = async () => {

    try {

      const response =
        await fetch(

          `http://127.0.0.1:8000/api/projects/${projectId}/sfd`,

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
        "SFD ajouté"
      );

      setFormData({

        requirement_id: "",

        priority: "Haute",

        module: "",

        version: "v1.0",

        title: "",

        description: "",

        validation_conditions: "",

        status: "Draft",
      });

      loadSFD();

    } catch (err) {

      console.log(err);
    }
  };


  // =========================
  // GENERATE IA TESTS
  // =========================

  const generateAITests =
    async () => {

      try {

        const response =
          await fetch(

            `http://127.0.0.1:8000/api/projects/${projectId}/generate-tests`,

            {
              method: "POST",
            }
          );

        const data =
          await response.json();

        console.log(data);

        alert(
          "Tests IA générés"
        );

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
          Chargement SFD...
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
              SFD - Spécifications Fonctionnelles
            </h2>

            <p
              style={{
                marginTop: "10px",
                opacity: 0.85,
              }}
            >
              Gestion intelligente des exigences métier
            </p>

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
              {stats.total}
            </h1>
            <p>Exigences</p>
          </div>

          <div>
            <h1 style={{ margin: 0 }}>
              {stats.validated}
            </h1>
            <p>Validées</p>
          </div>

          <div>
            <h1 style={{ margin: 0 }}>
              {stats.draft}
            </h1>
            <p>Draft</p>
          </div>

          <div>
            <h1 style={{ margin: 0 }}>
              {stats.critical}
            </h1>
            <p>Critiques</p>
          </div>

        </div>

      </div>


      {/* TABLE */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Liste Exigences Métier
            </h3>

            <p style={sectionDesc}>
              Gestion centralisée des règles métier
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
              <th>Exigence</th>
              <th>Priorité</th>
              <th>Status</th>
              <th>Version</th>
            </tr>

          </thead>

          <tbody>

            {

              requirements.length > 0

                ? requirements.map(

                    (
                      item,
                      index
                    ) => (

                      <tr key={index}>

                        <td>
                          {
                            item.requirement_id
                          }
                        </td>

                        <td>
                          {item.title}
                        </td>

                        <td>

                          <span
                            style={

                              item.priority ===
                              "Haute"

                                ? criticalBadge

                                : mediumBadge
                            }
                          >
                            {
                              item.priority
                            }
                          </span>

                        </td>

                        <td>

                          <span
                            style={

                              item.status ===
                              "Validated"

                                ? successBadge

                                : draftBadge
                            }
                          >
                            {
                              item.status
                            }
                          </span>

                        </td>

                        <td>
                          {item.version}
                        </td>

                      </tr>
                    )
                  )

                : (

                  <tr>

                    <td colSpan="5">
                      Aucun SFD
                    </td>

                  </tr>
                )
            }

          </tbody>

        </table>

      </div>


      {/* FORM */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Ajouter Exigence
            </h3>

            <p style={sectionDesc}>
              Nouvelle règle métier
            </p>

          </div>

          <div style={badgeStyle}>
            NEW SFD
          </div>

        </div>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2,1fr)",

            gap: "20px",

            marginTop: "30px",
          }}
        >

          <input
            name="requirement_id"
            value={
              formData.requirement_id
            }
            onChange={handleChange}
            placeholder="SFD-001"
            style={inputStyle}
          />

          <select
            name="priority"
            value={
              formData.priority
            }
            onChange={handleChange}
            style={inputStyle}
          >
            <option>Haute</option>
            <option>Moyenne</option>
            <option>Basse</option>
          </select>

          <input
            name="module"
            value={
              formData.module
            }
            onChange={handleChange}
            placeholder="Authentification"
            style={inputStyle}
          />

          <input
            name="version"
            value={
              formData.version
            }
            onChange={handleChange}
            placeholder="v1.0"
            style={inputStyle}
          />

        </div>


        <div style={{ marginTop: "25px" }}>

          <input
            name="title"
            value={
              formData.title
            }
            onChange={handleChange}
            placeholder="Titre Fonctionnel"
            style={inputStyle}
          />

        </div>


        <div style={{ marginTop: "25px" }}>

          <textarea
            rows="6"
            name="description"
            value={
              formData.description
            }
            onChange={handleChange}
            placeholder="Description métier"
            style={textareaStyle}
          ></textarea>

        </div>


        <div style={{ marginTop: "25px" }}>

          <textarea
            rows="5"
            name="validation_conditions"
            value={
              formData.validation_conditions
            }
            onChange={handleChange}
            placeholder="Conditions validation"
            style={textareaStyle}
          ></textarea>

        </div>


        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",

            marginTop: "30px",
          }}
        >

          <button
            onClick={createSFD}
            style={saveBtn}
          >
            Sauvegarder SFD
          </button>


          <button
            onClick={generateAITests}
            style={generateBtn}
          >
            Générer Tests IA
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
  background: "#0f172a",
  color: "white",
  border: "none",
  padding: "14px 24px",
  borderRadius: "12px",
  cursor: "pointer",
};

const generateBtn = {
  background:
    "linear-gradient(135deg,#2563eb,#7c3aed)",

  color: "white",

  border: "none",

  padding: "14px 24px",

  borderRadius: "12px",

  cursor: "pointer",
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

export default SFDSection;