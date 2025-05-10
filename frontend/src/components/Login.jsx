import React, {useState} from 'react'
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const [loginData , setLoginData] = useState({username: "", password: ""});
    const [errmsg, setErrmsg] = useState("");

    const handleChange = (e) =>{
        setLoginData(prev => ({ ...prev ,[e.target.name]: e.target.value}))
        setErrmsg(""); // Clear error message when user types
    }

    const handleSubmit = () =>{
        // Validate inputs
        if (!loginData.username || !loginData.password) {
            setErrmsg("Please fill in all fields");
            return;
        }

        //check if username and password are in the database
        let backendUrl = import.meta.env.VITE_BACKEND_URL+"/login";
        fetch(backendUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        }).then(res => res.json())
        .then(data => {
            console.log("response: ",data)
            if(data.token){
                localStorage.setItem('token', data.token);
                setErrmsg("");
                // window.location.href = "/";
                navigate("/dashboard");
            } else if (data.message) {
                setErrmsg(data.message);
            }
        })
        .catch(err => {
            console.log(err);
            setErrmsg("An error occurred. Please try again later.");
        })

        console.log(backendUrl)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Login
                    </h1>
                </div>
                {errmsg && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{errmsg}</span>
                    </div>
                )}
                <div className="mt-8 space-y-6">
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                name="username"
                                type="text"
                                placeholder="Username"
                                onChange={handleChange}
                                value={loginData.username}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            />
                        </div>
                        <div>
                            <input
                                name="password"
                                type="password"
                                placeholder="Password"
                                onChange={handleChange}
                                value={loginData.password}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={handleSubmit}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

}