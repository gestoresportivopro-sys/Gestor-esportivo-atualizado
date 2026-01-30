import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nncxdwthzepdcvhttmvv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uY3hkd3RoemVwZGN2aHR0bXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzM2MjMsImV4cCI6MjA4NTMwOTYyM30.9T6JKIhIyaSisfT7kS80v8fHtgS6W6awh7FTwG6UZjg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);