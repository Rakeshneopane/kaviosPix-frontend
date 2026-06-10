import {Outlet} from "react-router-dom"
import Footer from "@/components/Footer/Footer.jsx"
import NavbarComponent from "@/components/navbar/Navbar.jsx";
import { Dialog } from "@/components/ui/dialog.jsx";
import './App.css';
import { Toaster } from "sonner";

function App() {
  return (
    <Dialog>
      <div className="min-h-screen flex flex-col">
        <NavbarComponent />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <Toaster position="top-right" richColors closeButton />
      </div>
    </Dialog>
  )
}

export default App