import React from "react";

const CreatePassword = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left Image Section */}
      <div className="hidden md:flex w-1/2 bg-cover bg-center" 
           style={{ backgroundImage: "url('/path-to-your-image.jpg')" }}>
      </div>
      
      {/* Right Form Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-white p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Afrovalley</h1>
          <p className="text-gray-600 mb-4">Create your password</p>
          
          <form>
            <div className="mb-4">
              <input type="password" placeholder="Password" 
                     className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="mb-6">
              <input type="password" placeholder="Confirm password" 
                     className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <button type="submit" 
                    className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600">
              Save password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePassword;
