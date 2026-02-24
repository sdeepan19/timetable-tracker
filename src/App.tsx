import { NavBar } from "./components/NavBar";
import { Calendar } from "./components/Calendar";
import { StatsPanel } from "./components/StatsPanel";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { auth } from "./firebase/firebase";
import { useTimetable } from "./store/useTimetable";

function App() {
  const { setUser } = useTimetable();

  // Keep the auth state in sync with Firebase
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, [setUser]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar />
      <main className="flex-1 container mx-auto p-4 grid md:grid-cols-3 gap-4">
        {/* Left column – stats */}
        <section className="md:col-span-1">
          <StatsPanel />
        </section>

        {/* Right column – calendar */}
        <section className="md:col-span-2">
          <Calendar />
        </section>
      </main>

      {/* Global toast container (bottom‑right) */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;
