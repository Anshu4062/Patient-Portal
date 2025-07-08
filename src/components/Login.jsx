
//V3
import React, { useState, useEffect } from "react";
import {
  User,
  Lock,
  Search,
  Edit,
  Trash2,
  Plus,
  UserPlus,
  Calendar,
  Users,
  Mail,
  Heart,
  LogOut,
  UserCheck,
} from "lucide-react";

const PatientManagementApp = () => {
  const [currentView, setCurrentView] = useState("login"); // 'login', 'register', 'dashboard'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    fullName: "",
  });
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [newPatient, setNewPatient] = useState({
    name: "",
    patientId: "",
    dateOfBirth: "",
    gender: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success', 'error'

  // Check for existing session on component mount
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const token = localStorage?.getItem("authToken");
        const userData = localStorage?.getItem("currentUser");

        if (token && userData) {
          const user = JSON.parse(userData);
          setIsLoggedIn(true);
          setCurrentUser(user);
          setCurrentView("dashboard");
          loadPatients();
        }
      } catch (error) {
        console.error("Error checking session:", error);
        // Clear invalid session data
        localStorage?.removeItem("authToken");
        localStorage?.removeItem("currentUser");
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  // Simulate API calls (replace with actual API endpoints)
  const apiCall = async (endpoint, method = "GET", data = null) => {
    try {
      // For demo purposes, simulate API responses
      return simulateApiResponse(endpoint, method, data);
    } catch (error) {
      throw error;
    }
  };

  // Simulate API responses for demo (replace with actual API calls)
  const simulateApiResponse = (endpoint, method, data) => {
    // In memory storage for demo - in production, use proper state management
    const users = JSON.parse(localStorage?.getItem("users") || "[]");
    const patients = JSON.parse(localStorage?.getItem("patients") || "[]");

    if (endpoint === "/register" && method === "POST") {
      const existingUser = users.find((u) => u.username === data.username);
      if (existingUser) {
        throw new Error("Username already exists");
      }
      const newUser = { id: Date.now(), ...data };
      users.push(newUser);
      if (localStorage) {
        localStorage.setItem("users", JSON.stringify(users));
      }
      return { success: true, message: "Registration successful" };
    }

    if (endpoint === "/login" && method === "POST") {
      const user = users.find(
        (u) => u.username === data.username && u.password === data.password
      );
      if (!user) {
        throw new Error("Invalid credentials");
      }
      return {
        success: true,
        token: "fake-jwt-token-" + Date.now(),
        user: { id: user.id, username: user.username, fullName: user.fullName },
      };
    }

    if (endpoint === "/patients" && method === "GET") {
      return { patients };
    }

    if (endpoint === "/patients" && method === "POST") {
      const newPatient = { id: Date.now(), ...data };
      patients.push(newPatient);
      if (localStorage) {
        localStorage.setItem("patients", JSON.stringify(patients));
      }
      return { success: true, patient: newPatient };
    }

    if (endpoint.startsWith("/patients/") && method === "PUT") {
      const patientId = parseInt(endpoint.split("/")[2]);
      const patientIndex = patients.findIndex((p) => p.id === patientId);
      if (patientIndex !== -1) {
        patients[patientIndex] = { ...patients[patientIndex], ...data };
        if (localStorage) {
          localStorage.setItem("patients", JSON.stringify(patients));
        }
        return { success: true, patient: patients[patientIndex] };
      }
      throw new Error("Patient not found");
    }

    if (endpoint.startsWith("/patients/") && method === "DELETE") {
      const patientId = parseInt(endpoint.split("/")[2]);
      const filteredPatients = patients.filter((p) => p.id !== patientId);
      if (localStorage) {
        localStorage.setItem("patients", JSON.stringify(filteredPatients));
      }
      return { success: true };
    }

    throw new Error("Endpoint not found");
  };

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleRegister = async () => {
    if (registerData.password !== registerData.confirmPassword) {
      showMessage("Passwords do not match", "error");
      return;
    }

    if (
      !registerData.username ||
      !registerData.password ||
      !registerData.email ||
      !registerData.fullName
    ) {
      showMessage("Please fill all fields", "error");
      return;
    }

    try {
      await apiCall("/register", "POST", {
        username: registerData.username,
        password: registerData.password,
        email: registerData.email,
        fullName: registerData.fullName,
      });
      showMessage("Registration successful! Please login.", "success");
      setCurrentView("login");
      setRegisterData({
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        fullName: "",
      });
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

  const handleLogin = async () => {
    if (!loginData.username || !loginData.password) {
      showMessage("Please enter username and password", "error");
      return;
    }

    try {
      const result = await apiCall("/login", "POST", loginData);

      // Store authentication data
      localStorage?.setItem("authToken", result.token);
      localStorage?.setItem("currentUser", JSON.stringify(result.user));

      setIsLoggedIn(true);
      setCurrentUser(result.user);
      setCurrentView("dashboard");
      showMessage("Login successful!", "success");
      loadPatients();
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage?.removeItem("authToken");
    localStorage?.removeItem("currentUser");

    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentView("login");
    setPatients([]);
  };

  const loadPatients = async () => {
    try {
      const result = await apiCall("/patients");
      setPatients(result.patients);
    } catch (error) {
      showMessage("Failed to load patients", "error");
    }
  };

  const handleAddPatient = async () => {
    if (
      !newPatient.name ||
      !newPatient.patientId ||
      !newPatient.dateOfBirth ||
      !newPatient.gender
    ) {
      showMessage("Please fill all fields", "error");
      return;
    }

    try {
      const result = await apiCall("/patients", "POST", newPatient);
      setPatients([...patients, result.patient]);
      setNewPatient({ name: "", patientId: "", dateOfBirth: "", gender: "" });
      setShowAddForm(false);
      showMessage("Patient added successfully!", "success");
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
    setNewPatient(patient);
    setShowAddForm(true);
  };

  const handleUpdatePatient = async () => {
    if (
      !newPatient.name ||
      !newPatient.patientId ||
      !newPatient.dateOfBirth ||
      !newPatient.gender
    ) {
      showMessage("Please fill all fields", "error");
      return;
    }

    try {
      const result = await apiCall(
        `/patients/${editingPatient.id}`,
        "PUT",
        newPatient
      );
      setPatients(
        patients.map((p) => (p.id === editingPatient.id ? result.patient : p))
      );
      setNewPatient({ name: "", patientId: "", dateOfBirth: "", gender: "" });
      setShowAddForm(false);
      setEditingPatient(null);
      showMessage("Patient updated successfully!", "success");
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

//   const handleDeletePatient = async (id) => {
//     if (window.confirm("Are you sure you want to delete this patient?")) {
//       try {
//         await apiCall(`/patients/${id}`, "DELETE");
//         setPatients(patients.filter((p) => p.id !== id));
//         showMessage("Patient deleted successfully!", "success");
//       } catch (error) {
//         showMessage(error.message, "error");
//       }
//     }
//   };
const handleDeletePatient = async (id) => {
  const patient = patients.find((p) => p.id === id);
  const patientName = patient ? patient.name : "this patient";

  if (window.confirm(`Delete ${patientName}? This action cannot be undone.`)) {
    try {
      await apiCall(`/patients/${id}`, "DELETE");
      setPatients(patients.filter((p) => p.id !== id));
      showMessage("Patient deleted successfully!", "success");
    } catch (error) {
      showMessage(error.message, "error");
    }
  }
};

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Login/Register View
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Patient Management
            </h1>
            <p className="text-gray-600">
              {currentView === "login"
                ? "Sign in to manage patient records"
                : "Create a new account"}
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg ${
                messageType === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {currentView === "login" ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Username"
                    value={loginData.username}
                    onChange={(e) =>
                      setLoginData({ ...loginData, username: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Sign In
              </button>

              <div className="text-center">
                <button
                  onClick={() => setCurrentView("register")}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Don't have an account? Register here
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={registerData.fullName}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        fullName: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        email: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Username"
                    value={registerData.username}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        username: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        password: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={registerData.confirmPassword}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleRegister}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Register
              </button>

              <div className="text-center">
                <button
                  onClick={() => setCurrentView("login")}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Already have an account? Sign in here
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-800">
                Patient Management System
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {currentUser?.fullName || currentUser?.username}!
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message Display */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-lg ${
              messageType === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingPatient(null);
                setNewPatient({
                  name: "",
                  patientId: "",
                  dateOfBirth: "",
                  gender: "",
                });
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Patient
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-blue-600" />
              {editingPatient ? "Edit Patient" : "Add New Patient"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={newPatient.name}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient ID
                </label>
                <input
                  type="text"
                  value={newPatient.patientId}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, patientId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={newPatient.dateOfBirth}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      dateOfBirth: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={newPatient.gender}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, gender: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2 flex gap-2">
                <button
                  onClick={
                    editingPatient ? handleUpdatePatient : handleAddPatient
                  }
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  {editingPatient ? "Update Patient" : "Add Patient"}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingPatient(null);
                    setNewPatient({
                      name: "",
                      patientId: "",
                      dateOfBirth: "",
                      gender: "",
                    });
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Patient List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Patient Records
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date of Birth
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {patient.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.patientId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.dateOfBirth}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.gender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPatient(patient)}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                          title="Edit Patient"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePatient(patient.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1"
                          title="Delete Patient"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPatients.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No patients found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientManagementApp;