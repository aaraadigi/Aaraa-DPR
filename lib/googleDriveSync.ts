
import { supabase } from './supabaseClient';

export const triggerDriveSync = async (sessionData: {
  project_code: string;
  uploader_id: string;
  upload_type: 'Site_Photos' | 'Invoices' | 'Drawings';
  purpose: string;
  file_names: string[];
}) => {
  // 1. Create the database record to trigger the Webhook/Edge Function
  const { data, error } = await supabase
    .from('upload_sessions')
    .insert({
      project_code: sessionData.project_code,
      uploader_id: sessionData.uploader_id,
      upload_type: sessionData.upload_type,
      purpose: sessionData.purpose,
      file_count: sessionData.file_names.length,
      status: 'PENDING'
    })
    .select()
    .single();

  if (error) throw error;

  // Note: The actual heavy lifting (Supabase -> Drive) is handled 
  // by the Supabase Edge Function triggered by this DB insert.
  return data;
};
