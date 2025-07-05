import React , {createContext , useContext, useState} from "react";

export const AuthContext = createContext();



export const useAuthContext = () =>{
    return useContext(AuthContext)
}

const AuthProvider = ({children}) => {
    const [authData , setAuthData] = useState({
        token : null ,
        userId : null ,
        email : null 
    })

    const login = (token , userId) =>{
        setAuthData({token , userId});
        localStorage.setItem('token' , token);
        localStorage.setItem('userId' , userId)
    }
    const logout = () => {
        setAuthData({ token: null, userId: null });
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
    };

    return (
        <AuthContext.Provider value={{...authData , login , logout}} >
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider ; 