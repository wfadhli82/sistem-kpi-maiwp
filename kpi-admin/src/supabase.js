import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dkyqxhlirikkufkiwwnt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRreXF4aGxpcmlra3Vma2l3d250Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDM2NTgsImV4cCI6MjA2OTA3OTY1OH0.1sl3yf6AM6tdDYSz99ZWnH9sGX4So5TBKzCTW8mHlzM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 