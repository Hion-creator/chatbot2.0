import { Link } from "react-router-dom";
import AccountToggle from "./AccountToggle";
import RouteSelect from "./RouteSelect";
import Plan from "./Plan";

function Sidebar({ activePage, setActivePage }) {
  return (
    <div>
      <div className="overflow-y-scroll sticky top-4 h-[calc(100vh-32px-48px)]">
        <AccountToggle />
        <RouteSelect activePage={activePage} setActivePage={setActivePage} />
      </div>
      <Plan />
    </div>
  );
}

export default Sidebar;