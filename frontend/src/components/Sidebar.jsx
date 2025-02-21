import { ChevronFirst, ChevronLast, MoreHorizontal, MoreVertical } from "lucide-react";
import { useStateContext } from "../contexts/ContextProvider";
import { createContext, useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, MenuButton, MenuItem,MenuItems } from '@headlessui/react'
import logo from "../assets/logo.png";
import PropTypes from 'prop-types';

const SidebarContext = createContext();

export default function Sidebar({ children ,logout}) {
  const [expanded, setExpanded] = useState(true)
  const {
    currentUser: { username, role },
  } = useStateContext();
  
  return (
    <Menu as={"div"} className="relative">
      <aside className="h-screen inline-block">
        <nav className="h-full flex flex-col justify-between bg-white border-r shadow-sm">
          <div className="p-4 pb-2 flex justify-between items-center  mb-2 min-h-[5.3rem]">
            <img
              src={logo}
              className={`overflow-hidden transition-all ${
                expanded ? "w-28" : "w-0"
              }`}
              alt=""
            />

            <button
              onClick={() => setExpanded((curr) => !curr)}
              className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              {expanded ? <ChevronFirst /> : <ChevronLast />}
            </button>
          </div>

          <div className="scrollable-y-hover grow">
            <SidebarContext.Provider value={{ expanded }}>
              <ul className="flex-1 px-3">{children}</ul>
            </SidebarContext.Provider>
          </div>

          <div className="border-t flex p-3">
            <img
              src={`https://ui-avatars.com/api/?background=c7d2fe&color=3730a3&bold=true&name=${username}`}
              alt=""
              className="w-10 h-10 rounded-md"
            />
            <div
              className={`flex justify-between items-center overflow-hidden transition-all ${
                expanded ? "w-52 ml-3" : "w-0"
              }`}
            >
              <div className="leading-4">
                <h4 className="font-semibold">{role}</h4>
                <span className="text-xs text-gray-600 text-nowrap">
                  {username}
                </span>
              </div>
            </div>

            <MenuButton>
              <MoreVertical size={20} />
            </MenuButton>

            <MenuItems
              anchor="top end"
              transition={true}
              className="[--anchor-gap:8px] [--anchor-padding:8px] rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 origin-top transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
            >
              <div className="py-1">
                <MenuItem>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                  >
                    Ubahsuai Akaun
                  </a>
                </MenuItem>
                {/* <form action={`${import.meta.env.VITE_API_BASE_URL}/logout`} method="POST"> */}
                <MenuItem>
                  <button
                    // type="submit"
                    type="buttom"
                    onClick={logout}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                  >
                    Log Keluar
                  </button>
                </MenuItem>
                {/* </form> */}
              </div>
            </MenuItems>
          </div>
        </nav>
      </aside>
    </Menu>
  );
}
Sidebar.propTypes = {
  logout: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
export function SidebarItem({ icon, text, to, type, badgeCount }) {
  const { expanded } = useContext(SidebarContext);
  return (
    <li className="relative">
      {type === 0 ? (
        <span className="uppercase text-2xs relative flex items-center py-2 px-3 mt-2 text-nowrap font-medium text-gray-600 group">
          {expanded ? text : <MoreHorizontal size={20} />}
        </span>
      ) : (
        <NavLink
          to={to}
          className={({ isActive }) =>
            classNames(
              isActive
                ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
                : "hover:bg-indigo-50 text-gray-600",
              `relative flex items-center py-2 px-3 font-medium text-xs rounded-md transition-colors group`
            )
          }>
          {icon}
          <span
            className={`overflow-hidden transition-all text-nowrap text-gray-700 ${
              expanded ? "w-52 ml-3" : "w-0"
            }`}>
            {text}
          </span>

          {/* Badge Counter */}
          {badgeCount > 0 && (
            <span className="absolute right-2 top-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {badgeCount}
            </span>
          )}

          {!expanded && (
            <div
              className={`absolute left-full rounded-md px-2 py-1 ml-6 
              bg-indigo-100 text-indigo-800 text-sm invisible opacity-20 
              -translate-x-3 transition-all group-hover:visible 
              group-hover:opacity-100 group-hover:translate-x-0 z-50 text-nowrap`}>
              {text}
            </div>
          )}
        </NavLink>
      )}
    </li>
  );
}
SidebarItem.propTypes = {
  icon: PropTypes.element,
  text: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  type: PropTypes.number,
  active: PropTypes.bool,
  alert: PropTypes.bool,
  badgeCount: PropTypes.number,
};
