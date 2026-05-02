import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
   ArrowLeft,
   ChevronRight,
   Type,
   Layout,
   FileDown,
   Bold,
   Italic,
   Underline,
   Settings2,
   Trash2,
   Plus,
   Minus,
   Palette,
} from 'lucide-react';
import { Rnd } from 'react-rnd';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

const BuilderPage = () => {
   const location = useLocation();
   const navigate = useNavigate();
   const selectedImages = location.state?.selectedImages || [];

   const [currentStep, setCurrentStep] = useState(1);
   const [selectedTemplate, setSelectedTemplate] = useState('grid');
   const [textElements, setTextElements] = useState([]);
   const [editingTextId, setEditingTextId] = useState(null);
   const [isGenerating, setIsGenerating] = useState(false);

   // State for custom layout images
   const [builderImages, setBuilderImages] = useState([]);

   const catalogRef = useRef(null);

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

   useEffect(() => {
      if (selectedImages.length === 0) {
         navigate('/gallery');
      } else {
         // Initialize builder images with default positions for custom layout
         setBuilderImages(
            selectedImages.map((img, idx) => ({
               ...img,
               x: 50 + (idx % 3) * 200,
               y: 100 + Math.floor(idx / 3) * 250,
               width: 250,
               height: 250,
            })),
         );
      }
   }, [selectedImages, navigate]);

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

   const removeTextElement = (id) => {
      setTextElements((prev) => prev.filter((el) => el.id !== id));
      setEditingTextId(null);
   };

   const handleGeneratePDF = async () => {
      if (!catalogRef.current) return;
      setIsGenerating(true);

      try {
         // html2canvas-pro supports oklch() natively — render directly
         const canvas = await html2canvas(catalogRef.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
         });

         const imgData = canvas.toDataURL('image/jpeg', 0.95);
         const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
            compress: true,
         });

         const pdfWidth = pdf.internal.pageSize.getWidth();
         const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

         pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
         pdf.save('bewatch-luxury-catalog.pdf');
      } catch (error) {
         console.error('PDF Generation failed:', error);
         alert('PDF generation failed — see console for details.');
      } finally {
         setIsGenerating(false);
      }
   };

   const renderTemplate = () => {
      switch (selectedTemplate) {
         case 'grid':
            return (
               <div className="grid grid-cols-2 gap-4">
                  {selectedImages.map((img) => (
                     <div
                        key={img.id}
                        className="aspect-square rounded-xl overflow-hidden border border-neutral-100 shadow-sm">
                        <img
                           src={img.src}
                           alt={img.alt}
                           className="w-full h-full object-cover"
                        />
                     </div>
                  ))}
               </div>
            );
         case 'mosaic':
            return (
               <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] gap-4">
                  {selectedImages.map((img, idx) => (
                     <div
                        key={img.id}
                        className={`rounded-xl overflow-hidden border border-neutral-100 shadow-sm ${
                           idx % 3 === 0
                              ? 'col-span-2 row-span-2'
                              : 'col-span-1 row-span-1'
                        }`}>
                        <img
                           src={img.src}
                           alt={img.alt}
                           className="w-full h-full object-cover"
                        />
                     </div>
                  ))}
               </div>
            );
         case 'minimal':
            return (
               <div className="space-y-8">
                  <div className="aspect-[16/9] rounded-3xl overflow-hidden border border-neutral-100 shadow-md">
                     <img
                        src={selectedImages[0]?.src}
                        alt={selectedImages[0]?.alt}
                        className="w-full h-full object-cover"
                     />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                     {selectedImages.slice(1).map((img) => (
                        <div
                           key={img.id}
                           className="aspect-square rounded-xl overflow-hidden border border-neutral-100 shadow-sm">
                           <img
                              src={img.src}
                              alt={img.alt}
                              className="w-full h-full object-cover"
                           />
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
                        <div className="w-full h-full rounded-xl overflow-hidden border border-white shadow-lg relative">
                           <img
                              src={img.src}
                              alt={img.alt}
                              className="w-full h-full object-cover pointer-events-none"
                           />
                           <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-[10px] text-white uppercase tracking-widest font-bold">
                                 Resize / Drag
                              </span>
                           </div>
                        </div>
                     </Rnd>
                  ))}
               </div>
            );
         default:
            return null;
      }
   };

   return (
      <div className="min-h-screen bg-[#fafafa] text-black font-sans">
         {/* Navigation Bar */}
         <nav className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between sticky top-0 z-[100]">
            <div className="flex items-center gap-6">
               <Link
                  to="/gallery"
                  className="text-neutral-500 hover:text-black transition-colors">
                  <ArrowLeft size={20} />
               </Link>
               <h1
                  className="text-xl font-light tracking-tight italic text-[#c09a74]"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                  Catalog Builder
               </h1>
            </div>

            <div className="flex items-center gap-4">
               {currentStep > 1 && (
                  <button
                     onClick={() => setCurrentStep(currentStep - 1)}
                     className="px-6 py-2 rounded-full border border-neutral-200 text-xs font-bold uppercase tracking-widest hover:bg-neutral-50 transition-all">
                     Back
                  </button>
               )}
               {currentStep < 3 ? (
                  <button
                     onClick={() => setCurrentStep(currentStep + 1)}
                     className="px-8 py-2 rounded-full bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#c09a74] transition-all shadow-lg flex items-center gap-2">
                     Next Step <ChevronRight size={14} />
                  </button>
               ) : (
                  <button
                     onClick={handleGeneratePDF}
                     disabled={isGenerating}
                     className="px-8 py-2 rounded-full bg-[#c09a74] text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center gap-2 disabled:opacity-50">
                     {isGenerating ? 'Generating...' : 'Export PDF'}
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
                           className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                              currentStep >= step.id
                                 ? 'bg-[#c09a74] border-[#c09a74] text-white shadow-xl scale-110'
                                 : 'bg-white border-neutral-200 text-neutral-400'
                           }`}>
                           <StepIcon size={20} />
                        </div>
                        <span
                           className={`text-[10px] uppercase tracking-[0.2em] font-bold ${
                              currentStep >= step.id
                                 ? 'text-[#c09a74]'
                                 : 'text-neutral-400'
                           }`}>
                           {step.name}
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
                        <h3 className="text-sm uppercase tracking-widest font-bold text-neutral-400 mb-6">
                           Select Layout
                        </h3>
                        <div className="space-y-4">
                           {templates.map((tpl) => (
                              <button
                                 key={tpl.id}
                                 onClick={() => setSelectedTemplate(tpl.id)}
                                 className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 ${
                                    selectedTemplate === tpl.id
                                       ? 'border-[#c09a74] bg-[#c09a74]/5 shadow-inner'
                                       : 'border-neutral-100 hover:border-neutral-200 shadow-sm'
                                 }`}>
                                 <div className="flex justify-between items-start mb-1">
                                    <span className="block text-base font-bold text-black">
                                       {tpl.name}
                                    </span>
                                    {tpl.id === 'custom' && (
                                       <span className="bg-black text-white text-[8px] px-2 py-0.5 rounded-full uppercase">
                                          Pro
                                       </span>
                                    )}
                                 </div>
                                 <span className="block text-xs text-neutral-500">
                                    {tpl.description}
                                 </span>
                              </button>
                           ))}
                        </div>
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
                     className="bg-white rounded-[2.5rem] shadow-2xl p-4 md:p-8 border border-neutral-200 min-h-[1123px] relative overflow-hidden"
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
                              className={`!pointer-events-auto group ${editingTextId === el.id ? 'ring-2 ring-[#c09a74] ring-offset-4' : ''}`}>
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
                              Bewatch Luxury Catalog
                           </span>
                           <span className="text-[6px] uppercase tracking-widest text-neutral-500">
                              Excellence in Timekeeping
                           </span>
                        </div>
                        <span
                           className="text-[10px] font-light italic"
                           style={{ fontFamily: "'Playfair Display', serif" }}>
                           www.bewatch.luxury
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
