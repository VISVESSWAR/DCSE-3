import { createContext, useContext, useState } from "react";
const faculty = {
  facultyId: "FAC002",
  name: "faculty",
  position: "Assistant Professor",
  contactInfo: {
    email: "faculty@example.com",
    phone: "+919876543210",
  },
  areasOfExpertise: ["Machine Learning", "AI", "Data Science"],
  classesHandled: [
    {
      semester: "3",
      _id: "6845c010f4d7457e793dfd3e",
    },
    {
      semester: "5",
      _id: "6845c010f4d7457e793dfd3f",
    },
  ],
  dob: "1985-04-20T00:00:00.000Z",
  dateOfJoining: "2015-08-12T00:00:00.000Z",
  isActive: true,
  _id: "6845c010f4d7457e793dfd3d",
  __v: 0,
};

const hod = {
  facultyId: "FAC003",
  name: "hod",
  position: "Head of Department",
  contactInfo: {
    email: "hod@example.com",
    phone: "+919112233445",
  },
  areasOfExpertise: ["Database Systems", "Software Engineering"],
  classesHandled: [
    {
      semester: "4",
      _id: "6845c02cf4d7457e793dfd42",
    },
    {
      semester: "7",
      _id: "6845c02cf4d7457e793dfd43",
    },
  ],
  dob: "1978-09-10T00:00:00.000Z",
  dateOfJoining: "2008-01-05T00:00:00.000Z",
  isActive: true,
  _id: "6845c02cf4d7457e793dfd41",
  __v: 0,
};
const admin = {
  facultyId: "FAC001",
  name: "admin",
  position: "Admin",
  contactInfo: {
    email: "admin@example.com",
    phone: "+911234567890",
  },
  areasOfExpertise: ["System Administration", "Security", "Networking"],
  classesHandled: [
    {
      semester: "5",
      _id: "6845bcc003d9421f7b3a4cd1",
    },
    {
      semester: "6",
      _id: "6845bcc003d9421f7b3a4cd2",
    },
  ],
  dob: "1980-01-15T00:00:00.000Z",
  dateOfJoining: "2010-06-01T00:00:00.000Z",
  isActive: true,
  _id: "6845bcc003d9421f7b3a4cd0",
  __v: 0,
};


const UserContext = createContext();

function UserProvider({ children }) {

  const dummy = faculty;
  const [user, setUser] = useState(dummy);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

function UserData() {
  const context = useContext(UserContext);
  if (!context) throw new Error("Context not accesible outside boundary");
  return context;
}
export { UserData, UserProvider };
