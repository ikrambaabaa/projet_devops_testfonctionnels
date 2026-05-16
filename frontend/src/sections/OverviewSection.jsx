import { useEffect, useState } from "react";

function OverviewSection({
  projectId
}) {

  const [overview, setOverview] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);


  // =========================
  // LOAD OVERVIEW
  // =========================

  useEffect(() => {

    const loadOverview =
      async () => {

        try {

          const response =
            await fetch(

              `http://127.0.0.1:8000/api/projects/${projectId}/overview`
            );

          const data =
            await response.json();

          console.log(data);

          setOverview(data);

        } catch (err) {

          console.log(err);

          setError(
            "Erreur chargement dashboard"
          );

        } finally {

          setLoading(false);
        }
      };

    loadOverview();

  }, [projectId]);


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
          Chargement Dashboard...
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


  // =========================
  // SAFE DATA
  // =========================

  const project =
    overview?.project || {};

  const statistics =
    overview?.statistics || {};

  const recentActivity =
    overview?.recent_activity || [];


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
          Dashboard QA Fonctionnel
        </h2>

        <p
          style={{
            marginTop: "12px",
            opacity: 0.85,
          }}
        >
          {

            project.description ||

            "Plateforme QA IA"
          }
        </p>


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
                statistics.total_tests || 0
              }
            </h1>

            <p>Total Tests</p>

          </div>


          <div>

            <h1 style={{ margin: 0 }}>
              {
                statistics.total_pass || 0
              }
            </h1>

            <p>PASS</p>

          </div>


          <div>

            <h1 style={{ margin: 0 }}>
              {
                statistics.total_fail || 0
              }
            </h1>

            <p>FAIL</p>

          </div>


          <div>

            <h1 style={{ margin: 0 }}>
              {
                statistics.coverage || 0
              }%
            </h1>

            <p>Coverage</p>

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
              Tests Validés
            </h3>

            <h1 style={cardValue}>
              {
                statistics.total_pass || 0
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
                statistics.total_fail || 0
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
                statistics.coverage || 0
              }%
            </h1>

          </div>

        </div>


        <div style={cardStyle}>

          <div style={iconBox}>
            📁
          </div>

          <div>

            <h3 style={cardTitle}>
              SFD
            </h3>

            <h1 style={cardValue}>
              {
                statistics.total_sfd || 0
              }
            </h1>

          </div>

        </div>

      </div>


      {/* RECENT ACTIVITY */}
      <div style={sectionCard}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle}>
              Activité récente
            </h3>

            <p style={sectionDesc}>
              Dernières activités QA
            </p>

          </div>

          <div style={badgeStyle}>
            LIVE
          </div>

        </div>


        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            marginTop: "25px",
          }}
        >

          {

            recentActivity.length > 0

              ? recentActivity.map(

                  (item, index) => (

                    <div
                      key={index}
                      style={activityItem}
                    >

                      {

                        item.message ||

                        item
                      }

                    </div>
                  )
                )

              : (

                <div style={activityItem}>
                  Aucune activité récente
                </div>
              )
          }

        </div>

      </div>

    </div>
  );
}


/* STYLES */

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

const activityItem = {
  background: "#f8fafc",
  padding: "16px",
  borderRadius: "14px",
};

export default OverviewSection;