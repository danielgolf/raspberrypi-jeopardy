import React from 'react';
import {
  NavLink
} from "react-router-dom";

function Navbar() {
  return (
    <nav className="p-2 bg-teal-800 flex flex-wrap">
      <div className="flex items-center justify-start mr-8">
        <img className="h-12" src="favicon.ico" alt="Raspi"/>
        <span className="font-semibold text-xl tracking-tight ml-1">Jeopardy!</span>
      </div>
      <ul className="flex-grow flex flex-wrap items-center justify-start text-gray-300">
        <li className="m-3 p-2 min-w-48 text-center border border-gray-700 rounded-md bg-teal-900">
          <NavLink to="/gm/start" activeClassName="font-bold text-white text-lg">
            Start Game
          </NavLink>
        </li>
        <li className="m-3 p-2 min-w-48 text-center border border-gray-700 rounded-md bg-teal-900">
          <NavLink to="/gm/view" activeClassName="font-bold text-white text-lg">
            Game Master View
          </NavLink>
        </li>
        <li className="m-3 p-2 min-w-48 text-center border border-gray-700 rounded-md bg-teal-900">
          <NavLink to="/viewer" activeClassName="font-bold text-white text-lg">
            Viewer
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
