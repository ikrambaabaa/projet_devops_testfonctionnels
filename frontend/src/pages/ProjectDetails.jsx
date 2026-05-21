import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import ConfigSection from "../sections/ConfigSection";
import SFDSection from "../sections/SFDSection";
import OverviewSection from "../sections/OverviewSection";
import TestsSection from "../sections/TestsSection";
import ValidationSection from "../sections/ValidationSection";
import PipelineSection from "../sections/PipelineSection";
import ExecutionSection from "../sections/ExecutionSection";
import ReportsSection from "../sections/ReportsSection";
import VersioningSection from "../sections/VersioningSection";
import WorkflowSection from "../sections/WorkflowSection";


function ProjectDetails({
  project,
  goBack,
}) {

  const [activeTab, setActiveTab] =
    useState("Aperçu");


  const tabs = [

  "Aperçu",

  "Configuration",

  "SFD",

  "Workflow Métier",

  "Tests IA",

  "Validation QA",

  "Versioning",

  "Pipelines",

  "Exécutions",

  "Rapports",
];


  return (

    <div
      style={{
        display: "flex",
        background: "#f1f5f9",
        minHeight: "100vh",
      }}
    >

      <Sidebar />


      <div
        style={{
          flex: 1,
          padding: "30px",
        }}
      >

        {/* HEADER */}
        <Header
          title={project.name}
          description="Gestion QA IA du projet"
        />


        {/* BACK BUTTON */}
        <button
          onClick={goBack}
          style={{
            marginBottom: "25px",
            background: "#e2e8f0",
            border: "none",
            padding: "12px 18px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          ← Retour Projets
        </button>


        {/* HERO */}
        <div
          style={{
            background:
              "linear-gradient(135deg,#2563eb,#7c3aed)",

            borderRadius: "20px",

            padding: "35px",

            color: "white",

            marginBottom: "30px",

            boxShadow:
              "0 12px 30px rgba(0,0,0,0.1)",
          }}
        >

          <h2
            style={{
              margin: 0,
              fontSize: "32px",
            }}
          >
            {project.name}
          </h2>

          <p
            style={{
              opacity: 0.85,
              marginTop: "12px",
              maxWidth: "700px",
            }}
          >
            {project.description}
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
                {project.tests || 0}
              </h1>

              <p>Total Tests</p>

            </div>


            <div>

              <h1 style={{ margin: 0 }}>
                {project.coverage || "0%"}
              </h1>

              <p>Coverage</p>

            </div>


            <div>

              <h1 style={{ margin: 0 }}>
                {project.pipelines || 0}
              </h1>

              <p>Pipelines</p>

            </div>

          </div>

        </div>


        {/* TABS */}
        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "30px",
          }}
        >

          {tabs.map((tab, index) => (

            <button
              key={index}

              onClick={() =>
                setActiveTab(tab)
              }

              style={{

                border:

                  activeTab === tab
                    ? "none"
                    : "1px solid #cbd5e1",

                background:

                  activeTab === tab
                    ? "#2563eb"
                    : "white",

                color:

                  activeTab === tab
                    ? "white"
                    : "#0f172a",

                padding: "12px 20px",

                borderRadius: "12px",

                cursor: "pointer",

                fontWeight: "600",

                transition: "0.3s",
              }}
            >
              {tab}
            </button>

          ))}

        </div>


        {/* MAIN CONTENT */}

        {activeTab === "Aperçu" &&

          <OverviewSection
            projectId={project.id}
          />
        }


        {activeTab === "Configuration" &&

          <ConfigSection
            projectId={project.id}
          />
        }


        {activeTab === "SFD" &&

          <SFDSection
            projectId={project.id}
          />
        }


        {activeTab === "Workflow Métier" &&

          <WorkflowSection
            projectId={project.id}
          />
        }


        {activeTab === "Tests IA" &&

          <TestsSection
            projectId={project.id}
          />
        }


        {activeTab === "Validation QA" &&

          <ValidationSection
            projectId={project.id}
          />
        }


        {activeTab === "Pipelines" &&

          <PipelineSection
            projectId={project.id}
          />
        }


        {activeTab === "Exécutions" &&

          <ExecutionSection
            projectId={project.id}
          />
        }


        {activeTab === "Rapports" &&

          <ReportsSection
            projectId={project.id}
          />
        }


        {activeTab === "Versioning" &&

          <VersioningSection
            projectId={project.id}
          />
        }

      </div>

    </div>
  );
}

export default ProjectDetails;