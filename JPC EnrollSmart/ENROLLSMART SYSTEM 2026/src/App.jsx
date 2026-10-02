import React, { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Login from "./pages/Login.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-dark text-white py-5">
          <div className="container py-lg-5">
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                <span className="badge text-bg-primary mb-3">SMART ENROLLMENT SYSTEM</span>
                <h1 className="display-4 fw-bold">Enrollment made simple.</h1>
                <p className="lead text-white-50">Book your enrollment appointment, monitor your schedule, and avoid long waiting lines with JPC ENROLLSMART.</p>
                <a className="btn btn-primary btn-lg" href="/login">Book Appointment</a>
              </div>
              <div className="col-lg-6">
                <div className="card shadow-lg border-0">
                  <div className="card-body p-4 p-lg-5 text-dark">
                    <h2 className="h4 fw-bold">JPC ENROLLSMART</h2>
                    <p className="text-secondary">Enrollment appointment and monitoring system.</p>
                    <div className="row g-3 mt-2">
                      <div className="col-4"><div className="bg-light rounded p-3 text-center"><strong className="d-block fs-4">100+</strong><small>Appointments</small></div></div>
                      <div className="col-4"><div className="bg-light rounded p-3 text-center"><strong className="d-block fs-4">500+</strong><small>Students</small></div></div>
                      <div className="col-4"><div className="bg-light rounded p-3 text-center"><strong className="d-block fs-4">Fast</strong><small>Processing</small></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-5" id="features">
          <div className="container py-lg-4">
            <div className="text-center mb-5"><h2 className="fw-bold">Everything you need</h2><p className="text-secondary">A simple enrollment appointment system for students and staff.</p></div>
            <div className="row g-4">
              {[
                ["Appointment Booking", "Choose an available enrollment date and time slot."],
                ["Schedule Tracking", "Check your appointment and enrollment status."],
                ["Admin Dashboard", "Manage schedules, students, capacity, and status."],
                ["CSV Export", "Keep administrative records in a simple format."],
                ["Responsive", "Use the system on desktop, tablet, or mobile."],
                ["PWA Ready", "Install the application and use its cached shell offline."]
              ].map(([title, text]) => (
                <div className="col-md-6 col-lg-4" key={title}>
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body p-4"><h3 className="h5 fw-bold">{title}</h3><p className="text-secondary mb-0">{text}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"}/api/auth/admin`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || "Login failed");
      localStorage.setItem("enrollsmart_token", data.token);
      localStorage.setItem("enrollsmart_role", "admin");
      window.location.href = "/admin";
    } catch (error) { setMessage(error.message); }
  }

  return <AuthShell title="Administrator Access">
    <form onSubmit={submit}>
      {message && <div className="alert alert-danger">{message}</div>}
      <div className="mb-3"><label className="form-label">Username</label><input className="form-control" value={username} onChange={e => setUsername(e.target.value)} required /></div>
      <div className="mb-3"><label className="form-label">Password</label><input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required /></div>
      <button className="btn btn-dark w-100">Sign in as Admin</button>
    </form>
    <div className="text-center mt-4"><a href="/login">Student Login</a> <span className="text-secondary mx-2">•</span> <a href="/">Home</a></div>
  </AuthShell>;
}

function AuthShell({ title, subtitle, children }) {
  return <><Header /><main className="bg-light py-5 min-vh-100"><div className="container"><div className="row justify-content-center"><div className="col-sm-10 col-md-7 col-lg-5 col-xl-4"><div className="card border-0 shadow-sm"><div className="card-body p-4 p-lg-5 text-center"><img src="/assets/images/enrollsmart-logo.png" alt="JPC ENROLLSMART" className="auth-logo mb-3" /><h1 className="h3 fw-bold">{title}</h1><p className="text-secondary mb-4">{subtitle}</p>{children}</div></div></div></div></div></main><Footer /></>;
}

function App() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => { const onPop = () => setPath(window.location.pathname); window.addEventListener("popstate", onPop); return () => window.removeEventListener("popstate", onPop); }, []);
  if (path === "/login" || path === "/login.html") return <Login />;
  if (path === "/student" || path === "/student.html") return <StudentDashboard />;
  if (path === "/admin" || path === "/admin.html") return <AdminDashboard />;
  if (path === "/admin/login" || path === "/admin-login.html") return <AdminLogin />;
  return <Home />;
}

export default App;
