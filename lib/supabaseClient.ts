import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oozarphayvtwssgieqoo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vemFycGhheXZ0d3NzZ2llcW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNTgyNzMsImV4cCI6MjA4MDkzNDI3M30.TKgxuD5eJJqK1-XCrZYcBKqYwUvAgNAdTwwd98rxdCw';

export const supabase = createClient(supabaseUrl, supabaseKey);
