import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userDepartment, setUserDepartment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to initialize default users if not exists
  const initializeDefaultUsers = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.length === 0) {
      const defaultUsers = [
        {
          id: 'admin-001',
          name: 'Admin Utama',
          email: 'wfadhli82@gmail.com',
          password: 'admin123', // default password
          role: 'admin',
          department: 'Pentadbiran'
        }
      ];
      localStorage.setItem('users', JSON.stringify(defaultUsers));
      console.log('Default users initialized:', defaultUsers);
    } else {
      // Check if admin user exists, if not add it
      const adminExists = users.some(user => user.email === 'wfadhli82@gmail.com' && user.role === 'admin');
      if (!adminExists) {
        const adminUser = {
          id: 'admin-001',
          name: 'Admin Utama',
          email: 'wfadhli82@gmail.com',
          password: 'admin123',
          role: 'admin',
          department: 'Pentadbiran'
        };
        users.push(adminUser);
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Admin user added:', adminUser);
      } else {
        // Ensure admin user has password
        const adminUser = users.find(user => user.email === 'wfadhli82@gmail.com' && user.role === 'admin');
        if (adminUser && !adminUser.password) {
          adminUser.password = 'admin123';
          localStorage.setItem('users', JSON.stringify(users));
          console.log('Password added to existing admin user:', adminUser);
        }
      }
    }
  };

  // Function to get user info from localStorage
  const getUserInfo = (email) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const matchingUsers = users.filter(u => u.email === email);
    if (matchingUsers.length === 0) {
      return { role: 'user', department: null };
    }
    // Priority: admin > admin_bahagian > user
    const priorityOrder = { 'admin': 3, 'admin_bahagian': 2, 'user': 1 };
    const highestPriorityUser = matchingUsers.reduce((prev, current) => {
      return (priorityOrder[current.role] || 0) > (priorityOrder[prev.role] || 0) ? current : prev;
    });
    return { role: highestPriorityUser.role, department: highestPriorityUser.department };
  };

  useEffect(() => {
    initializeDefaultUsers();
    // Check current user from localStorage
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      const userObj = JSON.parse(stored);
      setUser(userObj);
      const userInfo = getUserInfo(userObj.email);
      setUserRole(userInfo.role);
      setUserDepartment(userInfo.department);
    } else {
      setUser(null);
      setUserRole(null);
      setUserDepartment(null);
    }
    setLoading(false);
  }, []);

  // When user changes (login/logout), update role/department
  useEffect(() => {
    if (user) {
      const userInfo = getUserInfo(user.email);
      setUserRole(userInfo.role);
      setUserDepartment(userInfo.department);
    } else {
      setUserRole(null);
      setUserDepartment(null);
    }
  }, [user]);

  const signOut = async () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    setUserRole(null);
    setUserDepartment(null);
  };

  const value = {
    user,
    userRole,
    userDepartment,
    signOut,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 