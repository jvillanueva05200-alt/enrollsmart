import React, { useCallback, useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
const EMPTY_FORM = { id: "", name: "", email: "", gender: "", address: "", dept: "", level: "", date: "", time: "", phone: "" };

async function request(path, options = {}) {
  const token = localStorage.getItem("enrollsmart_token");
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
  });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
  if (!response.ok) throw new Error(data.error || data.message || `Request failed (${response.status})`);
  return data;
}

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [dates, setDates] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const token = localStorage.getItem("enrollsmart_token");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError("");
    try {
      const [studentData, analyticsData, dateData, info] = await Promise.all([
        request("/api/students"), request("/api/analytics"), request("/api/dates"), request("/api/enrollment-info"),
      ]);
      setStudents(studentData.students || []);
      setAnalytics(analyticsData);
      setDates(dateData || []);
      setTimeSlots(info.timeSlots || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  function logout() { localStorage.clear(); window.location.href = "/admin/login"; }
  function openCreate() { setEditing(null); setForm({ ...EMPTY_FORM }); setModalOpen(true); setMessage(""); setError(""); }
  function openEdit(student) {
    setEditing(student.id); setModalOpen(true);
    setForm({ id: student.id || "", name: student.name || "", email: student.email || "", gender: student.gender || "", address: student.address || "", dept: student.dept || "", level: student.level || "", date: student.date || "", time: student.time || "", phone: student.phone || "" });
    setMessage(""); setError("");
  }
  function closeModal() { setEditing(null); setForm({ ...EMPTY_FORM }); setModalOpen(false); }
  function change(e) { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })); }

  async function save(event) {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    try {
      const body = { ...form, id: form.id || undefined };
      if (editing) delete body.id;
      await request(editing ? `/api/students/${encodeURIComponent(editing)}` : "/api/students", { method: editing ? "PUT" : "POST", body: JSON.stringify(body) });
      closeModal(); setMessage(editing ? "Student updated successfully." : "Student added successfully."); await load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function remove(student) {
    if (!window.confirm(`Delete ${student.name || student.id}?`)) return;
    setError(""); setMessage("");
    try { await request(`/api/students/${encodeURIComponent(student.id)}`, { method: "DELETE" }); setMessage("Student deleted successfully."); await load(); }
    catch (err) { setError(err.message); }
  }

  async function changeStatus(student, status) {
    try { await request(`/api/students/${encodeURIComponent(student.id)}`, { method: "PUT", body: JSON.stringify({ status }) }); setMessage("Status updated."); await load(); }
    catch (err) { setError(err.message); }
  }

  async function exportCsv() {
    try {
      const token = localStorage.getItem("enrollsmart_token");
      const response = await fetch(`${API}/api/export/csv`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.error || "Export failed."); }
      const blob = await response.blob(); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "JPC-ENROLLSMART-Masterlist.csv"; a.click(); URL.revokeObjectURL(url);
    } catch (err) { setError(err.message); }
  }

  if (!token) return <><Header /><main className="container py-5"><div className="alert alert-warning">Please log in as administrator. <a href="/admin/login">Admin login</a>.</div></main><Footer /></>;

  return <>
    <Header />
    <main className="bg-light py-5 min-vh-100">
      <div className="container">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div><h1 className="h3 fw-bold mb-1">Admin Dashboard</h1><p className="text-secondary mb-0">Enrollment management</p></div>
          <div className="d-flex gap-2"><button className="btn btn-primary" onClick={openCreate}>Add Student</button><button className="btn btn-outline-danger" onClick={logout}>Logout</button></div>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        <div className="row g-4 mb-4"><Stat title="Students" value={analytics?.total ?? students.length} /><Stat title="Pending" value={analytics?.pending ?? 0} /><Stat title="Enrolled" value={analytics?.enrolled ?? 0} /></div>
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3"><div><h2 className="h5 fw-bold mb-0">Student List</h2><small className="text-secondary">React → Express API → database</small></div><button className="btn btn-outline-secondary btn-sm" onClick={exportCsv}>Export CSV</button></div>
            {loading ? <div className="text-center py-4"><div className="spinner-border text-primary" /><p className="text-secondary mt-2 mb-0">Loading students...</p></div> :
              <div className="table-responsive"><table className="table table-striped table-hover align-middle"><thead className="table-dark"><tr><th>No.</th><th>Student ID</th><th>Name</th><th>Gender</th><th>Address</th><th>Program</th><th>Date</th><th>Status</th><th>Option</th></tr></thead><tbody>
                {students.map((student, index) => <tr key={student.id}><td>{index + 1}</td><td>{student.id}</td><td>{student.name}</td><td>{student.gender || "—"}</td><td>{student.address || "—"}</td><td>{student.dept}</td><td>{student.date}</td><td><select className="form-select form-select-sm" value={student.status || "Pending"} onChange={e => changeStatus(student, e.target.value)}><option>Pending</option><option>Enrolled</option><option>Completed</option><option>Cancelled</option></select></td><td><div className="d-flex gap-1"><button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(student)}>Edit</button><button className="btn btn-sm btn-outline-danger" onClick={() => remove(student)}>Delete</button></div></td></tr>)}
                {students.length === 0 && <tr><td colSpan="9" className="text-center text-secondary py-4">No students found.</td></tr>}
              </tbody></table></div>}
          </div>
        </div>
      </div>
    </main>
    <div className="modal fade show" style={{ display: modalOpen ? "block" : "none" }} aria-hidden={!modalOpen}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable"><div className="modal-content"><form onSubmit={save}><div className="modal-header"><h5 className="modal-title">{editing ? "Edit Student" : "Add Student"}</h5><button type="button" className="btn-close" onClick={closeModal} /></div><div className="modal-body"><div className="row g-3">
        <Field label="Student ID" name="id" value={form.id} onChange={change} disabled={Boolean(editing)} required={!editing} /><Field label="Full Name" name="name" value={form.name} onChange={change} required /><Field label="Email" name="email" value={form.email} onChange={change} type="email" /><Field label="Gender" name="gender" value={form.gender} onChange={change} /><Field label="Address" name="address" value={form.address} onChange={change} col="col-12" /><Field label="Program / Department" name="dept" value={form.dept} onChange={change} required /><Field label="Level" name="level" value={form.level} onChange={change} /><Field label="Phone" name="phone" value={form.phone} onChange={change} /><div className="col-md-6"><label className="form-label">Enrollment Date</label><select className="form-select" name="date" value={form.date} onChange={change} required><option value="">Select date</option>{dates.filter(d => d.status === "Announced" || d.date === form.date).map(d => <option key={d.date} value={d.date}>{d.date} ({d.available} available)</option>)}</select></div><div className="col-md-6"><label className="form-label">Time</label><select className="form-select" name="time" value={form.time} onChange={change} required><option value="">Select time</option>{timeSlots.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
      </div></div><div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : editing ? "Update Student" : "Add Student"}</button></div></form></div></div>
    </div>
    {modalOpen && <div className="modal-backdrop fade show" />}
    <Footer />
  </>;
}

function Field({ label, name, value, onChange, type = "text", required = false, disabled = false, col = "col-md-6" }) { return <div className={col}><label className="form-label">{label}</label><input className="form-control" name={name} type={type} value={value} onChange={onChange} required={required} disabled={disabled} /></div>; }
function Stat({ title, value }) { return <div className="col-md-4"><div className="card border-0 shadow-sm"><div className="card-body p-4"><small className="text-secondary">{title}</small><div className="display-6 fw-bold">{value}</div></div></div></div>; }
