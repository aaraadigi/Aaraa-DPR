
import React, { useState } from 'react';
import { Camera, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { supabase } from '../lib/supabaseClient';
import { triggerDriveSync } from '../lib/googleDriveSync';

export const SitePhotoUpload: React.FC<{ projectId: string, projectCode: string, userId: string }> = ({ 
  projectId, projectCode, userId 
}) => {
  const [photos, setPhotos] = useState<{file: File, preview: string}[]>([]);
  const [purpose, setPurpose] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Fix: Use a standard for loop to iterate over FileList. 
      // This avoids TypeScript's 'unknown' inference issue seen with Array.from(FileList).map
      const newFiles: {file: File, preview: string}[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        newFiles.push({
          file,
          preview: URL.createObjectURL(file)
        });
      }
      setPhotos(prev => [...prev, ...newFiles]);
    }
  };

  const handleUpload = async () => {
    if (photos.length === 0 || !purpose) return alert("Select photos and enter purpose.");
    setUploading(true);

    try {
      const fileNames: string[] = [];
      
      // 1. Upload to Temp Buffer in Supabase Storage
      for (const p of photos) {
        const ext = p.file.name.split('.').pop();
        const path = `temp-buffer/${projectCode}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const { error } = await supabase.storage.from('erp-uploads').upload(path, p.file);
        if (!error) fileNames.push(path);
      }

      // 2. Trigger Backend Sync to Google Drive
      await triggerDriveSync({
        project_code: projectCode,
        uploader_id: userId,
        upload_type: 'Site_Photos',
        purpose: purpose,
        file_names: fileNames
      });

      setSuccess(true);
      setPhotos([]);
      setPurpose('');
    } catch (err) {
      alert("Sync failed. Admin has been notified.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <GlassCard className="max-w-2xl mx-auto">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Camera className="text-blue-500" /> Cloud Site Reporting
      </h3>
      
      <div className="space-y-4">
        <textarea 
          placeholder="What are these photos for? (e.g., Column reinforcement check)"
          value={purpose}
          onChange={e => setPurpose(e.target.value)}
          className="w-full p-4 bg-slate-50 border rounded-2xl text-sm"
          rows={3}
        />

        <div className="grid grid-cols-4 gap-2">
          {photos.map((p, i) => (
            <div key={i} className="aspect-square rounded-lg overflow-hidden border">
              <img src={p.preview} className="w-full h-full object-cover" />
            </div>
          ))}
          <label className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-50">
            <Camera className="text-slate-300" />
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        </div>

        {success ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center justify-center gap-2 font-bold">
            <CheckCircle2 size={20} /> Photos synced to Google Drive
          </div>
        ) : (
          <button 
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {uploading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
            {uploading ? 'Syncing to Google Drive...' : 'Upload to Cloud Archive'}
          </button>
        )}
      </div>
    </GlassCard>
  );
};
