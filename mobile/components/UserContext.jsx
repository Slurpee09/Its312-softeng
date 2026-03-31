import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check AsyncStorage for a stored user and verify against backend session
    const checkUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (!storedUser) return;

      let parsed = null;
      try { parsed = JSON.parse(storedUser); } catch (e) { parsed = null; }
      if (!parsed) {
        await AsyncStorage.removeItem("user");
        return;
      }

      // Verify session on server; if session is invalid, clear stored user to avoid stale admin redirects
      try {
        const res = await fetch("http://localhost:5000/profile", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          const serverUser = await res.json().catch(() => null);
          // Prefer server authoritative user; fall back to local copy
          const finalUser = serverUser && serverUser.id ? { ...parsed, ...serverUser } : parsed;
          setUser(finalUser);
          await AsyncStorage.setItem("user", JSON.stringify(finalUser));
        } else {
          // Session invalid — remove local storage copy
          await AsyncStorage.removeItem("user");
          setUser(null);
        }
      } catch (err) {
        // Network error: keep local copy but set into state so app remains usable offline
        setUser(parsed);
      }
    };

    checkUser();
  }, []);

  const login = async (userData) => {
    setUser(userData);
    await AsyncStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
