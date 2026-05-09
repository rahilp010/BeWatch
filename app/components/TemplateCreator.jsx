import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   X,
   Type,
   Image as ImageIcon,
   Save,
   Trash2,
   Plus,
   Minus,
   Move,
   ArrowRight,
} from 'lucide-react';
import { Rnd } from 'react-rnd';

const TemplateCreator = ({ isOpen, onClose, onSave }) => {
   const [elements, setElements] = useState([]);
   const [templateName, setTemplateName] = useState('');
   const [selectedId, setSelectedId] = useState(null);
   const [canvasHeight, setCanvasHeight] = useState(1131);

   const addElement = (type) => {
      const newElement = {
         id: Date.now(),
         type,
         x: 50,
         y: 50,
         width: type === 'image' ? 200 : type === 'arrow' ? 150 : 250,
         height: type === 'image' ? 200 : type === 'arrow' ? 50 : 50,
         content: type === 'text' ? 'Sample Text' : null,
         fontSize: 24,
         color: '#000000',
         fontFamily: "'Playfair Display', serif",
         arrowStyle: type === 'arrow' ? 'straight' : null,
      };
      setElements([...elements, newElement]);
      setSelectedId(newElement.id);
   };

   const updateElement = (id, updates) => {
      setElements((prev) =>
         prev.map((el) => (el.id === id ? { ...el, ...updates } : el)),
      );
   };

   const removeElement = (id) => {
      setElements((prev) => prev.filter((el) => el.id !== id));
      if (selectedId === id) setSelectedId(null);
   };

   const handleSave = () => {
      if (!templateName) {
         alert('Please enter a template name');
         return;
      }
      if (elements.length === 0) {
         alert('Please add at least one component');
         return;
      }

      const newTemplate = {
         id: `custom-${Date.now()}`,
         name: templateName,
         elements: elements.map((el) => ({ ...el })),
         canvasHeight: canvasHeight,
         description: 'Custom user template',
      };

      onSave(newTemplate);
      setElements([]);
      setTemplateName('');
      onClose();
   };

   const selectedElement = elements.find((el) => el.id === selectedId);

   const renderArrow = (el) => {
      const { width, height, arrowStyle, color } = el;
      const strokeWidth = 2;
      const headSize = 10;

      if (arrowStyle === 'straight') {
         return (
            <svg
               width="100%"
               height="100%"
               viewBox={`0 0 ${width} ${height}`}
               preserveAspectRatio="none">
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
      }

      if (arrowStyle === 'spring') {
         const points = [];
         const steps = 100;
         const amplitude = height / 3;
         for (let i = 0; i <= steps; i++) {
            const x = (i / steps) * (width - headSize);
            const y =
               height / 2 + Math.sin((i / steps) * Math.PI * 8) * amplitude;
            points.push(`${x},${y}`);
         }
         return (
            <svg
               width="100%"
               height="100%"
               viewBox={`0 0 ${width} ${height}`}
               preserveAspectRatio="none">
               <polyline
                  points={points.join(' ')}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
               />
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
      }

      if (arrowStyle === 'combination') {
         const midX = (width - headSize) * 0.6;
         const points = [];
         const steps = 60;
         const amplitude = height / 3;
         for (let i = 0; i <= steps; i++) {
            const x = (i / steps) * midX;
            const y =
               height / 2 + Math.sin((i / steps) * Math.PI * 6) * amplitude;
            points.push(`${x},${y}`);
         }
         return (
            <svg
               width="100%"
               height="100%"
               viewBox={`0 0 ${width} ${height}`}
               preserveAspectRatio="none">
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
      }
   };

   return (
      <AnimatePresence>
         {isOpen && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-4 lg:p-8">
               <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-white rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] w-full max-w-7xl h-[94dvh] lg:h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                  {/* Header */}
                  <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-neutral-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                     <div className="min-w-0">
                        <h2
                           className="text-xl sm:text-2xl font-light italic text-[#c09a74]"
                           style={{ fontFamily: "'Playfair Display', serif" }}>
                           Template Creator
                        </h2>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mt-1">
                           Design your own luxury layout
                        </p>
                     </div>
                     <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full lg:w-auto">
                        <input
                           type="text"
                           placeholder="Template Name..."
                           value={templateName}
                           onChange={(e) => setTemplateName(e.target.value)}
                           className="bg-neutral-50 border border-neutral-200 rounded-full px-4 sm:px-6 py-2 text-sm focus:outline-none focus:border-[#c09a74] w-full lg:w-64"
                        />
                        <button
                           onClick={handleSave}
                           className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded-full bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#c09a74] transition-all shadow-lg">
                           <Save size={16} />
                           <span className="hidden sm:inline">Save Template</span>
                        </button>
                        <button
                           onClick={onClose}
                           className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors shrink-0">
                           <X size={20} />
                        </button>
                     </div>
                  </div>

                  <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                     {/* Sidebar */}
                     <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-neutral-100 flex flex-col p-4 sm:p-6 gap-6 sm:gap-8 overflow-y-auto custom-scrollbar">
                        <div className="space-y-4">
                           <h3 className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                              Components
                           </h3>
                           <div className="grid grid-cols-1 gap-3">
                              <button
                                 onClick={() => addElement('image')}
                                 className="flex items-center gap-4 p-4 rounded-2xl border border-neutral-100 hover:border-[#c09a74] hover:bg-[#c09a74]/5 transition-all text-left group">
                                 <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center group-hover:bg-[#c09a74] group-hover:text-white transition-colors">
                                    <ImageIcon size={20} />
                                 </div>
                                 <div className="min-w-0">
                                    <span className="block text-sm font-bold">
                                       Image Placeholder
                                    </span>
                                    <span className="hidden sm:block text-[10px] text-neutral-500">
                                       Drag to position watch images
                                    </span>
                                 </div>
                              </button>
                              <button
                                 onClick={() => addElement('text')}
                                 className="flex items-center gap-4 p-4 rounded-2xl border border-neutral-100 hover:border-[#c09a74] hover:bg-[#c09a74]/5 transition-all text-left group">
                                 <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center group-hover:bg-[#c09a74] group-hover:text-white transition-colors">
                                    <Type size={20} />
                                 </div>
                                 <div className="min-w-0">
                                    <span className="block text-sm font-bold">
                                       Text Element
                                    </span>
                                    <span className="hidden sm:block text-[10px] text-neutral-500">
                                       Add titles or descriptions
                                    </span>
                                 </div>
                              </button>
                              <button
                                 onClick={() => addElement('arrow')}
                                 className="flex items-center gap-4 p-4 rounded-2xl border border-neutral-100 hover:border-[#c09a74] hover:bg-[#c09a74]/5 transition-all text-left group">
                                 <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center group-hover:bg-[#c09a74] group-hover:text-white transition-colors">
                                    <ArrowRight size={20} />
                                 </div>
                                 <div className="min-w-0">
                                    <span className="block text-sm font-bold">
                                       Arrow Element
                                    </span>
                                    <span className="hidden sm:block text-[10px] text-neutral-500">
                                       Add directional arrows
                                    </span>
                                 </div>
                              </button>
                           </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-neutral-100">
                           <h3 className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                              Template Settings
                           </h3>
                           <div className="space-y-2">
                              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                 Canvas Height (PPT Style)
                              </label>
                              <div className="flex items-center gap-3">
                                 <button
                                    onClick={() =>
                                       setCanvasHeight(
                                          Math.max(400, canvasHeight - 100),
                                       )
                                    }>
                                    <Minus size={14} />
                                 </button>
                                 <input
                                    type="number"
                                    value={canvasHeight}
                                    onChange={(e) =>
                                       setCanvasHeight(
                                          parseInt(e.target.value) || 400,
                                       )
                                    }
                                    className="w-20 text-center bg-neutral-50 border border-neutral-200 rounded-md py-1"
                                 />
                                 <button
                                    onClick={() =>
                                       setCanvasHeight(
                                          Math.min(3000, canvasHeight + 100),
                                       )
                                    }>
                                    <Plus size={14} />
                                 </button>
                              </div>
                              <div className="flex gap-2 mt-2">
                                 <button
                                    className="text-xs text-neutral-500 hover:text-[#c09a74]"
                                    onClick={() => setCanvasHeight(1131)}>
                                    A4 Portrait
                                 </button>
                                 <button
                                    className="text-xs text-neutral-500 hover:text-[#c09a74]"
                                    onClick={() => setCanvasHeight(565)}>
                                    16:9 Slide
                                 </button>
                              </div>
                           </div>
                        </div>

                        {selectedElement && (
                           <div className="space-y-6 pt-6 border-t border-neutral-100">
                              <div className="flex items-center justify-between">
                                 <h3 className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                    Element Settings
                                 </h3>
                                 <button
                                    onClick={() => removeElement(selectedId)}
                                    className="text-red-500 hover:text-red-600 p-1">
                                    <Trash2 size={16} />
                                 </button>
                              </div>

                              {selectedElement.type === 'text' && (
                                 <div className="space-y-4">
                                    <div className="space-y-2">
                                       <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                          Content
                                       </label>
                                       <input
                                          type="text"
                                          value={selectedElement.content}
                                          onChange={(e) =>
                                             updateElement(selectedId, {
                                                content: e.target.value,
                                             })
                                          }
                                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#c09a74]"
                                       />
                                    </div>
                                    <div className="flex items-center justify-between">
                                       <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                          Size
                                       </label>
                                       <div className="flex items-center gap-3">
                                          <button
                                             onClick={() =>
                                                updateElement(selectedId, {
                                                   fontSize: Math.max(
                                                      12,
                                                      selectedElement.fontSize -
                                                         2,
                                                   ),
                                                })
                                             }
                                             className="p-1 rounded-md bg-neutral-100 hover:bg-neutral-200">
                                             <Minus size={14} />
                                          </button>
                                          <span className="text-xs font-bold">
                                             {selectedElement.fontSize}
                                          </span>
                                          <button
                                             onClick={() =>
                                                updateElement(selectedId, {
                                                   fontSize: Math.min(
                                                      72,
                                                      selectedElement.fontSize +
                                                         2,
                                                   ),
                                                })
                                             }
                                             className="p-1 rounded-md bg-neutral-100 hover:bg-neutral-200">
                                             <Plus size={14} />
                                          </button>
                                       </div>
                                    </div>
                                 </div>
                              )}

                              {selectedElement.type === 'arrow' && (
                                 <div className="space-y-4">
                                    <div className="space-y-2">
                                       <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                          Style
                                       </label>
                                       <select
                                          value={selectedElement.arrowStyle}
                                          onChange={(e) =>
                                             updateElement(selectedId, {
                                                arrowStyle: e.target.value,
                                             })
                                          }
                                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#c09a74]">
                                          <option value="straight">
                                             Straight
                                          </option>
                                          <option value="spring">Spring</option>
                                          <option value="combination">
                                             Combination
                                          </option>
                                       </select>
                                    </div>
                                    <div className="space-y-2">
                                       <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                          Color
                                       </label>
                                       <input
                                          type="color"
                                          value={selectedElement.color}
                                          onChange={(e) =>
                                             updateElement(selectedId, {
                                                color: e.target.value,
                                             })
                                          }
                                          className="w-full h-10 cursor-pointer rounded border-none p-0 bg-transparent"
                                       />
                                    </div>
                                 </div>
                              )}

                              <div className="space-y-2">
                                 <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                                    Dimensions
                                 </label>
                                 <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-neutral-50 rounded-xl p-2 text-center">
                                       <span className="block text-[8px] uppercase text-neutral-400 font-bold">
                                          Width
                                       </span>
                                       <span className="text-xs font-bold">
                                          {Math.round(selectedElement.width)}px
                                       </span>
                                    </div>
                                    <div className="bg-neutral-50 rounded-xl p-2 text-center">
                                       <span className="block text-[8px] uppercase text-neutral-400 font-bold">
                                          Height
                                       </span>
                                       <span className="text-xs font-bold">
                                          {Math.round(selectedElement.height)}px
                                       </span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>

                     {/* Canvas */}
                     <div className="flex-1 bg-neutral-50 p-4 sm:p-8 lg:p-12 overflow-y-auto custom-scrollbar flex justify-center">
                        <div
                           className="bg-white shadow-2xl relative overflow-hidden"
                           style={{
                              width: '800px',
                              height: `${canvasHeight}px`,
                              minHeight: `${canvasHeight}px`,
                              transition: 'height 0.3s ease',
                           }}>
                           {/* Grid Background Overlay */}
                           <div
                              className="absolute inset-0 pointer-events-none opacity-[0.03]"
                              style={{
                                 backgroundImage:
                                    'radial-gradient(#000 1px, transparent 1px)',
                                 backgroundSize: '20px 20px',
                              }}
                           />

                           {elements.map((el) => (
                              <Rnd
                                 key={el.id}
                                 size={{ width: el.width, height: el.height }}
                                 position={{ x: el.x, y: el.y }}
                                 onDragStop={(e, d) =>
                                    updateElement(el.id, { x: d.x, y: d.y })
                                 }
                                 onResizeStop={(
                                    e,
                                    direction,
                                    ref,
                                    delta,
                                    position,
                                 ) => {
                                    updateElement(el.id, {
                                       width: parseInt(ref.style.width),
                                       height: parseInt(ref.style.height),
                                       ...position,
                                    });
                                 }}
                                 bounds="parent"
                                 onClick={() => setSelectedId(el.id)}
                                 className={`group ${selectedId === el.id ? 'ring-2 ring-[#c09a74]' : ''}`}>
                                 {el.type === 'image' ? (
                                    <div className="w-full h-full bg-neutral-100 flex items-center justify-center border-2 border-dashed border-neutral-300 relative group">
                                       <ImageIcon
                                          size={32}
                                          className="text-neutral-300"
                                       />
                                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                                          <Move
                                             size={16}
                                             className="text-white opacity-0 group-hover:opacity-100"
                                          />
                                       </div>
                                       <span className="absolute bottom-2 left-2 text-[8px] uppercase tracking-widest font-bold text-neutral-400">
                                          Watch Image Placeholder
                                       </span>
                                    </div>
                                 ) : el.type === 'arrow' ? (
                                    <div className="w-full h-full flex items-center justify-center cursor-move">
                                       {renderArrow(el)}
                                    </div>
                                 ) : (
                                    <div
                                       className="w-full h-full p-2 flex items-center justify-center text-center cursor-move"
                                       style={{
                                          fontSize: `${el.fontSize}px`,
                                          color: el.color,
                                          fontFamily: el.fontFamily,
                                       }}>
                                       {el.content}
                                    </div>
                                 )}
                              </Rnd>
                           ))}

                           {elements.length === 0 && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-300 pointer-events-none">
                                 <Plus
                                    size={48}
                                    strokeWidth={1}
                                    className="mb-4"
                                 />
                                 <p
                                    className="text-lg font-light italic"
                                    style={{
                                       fontFamily: "'Playfair Display', serif",
                                    }}>
                                    Select components from the sidebar to begin
                                 </p>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
   );
};

export default TemplateCreator;
