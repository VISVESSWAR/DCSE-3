import { createContext, useContext, useState } from "react";

const UserContext = createContext();
function UserProvider({ children }) {
  const dummy = {
    name: "Dr.X",
    position: "Associate Professor",
    role: "faculty",
    // role: "Admin",
  };
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
