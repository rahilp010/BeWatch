import { useState, useEffect, useRef, useMemo, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
   Check,
   LayoutPanelTop,
   Loader2,
   Trash2,
   Layout,
   MoreHorizontal,
} from 'lucide-react';
import {
   insertWatch,
   insertWatches,
   uploadImage,
   deleteWatches,
   deleteImages,
} from '../lib/supabaseClient';
import { useWatches, watchesQueryKey } from '../hooks/useWatches';
import { useBrands, brandsQueryKey } from '../hooks/useBrands';
import { insertBrand, uploadBrandLogo } from '../lib/supabaseClient';
import TemplateCreator from './TemplateCreator';
import {
   Plus,
   X as XIcon,
   Image as ImageIcon,
   CheckCircle2,
} from 'lucide-react';

const normalizeBrandName = (value) =>
   (value || '').trim().replace(/\s+/g, ' ').toLowerCase();

const GalleryPage = () => {
   const navigate = useNavigate();
   const queryClient = useQueryClient();
   const { data: watchData, isLoading } = useWatches();
   const [filter, setFilter] = useState('All');
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

   const { data: brandsData, isLoading: isLoadingBrands } = useBrands({
      enabled: true,
   });
   const [isTemplateCreatorOpen, setIsTemplateCreatorOpen] = useState(false);
   const [dragActive, setDragActive] = useState(false);
   const [selectionMode, setSelectionMode] = useState(false);
   const [selectedIds, setSelectedIds] = useState([]);
   const [brandLogoFile, setBrandLogoFile] = useState(null);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isAddingBrand, setIsAddingBrand] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);
   const [notification, setNotification] = useState(null); // { type, title, message, onConfirm }
   const [isMobile, setIsMobile] = useState(false);
   const [isFilterPending, startFilterTransition] = useTransition();
   const hasHydratedWatches = useRef(false);

   const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
   const filterMenuRef = useRef(null);

   useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
   }, []);

   useEffect(() => {
      const handleClickOutside = (event) => {
         if (
            filterMenuRef.current &&
            !filterMenuRef.current.contains(event.target)
         ) {
            setIsFilterMenuOpen(false);
         }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
         document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   const [formData, setFormData] = useState({
      brand: 'Titan',
   });

   const [watchItems, setWatchItems] = useState([
      {
         id: Date.now(),
         modelName: '',
         mrp: '',
         color: '',
         dialColor: '',
         image: '',
         imageFile: null,
      },
   ]);

   const [images, setImages] = useState([
      {
         id: 'static-1',
         src: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1200&auto=format&fit=crop',
         alt: 'Titan Regalia',
         brand: 'Titan',
         className: 'md:col-span-2 md:row-span-2',
      },
      {
         id: 'static-2',
         src: 'https://images.unsplash.com/photo-1712256840261-f9d23b6c42a5?q=80&w=687&auto=format&fit=crop',
         alt: 'Casio Edifice',
         brand: 'Casio',
         className: 'md:col-span-1 md:row-span-1',
      },
      {
         id: 'static-3',
         src: 'https://images.unsplash.com/photo-1690392377043-105546e33cf6?q=80&w=627&auto=format&fit=crop',
         alt: 'Fossil Heritage',
         brand: 'Fossil',
         className: 'md:col-span-1 md:row-span-2',
      },
      {
         id: 'static-4',
         src: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=800&auto=format&fit=crop',
         alt: 'Seiko Prospex',
         brand: 'Seiko',
         className: 'md:col-span-1 md:row-span-1',
      },
      {
         id: 'static-5',
         src: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1200&auto=format&fit=crop',
         alt: 'Fastrack Limitless',
         brand: 'Fastrack',
         className: 'md:col-span-2 md:row-span-1',
      },
      {
         id: 'static-6',
         src: 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?q=80&w=800&auto=format&fit=crop',
         alt: 'Titan Nebula',
         brand: 'Titan',
         className: 'md:col-span-1 md:row-span-1',
      },
      {
         id: 'static-7',
         src: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?q=80&w=800&auto=format&fit=crop',
         alt: 'Casio G-Shock',
         brand: 'Casio',
         className: 'md:col-span-1 md:row-span-1',
      },
      {
         id: 'static-8',
         src: 'https://images.unsplash.com/photo-1692992214153-edeb693a2da3?q=80&w=735&auto=format&fit=crop',
         alt: 'Seiko Presage',
         brand: 'Seiko',
         className: 'md:col-span-2 md:row-span-2',
      },
      {
         id: 'static-9',
         src: 'https://images.unsplash.com/photo-1711227266361-5962d59b0268?q=80&w=687&auto=format&fit=crop',
         alt: 'Fossil Gen 6',
         brand: 'Fossil',
         className: 'md:col-span-1 md:row-span-1',
      },
      {
         id: 'static-10',
         src: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?q=80&w=800&auto=format&fit=crop',
         alt: 'Fastrack Reflex',
         brand: 'Fastrack',
         className: 'md:col-span-1 md:row-span-1',
      },
      {
         id: 'static-11',
         src: 'https://images.unsplash.com/photo-1723629159965-b0628625f45e?q=80&w=2061&auto=format&fit=crop',
         alt: 'Titan Maritime Pro',
         brand: 'Titan',
         className: 'md:col-span-1 md:row-span-1',
      },
   ]);

   const [brandFormData, setBrandFormData] = useState({
      name: '',
      logoUrl: '',
   });

   const availableBrands = useMemo(() => {
      const brandMap = new Map();

      const registerBrand = (brand) => {
         const displayName = (brand || '').trim().replace(/\s+/g, ' ');
         const normalized = normalizeBrandName(displayName);

         if (!displayName || !normalized || brandMap.has(normalized)) return;
         brandMap.set(normalized, displayName);
      };

      images.forEach((img) => registerBrand(img.brand));
      (brandsData || []).forEach((brand) => registerBrand(brand.name));

      return [
         'All',
         ...Array.from(brandMap.values()).sort((a, b) => a.localeCompare(b)),
      ];
   }, [images, brandsData]);

   const handleFilterChange = (brand) => {
      startFilterTransition(() => {
         setFilter(brand);
      });
   };

   useEffect(() => {
      if (!watchData?.items) return;
      if (hasHydratedWatches.current) return;
      hasHydratedWatches.current = true;

      const mapped = watchData.items.map((w) => ({
         id: w.id,
         src: w.image_url,
         alt: w.model_name,
         brand: w.brand,
         mrp: w.mrp,
         color: w.color,
         dialColor: w.dial_color,
         className: 'md:col-span-1 md:row-span-1',
      }));

      setImages((prev) => {
         const staticItems = prev.filter(
            (img) => typeof img.id === 'string' && img.id.startsWith('static-'),
         );
         return [...mapped, ...staticItems];
      });
   }, [watchData]);

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
   };

   const handleItemInputChange = (id, e) => {
      const { name, value } = e.target;
      setWatchItems((prev) =>
         prev.map((item) =>
            item.id === id ? { ...item, [name]: value } : item,
         ),
      );
   };

   const addWatchItem = () => {
      setWatchItems((prev) => [
         ...prev,
         {
            id: Date.now(),
            modelName: '',
            mrp: '',
            color: '',
            dialColor: '',
            image: '',
            imageFile: null,
         },
      ]);
   };

   const removeWatchItem = (id) => {
      if (watchItems.length === 1) {
         setWatchItems([
            {
               id: Date.now(),
               modelName: '',
               mrp: '',
               color: '',
               dialColor: '',
               image: '',
               imageFile: null,
            },
         ]);
         return;
      }
      setWatchItems((prev) => prev.filter((item) => item.id !== id));
   };

   // Drag & Drop Handlers
   const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
         setDragActive(true);
      } else if (e.type === 'dragleave') {
         setDragActive(false);
      }
   };

   const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
         handleFiles(e.dataTransfer.files);
      }
   };

   const handleChangeFile = (e) => {
      e.preventDefault();
      if (e.target.files && e.target.files.length > 0) {
         handleFiles(e.target.files);
      }
   };

   const handleFiles = (files) => {
      const newItems = Array.from(files).map((file, index) => ({
         id: Date.now() + index,
         modelName: file.name.split('.')[0].replace(/[-_]/g, ' '),
         mrp: '',
         color: '',
         dialColor: '',
         image: URL.createObjectURL(file),
         imageFile: file,
      }));

      setWatchItems((prev) => {
         const isEmpty =
            prev.length === 1 && !prev[0].image && !prev[0].modelName;
         return isEmpty ? newItems : [...prev, ...newItems];
      });
   };

   const clearImage = (id) => {
      setWatchItems((prev) =>
         prev.map((item) =>
            item.id === id ? { ...item, image: '', imageFile: null } : item,
         ),
      );
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      const itemsToSync = watchItems.filter(
         (item) => item.image || item.modelName,
      );
      if (itemsToSync.length === 0) {
         setIsSubmitting(false);
         return;
      }

      const previousCache = queryClient.getQueryData(watchesQueryKey);
      const currentBrand = formData.brand;

      // Optimistic watches for the UI
      const optimisticWatches = itemsToSync.map((item) => ({
         id: `temp-${item.id}`,
         src:
            item.image ||
            'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=800&auto=format&fit=crop',
         alt: item.modelName,
         brand: currentBrand,
         mrp: Number(item.mrp) || 0,
         color: item.color,
         dialColor: item.dialColor,
         className: 'md:col-span-1 md:row-span-1',
         isSyncing: true,
      }));

      // Update Query Cache
      queryClient.setQueryData(watchesQueryKey, (current) => {
         const items = current?.items ?? [];
         return {
            items: [...optimisticWatches, ...items],
            count: (current?.count ?? 0) + optimisticWatches.length,
         };
      });

      // Update Local State
      setImages((prev) => [...optimisticWatches, ...prev]);
      setSelectionMode(false);
      setSelectedIds([]);
      setIsModalOpen(false);

      // Reset Modal State
      setFormData({ brand: currentBrand });
      setWatchItems([
         {
            id: Date.now(),
            modelName: '',
            mrp: '',
            color: '',
            dialColor: '',
            image: '',
            imageFile: null,
         },
      ]);

      try {
         // 1. Upload all images in parallel
         const syncedItems = await Promise.all(
            itemsToSync.map(async (item) => {
               let imageUrl = item.image;
               if (item.imageFile) {
                  imageUrl = await uploadImage(item.imageFile);
               }
               return {
                  model_name: item.modelName,
                  brand: currentBrand,
                  mrp: Number(item.mrp) || 0,
                  color: item.color,
                  dial_color: item.dialColor,
                  image_url:
                     imageUrl ||
                     'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=800&auto=format&fit=crop',
                  tempId: `temp-${item.id}`,
               };
            }),
         );

         // 2. Bulk insert watches
         const dbWatches = await insertWatches(
            syncedItems.map(({ tempId, ...rest }) => rest),
         );

         // 3. Map DB results back to temp IDs and update cache
         queryClient.setQueryData(watchesQueryKey, (current) => {
            if (!current) return current;
            const items = current.items ?? [];
            let updatedItems = [...items];

            syncedItems.forEach((synced, idx) => {
               const dbWatch = dbWatches[idx];
               updatedItems = updatedItems.map((img) =>
                  img.id === synced.tempId
                     ? {
                          ...img,
                          id: dbWatch.id,
                          src: dbWatch.image_url,
                          alt: dbWatch.model_name,
                          brand: dbWatch.brand,
                          mrp: dbWatch.mrp,
                          color: dbWatch.color,
                          dialColor: dbWatch.dial_color,
                          isSyncing: false,
                       }
                     : img,
               );
            });

            return { ...current, items: updatedItems };
         });

         // Update Local Images State
         setImages((prev) => {
            let updated = [...prev];
            syncedItems.forEach((synced, idx) => {
               const dbWatch = dbWatches[idx];
               updated = updated.map((img) =>
                  img.id === synced.tempId
                     ? {
                          ...img,
                          id: dbWatch.id,
                          src: dbWatch.image_url,
                          alt: dbWatch.model_name,
                          brand: dbWatch.brand,
                          mrp: dbWatch.mrp,
                          color: dbWatch.color,
                          dialColor: dbWatch.dial_color,
                          isSyncing: false,
                       }
                     : img,
               );
            });
            return updated;
         });
      } catch (err) {
         console.error('Failed to sync watches with Supabase:', err);
         if (previousCache) {
            queryClient.setQueryData(watchesQueryKey, previousCache);
         }
         // Restore previous images state or just clear the syncing ones
         setImages((prev) =>
            prev.filter((img) => !optimisticWatches.find((o) => o.id === img.id)),
         );
         setNotification({
            type: 'error',
            title: 'Sync Failed',
            message:
               'Failed to save some timepieces to cloud. They have been removed from the view.',
         });
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleBrandSubmit = async (e) => {
      e.preventDefault();
      const brandName = brandFormData.name.trim().replace(/\s+/g, ' ');
      if (!brandName) return;

      setIsAddingBrand(true);
      try {
         let logoUrl = brandFormData.logoUrl;
         if (brandLogoFile) {
            logoUrl = await uploadBrandLogo(brandLogoFile);
         }

         await insertBrand({
            name: brandName,
            logo_url: logoUrl,
         });

         setBrandFormData({ name: '', logoUrl: '' });
         setBrandLogoFile(null);
         await queryClient.invalidateQueries({ queryKey: brandsQueryKey });

         setNotification({
            type: 'success',
            title: 'Brand Added',
            message: `"${brandName}" has been successfully added to your brands.`,
         });
         // Don't close modal, let user add more or see the list
      } catch (err) {
         console.error('Failed to add brand:', err);
         setNotification({
            type: 'error',
            title: 'Failed to Add Brand',
            message:
               'An error occurred while saving the brand. It might already exist.',
         });
      } finally {
         setIsAddingBrand(false);
      }
   };

   const toggleSelection = (id) => {
      if (!selectionMode) return;
      setSelectedIds((prev) =>
         prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
      );
   };

   const handleDoubleClick = (id) => {
      if (selectionMode) return;
      setSelectionMode(true);
      setSelectedIds([id]);
   };

   // Long press for mobile
   const [longPressTimer, setLongPressTimer] = useState(null);
   const handleTouchStart = (id) => {
      if (selectionMode) return;
      const timer = setTimeout(() => {
         setSelectionMode(true);
         setSelectedIds([id]);
         if (navigator.vibrate) navigator.vibrate(50);
      }, 600);
      setLongPressTimer(timer);
   };

   const handleTouchEnd = () => {
      if (longPressTimer) {
         clearTimeout(longPressTimer);
         setLongPressTimer(null);
      }
   };

   const exitSelectionMode = () => {
      setSelectionMode(false);
      setSelectedIds([]);
   };

   const handleSaveTemplate = (newTemplate) => {
      const savedTemplates = JSON.parse(
         localStorage.getItem('custom-templates') || '[]',
      );
      localStorage.setItem(
         'custom-templates',
         JSON.stringify([...savedTemplates, newTemplate]),
      );
      setNotification({
         type: 'success',
         title: 'Template Saved',
         message: `"${newTemplate.name}" has been added to your catalog builder.`,
      });
   };

   const handleCreateCatalog = () => {
      const selectedImages = images.filter((img) =>
         selectedIds.includes(img.id),
      );
      navigate('/builder', { state: { selectedImages } });
   };

   const handleDelete = async (idsToDelete) => {
      const ids = Array.isArray(idsToDelete) ? idsToDelete : [idsToDelete];
      if (ids.length === 0) return;

      const confirmMsg =
         ids.length === 1
            ? 'Are you sure you want to delete this timepiece? This action cannot be undone.'
            : `Are you sure you want to delete these ${ids.length} timepieces? This action cannot be undone.`;

      setNotification({
         type: 'delete',
         title: 'Confirm Deletion',
         message: confirmMsg,
         onConfirm: async () => {
            setNotification(null);
            setIsDeleting(true);
            const previousCache = queryClient.getQueryData(watchesQueryKey);
            const previousImages = images;

            queryClient.setQueryData(watchesQueryKey, (current) => {
               if (!current) return current;
               const items = current.items ?? [];
               const removedCount = items.filter((item) =>
                  ids.includes(item.id),
               ).length;
               return {
                  ...current,
                  items: items.filter((item) => !ids.includes(item.id)),
                  count: Math.max(0, (current.count ?? 0) - removedCount),
               };
            });

            setImages((prev) => prev.filter((img) => !ids.includes(img.id)));
            try {
               const itemsToDelete = images.filter((img) =>
                  ids.includes(img.id),
               );
               // Supabase IDs are numbers, static ones are 'static-X'
               const dbIds = itemsToDelete
                  .filter((img) => typeof img.id === 'number')
                  .map((img) => img.id);
               const imageUrls = itemsToDelete.map((img) => img.src);

               if (imageUrls.length > 0) {
                  await deleteImages(imageUrls);
               }

               if (dbIds.length > 0) {
                  await deleteWatches(dbIds);
               }

               setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));

               if (selectedIds.length <= ids.length) {
                  setSelectionMode(false);
               }

               setNotification({
                  type: 'success',
                  title: 'Deleted Successfully',
                  message:
                     'The timepiece(s) have been removed from your collection.',
               });
            } catch (err) {
               console.error('Failed to delete watches:', err);
               if (previousCache) {
                  queryClient.setQueryData(watchesQueryKey, previousCache);
               }
               setImages((prev) => {
                  const existingIds = new Set(prev.map((img) => img.id));
                  const restored = previousImages.filter(
                     (img) => ids.includes(img.id) && !existingIds.has(img.id),
                  );
                  return [...restored, ...prev];
               });
               setNotification({
                  type: 'error',
                  title: 'Deletion Failed',
                  message:
                     'Could not remove items from the cloud. They have been hidden from view only.',
               });
            } finally {
               setIsDeleting(false);
            }
         },
      });
   };

   const filteredImages =
      filter === 'All'
         ? images
         : images.filter(
              (img) =>
                 normalizeBrandName(img.brand) === normalizeBrandName(filter),
           );

   const itemVariants = {
      hidden: { opacity: 0, scale: 0.96, y: 8 },
      visible: (index = 0) => ({
         opacity: 1,
         scale: 1,
         y: 0,
         transition: {
            duration: 0.22,
            ease: 'easeOut',
            delay: index * 0.03,
         },
      }),
      exit: {
         opacity: 0,
         scale: 0.96,
         y: -6,
         transition: { duration: 0.16, ease: 'easeInOut' },
      },
   };

   return (
      <div className="min-h-screen w-full bg-[#fdfdfd] text-black font-sans px-6 py-8 lg:px-16 lg:py-12">
         {/* Top Navigation Row */}
         <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex justify-between items-center mb-2">
            <div className="flex items-center gap-6">
               <Link
                  to="/"
                  className="flex items-center space-x-2 text-[#505050] hover:text-[#c09a74] transition-colors duration-300 group">
                  <span className="text-xl group-hover:-translate-x-1 transition-transform duration-300">
                     ←
                  </span>
                  <span className="uppercase tracking-widest text-[10px] md:text-sm font-bold">
                     Back
                  </span>
               </Link>

               {!selectionMode && (
                  <button
                     onClick={() => setSelectionMode(true)}
                     className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-[#c09a74] hover:opacity-70 transition-opacity">
                     Select
                  </button>
               )}

               {selectionMode && (
                  <button
                     onClick={exitSelectionMode}
                     className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-red-500 hover:text-red-600 transition-colors">
                     Cancel ({selectedIds.length})
                  </button>
               )}
            </div>

            <div className="flex items-center gap-4">
               {!selectionMode && (
                  <button
                     onClick={() => setIsTemplateCreatorOpen(true)}
                     className="flex items-center space-x-2 px-4 py-2 md:px-5 md:py-2 rounded-full bg-white border border-[#c09a74] text-[#c09a74] hover:bg-[#c09a74] hover:text-white cursor-pointer transition-all duration-400 group">
                     <span className="text-lg font-light transition-transform duration-300 group-hover:scale-110">
                        <Layout size={18} />
                     </span>
                     {/* <span className="uppercase tracking-widest text-[10px] md:text-sm font-bold">
                        Add Templates
                     </span> */}
                  </button>
               )}

               <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 md:px-5 md:py-2 rounded-full bg-white border border-[#c09a74] text-[#c09a74] hover:bg-[#c09a74] hover:text-white cursor-pointer transition-all duration-400">
                  <span className="text-lg font-light transition-transform duration-300 group-hover:rotate-90">
                     <Plus size={18} />
                  </span>
                  <span className="uppercase tracking-widest text-[10px] md:text-sm font-bold">
                     Add Watch
                  </span>
               </button>
            </div>
         </motion.div>

         <TemplateCreator
            isOpen={isTemplateCreatorOpen}
            onClose={() => setIsTemplateCreatorOpen(false)}
            onSave={handleSaveTemplate}
         />

         {/* Title & Filters Row */}
         <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <motion.div
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="w-full md:w-auto flex flex-col md:flex-row md:items-end relative">
               <h1
                  className="text-4xl md:text-5xl lg:text-7xl tracking-tight font-light italic text-[#c09a74]"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                  {selectionMode ? 'Select Items' : 'Watch Gallery'}
               </h1>
               <p className="text-[#c09a74] text-[10px] md:text-sm tracking-[0.2em] md:tracking-[0.3em] font-bold mt-1 md:mt-2 md:absolute md:left-4 md:-bottom-5 opacity-60">
                  {isMobile ? 'Long press to select' : 'Double click to select'}
               </p>
            </motion.div>

            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               aria-busy={isFilterPending}
               className={`flex flex-wrap items-center gap-3 transition-opacity duration-150 ${
                  isFilterPending ? 'opacity-80' : 'opacity-100'
               }`}>
               {/* Show first 5 pills including "All" */}
               {availableBrands.slice(0, 5).map((brand) => {
                  const isActive = filter === brand;
                  return (
                  <button
                     key={brand}
                     onClick={() => handleFilterChange(brand)}
                     className={`relative isolate overflow-hidden px-4 py-1.5 md:px-6 md:py-2 rounded-full text-[10px] md:text-xs uppercase tracking-widest font-bold transition-colors duration-200 whitespace-nowrap transform-gpu ${
                        isActive
                           ? 'text-white shadow-lg'
                           : 'bg-transparent text-[#505050] border border-[#505050]/20 hover:border-[#c09a74] hover:text-[#c09a74]'
                     } ${isFilterPending ? 'pointer-events-none' : ''}`}>
                     {isActive && (
                        <motion.span
                           layoutId="activeFilterPill"
                           transition={{ type: 'spring', stiffness: 520, damping: 38 }}
                           className="absolute inset-0 rounded-full bg-[#c09a74]"
                        />
                     )}
                     <span className="relative z-10">{brand}</span>
                  </button>
                  );
               })}

               {/* Overflow Menu for remaining brands */}
               {availableBrands.length > 5 && (
                  <div className="relative" ref={filterMenuRef}>
                     <button
                        onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                        className={`p-2 md:p-2.5 rounded-full transition-all duration-300 ${
                           availableBrands.slice(5).includes(filter)
                              ? 'bg-[#c09a74] text-white shadow-lg'
                              : 'bg-transparent text-[#505050] border border-[#505050]/20 hover:border-[#c09a74] hover:text-[#c09a74]'
                        }`}>
                        <MoreHorizontal size={16} />
                     </button>

                     <AnimatePresence>
                        {isFilterMenuOpen && (
                           <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[100] overflow-hidden">
                              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                {availableBrands.slice(5).map((brand) => {
                                   const isActive = filter === brand;
                                   return (
                                   <button
                                      key={brand}
                                      onClick={() => {
                                          handleFilterChange(brand);
                                          setIsFilterMenuOpen(false);
                                       }}
                                       className={`relative isolate overflow-hidden w-full text-left px-5 py-3 text-[10px] md:text-xs uppercase tracking-widest font-bold transition-colors duration-200 ${
                                          isActive
                                             ? 'text-[#c09a74]'
                                             : 'text-[#505050] hover:bg-gray-50 hover:text-[#c09a74]'
                                       }`}>
                                       {isActive && (
                                          <motion.span
                                             layoutId="activeFilterPill"
                                             transition={{ type: 'spring', stiffness: 520, damping: 38 }}
                                             className="absolute inset-0 bg-[#c09a74]/10"
                                          />
                                       )}
                                       <span className="relative z-10">{brand}</span>
                                    </button>
                                   );
                                })}
                              </div>
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
               )}
            </motion.div>
         </div>

         {/* Selection Toolbar */}
         <AnimatePresence>
            {selectedIds.length > 0 && (
               <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="fixed bottom-6 md:bottom-10 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-[200] bg-black/90 text-white px-6 py-4 md:px-8 md:py-4 rounded-3xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-4 md:gap-8 backdrop-blur-md border border-white/10">
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between">
                     <div className="flex flex-col">
                        <span className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-white/50">
                           Selected
                        </span>
                        <span
                           className="text-sm md:text-lg font-light italic"
                           style={{ fontFamily: "'Playfair Display', serif" }}>
                           {selectedIds.length}{' '}
                           {selectedIds.length === 1 ? 'Item' : 'Items'}
                        </span>
                     </div>
                     <div className="md:hidden flex gap-2">
                        <button
                           onClick={() => handleDelete(selectedIds)}
                           disabled={isDeleting}
                           className="p-2 rounded-full bg-red-500/20 text-red-500">
                           <Trash2 size={18} />
                        </button>
                        <button
                           onClick={handleCreateCatalog}
                           className="p-2 rounded-full bg-[#c09a74] text-white">
                           <LayoutPanelTop size={18} />
                        </button>
                     </div>
                  </div>

                  <div className="hidden md:block h-8 w-[1px] bg-white/20" />

                  <div className="hidden md:flex items-center gap-3">
                     <button
                        onClick={() => handleDelete(selectedIds)}
                        disabled={isDeleting}
                        className="flex items-center gap-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-6 py-2 rounded-full transition-all duration-300 group border border-red-500/20 disabled:opacity-50">
                        {isDeleting ? (
                           <Loader2 size={18} className="animate-spin" />
                        ) : (
                           <Trash2 size={18} />
                        )}
                        <span className="uppercase tracking-widest text-xs font-bold">
                           Delete
                        </span>
                     </button>

                     <button
                        onClick={handleCreateCatalog}
                        className="flex items-center gap-3 bg-[#c09a74] hover:bg-[#d4b08d] text-white px-6 py-2 rounded-full transition-all duration-300 group shadow-lg shadow-[#c09a74]/20">
                        <LayoutPanelTop size={18} />
                        <span className="uppercase tracking-widest text-xs font-bold">
                           Create Catalog Builder
                        </span>
                     </button>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         <AnimatePresence>
            {notification && (
               // Enhanced Backdrop: Slightly deeper blur for a more premium feel
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/50 backdrop-blur-md">
                  <motion.div
                     initial={{ scale: 0.95, opacity: 0, y: 10 }}
                     animate={{ scale: 1, opacity: 1, y: 0 }}
                     exit={{ scale: 0.95, opacity: 0, y: 10 }}
                     transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
                     className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] max-w-lg w-full relative overflow-hidden flex flex-col">
                     {/* 
               Dynamic Theme Configuration 
               Softens the semantic colors to fit the luxury theme better
            */}
                     {(() => {
                        const themeMap = {
                           delete: {
                              line: 'bg-rose-500',
                              iconBg: 'bg-rose-50',
                              iconColor: 'text-rose-500',
                              btn: 'bg-rose-500 hover:bg-rose-600',
                           },
                           success: {
                              line: 'bg-emerald-500',
                              iconBg: 'bg-emerald-50',
                              iconColor: 'text-emerald-500',
                              btn: 'bg-emerald-500 hover:bg-emerald-600',
                           },
                           error: {
                              line: 'bg-amber-500',
                              iconBg: 'bg-amber-50',
                              iconColor: 'text-amber-500',
                              btn: 'bg-amber-500 hover:bg-amber-600',
                           },
                           info: {
                              line: 'bg-[#c09a74]',
                              iconBg: 'bg-[#c09a74]/10',
                              iconColor: 'text-[#c09a74]',
                              btn: 'bg-black hover:bg-[#c09a74]',
                           },
                        };
                        const activeTheme =
                           themeMap[notification.type] || themeMap.info;

                        return (
                           <>
                              {/* Elegant ultra-thin top accent line */}
                              <div
                                 className={`h-1 w-full ${activeTheme.line}`}
                              />

                              <div className="p-8 md:p-10 text-center">
                                 {/* Icon Container with subtle pulse animation on entrance */}
                                 <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.1, type: 'spring' }}
                                    className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center relative ${activeTheme.iconBg}`}>
                                    {/* Outer decorative ring */}
                                    <div
                                       className={`absolute inset-0 rounded-full border border-current opacity-20 ${activeTheme.iconColor} scale-110`}
                                    />

                                    {/* Icons */}
                                    <div className={`${activeTheme.iconColor}`}>
                                       {notification.type === 'delete' && (
                                          <Trash2 size={32} strokeWidth={1.5} />
                                       )}
                                       {notification.type === 'success' && (
                                          <Check size={32} strokeWidth={2} />
                                       )}
                                       {notification.type === 'error' && (
                                          <span className="text-3xl font-serif italic">
                                             !
                                          </span>
                                       )}
                                       {notification.type === 'info' && (
                                          <LayoutPanelTop
                                             size={32}
                                             strokeWidth={1.5}
                                          />
                                       )}
                                    </div>
                                 </motion.div>

                                 {/* Typography matching the luxury theme */}
                                 <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                                    {notification.title}
                                 </h3>

                                 <p className="text-[16px] text-neutral-500 leading-relaxed mb-8 px-2 font-medium">
                                    {notification.message}
                                 </p>

                                 {/* Action Buttons */}
                                 <div className="flex gap-3">
                                    {notification.onConfirm ? (
                                       <>
                                          <button
                                             onClick={() =>
                                                setNotification(null)
                                             }
                                             className="flex-1 px-6 py-3.5 rounded-xl border border-neutral-200 text-[#505050] text-[14px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-50 hover:border-neutral-300 transition-all">
                                             Cancel
                                          </button>
                                          <button
                                             onClick={notification.onConfirm}
                                             className={`flex-1 px-6 py-3.5 rounded-xl text-white text-[14px] font-bold uppercase tracking-[0.2em] shadow-lg transition-all duration-300 ${activeTheme.btn}`}>
                                             Confirm
                                          </button>
                                       </>
                                    ) : (
                                       <button
                                          onClick={() => {
                                             if (notification.onAcknowledge) {
                                                notification.onAcknowledge();
                                             }
                                             setNotification(null);
                                          }}
                                          className="w-full px-6 py-3.5 rounded-xl bg-black text-white text-[14px] font-bold uppercase tracking-[0.2em] hover:bg-[#c09a74] transition-all duration-300 shadow-xl hover:shadow-2xl">
                                          Acknowledge
                                       </button>
                                    )}
                                 </div>
                              </div>
                           </>
                        );
                     })()}
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Side-by-Side Dual Modal */}
         <AnimatePresence>
            {isModalOpen && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <motion.div
                     initial={{ scale: 0.9, opacity: 0, y: 20 }}
                     animate={{ scale: 1, opacity: 1, y: 0 }}
                     exit={{ scale: 0.9, opacity: 0, y: 20 }}
                     className="flex flex-col lg:flex-row gap-2 w-full max-w-7xl h-[90vh] lg:h-[80vh] relative">
                     {/* Floating Close Button */}
                     <button
                        onClick={() => setIsModalOpen(false)}
                        className="absolute -top-12 right-0 lg:top-6 lg:right-6 text-white lg:text-black hover:text-[#c09a74] transition-colors z-[110] bg-black/20 lg:bg-transparent rounded-full p-2 lg:p-0">
                        <svg
                           className="w-6 h-6"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24">
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                           />
                        </svg>
                     </button>

                     {/* LEFT PANEL: The Form */}
                     <div className="bg-white rounded-[2rem] w-full lg:w-2/3 h-full overflow-y-auto custom-scrollbar shadow-2xl relative flex flex-col border-r border-neutral-100">
                        <div className="p-8 md:p-12 flex-1 flex flex-col">
                           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                              <h2
                                 className="text-3xl font-light italic text-[#c09a74]"
                                 style={{
                                    fontFamily: "'Playfair Display', serif",
                                 }}>
                                 Add New Timepieces
                              </h2>

                              {/* GLOBAL BRAND SELECTOR */}
                              <div className="flex flex-col gap-2 min-w-[240px]">
                                 <div className="flex items-center justify-between">
                                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#505050]">
                                       Collection Brand
                                    </label>
                                    <button
                                       type="button"
                                       onClick={() =>
                                          setIsBrandModalOpen(true)
                                       }
                                       className="text-[#c09a74] hover:scale-110 transition-transform"
                                       title="Add New Brand">
                                       <Plus size={14} strokeWidth={3} />
                                    </button>
                                 </div>
                                 <div className="relative">
                                    <select
                                       name="brand"
                                       value={formData.brand}
                                       onChange={handleInputChange}
                                       className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#c09a74] transition-colors text-sm appearance-none cursor-pointer">
                                       <option value="" disabled>
                                          Select Brand
                                       </option>
                                       {availableBrands
                                          .filter((b) => b !== 'All')
                                          .map((brand) => (
                                             <option
                                                key={brand}
                                                value={brand}>
                                                {brand}
                                             </option>
                                          ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                                       <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24">
                                          <path
                                             strokeLinecap="round"
                                             strokeLinejoin="round"
                                             strokeWidth="2"
                                             d="M19 9l-7 7-7-7"
                                          />
                                       </svg>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <form
                              onSubmit={handleSubmit}
                              className="space-y-8 flex-1">
                              <div className="space-y-6">
                                 {watchItems.map((item, index) => (
                                    <motion.div
                                       initial={{ opacity: 0, y: 20 }}
                                       animate={{ opacity: 1, y: 0 }}
                                       key={item.id}
                                       className="relative group p-6 bg-neutral-50 rounded-[1.5rem] border border-neutral-200/60 hover:border-[#c09a74]/40 transition-all duration-300">
                                       {watchItems.length > 1 && (
                                          <button
                                             type="button"
                                             onClick={() =>
                                                removeWatchItem(item.id)
                                             }
                                             className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white border border-neutral-200 text-neutral-400 hover:text-red-500 hover:border-red-100 shadow-sm flex items-center justify-center transition-all z-10">
                                             <XIcon size={14} />
                                          </button>
                                       )}

                                       <div className="flex flex-col md:flex-row gap-8">
                                          {/* Item Preview */}
                                          <div className="w-full md:w-32 h-32 rounded-2xl bg-white border border-neutral-200 overflow-hidden relative flex-shrink-0">
                                             {item.image ? (
                                                <>
                                                   <img
                                                      src={item.image}
                                                      alt="Preview"
                                                      className="w-full h-full object-cover"
                                                   />
                                                   <button
                                                      type="button"
                                                      onClick={() =>
                                                         clearImage(item.id)
                                                      }
                                                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                      <Trash2
                                                         size={16}
                                                         className="text-white"
                                                      />
                                                   </button>
                                                </>
                                             ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-300 gap-2">
                                                   <ImageIcon size={24} />
                                                   <span className="text-[8px] uppercase tracking-widest font-bold">
                                                      No Image
                                                   </span>
                                                </div>
                                             )}
                                          </div>

                                          {/* Item Fields */}
                                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                             <div className="space-y-1">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                                   Model Name
                                                </label>
                                                <input
                                                   required
                                                   type="text"
                                                   name="modelName"
                                                   value={item.modelName}
                                                   onChange={(e) =>
                                                      handleItemInputChange(
                                                         item.id,
                                                         e,
                                                      )
                                                   }
                                                   placeholder="e.g. Maritime Pro"
                                                   className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#c09a74] transition-colors text-sm"
                                                />
                                             </div>
                                             <div className="space-y-1">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                                   MRP (₹)
                                                </label>
                                                <input
                                                   required
                                                   type="number"
                                                   name="mrp"
                                                   value={item.mrp}
                                                   onChange={(e) =>
                                                      handleItemInputChange(
                                                         item.id,
                                                         e,
                                                      )
                                                   }
                                                   placeholder="Price"
                                                   className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#c09a74] transition-colors text-sm"
                                                />
                                             </div>
                                             <div className="space-y-1">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                                   Color
                                                </label>
                                                <input
                                                   type="text"
                                                   name="color"
                                                   value={item.color}
                                                   onChange={(e) =>
                                                      handleItemInputChange(
                                                         item.id,
                                                         e,
                                                      )
                                                   }
                                                   placeholder="Case Color"
                                                   className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#c09a74] transition-colors text-sm"
                                                />
                                             </div>
                                             <div className="space-y-1">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                                   Dial Color
                                                </label>
                                                <input
                                                   type="text"
                                                   name="dialColor"
                                                   value={item.dialColor}
                                                   onChange={(e) =>
                                                      handleItemInputChange(
                                                         item.id,
                                                         e,
                                                      )
                                                   }
                                                   placeholder="Dial"
                                                   className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#c09a74] transition-colors text-sm"
                                                />
                                             </div>
                                          </div>
                                       </div>
                                    </motion.div>
                                 ))}
                              </div>

                              <div className="pt-6 pb-12 flex flex-col md:flex-row gap-4">
                                 <button
                                    type="button"
                                    onClick={addWatchItem}
                                    className="flex-1 bg-neutral-100 text-neutral-600 py-4 rounded-xl uppercase tracking-widest text-xs font-bold hover:bg-neutral-200 transition-all flex items-center justify-center gap-2">
                                    <Plus size={16} />
                                    Add Another
                                 </button>
                                 <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-[2] bg-black text-white py-4 rounded-xl uppercase tracking-widest text-xs font-bold hover:bg-[#c09a74] transition-all duration-500 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSubmitting ? (
                                       <>
                                          <Loader2
                                             size={16}
                                             className="animate-spin"
                                          />
                                          Saving {watchItems.length}{' '}
                                          Timepieces...
                                       </>
                                    ) : (
                                       `Confirm & Save ${watchItems.length} Items`
                                    )}
                                 </button>
                              </div>
                           </form>
                        </div>
                     </div>

                     {/* RIGHT PANEL: Multi-Image Dropzone */}
                     <div className="bg-neutral-50/50 w-full lg:w-1/3 h-full relative overflow-hidden flex flex-col">
                        <div className="p-8 md:p-12 h-full flex flex-col">
                           <div className="mb-6">
                              <h3 className="text-sm uppercase tracking-widest font-bold text-[#505050]">
                                 Bulk Import
                              </h3>
                              <p className="text-xs text-neutral-400 mt-1">
                                 Drop multiple images to add them all at once.
                              </p>
                           </div>

                           <div
                              onDragEnter={handleDrag}
                              onDragLeave={handleDrag}
                              onDragOver={handleDrag}
                              onDrop={handleDrop}
                              className={`flex-1 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all duration-500 ${
                                 dragActive
                                    ? 'border-[#c09a74] bg-[#c09a74]/5 scale-[0.98]'
                                    : 'border-neutral-200 bg-white hover:bg-neutral-50'
                              }`}>
                              <input
                                 type="file"
                                 className="hidden"
                                 id="file-upload"
                                 multiple
                                 onChange={handleChangeFile}
                                 accept="image/*"
                              />
                              <label
                                 htmlFor="file-upload"
                                 className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-8 text-center group">
                                 <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#c09a74]/10 transition-all duration-500">
                                    <svg
                                       className={`w-8 h-8 transition-colors duration-300 ${dragActive ? 'text-[#c09a74]' : 'text-neutral-400'}`}
                                       fill="none"
                                       stroke="currentColor"
                                       viewBox="0 0 24 24">
                                       <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="1.5"
                                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                       />
                                    </svg>
                                 </div>
                                 <span className="text-sm uppercase tracking-widest font-bold text-[#505050] mb-2">
                                    {dragActive
                                       ? 'Drop Timepieces'
                                       : 'Upload Multiple'}
                                 </span>
                                 <span className="text-xs text-neutral-400 font-light max-w-[160px] leading-relaxed">
                                    Drag and drop images or click to browse
                                 </span>
                              </label>
                           </div>

                           {/* Selected Count Badge */}
                           <div className="mt-6 p-4 bg-white rounded-2xl border border-neutral-100 flex items-center justify-between">
                              <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                 Pending Upload
                              </span>
                              <span className="bg-[#c09a74] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                                 {
                                    watchItems.filter((i) => i.imageFile)
                                       .length
                                 }{' '}
                                 Images
                              </span>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>

         <AnimatePresence>
            {isLoading && (
               <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[500] bg-white flex flex-col items-center justify-center">
                  <motion.div
                     initial={{ scale: 0.8, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className="flex flex-col items-center">
                     <div className="relative w-24 h-24 mb-8">
                        <motion.div
                           animate={{ rotate: 360 }}
                           transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'linear',
                           }}
                           className="absolute inset-0 border-2 border-[#c09a74]/20 border-t-[#c09a74] rounded-full"
                        />
                        <div className="absolute inset-4 flex items-center justify-center">
                           <Loader2
                              size={32}
                              className="text-[#c09a74] animate-spin"
                           />
                        </div>
                     </div>
                     <h2
                        className="text-2xl font-light italic text-[#c09a74] tracking-widest"
                        style={{ fontFamily: "'Playfair Display', serif" }}>
                        B-Watch
                     </h2>
                     <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-400 mt-2 font-bold">
                        Initializing Collection
                     </p>
                  </motion.div>
               </motion.div>
            )}
        </AnimatePresence>

        {/* Bento Grid */}
         <AnimatePresence mode="wait" initial={false}>
            <motion.div
               key={filter}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0, transition: { duration: 0.12 } }}
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[300px] gap-6">
               <AnimatePresence initial={false}>
                  {filteredImages.map((image, index) => (
                     <motion.div
                        key={image.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        custom={index}
                        onDoubleClick={() =>
                           selectionMode
                              ? handleDelete(image.id)
                              : handleDoubleClick(image.id)
                        }
                        onTouchStart={() => handleTouchStart(image.id)}
                        onTouchEnd={handleTouchEnd}
                        onClick={() => toggleSelection(image.id)}
                        className={`relative overflow-hidden rounded-3xl group shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer ${image.className} ${
                           selectedIds.includes(image.id)
                              ? 'ring-4 ring-[#c09a74] scale-[0.98]'
                              : ''
                        } ${image.isSyncing ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                     <motion.img
                        src={image.src}
                        alt={image.alt}
                        className={`w-full h-full object-cover transition-transform duration-1000 ${
                           !selectionMode ? 'group-hover:scale-110' : ''
                        }`}
                     />

                     {image.isSyncing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
                           <Loader2
                              size={32}
                              className="text-white animate-spin"
                           />
                        </div>
                     )}

                     {/* Selection Overlay */}
                     {selectionMode && (
                        <div
                           className={`absolute top-6 right-6 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                              selectedIds.includes(image.id)
                                 ? 'bg-[#c09a74] border-[#c09a74] scale-110'
                                 : 'bg-white/20 border-white/50 backdrop-blur-md'
                           }`}>
                           {selectedIds.includes(image.id) && (
                              <Check size={18} className="text-white" />
                           )}
                        </div>
                     )}

                     {selectionMode && (
                        <button
                           onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(image.id);
                           }}
                           className="absolute top-6 left-6 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg z-30">
                           <Trash2 size={14} />
                        </button>
                     )}

                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                        <span className="text-[#c09a74] text-xs uppercase tracking-[0.2em] font-bold mb-2">
                           {image.brand}
                        </span>
                        <p
                           className="text-white text-2xl font-light italic tracking-wide translate-y-4 group-hover:translate-y-0 transition-transform duration-500"
                           style={{ fontFamily: "'Playfair Display', serif" }}>
                           {image.alt}
                        </p>
                     </div>
                     </motion.div>
                  ))}
               </AnimatePresence>
            </motion.div>
         </AnimatePresence>

         {/* Footer */}
         <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-24 pt-12 border-t border-[#505050]/10 flex flex-col items-center gap-4">
            <p
               className="text-[#c09a74] text-sm italic"
               style={{ fontFamily: "'Playfair Display', serif" }}>
               Luxury Timepieces
            </p>
            <div className="text-[#505050]/40 uppercase tracking-[1em] text-[12px]">
               B-Watch © 2026
            </div>
         </motion.div>

         <AnimatePresence>
            {isBrandModalOpen && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                  <motion.div
                     initial={{ scale: 0.9, opacity: 0, y: 20 }}
                     animate={{ scale: 1, opacity: 1, y: 0 }}
                     exit={{ scale: 0.9, opacity: 0, y: 20 }}
                     className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col md:flex-row">
                     {/* Brand Form */}
                     <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar border-b md:border-b-0 md:border-r border-neutral-100">
                        <div className="flex items-center justify-between mb-8">
                           <h2
                              className="text-2xl font-light italic text-[#c09a74]"
                              style={{
                                 fontFamily: "'Playfair Display', serif",
                              }}>
                              Manage Brands
                           </h2>
                           <button
                              onClick={() => setIsBrandModalOpen(false)}
                              className="md:hidden text-neutral-400">
                              <XIcon />
                           </button>
                        </div>

                        <form
                           onSubmit={handleBrandSubmit}
                           className="space-y-6">
                           <div className="space-y-2">
                              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                 Brand Name
                              </label>
                              <input
                                 required
                                 type="text"
                                 value={brandFormData.name}
                                 onChange={(e) =>
                                    setBrandFormData({
                                       ...brandFormData,
                                       name: e.target.value,
                                    })
                                 }
                                 placeholder="e.g. Rolex"
                                 className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#c09a74] transition-colors text-sm"
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                 Brand Logo URL (Optional)
                              </label>
                              <input
                                 type="url"
                                 value={brandFormData.logoUrl}
                                 onChange={(e) =>
                                    setBrandFormData({
                                       ...brandFormData,
                                       logoUrl: e.target.value,
                                    })
                                 }
                                 placeholder="https://..."
                                 className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#c09a74] transition-colors text-sm"
                              />
                           </div>

                           <div className="pt-4">
                              <button
                                 type="submit"
                                 disabled={isAddingBrand}
                                 className="w-full bg-black text-white py-4 rounded-xl uppercase tracking-widest text-xs font-bold hover:bg-[#c09a74] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                                 {isAddingBrand ? (
                                    <Loader2
                                       size={16}
                                       className="animate-spin"
                                    />
                                 ) : (
                                    'Create New Brand'
                                 )}
                              </button>
                           </div>
                        </form>
                     </div>

                     {/* Brands List */}
                     <div className="w-full md:w-[40%] bg-neutral-50 p-8 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                           <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">
                              Existing Brands
                           </h3>
                           <button
                              onClick={() => setIsBrandModalOpen(false)}
                              className="hidden md:block text-neutral-400 hover:text-black transition-colors">
                              <Plus className="rotate-45" size={24} />
                           </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                           {isLoadingBrands ? (
                              <div className="flex justify-center py-12">
                                 <Loader2 className="animate-spin text-neutral-300" />
                              </div>
                           ) : brandsData?.length === 0 ? (
                              <div className="text-center py-12 text-xs text-neutral-400 italic">
                                 No brands created yet
                              </div>
                           ) : (
                              brandsData?.map((brand) => (
                                 <div
                                    key={brand.id}
                                    className="bg-white p-4 rounded-2xl border border-neutral-100 flex items-center justify-between group hover:border-[#c09a74]/30 transition-colors shadow-sm">
                                    <div className="flex items-center gap-3">
                                       {brand.logo_url ? (
                                          <img
                                             src={brand.logo_url}
                                             alt={brand.name}
                                             className="w-8 h-8 rounded-lg object-contain bg-neutral-50"
                                          />
                                       ) : (
                                          <div className="w-8 h-8 rounded-lg bg-[#c09a74]/10 flex items-center justify-center text-[#c09a74]">
                                             <ImageIcon size={14} />
                                          </div>
                                       )}
                                       <span className="text-sm font-bold">
                                          {brand.name}
                                       </span>
                                    </div>
                                    <CheckCircle2
                                       size={16}
                                       className="text-[#c09a74] opacity-0 group-hover:opacity-100 transition-opacity"
                                    />
                                 </div>
                              ))
                           )}
                        </div>
                     </div>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
};

export default GalleryPage;
