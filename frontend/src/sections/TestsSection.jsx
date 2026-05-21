import { useEffect, useState } from "react";

function TestsSection({
  projectId
}) {

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [tests, setTests] =
    useState([]);

  const [generatedScript, setGeneratedScript] =
    useState("");

  const [stats, setStats] =
    useState({

      total_tests: 0,

      functional: 0,

      draft: 0,

      coverage: 0,
    });

  const [sfdInput, setSfdInput] =
    useState("");

  const [generatedTests, setGeneratedTests] =
    useState("");


  // =========================
  // LOAD TESTS
  // =========================

  const loadTests = () => {

    setLoading(true);

    fetch(
      `http://127.0.0.1:8000/api/projects/${projectId}/tests`
    )

      .then(async (res) => {

        if (!res.ok) {

          throw new Error(
            "Erreur API Tests"
          );
        }

        return res.json();
      })

      .then((data) => {

        console.log(data);

        setTests(
          data.tests || []
        );

        setGeneratedScript(

          data.generated_script ||

`test("OTP invalide", async ({ page }) => {

  await page.goto("/login")

  await page.fill("#otp", "0000")

  await page.click("#submit")

})`
        );

        setStats({

          total_tests:
            data.total_tests || 0,

          functional:
            data.functional || 0,

          draft:
            data.draft || 0,

          coverage:
            data.coverage || 0,
        });

        setLoading(false);
      })

      .catch((err) => {

        console.log(err);

        setError(
          "Erreur chargement tests"
        );

        setLoading(false);
      });
  };


  useEffect(() => {

    loadTests();

  }, [projectId]);


  // =========================
  // GENERATE TESTS
  // =========================

// =========================
// GENERATE TESTS
// =========================

const generateTests =
  async () => {

    try {

      const response =
        await fetch(

          `http://127.0.0.1:8000/api/projects/${projectId}/generate-tests`,

          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              sfd: sfdInput,
            }),
          }
        );

      const data =
        await response.json();

      console.log(data);

      setGeneratedTests(

        JSON.stringify(
          data.tests,
          null,
          2
        )
      );

      alert(
        "Tests IA générés"
      );

      loadTests();

    } catch (err) {

      console.log(err);

      alert(
        "Erreur génération tests"
      );
    }
};


// =========================
// GENERATE PLAYWRIGHT SCRIPT
// =========================

const generatePlaywrightScript =
  async () => {

    try {

      const response =
  await fetch(

    `http://127.0.0.1:8000/api/projects/${projectId}/tests/generate-script`,

    {

      method: "POST",

      headers: {

        "Content-Type":
          "application/json"
      },

      body: JSON.stringify({})
    }
);

      const data =
        await response.json();

      console.log(data);

      setGeneratedScript(

        data.script ||

        "Aucun script généré"
      );

      alert(
        "Script Playwright généré"
      );

    } catch (err) {

      console.log(err);

      alert(
        "Erreur génération script"
      );
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
          Chargement Tests...
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
                fontSize: "30px",
              }}
            >
              Tests Fonctionnels IA
            </h2>

            <p
              style={{
                marginTop: "10px",
                opacity: 0.85,
              }}
            >
              Génération intelligente des scénarios métier
            </p>

          </div>


          <button
            onClick={generateTests}
            style={generateBtn}
          >
            Générer Tests IA
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
                stats.total_tests
              }
            </h1>
            <p>Tests Générés</p>
          </div>

          <div>
            <h1 style={{ margin: 0 }}>
              {
                stats.functional
              }
            </h1>
            <p>Fonctionnels</p>
          </div>

          <div>
            <h1 style={{ margin: 0 }}>
              {stats.draft}
            </h1>
            <p>Draft</p>
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


      {/* TABLE */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Liste Tests Générés
            </h3>

            <p style={sectionDesc}>
              Tests générés automatiquement
            </p>

          </div>

          <div style={badgeStyle}>
            AI TESTS
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
                              "Generated"

                                ? successBadge

                                : draftBadge
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

  {

    test.steps?.length > 0

      ? (

          <ul
            style={{
              paddingLeft: "18px"
            }}
          >

            {

              test.steps.map(

                (
                  step,
                  idx
                ) => (

                  <li key={idx}>

                    {
                      step.description
                    }

                  </li>
                )
              )
            }

          </ul>
        )

      : "Aucune étape"
  }

</td>
                      </tr>
                    )
                  )

                : (

                  <tr>

                    <td colSpan="5">
                      Aucun test généré
                    </td>

                  </tr>
                )
            }

          </tbody>

        </table>

      </div>


      {/* GENERATION PANEL */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Génération IA
            </h3>

            <p style={sectionDesc}>
              Création intelligente
            </p>

          </div>

          <div style={badgeStyle}>
            AI ENGINE
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

          <div>

            <label style={labelStyle}>
              Exigence SFD
            </label>

            <textarea
              rows="8"
              value={sfdInput}
              onChange={(e) =>
                setSfdInput(
                  e.target.value
                )
              }
              placeholder="Le système doit..."
              style={textareaStyle}
            ></textarea>

          </div>


          <div>

            <label style={labelStyle}>
              Tests générés
            </label>

            <textarea
              rows="8"
              value={
                generatedTests
              }
              readOnly
              placeholder="Scénarios générés..."
              style={textareaStyle}
            ></textarea>

          </div>

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
  onClick={
    generatePlaywrightScript
  }
  style={generateBtn}
>
  Générer Script Playwright
</button>

        </div>

      </div>


      {/* GENERATED SCRIPT */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Script Généré
            </h3>

            <p style={sectionDesc}>
              Script Playwright IA
            </p>

          </div>

          <div style={badgeStyle}>
            PLAYWRIGHT
          </div>

        </div>


        <div style={scriptContainer}>

          <pre>
            {generatedScript}
          </pre>

        </div>

      </div>


      {/* FLOW */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Workflow IA
            </h3>

            <p style={sectionDesc}>
              Transformation métier
            </p>

          </div>

          <div style={badgeStyle}>
            AI FLOW
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
            SFD Métier
          </div>

          <div style={arrowStyle}>
            →
          </div>

          <div style={flowCard}>
            Analyse IA
          </div>

          <div style={arrowStyle}>
            →
          </div>

          <div style={flowCard}>
            Génération Tests
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
            Pipeline GitLab
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

const generateBtn = {
  background:
    "linear-gradient(135deg,#2563eb,#7c3aed)",

  color: "white",

  border: "none",

  padding: "16px 28px",

  borderRadius: "14px",

  cursor: "pointer",

  fontWeight: "700",
};

const scriptContainer = {
  background: "#020617",
  color: "#e2e8f0",
  padding: "25px",
  borderRadius: "18px",
  overflowX: "auto",
};

export default TestsSection;