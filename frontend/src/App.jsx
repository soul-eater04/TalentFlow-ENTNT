import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "./components/ui/navigation-menu";
import Home from "./components/Home";
import Jobs from "./components/Jobs";
import JobDetail from "./components/JobDetail";
import Candidates from "./components/Candidates";
import CandidateDetail from "./components/CandidateDetail";
import { Assessment, AssessmentTest } from "./components/Assessment";
import { ModeToggle } from "./components/ModeToggle";
import KanbanBoard from "./components/KanbanBoard";
import { Toaster } from "sonner";
import AssessmentList from "./components/AssessmentList";
import NavBar from "./components/NavBar";
import ApiDocs from "./components/ApiDocs";

const App = () => {
  return (
    <Router>
      <NavBar />

      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:slug" element={<JobDetail />} />
        <Route
          path="/candidates"
          element={
              <Candidates />
          }
        />
        <Route path="/candidates/:id" element={<CandidateDetail />} />
        <Route path="/assessments/:jobId" element={<AssessmentList />} />
        <Route path="/assessment-builder/:jobId" element={<Assessment />} />
        <Route
          path="/take-assessment/:assessmentId/:jobId"
          element={<AssessmentTest />}
        />
        <Route path="/kanban/:jobid" element={<KanbanBoard />} />
        <Route path="/docs" element={<ApiDocs />} />
      </Routes>
    </Router>
  );
};

export default App;
