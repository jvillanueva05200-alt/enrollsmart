import React, { useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("enrollsmart_token");
  const studentId = localStorage.getItem("enrollsmart_student_id");

  useEffect(() => {
    if (!token || !studentId) return;
    fetch(`${API}/api/students/${studentId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error || data.message || "Unable to load dashboard"); return data; })
      .then(setStudent)
      .catch(error => setError(error.message));
  }, [token, studentId]);

  function logout() { localStorage.clear(); window.location.href = "/login"; }

  if (!token || !studentId) return <><Header /><main className="container py-5"><div className="alert alert-warning">Please log in first. <a href="/login">Go to login</a>.</div></main><Footer /></>;

  return <><Header /><main className="bg-light py-5 min-vh-100"><div className="container"><div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"><div><h1 className="h3 fw-bold mb-1">Student Dashboard</h1><p className="text-secondary mb-0">{student?.name || studentId}</p></div><button className="btn btn-outline-danger" onClick={logout}>Logout</button></div>{error && <div className="alert alert-danger">{error}</div>}<div className="row g-4"><div className="col-lg-8"><div className="card border-0 shadow-sm h-100"><div className="card-body p-4"><h2 className="h5 fw-bold">Enrollment Appointment</h2><p className="text-secondary">Your current appointment information will appear here.</p>{student ? <div className="row g-3"><div className="col-sm-6"><div className="border rounded p-3"><small className="text-secondary">Student ID</small><strong className="d-block">{student.id || studentId}</strong></div></div><div className="col-sm-6"><div className="border rounded p-3"><small className="text-secondary">Status</small><strong className="d-block">{student.status || "Pending"}</strong></div></div></div> : <div className="placeholder-glow"><span className="placeholder col-12" /></div>}</div></div></div><div className="col-lg-4"><div className="card border-0 shadow-sm"><div className="card-body p-4"><h2 className="h5 fw-bold">Quick Actions</h2><button className="btn btn-primary w-100 mb-2">View Schedule</button><button className="btn btn-outline-secondary w-100">Profile</button></div></div></div></div></div></main><Footer /></>;
}
