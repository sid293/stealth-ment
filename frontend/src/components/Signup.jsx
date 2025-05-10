import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";


export default function Signup() {
    let navigate = useNavigate();
    const [signupData , setSignupData] = useState({username: "", password: ""});
    const [errmsg, setError] = useState('');

    const handleChange = (e) =>{
        setSignupData(prev => ({ ...prev ,[e.target.name]: e.target.value}))
    }

    useEffect(() => {
        console.log("set err: ",errmsg);
    },[errmsg])

    const handleSubmit = () =>{
        //check if username and password are in the database
        let backendUrl = import.meta.env.VITE_BACKEND_URL+"/signup";
        fetch(backendUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(signupData)
        }).then(res => res.json())
        .then(data => {
            console.log("response: ",data)
            console.log("data success: ",data.success);
            if(data.success){
                console.log("login success")
                // window.location.href = "/login"
                navigate("/login");
            }else{
                setError(data?.message || 'An error occurred');
            }
        })
        .catch(err => {
            setError(err.response?.data?.message || 'An error occurred');
            console.log(err);
        })
        console.log(backendUrl)
    }

    return(
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl bg-white font-bold text-center mb-8 text-gray-800">Signup</h1>
            <div className="space-y-4">
                <input 
                    name="username" 
                    type="text" 
                    placeholder="Username" 
                    onChange={handleChange} 
                    value={signupData.username}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                />
                <input 
                    name="password" 
                    type="password" 
                    placeholder="Password" 
                    onChange={handleChange} 
                    value={signupData.password}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                />
                <button 
                    onClick={handleSubmit}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Sign Up
                </button>
            </div>
            {errmsg && <h2 className="text-red-500 text-md">{errmsg}</h2>}
        </div>
    </div>)

}
