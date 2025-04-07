import React, { useState } from 'react'
import PropTypes from "prop-types";
import { FiBarChart2, FiFileText, FiHome, FiLogOut, FiSearch, FiUpload, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Route = ({ selected, Icon, title, onClick }) => {
    const isLogout = title === "Log Out";

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
    const [showLogoutMessage, setShowLogoutMessage] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        setShowLogoutMessage(true);
        setTimeout(() => {
            setShowLogoutMessage(false);
            navigate("/");
        }, 1000);
    };

    const routes = [
        { title: "Dashboard", Icon: FiHome },
        { title: "Upload PDF", Icon: FiUpload },
        { title: "Metrica", Icon: FiBarChart2 },
        { title: "OnBoarding", Icon: FiUsers },
        { title: "Examen", Icon: FiFileText },
        { title: "Query", Icon: FiSearch },
    ];

    return (
        <>
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
                <Route Icon={FiLogOut} selected={false} title="Log Out" onClick={handleLogout} />
            </div>
            {showLogoutMessage && (
                <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300">
                    ✅ Sesión cerrada con éxito
                </div>
            )}
        </>
    );
}

export default RouteSelect