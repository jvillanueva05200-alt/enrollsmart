
import React, { useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import {
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth } from "../firebase.js";

const API = "http://192.168.1.6:4000";  

export default function Login() {
  const [mode, setMode] = useState("login");
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const endpoint =
      mode === "login"
        ? "/api/auth/student"
        : "/api/auth/student/register";

    const body =
      mode === "login"
        ? { studentId, password }
        : { studentId, name, password };

    try {
      const response = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.message ||
          "Login request failed."
        );
      }

      if (!data.token) {
        throw new Error(
          "Walang authentication token na natanggap mula sa server."
        );
      }

      localStorage.setItem(
        "enrollsmart_token",
        data.token
      );

      localStorage.setItem(
        "enrollsmart_role",
        "student"
      );

      localStorage.setItem(
        "enrollsmart_student_id",
        studentId
      );

      window.location.href = "/student";
    } catch (error) {
      console.error("Student Login Error:", error);
      setMessage(
        error.message ||
        "Hindi makakonekta sa backend server."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setMessage("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account"
      });

      const result = await signInWithPopup(
        auth,
        provider
      );

      const user = result.user;

      if (!user) {
        throw new Error(
          "Hindi nakuha ang Google account."
        );
      }

     const idToken = await user.getIdToken(true);

      const response = await fetch(
        `${API}/api/auth/student/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            idToken
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.message ||
          "Hindi matagumpay ang Google Login."
        );
      }

      if (!data.token) {
        throw new Error(
          "Walang authentication token na natanggap mula sa backend."
        );
      }

      localStorage.setItem(
        "enrollsmart_token",
        data.token
      );

      localStorage.setItem(
        "enrollsmart_role",
        "student"
      );

      localStorage.setItem(
        "enrollsmart_student_id",
        data.id || data.studentId || user.uid
      );

      localStorage.setItem(
        "enrollsmart_student_name",
        data.name || user.displayName || ""
      );

      window.location.href = "/student";
    } catch (error) {
      console.error("Google Login Error:", error);

      let errorMessage = error.message;

      if (error.code === "auth/popup-closed-by-user") {
        errorMessage =
          "Isinara ang Google Login window bago matapos ang pag-login.";
      } else if (
        error.code === "auth/popup-blocked"
      ) {
        errorMessage =
          "Na-block ng browser ang Google Login popup. Payagan ang popups para sa localhost.";
      } else if (
        error.code === "auth/unauthorized-domain"
      ) {
        errorMessage =
          "Hindi authorized ang domain na ito sa Firebase Authentication.";
      } else if (
        error.code === "auth/operation-not-allowed"
      ) {
        errorMessage =
          "Hindi naka-enable ang Google Sign-in sa Firebase.";
      } else if (
        error.code === "auth/network-request-failed"
      ) {
        errorMessage =
          "May problema sa internet connection.";
      }

      setMessage(
        errorMessage ||
        "May hindi inaasahang error sa Google Login."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />

      <main className="bg-light py-5 min-vh-100">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-sm-10 col-md-7 col-lg-5 col-xl-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4 p-lg-5">
                  <div className="text-center mb-4">
                    <img
                      src="/assets/images/enrollsmart-logo.png"
                      alt="JPC ENROLLSMART"
                      className="auth-logo mb-3"
                    />

                    <h1 className="h3 fw-bold">
                      JPC ENROLLSMART
                    </h1>

                    <p className="text-secondary mb-0">
                      Enrollment Appointment System
                    </p>
                  </div>

                  {message && (
                    <div
                      className="alert alert-danger"
                      role="alert"
                    >
                      {message}
                    </div>
                  )}

                  <div
                    className="btn-group w-100 mb-4"
                    role="group"
                  >
                    <button
                      type="button"
                      className={`btn ${
                        mode === "login"
                          ? "btn-primary"
                          : "btn-outline-primary"
                      }`}
                      disabled={loading}
                      onClick={() => {
                        setMode("login");
                        setMessage("");
                      }}
                    >
                      Login
                    </button>

                    <button
                      type="button"
                      className={`btn ${
                        mode === "register"
                          ? "btn-primary"
                          : "btn-outline-primary"
                      }`}
                      disabled={loading}
                      onClick={() => {
                        setMode("register");
                        setMessage("");
                      }}
                    >
                      Register
                    </button>
                  </div>

                  <form onSubmit={submit}>
                    <div className="mb-3">
                      <label className="form-label">
                        Student ID
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        value={studentId}
                        onChange={(e) =>
                          setStudentId(e.target.value)
                        }
                        placeholder="2026-0001"
                        autoComplete="username"
                        required
                        disabled={loading}
                      />
                    </div>

                    {mode === "register" && (
                      <div className="mb-3">
                        <label className="form-label">
                          Full Name
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          value={name}
                          onChange={(e) =>
                            setName(e.target.value)
                          }
                          placeholder="Enter your full name"
                          autoComplete="name"
                          required
                          disabled={loading}
                        />
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="form-label">
                        Password
                      </label>

                      <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        placeholder="Enter your password"
                        autoComplete={
                          mode === "login"
                            ? "current-password"
                            : "new-password"
                        }
                        required
                        disabled={loading}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={loading}
                    >
                      {loading
                        ? "Please wait..."
                        : mode === "login"
                          ? "Login"
                          : "Create Account"}
                    </button>
                  </form>

                  {mode === "login" && (
                    <>
                      <div className="d-flex align-items-center my-4">
                        <hr className="flex-grow-1" />

                        <span className="text-secondary px-3">
                          OR
                        </span>

                        <hr className="flex-grow-1" />
                      </div>

                      <button
                        type="button"
                        className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center gap-2"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                      >
                        <img
                          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                          alt="Google"
                          width="20"
                          height="20"
                        />

                        {loading
                          ? "Connecting..."
                          : "Continue with Google"}
                      </button>
                    </>
                  )}

                  <div className="text-center mt-4">
                    <a href="/admin/login">
                      Administrator Login
                    </a>

                    <span className="text-secondary mx-2">
                      •
                    </span>

                    <a href="/">
                      Home
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}