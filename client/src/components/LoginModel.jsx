import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import axios from "axios";
import { serverUrl } from "../config";
import { useDispatch } from 'react-redux'
import { setUserData } from "../redux/userSlice";

function LoginModal({ open, onClose }) {
  const dispatch = useDispatch();
  const [previewUser, setPreviewUser] = useState(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleAuth = async () => {
    try {
      setIsSigningIn(true);
      const result = await signInWithPopup(auth, provider);
      const profile = result.user.providerData?.[0] || {};
      const userPayload = {
        name: result.user.displayName || profile.displayName || "Google User",
        email: result.user.email || profile.email,
        avatar: result.user.photoURL || profile.photoURL || "",
      };

      const { data } = await axios.post(
        `${serverUrl}/api/auth/google`,
        userPayload,
        {
          withCredentials: true,
        }
      );

      // Store token and user data
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      
      // Store user data without token
      const { token, ...userDataWithoutToken } = data;
      dispatch(setUserData(userDataWithoutToken));
      localStorage.setItem("user", JSON.stringify(userDataWithoutToken));
      setPreviewUser(userDataWithoutToken);

      // show preview briefly then close modal
      setTimeout(() => {
        setIsSigningIn(false);
        setPreviewUser(null);
        onClose();
      }, 1200);
    } catch (error) {
      console.error(error);
      setIsSigningIn(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative w-full max-w-md p-px rounded-3xl bg-linear-to-br from-purple-500/40 via-blue-500/30 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-3xl bg-[#0b0b0b] border-white/10 shadow-[0_30px_120px_rgba(0,0,0,0)] overflow-hidden">
              <motion.div
                animate={{
                  opacity: [0.25, 0.4, 0.25],
                  transition: { duration: 6, repeat: Infinity },
                }}
                className="absolute -top-32 -left-32 w-80 h-80 bg-purple-500/30 blur-[140px]"
              />

              <motion.div
                animate={{
                  opacity: [0.2, 0.35, 0.2],
                  transition: {
                    duration: 6,
                    repeat: Infinity,
                    delay: 2,
                  },
                }}
                className="absolute -top-32 -left-32 w-80 h-80 bg-purple-500/30 blur-[140px]"
              />
              <button
                type="button"
                className="absolute top-5 right-5 z-10 text-zinc-400 hover:text-white transition text-lg font-bold w-8 h-8 flex items-center justify-center pointer-events-auto cursor-pointer"
                onClick={onClose}
              >
                X
              </button>

              <div className="relative p-8 pt-14 pb-10 text-center">
                <h1 className="inline-block mb-6 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300">AI-powered website builder</h1>
                <h2 className="text-3xl font-semibold leading-tight mb-3 space-x-2">
                  <span>Welcome to</span>
                  <span className="bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">GenWeb.ai</span>
                </h2>

                {/* If previewUser exists, show signed-in preview inside modal */}
                {previewUser ? (
                  <div className="mx-auto w-full max-w-xs bg-white/3 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                    {previewUser.avatar ? (
                      <img src={previewUser.avatar} alt={previewUser.name} className="h-11 w-11 rounded-full object-cover" />
                    ) : (
                      <div className="h-11 w-11 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">{(previewUser.name || "?").charAt(0)}</div>
                    )}
                    <div className="text-left">
                      <div className="text-sm font-semibold">Signed in as</div>
                      <div className="text-sm text-zinc-200 truncate">{previewUser.name}</div>
                      <div className="text-xs text-zinc-400">{previewUser.email}</div>
                    </div>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleGoogleAuth}
                    className="group relative w-full h-13 rounded-xl bg-white text-black font-semibold shadow-x1 overflow-hidden"
                    disabled={isSigningIn}
                  >
                    <div className="relative flex items-center justify-center gap-3">
                      <img src="https://www.svgrepo.com/show/303108/google-icon-logo.svg" alt="Google logo" className="h-5 w-5" />
                      <span>{isSigningIn ? "Signing in..." : "Continue with Google"}</span>
                    </div>
                  </motion.button>
                )}

                <div className="flex items-center gap-4 my-10">
                  <div className="h-px flex-1 bg-white-wide/10">
                    <span className="text-xs text-zinc-500 tracking-wide">Secure Login</span>
                    <div className="h-px flex-1 bg-white/10"></div>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 loading-relaxed">
                  By continuing, you agree to our {" "}
                  <span className="underline cursor-pointer hover:text-zinc300">Terms of Service</span>{" "} and {" "}
                  <span className="underline cursor-pointer hover:text-zinc-300">Privacy Policy</span>
                </p>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LoginModal;
