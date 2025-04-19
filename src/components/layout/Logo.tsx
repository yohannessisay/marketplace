import React from "react";
import { Link } from "react-router-dom";

const Logo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center">
      <span className="text-xl font-bold hover:text-primary-dark transition-colors duration-200">
        <span className="text-green-600">Afro</span>valley{" "}
      </span>
    </Link>
  );
};

export default Logo;
