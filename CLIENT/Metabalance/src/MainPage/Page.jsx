import DashboardNavbar from "./Navbar";
import DashboardHero from "./Hero";
import StatsGrid from "./Stats/Statsgrid";
import DashboardFooter from "./Footer";

import "../styles/MainPage.css"

export default function DashboardPage() {
    return (
        <>
            <DashboardNavbar />

            <div className="dashboard-content">
                <DashboardHero />
                <StatsGrid />
            </div>

            <DashboardFooter />
        </>
    );
}
