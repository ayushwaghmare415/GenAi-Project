import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Coins, Mail } from "lucide-react";
import axios from "axios";
import LoginModal from "../components/LoginModel";
import axiosInstance from "../api/axiosInstance";
import { setUserData } from "../redux/userSlice";
import { serverUrl } from "../config";

function Home() {
  const highlights = [
    "AI Generated Code",
    "Fully Responsive Layouts",
    "Production Ready Output",
  ];

  const [openLogin, setOpenLogin] = React.useState(false);
  const userData = useSelector((state) => state.user.userData);
  const displayName = userData?.name || userData?.displayName || userData?.user?.name || 'User';
  const displayEmail = userData?.email || userData?.user?.email || '';
  const avatar = userData?.avatar || userData?.photoURL || userData?.user?.avatar || '';
  const dispatch = useDispatch();
  const [openProfile, setOpenProfile] = useState(false);
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([]);

  useEffect(() => {
    if (!userData) return;

    const handleGetWebsites = async () => {
      try {
        const result = await axiosInstance.get("/api/websites/get-all");
        setWebsites(result.data?.websites || []);
      } catch (error) {
        console.log(error);
      }
    };

    handleGetWebsites();
  }, [userData]);
  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
    } catch (error) {
      console.warn("Logout failed", error);
    }
    dispatch(setUserData(null));
    localStorage.removeItem("user");
    setOpenProfile(false);
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getEmailProviderBadge = (email) => {
    if (!email) return null;
    const domain = email.split("@")[1]?.toLowerCase() || "";
    const providers = {
      "gmail.com": { label: "G", color: "bg-red-500" },
      "googlemail.com": { label: "G", color: "bg-red-500" },
      "outlook.com": { label: "O", color: "bg-blue-500" },
      "hotmail.com": { label: "O", color: "bg-blue-500" },
      "live.com": { label: "O", color: "bg-blue-500" },
      "yahoo.com": { label: "Y", color: "bg-violet-500" },
      "icloud.com": { label: "I", color: "bg-slate-500" },
      "aol.com": { label: "A", color: "bg-sky-500" },
    };

    const provider = providers[domain];
    if (!provider) {
      return (
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] text-zinc-300">
          <Mail size={10} />
        </span>
      );
    }

    return (
      <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${provider.color} text-[10px] font-semibold text-white`}>
        {provider.label}
      </span>
    );
  };

  return (
    <div className="relative min-h-screen bg-[#040404] text-white overflow-hidden">
      {/* Navbar */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold">GenWeb.ai</div>

          <div className="flex items-center gap-5">
            <div className="hidden md:inline text-sm text-zinc-400 hover:text-white cursor-pointer transition" onClick={() => navigate("/pricing")}>
              Pricing
            </div>

            {userData && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm cursor-pointer hover:bg-white/10 transition" onClick={() => navigate("/pricing")}>
                <Coins size={14} className="text-yellow-400" />
                <span className="text-zinc-300">Credits</span>
                <span>{userData.credits ?? 100}</span>
                <span className="font-semibold">+</span>
              </div>
            )}

            {!userData ? (
              <button
                className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 text-sm"
                onClick={() => setOpenLogin(true)} 
              >
                Get Started
              </button>
            ) : (
              <div className="relative">
                <button
                  className="flex items-center"
                  onClick={() => setOpenProfile(!openProfile)}
                >
                  <img
                    src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full border border-white/20 object-cover"
                  />
                </button>
              <AnimatePresence>
                {openProfile && (
                  <>
                  <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-60 z-50 rounded-xl bg-[#0b0b0b] border border-white/10 shadow-2xl overflow-hidden"
                  >
                    <div className="p-4 border-b border-white/10">
                      <p className="text-sm font-semibold text-white">{displayName}</p>
                      <p className="flex items-center gap-2 text-xs text-zinc-400">
                        {getEmailProviderBadge(displayEmail)}
                        <span className="truncate">{displayEmail}</span>
                      </p>
                    </div>
                    
                    <button className='md:hidden w-full px-4 py-3 flex items-center gap-2 text-sm border-b border-white/10 hover:bg-white/5'>
                    <Coins size={14} className='text-yellow-400'/>
                    <span className="text-zinc-300">Credits</span>
                    <span>{userData.credits ?? 100}</span>
                    <span className="font-semibold">+</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate("/dashboard");
                        setOpenProfile(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-white/5"
                    >
                      Dashboard
                    </button>
                    <button onClick={handleLogout} className='w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-white/5'>Logout</button>

                  </motion.div>
                  </>
                )}
              </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Hero Section */}
      <section className="pt-44 pb-32 px-6 text-center">
        <motion.h1
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold tracking-tight"
        >
          Build Stunning Websites <br />
          <span className="bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            with AI
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-zinc-400 mt-6 max-w-2xl mx-auto"
        >
          Describe your idea and let AI generate a modern, responsive,
          production-ready website.
        </motion.p>

        <motion.button
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="px-10 py-4 rounded-xl bg-white text-black font-semibold hover:scale-105 transition mt-6"
          onClick={() => {
            if (userData) {
              navigate("/dashboard");
            } else {
              setOpenLogin(true);
            }
          }}
        >
          {userData ? "Go to dashboard" : "Get Started"}
        </motion.button>
      </section>

      {(!userData || (userData && websites.length === 0)) && (
        <section className="max-w-7xl mx-auto px-6 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {highlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="rounded-2xl bg-white/5 border border-white/10 p-8"
              >
                <h1 className="text-xl font-semibold mb-3">{highlight}</h1>

                <p className="text-sm text-zinc-400">
                  GenWeb.ai builds real websites, clean code, animations,
                  responsive, and scalable structure.
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {userData && websites.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-32">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-indigo-300">Your websites</p>
              <h3 className="mt-2 text-2xl font-semibold">Continue from your saved sites</h3>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10"
            >
              Open dashboard
            </button>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {websites.map((site, index) => (
              <article
                key={site._id || index}
                onClick={() => navigate(`/editor/${site._id}`)}
                className="group cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:border-indigo-400/60 hover:bg-white/10"
              >
                <div className="relative h-40 bg-black">
                  <iframe
                    srcDoc={site.latestCode || ""}
                    title={site.title || "Website preview"}
                    className="absolute inset-0 h-[140%] w-[140%] origin-top-left scale-[0.72] bg-white pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-black/25" />
                </div>

                <div className="p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">Website</p>
                  <h4 className="mt-2 text-xl font-semibold text-white">{site.title || "Untitled website"}</h4>
                  <p className="mt-2 text-sm text-zinc-300">
                    Last updated {new Date(site.updatedAt || Date.now()).toLocaleDateString()}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/editor/${site._id}`);
                    }}
                    className="mt-4 rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
                  >
                    Open site
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
      {/* Footer */}
      <footer className="border-t border-white/10 py-10 text-center text-sm text-zinc-500">
        &copy; {new Date().getFullYear()} GenWeb.ai. All rights reserved.
      </footer>

      {openLogin && (
        <LoginModal
          open={openLogin}
          onClose={() => setOpenLogin(false)}
        />
      )}
    </div>
  );
}

export default Home;