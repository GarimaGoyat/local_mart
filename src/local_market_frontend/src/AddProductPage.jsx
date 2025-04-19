import React, { useState } from "react";
import axios from "axios";

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "10px",
    fontWeight: "bold",
  },
  input: {
    padding: "10px",
    marginBottom: "20px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  formButtons: {
    display: "flex",
    justifyContent: "space-between",
  },
  saveButton: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "#4caf50",
    color: "white",
  },
  cancelButton: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "#f44336",
    color: "white",
  },
  errorMessage: {
    color: "#f44336",
    marginBottom: "10px",
    textAlign: "center",
  },
  successMessage: {
    color: "#4caf50",
    marginBottom: "10px",
    textAlign: "center",
  },
};

const AddProductPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    image: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axios.post("/api/shopkeeper/add-product", formData, {
        withCredentials: true,
      });
      setSuccess("Product added successfully!");
      setFormData({ name: "", category: "", price: "", quantity: "", image: "" });
    } catch (err) {
      setError("
