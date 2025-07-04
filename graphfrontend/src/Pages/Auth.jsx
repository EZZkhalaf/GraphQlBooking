import { set } from 'mongoose';
import React from 'react';
import { useState } from 'react';

const Auth = () => {
    const [isLogin , setIslogin] = useState(true);
    const [email , setEmail] = useState("");
    const [password , setPassword] = useState("")


    const createAccount = async(e)=>{
        e.preventDefault()
        try {
            const reqBody = {
                query:`
                    mutation {
                        createUser(userInput : {email : "${email}" , password : "${password}"}){
                            _id , 
                            email
                        }
                    }
                `
            }
            const response = await fetch("http://localhost:3000/api" , {
                method : "POST" ,
                headers : {'Content-Type' : 'application/json'} ,
                body : JSON.stringify(reqBody)
            })

            const data = await response.json() ;
            console.log(data)
        } catch (error) {
            console.log(error)
        }
    }

    const loginAccount = async(e)=>{
        e.preventDefault()
        try {
            const reqBody = {
                query:`
                    query {
                        login(email : "${email}" , password : "${password}"){
                            userId , 
                            token , 
                            tokenExpiration
                        }
                    }
                `
            }
            const response = await fetch("http://localhost:3000/api" , {
                method : "POST" ,
                headers : {'Content-Type' : 'application/json'} ,
                body : JSON.stringify(reqBody)
            })

            const data = await response.json() ;
            console.log(data)
        } catch (error) {
            console.log(error)
        }

    }
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa] px-4">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-8 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            {isLogin ? (
            <p>Sign In to Your Account</p>
            ) : (
            <p>Create Your Account</p>
            )}

        
        </h2>

        <form className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              onChange={e =>setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder-gray-400"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              onChange={e=> setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder-gray-400"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <div>
            {isLogin ? (
                <button
                    type="submit"
                    onClick={e => loginAccount(e)}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 rounded-md transition duration-200 shadow-sm"
                    >
                    Sign In
                </button>
            ):(
                <button
                    type="submit"
                    onClick={e => createAccount(e)}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 rounded-md transition duration-200 shadow-sm"
                    >
                    Sign Up
                </button>
            )}
          </div>
        </form>

        {/* Footer */}
        <p className="text-sm text-center text-gray-500 mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <span
                onClick={() => setIslogin(!isLogin)}
                className="text-indigo-500 hover:underline cursor-pointer"
            >
                {isLogin ? 'Register' : 'Login'}
            </span>
        </p>

      </div>
    </div>
  );
};

export default Auth;
