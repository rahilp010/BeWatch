import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useWatches } from '../hooks/useWatches';
import {
   ArrowLeft,
   ChevronRight,
   Type,
   Layout,
   FileDown,
   Bold,
   Check,
   Italic,
   Underline,
   Trash2,
   Plus,
   Minus,
   Palette,
   X,
   Image as ImageIcon,
} from 'lucide-react';
import { Rnd } from 'react-rnd';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

if (typeof window !== 'undefined') {
   window.html2canvas = html2canvas;
}

const BuilderPage = () => {
   const location = useLocation();
   const navigate = useNavigate();
   const selectedImages = useMemo(
      () => location.state?.selectedImages || [],
      [location.state?.selectedImages],
   );
   const { data: watchData } = useWatches();
   const [catalogImages, setCatalogImages] = useState(selectedImages);
   const isSingleImage = catalogImages.length === 1;

   const [currentStep, setCurrentStep] = useState(1);
   const [selectedTemplate, setSelectedTemplate] = useState(
      isSingleImage ? 'minimal' : 'grid',
   );
   const [textElements, setTextElements] = useState([]);
   const [editingTextId, setEditingTextId] = useState(null);
   const [isGenerating, setIsGenerating] = useState(false);
   const [isAddImageModalOpen, setIsAddImageModalOpen] = useState(false);
   const [isGalleryPickerOpen, setIsGalleryPickerOpen] = useState(false);
   const [selectedGalleryIds, setSelectedGalleryIds] = useState([]);
   const [previewPageCount, setPreviewPageCount] = useState(1);
   const [pageBreakAfterIds, setPageBreakAfterIds] = useState([]);
   const [activeCatalogImageId, setActiveCatalogImageId] = useState(
      selectedImages[0]?.id || null,
   );

   // State for custom layout images
   const [builderImages, setBuilderImages] = useState(() =>
      catalogImages.map((img, idx) => ({
         ...img,
         x: 50 + (idx % 3) * 200,
         y: 100 + Math.floor(idx / 3) * 250,
         width: 250,
         height: 250,
      })),
   );

   const [activeTemplateElements, setActiveTemplateElements] = useState([]);
   const [mappedImages, setMappedImages] = useState({});
   const [activePlaceholderId, setActivePlaceholderId] = useState(null);

   const catalogRef = useRef(null);
   const A4_PAGE_HEIGHT_PX = 1131; // Exact ratio for 800px width (297/210 * 800)

   const steps = [
      { id: 1, name: 'Template Selection', icon: Layout },
      { id: 2, name: 'Text Addition', icon: Type },
      { id: 3, name: 'Generate PDF', icon: FileDown },
   ];

   const templates = [
      {
         id: 'grid',
         name: 'Classic Grid',
         description: 'Clean and structured layout',
      },
      {
         id: 'mosaic',
         name: 'Bento Mosaic',
         description: 'Dynamic luxury editorial style',
      },
      {
         id: 'minimal',
         name: 'Minimal Hero',
         description: 'Focused on high-impact imagery',
      },
      {
         id: 'custom',
         name: 'Custom Canvas',
         description: 'Fully draggable & resizable images',
      },
   ];

   const [customTemplates, setCustomTemplates] = useState(() => {
      return JSON.parse(localStorage.getItem('custom-templates') || '[]');
   });

   const allTemplates = useMemo(() => {
      return [...templates, ...customTemplates];
   }, [customTemplates]);

   const fonts = [
      { name: 'Playfair Display', value: "'Playfair Display', serif" },
      { name: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans', sans-serif" },
      { name: 'Montserrat', value: "'Montserrat', sans-serif" },
      { name: 'Inter', value: "'Inter', sans-serif" },
   ];

   const colors = [
      '#000000',
      '#c09a74',
      '#505050',
      '#8b0000',
      '#000080',
      '#ffffff',
   ];

   const formatPrice = (value) => {
      const numberValue = Number(value);
      if (!Number.isFinite(numberValue) || numberValue <= 0) return 'Price on request';
      return `₹${new Intl.NumberFormat('en-IN').format(numberValue)}`;
   };

   const chunkArray = (items, size) => {
      const chunks = [];
      for (let i = 0; i < items.length; i += size) {
         chunks.push(items.slice(i, i + size));
      }
      return chunks;
   };

   const updateCatalogImage = (id, updates) => {
      setCatalogImages((prev) =>
         prev.map((img) => (img.id === id ? { ...img, ...updates } : img)),
      );
      setBuilderImages((prev) =>
         prev.map((img) => (img.id === id ? { ...img, ...updates } : img)),
      );
   };

   const activeCatalogImage = useMemo(
      () =>
         catalogImages.find((img) => img.id === activeCatalogImageId) ||
         catalogImages[0] ||
         null,
      [catalogImages, activeCatalogImageId],
   );

   const classicGridPages = useMemo(
      () => chunkArray(catalogImages, 6),
      [catalogImages],
   );

   useEffect(() => {
      if (selectedImages.length === 0) {
         navigate('/gallery');
      }
   }, [selectedImages.length, navigate]);

   useEffect(() => {
      if (!catalogImages.length) {
         setActiveCatalogImageId(null);
         return;
      }

      const exists = catalogImages.some(
         (img) => img.id === activeCatalogImageId,
      );
      if (!exists) {
         setActiveCatalogImageId(catalogImages[0].id);
      }
   }, [catalogImages, activeCatalogImageId]);

   useEffect(() => {
      const node = catalogRef.current;
      if (!node) return undefined;
      if (typeof ResizeObserver === 'undefined') return undefined;

      const updatePreviewPages = () => {
         const height =
            node.scrollHeight || node.getBoundingClientRect().height;
         setPreviewPageCount(
            Math.max(1, Math.ceil(height / A4_PAGE_HEIGHT_PX)),
         );
      };

      updatePreviewPages();

      const observer = new ResizeObserver(updatePreviewPages);
      observer.observe(node);

      return () => observer.disconnect();
   }, [catalogImages, selectedTemplate, textElements, activeTemplateElements]);

   useEffect(() => {
      if (selectedTemplate.startsWith('custom-')) {
         const template = customTemplates.find(
            (t) => t.id === selectedTemplate,
         );
         if (template) {
            setActiveTemplateElements(
               template.elements.map((el) => ({ ...el })),
            );
         }
      } else {
         setActiveTemplateElements([]);
      }
   }, [selectedTemplate, customTemplates]);

   const galleryImages = useMemo(
      () =>
         (watchData?.items || []).map((w) => ({
            id: w.id,
            src: w.image_url,
            alt: w.model_name,
            brand: w.brand,
            mrp: w.mrp,
            color: w.color,
            dialColor: w.dial_color,
         })),
      [watchData],
   );

   const addTextElement = () => {
      const newText = {
         id: Date.now(),
         content: 'New Text Entry',
         x: 50,
         y: 50,
         fontSize: 24,
         fontFamily: "'Playfair Display', serif",
         fontWeight: 'normal',
         fontStyle: 'normal',
         textDecoration: 'none',
         color: '#000000',
         width: 250,
         height: 'auto',
      };
      setTextElements([...textElements, newText]);
      setEditingTextId(newText.id);
   };

   const updateTextElement = (id, updates) => {
      setTextElements((prev) =>
         prev.map((el) => (el.id === id ? { ...el, ...updates } : el)),
      );
   };

   const updateBuilderImage = (id, updates) => {
      setBuilderImages((prev) =>
         prev.map((img) => (img.id === id ? { ...img, ...updates } : img)),
      );
   };

   const addImagesToCatalog = (imagesToAdd) => {
      if (!imagesToAdd || imagesToAdd.length === 0) return;

      setCatalogImages((prev) => {
         const existingIds = new Set(prev.map((img) => img.id));
         return [
            ...prev,
            ...imagesToAdd.filter((img) => !existingIds.has(img.id)),
         ];
      });

      setBuilderImages((prev) => {
         const existingIds = new Set(prev.map((img) => img.id));
         const additions = imagesToAdd
            .filter((img) => !existingIds.has(img.id))
            .map((img, idx) => ({
               ...img,
               x: 50 + ((prev.length + idx) % 3) * 200,
               y: 100 + Math.floor((prev.length + idx) / 3) * 250,
               width: 250,
               height: 250,
            }));

         return additions.length > 0 ? [...prev, ...additions] : prev;
      });
   };

   const addNewPage = () => {
      if (catalogImages.length === 0) return;

      const lastImageId = catalogImages[catalogImages.length - 1].id;
      setPageBreakAfterIds((prev) =>
         prev.includes(lastImageId) ? prev : [...prev, lastImageId],
      );
   };

   const hasPageBreakAfter = (imageId) => pageBreakAfterIds.includes(imageId);

   const addCatalogImage = () => {
      const imageUrl = window.prompt('Enter image URL to add to the catalog:');
      if (!imageUrl) return;

      const altText =
         window.prompt('Enter image title/alt text:') || 'New Image';
      const brandText = window.prompt('Enter brand name:') || 'Custom';

      const newImage = {
         id: `added-${Date.now()}`,
         src: imageUrl,
         alt: altText,
         brand: brandText,
      };

      addImagesToCatalog([newImage]);
   };

   const addSelectedGalleryImages = () => {
      const imagesToAdd = galleryImages.filter((img) =>
         selectedGalleryIds.includes(img.id),
      );

      if (activePlaceholderId) {
         if (imagesToAdd.length > 0) {
            setMappedImages((prev) => ({
               ...prev,
               [activePlaceholderId]: imagesToAdd[0].id,
            }));
            addImagesToCatalog(imagesToAdd);
         }
         setActivePlaceholderId(null);
      } else {
         addImagesToCatalog(imagesToAdd);
      }

      setSelectedGalleryIds([]);
      setIsGalleryPickerOpen(false);
   };

   const removeTextElement = (id) => {
      setTextElements((prev) => prev.filter((el) => el.id !== id));
      setEditingTextId(null);
   };

   const handleGeneratePDF = async () => {
      if (!catalogRef.current) return;
      setIsGenerating(true);

      const originalStyles = new Map();

      try {
         const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
            compress: true,
         });

         const pdfWidth = pdf.internal.pageSize.getWidth();
         const pdfHeight = pdf.internal.pageSize.getHeight();
         const margin = 10;
         const maxWidth = pdfWidth - margin * 2;
         const maxHeight = pdfHeight - margin * 2;

         const container = catalogRef.current;
         const domWidth = container.clientWidth; // Calculate the equivalent height of one A4 print page in the browser DOM

         const domPageHeight = (domWidth * maxHeight) / maxWidth; // Target all elements we want to protect from being sliced

         const elements = container.querySelectorAll('.pdf-item'); // Loop sequentially so shifting one element recalculates the position for the next

         for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            const rect = el.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const topRelativeToContainer = rect.top - containerRect.top;
            const elementBottom = topRelativeToContainer + rect.height; // Check which virtual page the element starts and ends on

            const startPage = Math.floor(
               topRelativeToContainer / domPageHeight,
            );
            const endPage = Math.floor(elementBottom / domPageHeight);

            if (startPage !== endPage) {
               // Element crosses a boundary. Push it to start exactly on the next page.
               const nextBoundary = endPage * domPageHeight;
               const pushAmount = nextBoundary - topRelativeToContainer;

               originalStyles.set(el, el.style.marginTop);
               const currentMargin =
                  parseFloat(window.getComputedStyle(el).marginTop) || 0;
               // Add slight padding (e.g., 20px) to clear the border cleanly
               el.style.marginTop = `${currentMargin + pushAmount + 20}px`;
            }
         } // Allow a brief moment for the browser to render the margin shifts

         await new Promise((resolve) => setTimeout(resolve, 100));

         const contentBounds =
            elements.length > 0
               ? Array.from(elements).reduce(
                    (acc, el) => {
                       const rect = el.getBoundingClientRect();
                       const containerRect = container.getBoundingClientRect();
                       const left = rect.left - containerRect.left;
                       const top = rect.top - containerRect.top;
                       const right = left + rect.width;
                       const bottom = top + rect.height;

                       return {
                          left: Math.min(acc.left, left),
                          top: Math.min(acc.top, top),
                          right: Math.max(acc.right, right),
                          bottom: Math.max(acc.bottom, bottom),
                       };
                    },
                    {
                       left: Infinity,
                       top: Infinity,
                       right: 0,
                       bottom: 0,
                    },
                 )
               : {
                    left: 0,
                    top: 0,
                    right: container.scrollWidth,
                    bottom: container.scrollHeight,
                 };

         const cropPadding = 8;
         const cropX = Math.max(0, Math.floor(contentBounds.left - cropPadding));
         const cropY = Math.max(0, Math.floor(contentBounds.top - cropPadding));
         const cropWidth = Math.ceil(
            Math.min(
               container.scrollWidth - cropX,
               contentBounds.right - contentBounds.left + cropPadding * 2,
            ),
         );
         const cropHeight = Math.ceil(
            Math.min(
               container.scrollHeight - cropY,
               contentBounds.bottom - contentBounds.top + cropPadding * 2,
            ),
         );

         const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            x: cropX,
            y: cropY,
            width: cropWidth,
            height: cropHeight,
         });

         const pageHeightPx = Math.floor((canvas.width * maxHeight) / maxWidth);
         const totalPages = Math.max(
            1,
            Math.ceil(canvas.height / pageHeightPx),
         );

         for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
            if (pageIndex > 0) {
               pdf.addPage();
            }

            const sourceY = pageIndex * pageHeightPx;
            const sliceHeight = Math.min(pageHeightPx, canvas.height - sourceY);

            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvas.width;
            pageCanvas.height = sliceHeight;

            const pageCtx = pageCanvas.getContext('2d');
            pageCtx.drawImage(
               canvas,
               0,
               sourceY,
               canvas.width,
               sliceHeight,
               0,
               0,
               canvas.width,
               sliceHeight,
            );

            const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
            const renderHeight = (sliceHeight * maxWidth) / canvas.width;

            pdf.addImage(
               pageImgData,
               'JPEG',
               margin,
               margin,
               maxWidth,
               renderHeight,
            );
         }

         pdf.save('b-watch-luxury-catalog.pdf');
      } catch (error) {
         console.error('PDF Generation failed:', error);
         alert('PDF generation failed — see console for details.');
      } finally {
         // Clean up: Reset the UI to its original layout so the web view isn't broken
         originalStyles.forEach((marginTop, el) => {
            el.style.marginTop = marginTop;
         });
         setIsGenerating(false);
      }
   };

   const availableGalleryImages = galleryImages.filter(
      (img) => !catalogImages.some((current) => current.id === img.id),
   );

   const pickerImages = activePlaceholderId
      ? galleryImages
      : availableGalleryImages;

   const renderPageBreakMarker = (key) => (
      <div
         key={key}
         className="w-full h-0"
         style={{
            breakAfter: 'page',
            pageBreakAfter: 'always',
            gridColumn: '1 / -1',
         }}>
         <div className="absolute left-0 right-0 border-t-2 border-dashed border-neutral-300/70 pointer-events-none" />
      </div>
   );

   const renderWatchMeta = (img, { compact = false } = {}) => (
      <div
         className={`absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/50 to-transparent ${
            compact ? 'p-3 md:p-4' : 'p-4 md:p-5'
         }`}>
         <div className="flex items-end justify-between gap-3 text-white">
            <div className="min-w-0 flex-1 space-y-1">
               <p
                  className="text-[9px] md:text-[10px] uppercase tracking-[0.28em] text-[#f2d7bf] font-bold"
                  style={{
                     overflowWrap: 'anywhere',
                  }}>
                  {img.brand || 'Custom Brand'}
               </p>
               <h3
                  className={`font-light italic leading-tight ${
                     compact ? 'text-sm md:text-base' : 'text-base md:text-lg'
                  }`}
                  style={{
                     fontFamily: "'Playfair Display', serif",
                     overflowWrap: 'anywhere',
                     wordBreak: 'break-word',
                  }}>
                  {img.alt || 'Untitled Watch'}
               </h3>
            </div>
            <div className="text-right shrink-0 max-w-[44%] space-y-1">
               <p className="text-xs md:text-sm font-bold tracking-widest">
                  {formatPrice(img.mrp)}
               </p>
               {(img.color || img.dialColor) && (
                  <div className="mt-1 flex flex-wrap justify-end gap-1">
                     {img.color && (
                        <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em]">
                           {img.color}
                        </span>
                     )}
                     {img.dialColor && (
                        <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em]">
                           Dial {img.dialColor}
                        </span>
                     )}
                  </div>
               )}
            </div>
         </div>
      </div>
   );

   const renderWatchCard = ({
      img,
      className,
      imageClassName = 'w-full h-full object-cover',
      compact = false,
      onClick,
      style,
   }) => (
      <div
         onClick={onClick}
         style={{
            breakInside: 'avoid',
            pageBreakInside: 'avoid',
            ...style,
         }}
         className={`relative overflow-hidden rounded-2xl border border-neutral-100 shadow-sm group bg-neutral-50 ${className || ''} ${
            onClick ? 'cursor-pointer' : ''
         } pdf-item`}>
         <img
            src={img.src}
            alt={img.alt}
            className={`${imageClassName} transition-transform duration-700 group-hover:scale-[1.03]`}
         />
         {renderWatchMeta(img, { compact })}
         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>
   );

   const renderTemplate = () => {
      switch (selectedTemplate) {
         case 'grid':
            if (isSingleImage) {
               return (
                  <div className="min-h-[860px] flex items-center justify-center">
                     <div className="w-full">
                        {renderWatchCard({
                           img: catalogImages[0],
                           className:
                              'rounded-[2rem] shadow-xl h-[780px] flex items-center justify-center',
                           imageClassName: 'w-full h-full object-cover',
                           onClick:
                              currentStep === 1
                                 ? () =>
                                      setActiveCatalogImageId(
                                         catalogImages[0]?.id,
                                      )
                                 : undefined,
                        })}
                        {hasPageBreakAfter(catalogImages[0]?.id) &&
                           renderPageBreakMarker(
                              `grid-single-${catalogImages[0]?.id}`,
                           )}
                     </div>
                  </div>
               );
            }

            return (
               <div className="space-y-0">
                  {classicGridPages.map((pageImages, pageIndex) => (
                     <div
                        key={`classic-grid-page-${pageIndex}`}
                        className="grid grid-cols-2 grid-rows-3 gap-4 h-[1131px]"
                        style={{
                           breakInside: 'avoid',
                           pageBreakInside: 'avoid',
                           breakAfter:
                              pageIndex < classicGridPages.length - 1
                                 ? 'page'
                                 : 'auto',
                           pageBreakAfter:
                              pageIndex < classicGridPages.length - 1
                                 ? 'always'
                                 : 'auto',
                        }}>
                        {pageImages.map((img) => (
                           <div key={img.id} className="contents">
                              {renderWatchCard({
                                 img,
                                 className: `h-full ${
                                    currentStep === 1 &&
                                    activeCatalogImageId === img.id
                                       ? 'ring-2 ring-[#c09a74] ring-offset-2'
                                       : ''
                                 }`,
                                 onClick:
                                    currentStep === 1
                                       ? () => setActiveCatalogImageId(img.id)
                                       : undefined,
                              })}
                           </div>
                        ))}
                     </div>
                  ))}
               </div>
            );
         case 'mosaic':
            if (catalogImages.length <= 2) {
               return (
                  <div
                     className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[780px]"
                     style={{ gridAutoRows: '1fr' }}>
                     {catalogImages.map((img) => (
                        <div key={img.id} className="contents">
                           {renderWatchCard({
                              img,
                              className: 'min-h-[360px] md:min-h-0 h-full',
                              onClick:
                                 currentStep === 1
                                    ? () => setActiveCatalogImageId(img.id)
                                    : undefined,
                           })}
                           {hasPageBreakAfter(img.id) &&
                              renderPageBreakMarker(`mosaic-small-${img.id}`)}
                        </div>
                     ))}
                  </div>
               );
            }

            if (catalogImages.length === 3) {
               return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[780px]">
                     <div
                        className="rounded-[1.5rem] overflow-hidden border border-neutral-100 shadow-sm min-h-[780px]"
                        style={{
                           breakInside: 'avoid',
                           pageBreakInside: 'avoid',
                        }}>
                        <img
                           src={catalogImages[0]?.src}
                           alt={catalogImages[0]?.alt}
                           className="w-full h-full object-cover"
                        />
                     </div>
                  <div className="grid grid-rows-2 gap-4 min-h-[780px]">
                     {catalogImages.slice(1).map((img) => (
                        <div key={img.id} className="contents">
                           {renderWatchCard({
                              img,
                              className: 'rounded-[1.5rem] min-h-[383px]',
                              onClick:
                                 currentStep === 1
                                    ? () => setActiveCatalogImageId(img.id)
                                    : undefined,
                           })}
                           {hasPageBreakAfter(img.id) &&
                              renderPageBreakMarker(`mosaic-mid-${img.id}`)}
                        </div>
                     ))}
                  </div>
                  </div>
               );
            }

            return (
               <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[220px] gap-4 min-h-[780px]">
                  {catalogImages.map((img, idx) => (
                     <div key={img.id} className="contents">
                        {renderWatchCard({
                           img,
                           className:
                              catalogImages.length === 4
                                 ? idx === 0 || idx === 3
                                    ? 'col-span-2 row-span-2 rounded-[1.5rem]'
                                    : 'col-span-1 row-span-1 rounded-[1.5rem]'
                                 : idx % 4 === 0
                                   ? 'col-span-2 row-span-2 rounded-[1.5rem]'
                                   : 'col-span-1 row-span-1 rounded-[1.5rem]',
                           onClick:
                              currentStep === 1
                                 ? () => setActiveCatalogImageId(img.id)
                                 : undefined,
                        })}
                        {hasPageBreakAfter(img.id) &&
                           renderPageBreakMarker(`mosaic-large-${img.id}`)}
                     </div>
                  ))}
               </div>
            );
         case 'minimal':
           if (isSingleImage) {
               return (
                  <div className="min-h-[920px] flex flex-col items-center justify-center gap-10 py-8">
                     <div className="w-full max-w-4xl">
                        {renderWatchCard({
                           img: catalogImages[0],
                           className:
                              'relative rounded-[2.5rem] min-h-[780px] flex items-center justify-center p-8 md:p-12',
                           imageClassName:
                              'w-full h-full max-h-[720px] object-contain drop-shadow-2xl',
                           onClick:
                              currentStep === 1
                                 ? () =>
                                      setActiveCatalogImageId(
                                         catalogImages[0]?.id,
                                      )
                                 : undefined,
                        })}
                        {hasPageBreakAfter(catalogImages[0]?.id) &&
                           renderPageBreakMarker(
                              `minimal-single-${catalogImages[0]?.id}`,
                           )}
                     </div>
                     <div className="text-center pdf-item">
                        <h2
                           className="text-3xl md:text-5xl font-light italic text-[#c09a74]"
                           style={{ fontFamily: "'Playfair Display', serif" }}>
                           {catalogImages[0]?.alt}
                        </h2>
                        <p className="mt-3 text-[10px] md:text-xs uppercase tracking-[0.35em] text-neutral-400 font-bold">
                           {catalogImages[0]?.brand}
                        </p>
                        <p className="mt-2 text-sm font-bold text-black">
                           {formatPrice(catalogImages[0]?.mrp)}
                        </p>
                     </div>
                  </div>
               );
            }

            return (
               <div className="space-y-8">
                  {renderWatchCard({
                     img: catalogImages[0],
                     className: 'aspect-[16/9] rounded-3xl shadow-md',
                     onClick:
                        currentStep === 1
                           ? () => setActiveCatalogImageId(catalogImages[0]?.id)
                           : undefined,
                  })}
                  <div className="grid grid-cols-3 gap-4">
                     {catalogImages.slice(1).map((img) => (
                        <div key={img.id} className="contents">
                           {renderWatchCard({
                              img,
                              className: 'aspect-square rounded-xl shadow-sm',
                              compact: true,
                              onClick:
                                 currentStep === 1
                                    ? () => setActiveCatalogImageId(img.id)
                                    : undefined,
                           })}
                           {hasPageBreakAfter(img.id) &&
                              renderPageBreakMarker(`minimal-${img.id}`)}
                        </div>
                     ))}
                  </div>
               </div>
            );
         case 'custom':
            return (
               <div className="w-full h-[1000px] relative border-2 border-dashed border-neutral-100 rounded-[2rem]">
                 {builderImages.map((img) => (
                     <Rnd
                        key={img.id}
                        size={{ width: img.width, height: img.height }}
                        position={{ x: img.x, y: img.y }}
                        onDragStop={(e, d) =>
                           updateBuilderImage(img.id, { x: d.x, y: d.y })
                        }
                        onResizeStop={(e, direction, ref, delta, position) => {
                           updateBuilderImage(img.id, {
                              width: ref.style.width,
                              height: ref.style.height,
                              ...position,
                           });
                        }}
                        bounds="parent"
                        className="group">
                        {renderWatchCard({
                           img,
                           className: 'w-full h-full rounded-xl shadow-lg',
                           compact: true,
                           imageClassName:
                              'w-full h-full object-cover pointer-events-none',
                        })}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                           <span className="text-[10px] text-white uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                              Resize / Drag
                           </span>
                        </div>
                     </Rnd>
                  ))}
               </div>
            );
         default:
            if (selectedTemplate.startsWith('custom-')) {
               const template = customTemplates.find(
                  (t) => t.id === selectedTemplate,
               );
               if (!template) return null;

               const imagePlaceholders = activeTemplateElements.filter(
                  (el) => el.type === 'image',
               );

               const renderArrow = (el) => {
                  const { width, height, arrowStyle, color } = el;
                  const strokeWidth = 2;
                  const headSize = 10;

                  const ArrowSVG = ({ children }) => (
                     <svg
                        width="100%"
                        height="100%"
                        viewBox={`0 0 ${width} ${height}`}
                        preserveAspectRatio="none">
                        {children}
                        <path
                           d={`M ${width - headSize} ${height / 2 - headSize / 2} L ${width} ${height / 2} L ${width - headSize} ${height / 2 + headSize / 2}`}
                           fill="none"
                           stroke={color}
                           strokeWidth={strokeWidth}
                           strokeLinecap="round"
                           strokeLinejoin="round"
                        />
                     </svg>
                  );

                  if (arrowStyle === 'straight') {
                     return (
                        <ArrowSVG>
                           <line
                              x1="0"
                              y1={height / 2}
                              x2={width - headSize}
                              y2={height / 2}
                              stroke={color}
                              strokeWidth={strokeWidth}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                           />
                        </ArrowSVG>
                     );
                  }

                  if (arrowStyle === 'spring') {
                     const points = [];
                     const steps = 100;
                     const amplitude = height / 3;
                     for (let i = 0; i <= steps; i++) {
                        const x = (i / steps) * (width - headSize);
                        const y =
                           height / 2 +
                           Math.sin((i / steps) * Math.PI * 8) * amplitude;
                        points.push(`${x},${y}`);
                     }
                     return (
                        <ArrowSVG>
                           <polyline
                              points={points.join(' ')}
                              fill="none"
                              stroke={color}
                              strokeWidth={strokeWidth}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                           />
                        </ArrowSVG>
                     );
                  }

                  if (arrowStyle === 'combination') {
                     const midX = (width - headSize) * 0.6;
                     const points = [];
                     const steps = 60;
                     const amplitude = height / 3;
                     for (let i = 0; i <= steps; i++) {
                        const x = (i / steps) * midX;
                        const y =
                           height / 2 +
                           Math.sin((i / steps) * Math.PI * 6) * amplitude;
                        points.push(`${x},${y}`);
                     }
                     return (
                        <ArrowSVG>
                           <polyline
                              points={points.join(' ')}
                              fill="none"
                              stroke={color}
                              strokeWidth={strokeWidth}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                           />
                           <line
                              x1={midX}
                              y1={height / 2}
                              x2={width - headSize}
                              y2={height / 2}
                              stroke={color}
                              strokeWidth={strokeWidth}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                           />
                        </ArrowSVG>
                     );
                  }
                  return null;
               };

               return (
                  <div
                     className="relative mx-auto bg-white shadow-2xl"
                     style={{
                        width: '800px',
                        height: `${template.canvasHeight || 1131}px`,
                     }}>
                     {activeTemplateElements.map((el) => {
                        if (el.type === 'image') {
                           // Find which image to show in this placeholder
                           let imageToShow = null;
                           if (mappedImages[el.id]) {
                              imageToShow = galleryImages.find(
                                 (img) => img.id === mappedImages[el.id],
                              );
                           } else {
                              const placeholderIdx =
                                 imagePlaceholders.findIndex(
                                    (p) => p.id === el.id,
                                 );
                              imageToShow =
                                 catalogImages[
                                    placeholderIdx % catalogImages.length
                                 ];
                           }

                           return (
                              <div
                                 key={el.id}
                                 onClick={() => {
                                    setActivePlaceholderId(el.id);
                                    setIsGalleryPickerOpen(true);
                                 }}
                                 style={{
                                    position: 'absolute',
                                    left: el.x,
                                    top: el.y,
                                    width: el.width,
                                    height: el.height,
                                 }}
                                 className="rounded-xl overflow-hidden border border-neutral-100 shadow-sm cursor-pointer group hover:ring-2 hover:ring-[#c09a74] transition-all">
                                 {imageToShow ? (
                                    <div className="w-full h-full relative">
                                       <img
                                          src={imageToShow.src}
                                          alt={imageToShow.alt}
                                          className="w-full h-full object-cover"
                                       />
                                       {renderWatchMeta(imageToShow, {
                                          compact: true,
                                       })}
                                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                                          <span className="text-[10px] text-white uppercase font-bold tracking-widest">
                                             Change Image
                                          </span>
                                       </div>
                                    </div>
                                 ) : (
                                    <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-300">
                                       <ImageIcon size={24} />
                                    </div>
                                 )}
                              </div>
                           );
                        } else if (el.type === 'arrow') {
                           return (
                              <div
                                 key={el.id}
                                 style={{
                                    position: 'absolute',
                                    left: el.x,
                                    top: el.y,
                                    width: el.width,
                                    height: el.height,
                                 }}
                                 className="flex items-center justify-center">
                                 {renderArrow(el)}
                              </div>
                           );
                        } else {
                           return (
                              <div
                                 key={el.id}
                                 style={{
                                    position: 'absolute',
                                    left: el.x,
                                    top: el.y,
                                    width: el.width,
                                    height: el.height,
                                    fontSize: `${el.fontSize}px`,
                                    fontFamily: el.fontFamily,
                                    color: el.color,
                                 }}
                                 className="flex items-center justify-center text-center">
                                 <input
                                    type="text"
                                    value={el.content}
                                    onChange={(e) => {
                                       const newContent = e.target.value;
                                       setActiveTemplateElements((prev) =>
                                          prev.map((item) =>
                                             item.id === el.id
                                                ? {
                                                     ...item,
                                                     content: newContent,
                                                  }
                                                : item,
                                          ),
                                       );
                                    }}
                                    className="w-full bg-transparent border-none text-center focus:outline-none focus:ring-1 focus:ring-[#c09a74]/30 rounded"
                                    style={{
                                       fontSize: 'inherit',
                                       fontFamily: 'inherit',
                                       color: 'inherit',
                                    }}
                                 />
                              </div>
                           );
                        }
                     })}
                  </div>
               );
            }
            return null;
      }
   };

   return (
      <div className="min-h-screen bg-[#fafafa] text-black font-sans">
         <AnimatePresence>
            {isAddImageModalOpen && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[600] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                  <motion.div
                     initial={{ scale: 0.95, y: 20 }}
                     animate={{ scale: 1, y: 0 }}
                     exit={{ scale: 0.95, y: 20 }}
                     className="w-full max-w-3xl rounded-[2rem] bg-white shadow-2xl overflow-hidden">
                     <div className="p-6 md:p-8 border-b border-neutral-100 flex items-center justify-between">
                        <div>
                           <h2
                              className="text-2xl font-light italic text-[#c09a74]"
                              style={{
                                 fontFamily: "'Playfair Display', serif",
                              }}>
                              Add Image
                           </h2>
                           <p className="text-xs uppercase tracking-widest font-bold text-neutral-400 mt-1">
                              Choose from gallery or use a URL
                           </p>
                        </div>
                        <button
                           onClick={() => setIsAddImageModalOpen(false)}
                           className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-500">
                           <X size={18} />
                        </button>
                     </div>

                     <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                           onClick={() => {
                              setIsAddImageModalOpen(false);
                              addCatalogImage();
                           }}
                           className="rounded-3xl border border-neutral-200 p-6 text-left hover:border-[#c09a74] hover:bg-[#c09a74]/5 transition-all">
                           <h3 className="text-lg font-bold">Add by URL</h3>
                           <p className="text-sm text-neutral-500 mt-2">
                              Paste an image link and add it to the catalog.
                           </p>
                        </button>

                        <button
                           onClick={() => {
                              setIsAddImageModalOpen(false);
                              setIsGalleryPickerOpen(true);
                           }}
                           className="rounded-3xl border border-neutral-200 p-6 text-left hover:border-[#c09a74] hover:bg-[#c09a74]/5 transition-all">
                           <h3 className="text-lg font-bold">
                              Choose from Gallery
                           </h3>
                           <p className="text-sm text-neutral-500 mt-2">
                              Select watches from your saved collection.
                           </p>
                        </button>
                     </div>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>

         <AnimatePresence>
            {isGalleryPickerOpen && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[650] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                  <motion.div
                     initial={{ scale: 0.95, y: 20 }}
                     animate={{ scale: 1, y: 0 }}
                     exit={{ scale: 0.95, y: 20 }}
                     className="w-full max-w-6xl rounded-[2rem] bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                     <div className="p-6 md:p-8 border-b border-neutral-100 flex items-center justify-between">
                        <div>
                           <h2
                              className="text-2xl font-light italic text-[#c09a74]"
                              style={{
                                 fontFamily: "'Playfair Display', serif",
                              }}>
                              Select from Gallery
                           </h2>
                           <p className="text-xs uppercase tracking-widest font-bold text-neutral-400 mt-1">
                              Pick one or more items to add
                           </p>
                        </div>
                        <div className="flex items-center gap-3">
                           <button
                              onClick={() => {
                                 setIsGalleryPickerOpen(false);
                                 setSelectedGalleryIds([]);
                              }}
                              className="px-4 py-2 rounded-full border border-neutral-200 text-xs uppercase tracking-widest font-bold">
                              Cancel
                           </button>
                           <button
                              onClick={addSelectedGalleryImages}
                              disabled={selectedGalleryIds.length === 0}
                              className="px-4 py-2 rounded-full bg-black text-white text-xs uppercase tracking-widest font-bold disabled:opacity-40">
                              Add Selected ({selectedGalleryIds.length})
                           </button>
                        </div>
                     </div>

                     <div className="p-6 md:p-8 overflow-y-auto">
                        {pickerImages.length === 0 ? (
                           <div className="py-16 text-center text-neutral-500">
                              No images available to add.
                           </div>
                        ) : (
                           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {pickerImages.map((img) => {
                                 const isSelected = selectedGalleryIds.includes(
                                    img.id,
                                 );
                                 return (
                                    <button
                                       key={img.id}
                                       onClick={() =>
                                          setSelectedGalleryIds((prev) =>
                                             prev.includes(img.id)
                                                ? prev.filter(
                                                     (id) => id !== img.id,
                                                  )
                                                : [...prev, img.id],
                                          )
                                       }
                                       className={`relative overflow-hidden rounded-2xl border-2 text-left transition-all ${
                                          isSelected
                                             ? 'border-[#c09a74] ring-2 ring-[#c09a74]/20'
                                             : 'border-transparent hover:border-neutral-200'
                                       }`}>
                                       <div className="aspect-square">
                                          <img
                                             src={img.src}
                                             alt={img.alt}
                                             className="w-full h-full object-cover"
                                          />
                                       </div>
                                       <div className="p-3">
                                          <div className="text-sm font-bold truncate">
                                             {img.alt}
                                          </div>
                                          <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                                             {img.brand}
                                          </div>
                                       </div>
                                       {isSelected && (
                                          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#c09a74] text-white flex items-center justify-center">
                                             <Check size={16} />
                                          </div>
                                       )}
                                    </button>
                                 );
                              })}
                           </div>
                        )}
                     </div>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Navigation Bar */}
         <nav className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between sticky top-0 z-[100]">
            <div className="flex items-center gap-4 md:gap-6">
               <Link
                  to="/gallery"
                  className="text-neutral-500 hover:text-black transition-colors">
                  <ArrowLeft size={18} md:size={20} />
               </Link>
               <h1
                  className="text-lg md:text-xl font-light tracking-tight italic text-[#c09a74]"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                  Builder
               </h1>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
               {currentStep > 1 && (
                  <button
                     onClick={() => setCurrentStep(currentStep - 1)}
                     className="px-4 py-2 md:px-6 md:py-2 rounded-full border border-neutral-200 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-neutral-50 transition-all">
                     Back
                  </button>
               )}
               {currentStep < 3 ? (
                  <button
                     onClick={() => setCurrentStep(currentStep + 1)}
                     className="px-6 py-2 md:px-8 md:py-2 rounded-full bg-black text-white text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-[#c09a74] transition-all shadow-lg flex items-center gap-2">
                     Next <ChevronRight size={14} className="hidden md:block" />
                  </button>
               ) : (
                  <button
                     onClick={handleGeneratePDF}
                     disabled={isGenerating}
                     className="px-6 py-2 md:px-8 md:py-2 rounded-full bg-[#c09a74] text-white text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center gap-2 disabled:opacity-50">
                     {isGenerating ? 'Wait...' : 'Export'}
                  </button>
               )}
            </div>
         </nav>

         {/* Timeline / Progress */}
         <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="flex items-center justify-between relative">
               <div className="absolute top-1/2 left-0 w-full h-[2px] bg-neutral-200 -translate-y-1/2 z-0" />
               <motion.div
                  className="absolute top-1/2 left-0 h-[2px] bg-[#c09a74] -translate-y-1/2 z-0"
                  initial={{ width: '0%' }}
                  animate={{
                     width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                  }}
               />

               {steps.map((step) => {
                  const StepIcon = step.icon;
                  return (
                     <div
                        key={step.id}
                        className="relative z-10 flex flex-col items-center gap-3">
                        <div
                           className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                              currentStep >= step.id
                                 ? 'bg-[#c09a74] border-[#c09a74] text-white shadow-xl scale-110'
                                 : 'bg-white border-neutral-200 text-neutral-400'
                           }`}>
                           <StepIcon size={16} md:size={20} />
                        </div>
                        <span
                           className={`text-[8px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.2em] font-bold ${
                              currentStep >= step.id
                                 ? 'text-[#c09a74]'
                                 : 'text-neutral-400'
                           }`}>
                           {step.name.split(' ')[0]}
                        </span>
                     </div>
                  );
               })}
            </div>
         </div>

         {/* Main Content Area */}
         <main className="max-w-7xl mx-auto px-6 pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
               {/* Controls Panel */}
               <div className="lg:col-span-4 space-y-6 sticky top-28">
                  {currentStep === 1 && (
                     <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm">
                        <div className="flex items-center justify-between gap-4 mb-6">
                           <h3 className="text-sm uppercase tracking-widest font-bold text-neutral-400">
                              Select Layout
                           </h3>
                           <div className="flex items-center gap-2">
                              {/* <button
                                 onClick={addNewPage}
                                 className="px-4 py-2 rounded-full border border-neutral-200 text-black text-[10px] uppercase tracking-widest font-bold hover:border-[#c09a74] hover:text-[#c09a74] transition-colors">
                                 Add New Page
                              </button> */}
                              <button
                                 onClick={() => setIsAddImageModalOpen(true)}
                                 className="px-4 py-2 rounded-full bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#c09a74] transition-colors">
                                 Add Image
                              </button>
                           </div>
                        </div>
                        <div className="space-y-4">
                           {allTemplates.map((tpl) => (
                              <div
                                 key={tpl.id}
                                 onClick={() => setSelectedTemplate(tpl.id)}
                                 className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                                    selectedTemplate === tpl.id
                                       ? 'border-[#c09a74] bg-[#c09a74]/5 shadow-inner'
                                       : 'border-neutral-100 hover:border-neutral-200 shadow-sm'
                                 }`}>
                                 <div className="flex justify-between items-start mb-1">
                                    <span className="block text-base font-bold text-black">
                                       {tpl.name}
                                    </span>
                                    <div className="flex items-start gap-2">
                                       {(tpl.id === 'custom' ||
                                          tpl.id.startsWith('custom-')) && (
                                          <span className="bg-black text-white text-[8px] px-2 py-0.5 rounded-full uppercase">
                                             Pro
                                          </span>
                                       )}
                                       {tpl.id.startsWith('custom-') && (
                                          <button
                                             onClick={(e) => {
                                                e.stopPropagation();
                                                const confirmed =
                                                   window.confirm(
                                                      'Delete this custom template?',
                                                   );
                                                if (confirmed) {
                                                   const filtered =
                                                      customTemplates.filter(
                                                         (t) => t.id !== tpl.id,
                                                      );
                                                   localStorage.setItem(
                                                      'custom-templates',
                                                      JSON.stringify(filtered),
                                                   );
                                                   setCustomTemplates(filtered);
                                                   if (
                                                      selectedTemplate ===
                                                      tpl.id
                                                   ) {
                                                      setSelectedTemplate(
                                                         isSingleImage
                                                            ? 'minimal'
                                                            : 'grid',
                                                      );
                                                   }
                                                }
                                             }}
                                             className="text-red-400 hover:text-red-600 transition-colors">
                                             <Trash2 size={14} />
                                          </button>
                                       )}
                                    </div>
                                 </div>
                                 <span className="block text-xs text-neutral-500">
                                    {tpl.description}
                                 </span>
                              </div>
                           ))}
                        </div>

                        <div className="mt-6 rounded-2xl border border-dashed border-neutral-200 p-4">
                           <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-2">
                              Catalog Images
                           </p>
                           <div className="flex flex-wrap gap-2">
                              {catalogImages.map((img) => (
                                 <div
                                    key={img.id}
                                    onClick={() => setActiveCatalogImageId(img.id)}
                                    className={`flex items-center gap-2 bg-neutral-100 px-3 py-1.5 rounded-full group border transition-all cursor-pointer ${
                                       activeCatalogImageId === img.id
                                          ? 'border-[#c09a74] bg-[#c09a74]/10 shadow-sm'
                                          : 'border-neutral-200'
                                    }`}>
                                    <span className="text-[10px] text-neutral-600 font-medium max-w-[160px] truncate">
                                       {img.alt}
                                    </span>
                                    <button
                                       onClick={() => {
                                          if (activeCatalogImageId === img.id) {
                                             setActiveCatalogImageId(
                                                catalogImages.find(
                                                   (item) => item.id !== img.id,
                                                )?.id || null,
                                             );
                                          }
                                          setCatalogImages((prev) =>
                                             prev.filter(
                                                (i) => i.id !== img.id,
                                             ),
                                          );
                                          setMappedImages((prev) => {
                                             const next = { ...prev };
                                             Object.keys(next).forEach(
                                                (key) => {
                                                   if (next[key] === img.id)
                                                      delete next[key];
                                                },
                                             );
                                             return next;
                                          });
                                       }}
                                       className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all">
                                       <X size={10} />
                                    </button>
                                 </div>
                              ))}
                              <button
                                 onClick={() => {
                                    setActivePlaceholderId(null);
                                    setIsGalleryPickerOpen(true);
                                 }}
                                 className="text-[10px] px-3 py-1.5 rounded-full border border-dashed border-neutral-300 text-neutral-400 hover:border-[#c09a74] hover:text-[#c09a74] transition-colors flex items-center gap-1">
                                 <Plus size={10} /> Add
                              </button>
                           </div>
                        </div>

                        {activeCatalogImage && (
                           <div className="mt-6 rounded-2xl border border-neutral-200 p-4 space-y-4">
                             <div className="flex items-center justify-between gap-3">
                                 <div>
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                       Selected Watch
                                    </p>
                                    <h4
                                       className="text-base font-bold text-black mt-1 whitespace-normal break-words"
                                       style={{ overflowWrap: 'anywhere' }}>
                                       {activeCatalogImage.alt}
                                    </h4>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                       Preview Price
                                    </p>
                                    <p className="text-sm font-bold text-[#c09a74]">
                                       {formatPrice(activeCatalogImage.mrp)}
                                    </p>
                                 </div>
                              </div>

                              <div className="aspect-video rounded-xl overflow-hidden border border-neutral-100 bg-neutral-50">
                                 <img
                                    src={activeCatalogImage.src}
                                    alt={activeCatalogImage.alt}
                                    className="w-full h-full object-cover"
                                 />
                              </div>

                              <div className="grid grid-cols-1 gap-3">
                                 <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                       Model Name
                                    </label>
                                    <input
                                       type="text"
                                       value={activeCatalogImage.alt || ''}
                                       onChange={(e) =>
                                          updateCatalogImage(
                                             activeCatalogImage.id,
                                             { alt: e.target.value },
                                          )
                                       }
                                       className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c09a74]"
                                    />
                                 </div>

                                 <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                       Brand
                                    </label>
                                    <input
                                       type="text"
                                       value={activeCatalogImage.brand || ''}
                                       onChange={(e) =>
                                          updateCatalogImage(
                                             activeCatalogImage.id,
                                             { brand: e.target.value },
                                          )
                                       }
                                       className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c09a74]"
                                    />
                                 </div>

                                 <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                       Price
                                    </label>
                                    <input
                                       type="number"
                                       min="0"
                                       value={activeCatalogImage.mrp ?? ''}
                                       onChange={(e) =>
                                          updateCatalogImage(
                                             activeCatalogImage.id,
                                             { mrp: Number(e.target.value) },
                                          )
                                       }
                                       className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c09a74]"
                                       placeholder="0"
                                    />
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                       <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                          Color
                                       </label>
                                       <input
                                          type="text"
                                          value={activeCatalogImage.color || ''}
                                          onChange={(e) =>
                                             updateCatalogImage(
                                                activeCatalogImage.id,
                                                { color: e.target.value },
                                             )
                                          }
                                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c09a74]"
                                          placeholder="e.g. Black"
                                       />
                                    </div>
                                    <div className="space-y-1.5">
                                       <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                          Dial Color
                                       </label>
                                       <input
                                          type="text"
                                          value={activeCatalogImage.dialColor || ''}
                                          onChange={(e) =>
                                             updateCatalogImage(
                                                activeCatalogImage.id,
                                                { dialColor: e.target.value },
                                             )
                                          }
                                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c09a74]"
                                          placeholder="e.g. Blue"
                                       />
                                    </div>
                                 </div>

                                 <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                       Image URL
                                    </label>
                                    <input
                                       type="url"
                                       value={activeCatalogImage.src || ''}
                                       onChange={(e) =>
                                          updateCatalogImage(
                                             activeCatalogImage.id,
                                             { src: e.target.value },
                                          )
                                       }
                                       className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c09a74]"
                                       placeholder="https://..."
                                    />
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>
                  )}

                  {currentStep === 2 && (
                     <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                           <h3 className="text-sm uppercase tracking-widest font-bold text-neutral-400">
                              Typography
                           </h3>
                           <button
                              onClick={addTextElement}
                              className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-[#c09a74] transition-colors shadow-md">
                              <Plus size={16} />
                           </button>
                        </div>

                        {editingTextId ? (
                           <div className="space-y-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                    Content
                                 </label>
                                 <textarea
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-sm focus:outline-none focus:border-[#c09a74] min-h-[100px]"
                                    value={
                                       textElements.find(
                                          (el) => el.id === editingTextId,
                                       )?.content
                                    }
                                    onChange={(e) =>
                                       updateTextElement(editingTextId, {
                                          content: e.target.value,
                                       })
                                    }
                                 />
                              </div>

                              <div className="flex items-start gap-4">
                                 <div className="flex-1 space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 flex items-center gap-2">
                                       <Palette size={10} /> Color
                                    </label>
                                    <div className="flex flex-wrap gap-1.5">
                                       {colors.map((c) => (
                                          <button
                                             key={c}
                                             onClick={() =>
                                                updateTextElement(
                                                   editingTextId,
                                                   { color: c },
                                                )
                                             }
                                             className={`w-5 h-5 rounded-full border border-neutral-200 transition-transform ${
                                                textElements.find(
                                                   (el) =>
                                                      el.id === editingTextId,
                                                )?.color === c
                                                   ? 'scale-110 ring-2 ring-[#c09a74] ring-offset-1'
                                                   : ''
                                             }`}
                                             style={{ backgroundColor: c }}
                                          />
                                       ))}
                                    </div>
                                 </div>
                                 <div className="w-28 space-y-2 -mt-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                       Size
                                    </label>
                                    <div className="flex items-center justify-between bg-neutral-50 rounded-xl px-2 border border-neutral-300 py-1.5">
                                       <button
                                          className="text-neutral-400 hover:text-black transition-colors"
                                          onClick={() =>
                                             updateTextElement(editingTextId, {
                                                fontSize: Math.max(
                                                   10,
                                                   (textElements.find(
                                                      (el) =>
                                                         el.id ===
                                                         editingTextId,
                                                   )?.fontSize || 24) - 2,
                                                ),
                                             })
                                          }>
                                          <Minus size={12} />
                                       </button>
                                       <span className="text-xs font-bold w-6 text-center">
                                          {
                                             textElements.find(
                                                (el) => el.id === editingTextId,
                                             )?.fontSize
                                          }
                                       </span>
                                       <button
                                          className="text-neutral-400 hover:text-black transition-colors"
                                          onClick={() =>
                                             updateTextElement(editingTextId, {
                                                fontSize: Math.min(
                                                   120,
                                                   (textElements.find(
                                                      (el) =>
                                                         el.id ===
                                                         editingTextId,
                                                   )?.fontSize || 24) + 2,
                                                ),
                                             })
                                          }>
                                          <Plus size={12} />
                                       </button>
                                    </div>
                                 </div>
                              </div>

                              <div className="space-y-4">
                                 <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                    Style
                                 </label>
                                 <div className="flex gap-2">
                                    {[
                                       {
                                          icon: Bold,
                                          key: 'fontWeight',
                                          activeVal: 'bold',
                                          inactiveVal: 'normal',
                                       },
                                       {
                                          icon: Italic,
                                          key: 'fontStyle',
                                          activeVal: 'italic',
                                          inactiveVal: 'normal',
                                       },
                                       {
                                          icon: Underline,
                                          key: 'textDecoration',
                                          activeVal: 'underline',
                                          inactiveVal: 'none',
                                       },
                                    ].map((tool) => {
                                       const element = textElements.find(
                                          (el) => el.id === editingTextId,
                                       );
                                       const isActive =
                                          element?.[tool.key] ===
                                          tool.activeVal;
                                       return (
                                          <button
                                             key={tool.key}
                                             onClick={() =>
                                                updateTextElement(
                                                   editingTextId,
                                                   {
                                                      [tool.key]: isActive
                                                         ? tool.inactiveVal
                                                         : tool.activeVal,
                                                   },
                                                )
                                             }
                                             className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                                                isActive
                                                   ? 'bg-[#c09a74] text-white shadow-md'
                                                   : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                             }`}>
                                             <tool.icon size={16} />
                                          </button>
                                       );
                                    })}
                                 </div>
                              </div>

                              <div className="space-y-4">
                                 <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                    Font
                                 </label>
                                 <select
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs appearance-none focus:outline-none focus:border-[#c09a74]"
                                    value={
                                       textElements.find(
                                          (el) => el.id === editingTextId,
                                       )?.fontFamily
                                    }
                                    onChange={(e) =>
                                       updateTextElement(editingTextId, {
                                          fontFamily: e.target.value,
                                       })
                                    }>
                                    {fonts.map((f) => (
                                       <option key={f.value} value={f.value}>
                                          {f.name}
                                       </option>
                                    ))}
                                 </select>
                              </div>

                              <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                                 <button
                                    onClick={() =>
                                       removeTextElement(editingTextId)
                                    }
                                    className="text-xs uppercase tracking-widest font-bold text-red-500 flex items-center gap-2 hover:text-red-600">
                                    <Trash2 size={14} /> Remove
                                 </button>
                                 <button
                                    onClick={() => setEditingTextId(null)}
                                    className="text-xs uppercase tracking-widest font-bold text-[#c09a74]">
                                    Done
                                 </button>
                              </div>
                           </div>
                        ) : (
                           <div className="text-center py-12">
                              <p className="text-xs text-neutral-400 font-light italic mb-4 leading-relaxed">
                                 Add text elements to label your collection. You
                                 can drag them directly on the canvas.
                              </p>
                              <button
                                 onClick={addTextElement}
                                 className="px-6 py-2 rounded-full border border-[#c09a74] text-[#c09a74] text-[10px] uppercase tracking-widest font-bold hover:bg-[#c09a74] hover:text-white transition-all">
                                 Add First Text
                              </button>
                           </div>
                        )}
                     </div>
                  )}

                  {currentStep === 3 && (
                     <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm space-y-6">
                        <h3 className="text-sm uppercase tracking-widest font-bold text-neutral-400">
                           Final Review
                        </h3>
                        <p className="text-xs text-neutral-500 leading-relaxed">
                           Your catalog is ready. We'll generate a
                           high-resolution PDF optimized for both screen viewing
                           and printing.
                        </p>
                        <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                              <FileDown size={20} />
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-widest font-bold text-green-600">
                                 Status
                              </span>
                              <span className="text-xs font-bold text-green-800">
                                 Ready to Export
                              </span>
                           </div>
                        </div>
                     </div>
                  )}
               </div>

               {/* Catalog Preview Area */}
               <div className="lg:col-span-8">
                  <div
                     id="catalog-canvas"
                     className={`bg-white ${
                        isGenerating
                           ? 'p-0 shadow-none border-none rounded-none'
                           : 'shadow-2xl p-3 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-neutral-200'
                     } min-h-[1131px] relative overflow-hidden`}
                     style={{ width: isGenerating ? '800px' : 'auto' }}
                     ref={catalogRef}>
                     {/* Background Decoration */}
                     {/* <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                        <span
                           className="text-[250px] font-bold italic -rotate-12 uppercase tracking-[0.2em]"
                           style={{ fontFamily: "'Playfair Display', serif" }}>
                           Luxury
                        </span>
                     </div> */}

                     <div className="relative z-10">{renderTemplate()}</div>

                     {previewPageCount > 1 &&
                        Array.from({ length: previewPageCount - 1 }).map(
                           (_, index) => (
                              <div
                                 key={`page-break-${index}`}
                                 className="absolute left-0 right-0 border-t-2 border-dashed border-neutral-300/80 pointer-events-none"
                                 style={{
                                    top: `${(index + 1) * A4_PAGE_HEIGHT_PX}px`,
                                 }}>
                                 <span className="absolute right-6 -top-3 bg-white px-2 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                                    Page {index + 2}
                                 </span>
                              </div>
                           ),
                        )}

                     {/* Text Layer */}
                     <div className="absolute inset-0 z-20 pointer-events-none">
                        {textElements.map((el) => (
                           <Rnd
                              key={el.id}
                              default={{
                                 x: el.x,
                                 y: el.y,
                                 width: el.width,
                                 height: 'auto',
                              }}
                              enableResizing={false}
                              onDragStop={(e, d) =>
                                 updateTextElement(el.id, { x: d.x, y: d.y })
                              }
                              disableDragging={currentStep !== 2}
                              className={`!pointer-events-auto group pdf-item ${editingTextId === el.id ? 'ring-2 ring-[#c09a74] ring-offset-4' : ''}`}>
                              <div
                                 onClick={() =>
                                    currentStep === 2 && setEditingTextId(el.id)
                                 }
                                 style={{
                                    fontSize: `${el.fontSize}px`,
                                    fontFamily: el.fontFamily,
                                    fontWeight: el.fontWeight,
                                    fontStyle: el.fontStyle,
                                    textDecoration: el.textDecoration,
                                    color: el.color,
                                    cursor:
                                       currentStep === 2 ? 'move' : 'default',
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: 1.2,
                                 }}
                                 className="relative p-2">
                                 {el.content}
                              </div>
                           </Rnd>
                        ))}
                     </div>

                     {/* Footer Watermark */}
                     <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end border-t border-neutral-100 pt-8 opacity-20">
                        <div className="flex flex-col gap-1">
                           <span className="text-[8px] uppercase tracking-widest font-bold">
                              B-Watch Luxury Catalog
                           </span>
                           <span className="text-[6px] uppercase tracking-widest text-neutral-500">
                              Excellence in Timekeeping
                           </span>
                        </div>
                        <span
                           className="text-[10px] font-light italic"
                           style={{ fontFamily: "'Playfair Display', serif" }}>
                           www.b-watch.luxury
                        </span>
                     </div>
                  </div>
               </div>
            </div>
         </main>
      </div>
   );
};

export default BuilderPage;
