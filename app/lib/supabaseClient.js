import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const watchSelectFields =
   'id, model_name, brand, mrp, color, dial_color, image_url, created_at';

export const fetchWatches = async ({ page = 0, pageSize } = {}) => {
   let query = supabase
      .from('watches')
      .select(watchSelectFields, { count: 'exact' })
      .order('created_at', { ascending: false });

   if (typeof pageSize === 'number' && pageSize > 0) {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
   }

   const { data, error, count } = await query;

   if (error) throw error;
   return {
      items: data ?? [],
      count: count ?? 0,
   };
};

export const insertWatch = async (watch) => {
   const { data, error } = await supabase
      .from('watches')
      .insert([watch])
      .select(watchSelectFields)
      .single();

   if (error) throw error;
   return data;
};

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

   const { data } = supabase.storage
      .from('watch-images')
      .getPublicUrl(filePath);

   return data.publicUrl;
};

export const deleteWatches = async (ids) => {
   if (!ids || ids.length === 0) return;

   const { error } = await supabase.from('watches').delete().in('id', ids);

   if (error) throw error;
   return true;
};

export const deleteImages = async (urls) => {
   if (!urls || urls.length === 0) return;

   const paths = urls
      .filter((url) => url && url.includes('watch-images/'))
      .map((url) => {
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

// --- Brand Management ---

export const fetchBrands = async () => {
   const { data, error } = await supabase
      .from('brands')
      .select('id, name, logo_url, created_at')
      .order('name', { ascending: true });

   if (error) throw error;
   return data ?? [];
};

export const insertBrand = async (brand) => {
   const { data, error } = await supabase
      .from('brands')
      .insert([brand])
      .select()
      .single();

   if (error) throw error;
   return data;
};

export const uploadBrandLogo = async (file) => {
   const fileExt = file.name.split('.').pop();
   const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
   const filePath = `logos/${fileName}`;

   const { error } = await supabase.storage
      .from('brand-logos')
      .upload(filePath, file, {
         cacheControl: '3600',
         upsert: false,
      });

   if (error) throw error;

   const { data } = supabase.storage
      .from('brand-logos')
      .getPublicUrl(filePath);

   return data.publicUrl;
};
