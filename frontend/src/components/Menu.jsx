import { useState } from "react";
import Sidebar from "./SlideBar/Sidebar";
import Dashboard from "./Dashboard";
import UploadPDF from "./UploadPDF";
import Metrics from "./Metrics";
import OnboardingBot from "./OnboardingBot";
import ExamForm from "./ExamForm";
import QueryBot from "./QueryBot";

function Menu() {
    const [activePage, setActivePage] = useState("Dashboard");

    const pages = {
        "Dashboard": <Dashboard />,
        "Upload PDF": <UploadPDF />,
        "Metrica": <Metrics />,
        "OnBoarding": <OnboardingBot />,
        "Examen": <ExamForm />,
        "Query": <QueryBot />,
    };

    return (
        <main className="grid gap-4 p-4 grid-cols-[220px_1fr]">
            <Sidebar activePage={activePage} setActivePage={setActivePage} />
            <div className="p-4">{pages[activePage]}</div>
        </main>
    );
}

export default Menu;