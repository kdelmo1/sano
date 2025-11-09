import React from 'react';
import { User } from "@supabase/supabase-js";

type AuthContextType = {
  isLoggedIn: boolean;
  user: User | null;
};

const AuthContext = React.createContext<AuthContextType>({
    isLoggedIn: false,
    user: null,
});

export default AuthContext;