import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Watches Table CRUD ───────────────────────────────────────
export const fetchWatches = async () => {
   const { data, error } = await supabase
      .from('watches')
      .select('*')
      .order('created_at', { ascending: false });

   if (error) throw error;
   return data;
};

export const insertWatch = async (watch) => {
   const { data, error } = await supabase
      .from('watches')
      .insert([watch])
      .select()
      .single();

   if (error) throw error;
   return data;
};

// ─── Image Storage ────────────────────────────────────────────
export const uploadImage = async (file) => {
   const fileExt = file.name.split('.').pop();
   const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
   const filePath = `watches/${fileName}`;

   const { error } = await supabase.storage
      .from('watch-images')
      .upload(filePath, file, {
         cacheControl: '3600',
         upsert: false,
      });

   if (error) throw error;

   // Get public URL
   const { data } = supabase.storage
      .from('watch-images')
      .getPublicUrl(filePath);

   return data.publicUrl;
};

export const deleteWatches = async (ids) => {
   if (!ids || ids.length === 0) return;
   const { error } = await supabase
      .from('watches')
      .delete()
      .in('id', ids);

   if (error) throw error;
   return true;
};

export const deleteImages = async (urls) => {
   if (!urls || urls.length === 0) return;

   // Extract paths from URLs
   // Format: .../storage/v1/object/public/watch-images/watches/filename.jpg
   // We need: watches/filename.jpg
   const paths = urls
      .filter(url => url && url.includes('watch-images/'))
      .map(url => {
         const parts = url.split('watch-images/');
         return parts.length > 1 ? parts[1] : null;
      })
      .filter(Boolean);

   if (paths.length === 0) return;

   const { error } = await supabase.storage
      .from('watch-images')
      .remove(paths);

   if (error) throw error;
   return true;
};
