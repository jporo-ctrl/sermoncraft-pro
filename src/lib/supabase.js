supabase.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  "https://swxhwdyszgmjznvhmavq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3eGh3ZHlzemdtanpudmhtYXZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5Mzc5OTcsImV4cCI6MjA4OTUxMzk5N30.nd1Vzmkhi0gklchYnu6OmW4C_LZ_CkS1_G7wQ2SPGW4"
)
async function test() {
  const { data, error } = await supabase.from("sermons").select("*")
  console.log("SUPABASE TEST:", data, error)
}

test()