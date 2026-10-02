import React from "react";

export default function Header() {
  return <header className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
    <div className="container">
      <a className="navbar-brand d-flex align-items-center gap-2" href="/">
        <img src="/assets/images/enrollsmart-logo.png" alt="JPC ENROLLSMART" className="brand-logo" />
        <span><strong>JPC ENROLLSMART</strong><small className="d-block text-white-50">John Paul College</small></span>
      </a>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation"><span className="navbar-toggler-icon" /></button>
      <nav className="collapse navbar-collapse" id="mainNav">
        <div className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
          <a className="nav-link" href="/">Home</a>
          <a className="nav-link" href="/#features">Features</a>
          <a className="btn btn-primary ms-lg-2" href="/login">Login</a>
        </div>
      </nav>
    </div>
  </header>;
}
