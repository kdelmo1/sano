import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const supabaseUrl = "https://qjtboybwetairixuiqmc.supabase.co";
const supabasePublishableKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqdGJveWJ3ZXRhaXJpeHVpcW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4ODk5NjQsImV4cCI6MjA3NjQ2NTk2NH0.0jDUcVJPAxEiPkOBYG9SeUrHhuFZqVcQ1eOkJWzKCoU";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
