import { createContext, useContext, useState, useReducer, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { credentialsReducer } from "../reducer";

const AuthContext = createContext();

const AuthProvider = ({children}) => {
    const [eToken, setEToken] = useState("");
    const [euser, setEUser] = useState("");
    const [credentials, credentialsDispatch] = useReducer(credentialsReducer, {email: "", password: "", userPassword:"", userConfirmPassword:"", isEmailValid:true, userEmail:"", display:"none", userName:"", userLastName:"" });
    const navigate = useNavigate();
    const location = useLocation();

    useEffect (() => {
        const sessionToken = localStorage.getItem("token");
        const availableUser = JSON.parse(localStorage.getItem("user"));
        if (sessionToken) {
            setEToken(sessionToken)
        }
        if (availableUser){
          setEUser(availableUser.firstName)
        }
    }, [])


    const userSignup = async (firstName, email, password) => {
        try {
            const {data: {createdUser, encodedToken}} = await axios.post("api/auth/signup", {
                email: email,
                password: password,
                firstName: firstName
            })
            
                localStorage.setItem("token", encodedToken);
                setEToken(encodedToken);
                localStorage.setItem("user", createdUser)
                setEUser(createdUser);
                navigate("/login")
            
        }catch(err){
            console.log(err);
        }
    }

    const userLogin = async (email, password) => {
        try {
            const {data : {foundUser, encodedToken}, status} = await axios.post("/api/auth/login", {
                email: email,
                password: password
            });
            if (status === 200){
                localStorage.setItem("token", encodedToken);
                setEToken(encodedToken);
                localStorage.setItem("user", JSON.stringify(foundUser))
                setEUser(JSON.parse(localStorage.getItem("user")).firstName);
                navigate(location?.state?.from?.pathname || "/", { replace: true });
            }
        }catch (err){
            console.log("from context error - ", err);
        }
    }

    const logOutHandler = () => {
        if (eToken){
            setEToken("");
            setEUser("");
            localStorage.clear();
            navigate("/");
        }else{
            navigate("/login")
        }
    }

    return (
        <AuthContext.Provider value={{userLogin, userSignup, logOutHandler, eToken, credentials, credentialsDispatch, euser}}>
            {children}
        </AuthContext.Provider>
    )
}

const useAuth = () => useContext(AuthContext);

export {useAuth, AuthProvider};
