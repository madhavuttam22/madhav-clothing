// src/pages/Profile/Profile.jsx
import React, { useState, useEffect, useRef } from "react";
import { onAuthStateChanged, signOut, updateProfile, updateEmail } from "firebase/auth";
import { auth } from "../../../firebase";
import { useNavigate } from "react-router-dom";
import Header from "../../Header/Header";
import Footer from "../../Footer/Footer";
import Notification from "../../Notification/Notification";
import ConfirmationModal from "../../ConfirmationModal/ConfirmationModal";
import { FiEdit, FiLogOut, FiX, FiUpload, FiTrash2 } from "react-icons/fi";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState({
    name: "", email: "", phone: "", address: "", avatar: "", initials: ""
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const fileRef = useRef();

  const showNotification = (msg, type = "success") => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getInitials = (name) => name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase();

  const getRandomColor = () => {
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F06292", "#7986CB", "#9575CD"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser({
          name: fbUser.displayName || "",
          email: fbUser.email,
          phone: "",
          address: "",
          avatar: fbUser.photoURL || "",
          initials: getInitials(fbUser.displayName || "")
        });
      } else {
        navigate("/login/");
      }
      setLoading(false);
    });
    return () => unsub();
  }, [navigate]);

  const handleChange = e => setUser(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onloadend = () => setUser(prev => ({ ...prev, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!user.name || !user.email) throw new Error("Name and Email are required");

      const form = new FormData();
      const [first_name, ...rest] = user.name.split(" ");
      form.append("first_name", first_name);
      form.append("last_name", rest.join(" "));
      form.append("email", user.email);
      form.append("phone", user.phone);
      form.append("address", user.address);

      if (fileRef.current.files[0]) {
        form.append("avatar", fileRef.current.files[0]);
      }

      const token = await auth.currentUser.getIdToken();
      const res = await fetch("https://ecco-back-4j3f.onrender.com/api/profile/update", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Update failed");

      await updateProfile(auth.currentUser, {
        displayName: user.name,
        photoURL: data.avatar_url || user.avatar
      });
      if (auth.currentUser.email !== user.email) {
        await updateEmail(auth.currentUser, user.email);
      }

      setUser(prev => ({
        ...prev,
        avatar: data.avatar_url,
        initials: getInitials(user.name)
      }));
      showNotification("Profile updated");
      setEditMode(false);
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/"); window.location.reload();
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <>
      <Header />
      <div className="profile-container">
        <h1>My Profile</h1>
        {!editMode ? (
          <div className="view-mode">
            <div className="avatar-display">
              {user.avatar
                ? <img src={user.avatar} alt="Profile" />
                : <div className="initials" style={{ backgroundColor: getRandomColor() }}>{user.initials}</div>
              }
            </div>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone || "Not provided"}</p>
            <p><strong>Address:</strong> {user.address || "Not provided"}</p>
            <button onClick={() => setEditMode(true)}><FiEdit /> Edit</button>
            <button onClick={() => setShowLogoutModal(true)}><FiLogOut /> Logout</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="edit-mode">
            <label htmlFor="avatar">Profile Photo</label>
            <input id="avatar" type="file" accept="image/*" ref={fileRef} onChange={handleAvatarChange} />

            <input name="name" value={user.name} onChange={handleChange} required placeholder="Full Name" />
            <input name="email" value={user.email} onChange={handleChange} required placeholder="Email" />
            <input name="phone" value={user.phone} onChange={handleChange} placeholder="Phone" />
            <textarea name="address" value={user.address} onChange={handleChange} placeholder="Address"></textarea>

            <button type="submit" disabled={loading}>{loading ? "Saving…" : "Save"}</button>
            <button type="button" onClick={() => setEditMode(false)}><FiX /> Cancel</button>
          </form>
        )}
        {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
      </div>
      <Footer />
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Logout?"
        message="Are you sure?"
        confirmText="Logout"
        icon={FiLogOut}
        type="danger"
      />
    </>
  );
};

export default Profile;
