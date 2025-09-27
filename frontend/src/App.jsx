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
import Assessment from "./components/Assessment";

const App = () => {
  return (
    <Router>
      <div className="bg-gray-50 px-4 shadow-sm">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/">Home</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/jobs">Jobs</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/candidates">Candidates</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/assessment">Assessment</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:jobid" element={<JobDetail />} />
        <Route path="/candidates" element={<Candidates />} />
        <Route path="/candidates/:id" element={<CandidateDetail />} />
        <Route path="/assessment" element={<Assessment />} />
      </Routes>
    </Router>
  );
};

export default App;
