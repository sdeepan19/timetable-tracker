import { signInWithGoogle, signOutUser } from "../firebase/firebase";
import { useTimetable } from "../store/useTimetable";
import { FaGoogle, FaUserCircle } from "react-icons/fa";

export const NavBar = () => {
  const { user, setUser } = useTimetable();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      setUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <nav className="flex items-center justify-between bg-indigo-600 text-white p-3">
      <h1 className="text-xl font-semibold">B‑Tech Timetable Tracker</h1>
      {user ? (
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <FaUserCircle />
            <span>{user.displayName ?? user.email}</span>
          </span>
          <button
            onClick={handleLogout}
            className="bg-white text-indigo-600 px-3 py-1 rounded hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      ) : (
        <button
          onClick={handleLogin}
          className="flex items-center space-x-2 bg-white text-indigo-600 px-3 py-1 rounded hover:bg-gray-100"
        >
          <FaGoogle />
          <span>Sign in with Google</span>
        </button>
      )}
    </nav>
  );
};
