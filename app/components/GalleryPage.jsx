import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
   Plus,
   ArrowLeft,
   Check,
   LayoutPanelTop,
   Loader2,
   Trash2,
} from 'lucide-react';
import {
   fetchWatches,
   insertWatch,
   uploadImage,
   deleteWatches,
   deleteImages,
} from '../lib/supabaseClient';

const GalleryPage = () => {
   const navigate = useNavigate();
   const [filter, setFilter] = useState('All');
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [dragActive, setDragActive] = useState(false);
   const [selectionMode, setSelectionMode] = useState(false);
   const [selectedIds, setSelectedIds] = useState([]);
   const [imageFile, setImageFile] = useState(null);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isLoading, setIsLoading] = useState(true);
   const [isDeleting, setIsDeleting] = useState(false);
   const [notification, setNotification] = useState(null); // { type, title, message, onConfirm }
   const [isMobile, setIsMobile] = useState(false);

   useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
   }, []);

   const [formData, setFormData] = useState({
      modelName: '',
      brand: 'Titan',
      mrp: '',
      color: '',
      dialColor: '',
      image: '',
   });

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

   const brands = ['All', 'Titan', 'Casio', 'Fossil', 'Seiko', 'Fastrack'];

   // Fetch watches from Supabase on mount
   useEffect(() => {
      let isMounted = true;
      const loadWatches = async () => {
         try {
            const dbWatches = await fetchWatches();
            if (isMounted && dbWatches && dbWatches.length > 0) {
               const mapped = dbWatches.map((w) => ({
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
                  // Filter out any items from mapped that are already in prev
                  const existingIds = new Set(prev.map((img) => img.id));
                  const newUniqueItems = mapped.filter(
                     (img) => !existingIds.has(img.id),
                  );
                  return [...newUniqueItems, ...prev];
               });
            }
         } catch (err) {
            console.error('Failed to fetch watches:', err);
         } finally {
            if (isMounted) setIsLoading(false);
         }
      };
      loadWatches();
      return () => {
         isMounted = false;
      };
   }, []);

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
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
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
         handleFile(e.dataTransfer.files[0]);
      }
   };

   const handleChangeFile = (e) => {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
         handleFile(e.target.files[0]);
      }
   };

   const handleFile = (file) => {
      setImageFile(file);
      const localUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, image: localUrl }));
   };

   const clearImage = () => {
      setImageFile(null);
      setFormData((prev) => ({ ...prev, image: '' }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      // OPTIMISTIC UI: Create a temporary item to show immediately
      const tempId = `temp-${Date.now()}`;
      const optimisticWatch = {
         id: tempId,
         src:
            formData.image ||
            'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=800&auto=format&fit=crop',
         alt: formData.modelName,
         brand: formData.brand,
         className: 'md:col-span-1 md:row-span-1',
         isSyncing: true, // Visual indicator that it's saving
      };

      // Add to UI immediately
      setImages((prev) => [optimisticWatch, ...prev]);
      setIsModalOpen(false);

      // Capture current form state for background processing
      const currentFormData = { ...formData };
      const currentImageFile = imageFile;

      // Reset form immediately
      setFormData({
         modelName: '',
         brand: 'Titan',
         mrp: '',
         color: '',
         dialColor: '',
         image: '',
      });
      setImageFile(null);

      // Background sync with Supabase
      try {
         let imageUrl = currentFormData.image;
         if (currentImageFile) {
            imageUrl = await uploadImage(currentImageFile);
         }

         const dbWatch = await insertWatch({
            model_name: currentFormData.modelName,
            brand: currentFormData.brand,
            mrp: Number(currentFormData.mrp) || 0,
            color: currentFormData.color,
            dial_color: currentFormData.dialColor,
            image_url: imageUrl || optimisticWatch.src,
         });

         // Update the optimistic item with real data
         setImages((prev) =>
            prev.map((img) =>
               img.id === tempId
                  ? {
                       ...img,
                       id: dbWatch.id,
                       src: dbWatch.image_url,
                       isSyncing: false,
                    }
                  : img,
            ),
         );
      } catch (err) {
         console.error('Failed to sync watch with Supabase:', err);
         setImages((prev) => prev.filter((img) => img.id !== tempId));
         setNotification({
            type: 'error',
            title: 'Sync Failed',
            message:
               'Failed to save watch to cloud. It has been removed from the session.',
         });
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

               setImages((prev) => prev.filter((img) => !ids.includes(img.id)));
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
               setNotification({
                  type: 'error',
                  title: 'Deletion Failed',
                  message:
                     'Could not remove items from the cloud. They have been hidden from view only.',
               });
               setImages((prev) => prev.filter((img) => !ids.includes(img.id)));
            } finally {
               setIsDeleting(false);
            }
         },
      });
   };

   const filteredImages =
      filter === 'All' ? images : images.filter((img) => img.brand === filter);

   const containerVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
   };

   const itemVariants = {
      hidden: { opacity: 0, scale: 0.9 },
      visible: {
         opacity: 1,
         scale: 1,
         transition: { duration: 0.5, ease: 'easeOut' },
      },
      exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } },
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

            <button
               onClick={() => setIsModalOpen(true)}
               className="flex items-center space-x-2 px-4 py-2 md:px-5 md:py-2 rounded-full bg-white border border-[#c09a74] text-[#c09a74] hover:bg-[#c09a74] hover:text-white cursor-pointer transition-all duration-400">
               <span className="text-lg font-light transition-transform duration-300 group-hover:rotate-90">
                  +
               </span>
               <span className="uppercase tracking-widest text-[10px] md:text-sm font-bold">
                  Add Watch
               </span>
            </button>
         </motion.div>

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
               className="flex flex-wrap gap-3">
               {brands.map((brand) => (
                  <button
                     key={brand}
                     onClick={() => setFilter(brand)}
                     className={`px-4 py-1.5 md:px-6 md:py-2 rounded-full text-[10px] md:text-xs uppercase tracking-widest font-bold transition-all duration-300 ${
                        filter === brand
                           ? 'bg-[#c09a74] text-white shadow-lg'
                           : 'bg-transparent text-[#505050] border border-[#505050]/20 hover:border-[#c09a74] hover:text-[#c09a74]'
                     }`}>
                     {brand}
                  </button>
               ))}
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
                                          onClick={() => setNotification(null)}
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
                     <div className="bg-white rounded-[2rem] w-full lg:w-3/4 h-full overflow-y-auto shadow-2xl relative flex flex-col">
                        <div className="p-8 md:p-12 flex-1">
                           <h2
                              className="text-3xl font-light italic text-[#c09a74] mb-8"
                              style={{
                                 fontFamily: "'Playfair Display', serif",
                              }}>
                              Add New Timepiece
                           </h2>

                           <form onSubmit={handleSubmit} className="space-y-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="space-y-2">
                                    <label className="text-[12px] uppercase tracking-[0.2em] font-bold text-[#505050]">
                                       Model Name
                                    </label>
                                    <input
                                       required
                                       type="text"
                                       name="modelName"
                                       value={formData.modelName}
                                       onChange={handleInputChange}
                                       placeholder="e.g. Maritime Pro"
                                       className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#c09a74] transition-colors text-sm"
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[12px] uppercase tracking-[0.2em] font-bold text-[#505050]">
                                       Brand
                                    </label>
                                    <select
                                       name="brand"
                                       value={formData.brand}
                                       onChange={handleInputChange}
                                       className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#c09a74] transition-colors text-sm appearance-none">
                                       {brands
                                          .filter((b) => b !== 'All')
                                          .map((brand) => (
                                             <option key={brand} value={brand}>
                                                {brand}
                                             </option>
                                          ))}
                                    </select>
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[12px] uppercase tracking-[0.2em] font-bold text-[#505050]">
                                       MRP (₹)
                                    </label>
                                    <input
                                       required
                                       type="number"
                                       name="mrp"
                                       value={formData.mrp}
                                       onChange={handleInputChange}
                                       placeholder="Price in INR"
                                       className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#c09a74] transition-colors text-sm"
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[12px] uppercase tracking-[0.2em] font-bold text-[#505050]">
                                       Color
                                    </label>
                                    <input
                                       type="text"
                                       name="color"
                                       value={formData.color}
                                       onChange={handleInputChange}
                                       placeholder="e.g. Silver"
                                       className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#c09a74] transition-colors text-sm"
                                    />
                                 </div>
                                 <div className="space-y-2 md:col-span-2">
                                    <label className="text-[12px] uppercase tracking-[0.2em] font-bold text-[#505050]">
                                       Dial Color
                                    </label>
                                    <input
                                       type="text"
                                       name="dialColor"
                                       value={formData.dialColor}
                                       onChange={handleInputChange}
                                       placeholder="e.g. Deep Blue"
                                       className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#c09a74] transition-colors text-sm"
                                    />
                                 </div>
                                 <div className="space-y-2 md:col-span-2">
                                    <label className="text-[12px] uppercase tracking-[0.2em] font-bold text-[#505050]">
                                       Image URL (Or Drop to Right)
                                    </label>
                                    <input
                                       type="url"
                                       name="image"
                                       value={formData.image}
                                       onChange={handleInputChange}
                                       placeholder="https://..."
                                       className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#c09a74] transition-colors text-sm"
                                    />
                                 </div>
                              </div>

                              <div className="pt-6">
                                 <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-black text-white py-4 rounded-xl uppercase tracking-widest text-xs font-bold hover:bg-[#c09a74] transition-all duration-500 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSubmitting ? (
                                       <>
                                          <Loader2
                                             size={16}
                                             className="animate-spin"
                                          />
                                          Saving...
                                       </>
                                    ) : (
                                       'Add to Collection'
                                    )}
                                 </button>
                              </div>
                           </form>
                        </div>
                     </div>

                     {/* RIGHT PANEL: Image Preview / Drag & Drop */}
                     <div className="bg-white rounded-[2rem] w-full lg:w-1/2 h-64 lg:h-full shadow-2xl relative overflow-hidden p-6 lg:p-8 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                           {formData.image ? (
                              <motion.div
                                 key="preview"
                                 initial={{ opacity: 0, scale: 0.95 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 exit={{ opacity: 0 }}
                                 className="w-full h-full relative group rounded-[1rem] overflow-hidden">
                                 <img
                                    src={formData.image}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                 />
                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <button
                                       onClick={clearImage}
                                       className="bg-white/90 text-black px-6 py-2 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-[#c09a74] hover:text-white transition-colors">
                                       Remove Image
                                    </button>
                                 </div>
                              </motion.div>
                           ) : (
                              <motion.div
                                 key="dropzone"
                                 initial={{ opacity: 0 }}
                                 animate={{ opacity: 1 }}
                                 exit={{ opacity: 0 }}
                                 className="w-full h-full">
                                 <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`w-full h-full border-2 border-dashed rounded-[1rem] flex flex-col items-center justify-center transition-all duration-300 ${
                                       dragActive
                                          ? 'border-[#c09a74] bg-[#c09a74]/10 scale-[0.98]'
                                          : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100'
                                    }`}>
                                    <input
                                       type="file"
                                       className="hidden"
                                       id="file-upload"
                                       onChange={handleChangeFile}
                                       accept="image/*"
                                    />
                                    <label
                                       htmlFor="file-upload"
                                       className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-8 text-center">
                                       <svg
                                          className={`w-12 h-12 mb-4 transition-colors duration-300 ${dragActive ? 'text-[#c09a74]' : 'text-neutral-400'}`}
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
                                       <span className="text-sm uppercase tracking-widest font-bold text-[#505050] mb-2">
                                          {dragActive
                                             ? 'Drop it here!'
                                             : 'Upload Image'}
                                       </span>
                                       <span className="text-xs text-neutral-500 font-light">
                                          Drag and drop or click to browse
                                       </span>
                                    </label>
                                 </div>
                              </motion.div>
                           )}
                        </AnimatePresence>
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
                        Bewatch
                     </h2>
                     <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-400 mt-2 font-bold">
                        Initializing Collection
                     </p>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Bento Grid */}
         <motion.div
            layout
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[300px] gap-6">
            <AnimatePresence mode="popLayout">
               {filteredImages.map((image) => (
                  <motion.div
                     layout
                     key={image.id}
                     variants={itemVariants}
                     initial="hidden"
                     animate="visible"
                     exit="exit"
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
               Bewatch © 2026
            </div>
         </motion.div>
      </div>
   );
};

export default GalleryPage;
