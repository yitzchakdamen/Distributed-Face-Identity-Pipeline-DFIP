import React, { useState } from "react";
import { createUser } from "../services/userService";
import { useAuth } from "../context/AuthContext";
import "./UserCreationForm.css";

interface UserFormData {
  username: string;
  password: string;
  name: string;
  email: string;
  role: string;
}

const UserCreationForm: React.FC = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    password: "",
    name: "",
    email: "",
    role: "viewer"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getRoleOptions = () => {
    if (currentUser?.role === "admin") {
      return [
        { value: "operator", label: "Operator" },
        { value: "viewer", label: "Viewer" }
      ];
    } else if (currentUser?.role === "operator") {
      return [
        { value: "viewer", label: "Viewer" }
      ];
    }
    return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (!formData.username || !formData.password || !formData.name || !formData.email) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await createUser(formData);
      if (response.success) {
        setSuccess(`User "${formData.name}" created successfully`);
        setFormData({
          username: "",
          password: "",
          name: "",
          email: "",
          role: "viewer"
        });
      } else {
        setError(response.error || "Failed to create user");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = getRoleOptions();

  if (roleOptions.length === 0) {
    return (
      <div className="user-creation-form">
        <div className="access-denied">
          <h3>Access Denied</h3>
          <p>You do not have permission to create users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-creation-form">
      <h2>Create New User</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="creation-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Enter username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Enter full name"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Enter email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="form-input"
            placeholder="Enter password (min 6 characters)"
            minLength={6}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserCreationForm;
