"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Icon } from "@/components/Icon";

interface Errors {
  username?: string;
  password?: string;
  confirm?: string;
}

export function AuthModal() {
  const { authMode, closeAuth, openAuth, signIn } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authMode) return;
    setErrors({});
    setPassword("");
    setConfirm("");
    const id = window.setTimeout(() => usernameRef.current?.focus(), 60);
    return () => window.clearTimeout(id);
  }, [authMode]);

  useEffect(() => {
    if (!authMode) return;
    document.body.classList.add("is-locked");
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAuth();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("is-locked");
      document.removeEventListener("keydown", onKey);
    };
  }, [authMode, closeAuth]);

  if (!authMode) return null;
  const registering = authMode === "register";

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    const name = username.trim();

    if (!name) next.username = "Pick a username.";
    else if (name.length < 3) next.username = "At least 3 characters.";
    else if (name.length > 18) next.username = "Keep it under 18 characters.";
    else if (!/^[a-zA-Z0-9_]+$/.test(name)) next.username = "Letters, numbers and underscores only.";

    if (!password) next.password = "Enter a password.";
    else if (password.length < 6) next.password = "At least 6 characters.";

    if (registering && password && confirm !== password) next.confirm = "Passwords do not match.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;
    signIn(name);
  };

  return (
    <div
      className="overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeAuth();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="authTitle">
        <button className="modal-close" type="button" onClick={closeAuth} aria-label="Close dialog">
          <Icon name="i-x" />
        </button>

        <div className="auth">
          <div className="auth-head">
            <span className="brand-mark brand-mark--logo">
              <Image src="/logo-round.png" alt="" width={64} height={64} />
            </span>
            <h2 id="authTitle">{registering ? "Create your demo account" : "Welcome back"}</h2>
            <p>
              {registering
                ? "Start with 5,000 fake coins. No email, no card, no server."
                : "This is a local demo — any username and password combination works."}
            </p>
          </div>

          <div className="auth-tabs" role="tablist" aria-label="Account action">
            <button
              type="button"
              role="tab"
              aria-selected={!registering}
              className={`auth-tab${!registering ? " is-active" : ""}`}
              onClick={() => openAuth("signin")}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={registering}
              className={`auth-tab${registering ? " is-active" : ""}`}
              onClick={() => openAuth("register")}
            >
              Register
            </button>
          </div>

          <form onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="auth-username">Username</label>
              <input
                id="auth-username"
                ref={usernameRef}
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setErrors((current) => ({ ...current, username: undefined }));
                }}
                placeholder="spear_and_mace"
                autoComplete="username"
                maxLength={18}
                aria-invalid={Boolean(errors.username)}
                aria-describedby={errors.username ? "auth-username-error" : undefined}
              />
              {errors.username && (
                <span className="field-error" id="auth-username-error">
                  {errors.username}
                </span>
              )}
            </div>

            <div className="field">
              <label htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrors((current) => ({ ...current, password: undefined }));
                }}
                placeholder="anything at all"
                autoComplete={registering ? "new-password" : "current-password"}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "auth-password-error" : undefined}
              />
              {errors.password && (
                <span className="field-error" id="auth-password-error">
                  {errors.password}
                </span>
              )}
            </div>

            {registering && (
              <div className="field">
                <label htmlFor="auth-confirm">Confirm password</label>
                <input
                  id="auth-confirm"
                  type="password"
                  value={confirm}
                  onChange={(event) => {
                    setConfirm(event.target.value);
                    setErrors((current) => ({ ...current, confirm: undefined }));
                  }}
                  placeholder="one more time"
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.confirm)}
                  aria-describedby={errors.confirm ? "auth-confirm-error" : undefined}
                />
                {errors.confirm && (
                  <span className="field-error" id="auth-confirm-error">
                    {errors.confirm}
                  </span>
                )}
              </div>
            )}

            <button className="btn btn-primary btn-block auth-submit" type="submit">
              <Icon name={registering ? "i-user-plus" : "i-user"} />
              {registering ? "Create account" : "Sign in"}
            </button>
          </form>

          {registering ? (
            <div className="auth-perks">
              <span className="auth-perk">
                <Icon name="i-check" /> 5,000 demo coins on the house
              </span>
              <span className="auth-perk">
                <Icon name="i-check" /> Balance saved in this browser only
              </span>
              <span className="auth-perk">
                <Icon name="i-check" /> Withdraw anything — it is all pretend
              </span>
            </div>
          ) : (
            <p className="auth-foot">
              New here?{" "}
              <button type="button" onClick={() => openAuth("register")}>
                Create an account
              </button>
            </p>
          )}

          <div className="auth-note">
            <Icon name="i-shield" />
            <span>
              <strong>Demo only.</strong> Passwords are validated for shape but never stored or sent anywhere. Do not
              reuse a real password.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
