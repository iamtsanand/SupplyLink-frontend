import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios";

export const StoreContext = createContext(null);

export const StoreContextProvider = (props) => {
 
const [user,setUser] = useState(null);
const [phoneNumber, setPhoneNumber] = useState('');

  const contextValue = {
  user,
    setUser,
    phoneNumber,
    setPhoneNumber,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};