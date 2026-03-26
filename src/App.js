import { useState, useEffect } from "react";
import SermonCraftPro from "./SermonCraftPro";
import AuthScreen from "./AuthScreen";
import { supabase } from "./lib/supabase";
import { getUserProfile } from "./lib/auth";

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(function() {
    supabase.auth.getSession().then(function({ data }) {
      setSession(data.session);
      if (data.session) {
        getUserProfile(data.session.user.id)
          .then(function(p) { setProfile(p); })
          .catch(function() { setProfile(null); })
          .finally(function() { setLoading(false); });
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(function(event, newSession) {
      setSession(newSession);
      if (newSession) {
        getUserProfile(newSession.user.id)
          .then(function(p) { setProfile(p); })
          .catch(function() { setProfile(null); });
      } else {
        setProfile(null);
      }
    });

    return function() {
      listener.subscription.unsubscribe();
    };
  }, []);

  function handleAuth(user, newSession) {
    setSession(newSession);
    getUserProfile(user.id)
      .then(function(p) { setProfile(p); })
      .catch(function() { setProfile(null); });
  }

  function handleSignOut() {
    setSession(null);
    setProfile(null);
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Georgia', serif",
        fontSize: 16,
        color: "#8B7355",
        backgroundColor: "#FDFAF5",
      }}>
        Loading...
      </div>
    );
  }

  if (!session) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  return (
    <SermonCraftPro
      user={session.user}
      profile={profile}
      onSignOut={handleSignOut}
    />
  );
}

export default App;