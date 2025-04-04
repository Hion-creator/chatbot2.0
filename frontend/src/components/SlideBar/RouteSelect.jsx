import React from 'react'
import PropTypes from "prop-types";
import { FiBarChart2, FiFileText, FiHome, FiLogOut, FiSearch, FiUpload, FiUsers } from "react-icons/fi";

const Route = ({ selected, Icon, title, onClick }) => {
    const isLogout = title === "Log Out"; // Detecta si es el botón de logout

    return (
        <button
            className={`flex items-center justify-start gap-2 w-full rounded px-2 py-1.5 text-sm 
            transition-[box-shadow,background-color,color] 
            ${selected
                    ? "bg-white text-stone-950 shadow"
                    : isLogout
                        ? "hover:bg-red-500 hover:text-white bg-transparent text-stone-500"
                        : "hover:bg-stone-200 bg-transparent text-stone-500 shadow-none"
                }`}
            onClick={onClick}
        >
            <Icon className={isLogout ? "hover:text-white" : selected ? "text-blue-500" : ""} />
            <span>{title}</span>
        </button>
    );
};

Route.propTypes = {
    selected: PropTypes.bool.isRequired,
    Icon: PropTypes.elementType.isRequired,
    title: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
};

function RouteSelect({ activePage, setActivePage }) {

    const routes = [
        { title: "Dashboard", Icon: FiHome },
        { title: "Upload PDF", Icon: FiUpload },
        { title: "Metrica", Icon: FiBarChart2 },
        { title: "OnBoarding", Icon: FiUsers },
        { title: "Examen", Icon: FiFileText },
        { title: "Query", Icon: FiSearch },
    ];

    return (
        <div className="space-y-1">
            {routes.map(({ title, Icon }) => (
                <Route
                    key={title}
                    Icon={Icon}
                    selected={activePage === title}
                    title={title}
                    onClick={() => setActivePage(title)}
                />
            ))}
            <Route Icon={FiLogOut} selected={false} title="Log Out" onClick={() => console.log("Cerrar sesión")} />
        </div>
    );
}

export default RouteSelect