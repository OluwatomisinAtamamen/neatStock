import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav className="navbar">
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/signup">Signup</Link>
        <Link to="/reports">Reports</Link>
        <Link to="/settings">Settings</Link>
        <Link to="/dashboard">Dashboard</Link>
        </nav>
    );
}

export default Navbar;