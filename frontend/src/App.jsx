import { useState } from "react";

import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetails from "./pages/ProjectDetails";

function App() {

  const [selectedProject, setSelectedProject] = useState(null);

  return (

    <>
      {
        selectedProject ? (

          <ProjectDetails
            project={selectedProject}
            goBack={() => setSelectedProject(null)}
          />

        ) : (

          <ProjectsPage
            onOpenProject={setSelectedProject}
          />

        )
      }
    </>

  );
}

export default App;