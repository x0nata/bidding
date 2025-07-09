import { Sidebar } from "../../admin/Sidebar";
import { Container } from "../Design";
import { useSelector } from "react-redux";
import { useState } from "react";
import { HiMenuAlt3, HiX } from "react-icons/hi";

export const DashboardLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role || "user";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <div className="mt-32">
        <Container className="flex relative">
          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden fixed top-36 left-4 z-50 bg-green text-white p-2 rounded-lg shadow-lg hover:bg-primary transition-colors"
          >
            {sidebarOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
          </button>

          {/* Sidebar */}
          <div className={`
            fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-40
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            w-80 lg:w-[25%] min-h-[calc(100vh-8rem)] bg-white shadow-xl lg:shadow-s1
            lg:rounded-lg overflow-hidden
          `}>
            <div className="h-full overflow-y-auto">
              <Sidebar role={role} />
            </div>
          </div>

          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <div className="w-full lg:w-[75%] lg:px-5 lg:ml-10 px-4 lg:rounded-lg">
            <div className="min-h-[calc(100vh-8rem)]">
              {children}
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};
