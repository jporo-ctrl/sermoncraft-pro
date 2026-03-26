import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://swxhwdyszgmjznvhmavq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3eGh3ZHlzemdtanpudmhtYXZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5Mzc5OTcsImV4cCI6MjA4OTUxMzk5N30.nd1Vzmkhi0gklchYnu6OmW4C_LZ_CkS1_G7wQ2SPGW4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);