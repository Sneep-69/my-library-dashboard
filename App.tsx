import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, BookOpen, History, Plus, 
  Home as HomeIcon, Library, BarChart3, Settings2, 
  Loader2, X, CheckCircle2, Trash2, Download, Upload, User, 
  Check, Clock, ChevronRight, Edit2, Image as ImageIcon, Save, AlertTriangle, ExternalLink, AlignLeft, Type, UserCircle
} from 'lucide-react';
import { Book, Tab, Stats } from './types';
import { RECENT_BOOKS } from './constants';

const APP_VERSION = "v2.0.0-local";
const DEFAULT_COVER = "https://images.unsplash.com/photo-1543005127-837384a37b3b?auto=format&fit=crop&q=80&w=400";

const App: React.FC = () => {
  // Persistence / State
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Home);
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('userName') || 'Lecteur Passionné');
  const [library, setLibrary] = useState<Book[]>(() => {
    const saved = localStorage.getItem('myLibrary');
    return saved ? JSON.parse(saved) : RECENT_BOOKS;
  });
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  
  // Manual Add Form state
  const [addForm, setAddForm] = useState({
    title: '',
    author: '',
    coverUrl: '',
    summary: ''
  });

  // Editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    author: '',
    coverUrl: '',
    summary: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save on change to LocalStorage (iPhone storage)
  useEffect(() => {
    localStorage.setItem('myLibrary', JSON.stringify(library));
  }, [library]);

  useEffect(() => {
    localStorage.setItem('userName', userName);
  }, [userName]);

  // Derived Stats
  const booksRead = library.filter(b => b.isRead).length;
  const stats: Stats = {
    booksGoal: 24,
    booksRead: booksRead,
    streakDays: 14,
    personalRecord: 21
  };

  const handleAddBookManually = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.title.trim()) return;

    const newBook: Book = {
      id: Date.now().toString(),
      title: addForm.title,
      author: addForm.author || "Auteur inconnu",
      coverUrl: addForm.coverUrl || DEFAULT_COVER,
      summary: addForm.summary || "Pas de description.",
      isRead: false,
      addedAt: Date.now()
    };

    setLibrary(prev => [newBook, ...prev]);
    setAddForm({ title: '', author: '', coverUrl: '', summary: '' });
    setIsAddModalOpen(false);
    setActiveTab(Tab.Library);
  };

  const toggleReadStatus = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLibrary(prev => prev.map(b => b.id === id ? { ...b, isRead: !b.isRead } : b));
    if (selectedBook?.id === id) {
      setSelectedBook(prev => prev ? { ...prev, isRead: !prev.isRead } : null);
    }
  };

  const initiateDelete = (book: Book, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setBookToDelete(book);
  };

  const confirmDelete = () => {
    if (!bookToDelete) return;
    setLibrary(prev => prev.filter(b => b.id !== bookToDelete.id));
    if (selectedBook?.id === bookToDelete.id) {
      setSelectedBook(null);
    }
    setBookToDelete(null);
  };

  const startEditing = () => {
    if (!selectedBook) return;
    setEditForm({
      title: selectedBook.title,
      author: selectedBook.author,
      coverUrl: selectedBook.coverUrl,
      summary: selectedBook.summary || ''
    });
    setIsEditing(true);
  };

  const saveDetails = () => {
    if (!selectedBook) return;
    const updatedBook = {
      ...selectedBook,
      title: editForm.title,
      author: editForm.author,
      coverUrl: editForm.coverUrl,
      summary: editForm.summary
    };
    
    setLibrary(prev => prev.map(b => b.id === selectedBook.id ? updatedBook : b));
    setSelectedBook(updatedBook);
    setIsEditing(false);
  };

  const exportConfig = () => {
    const data = { library, userName, version: APP_VERSION };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ma_bibliotheque_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.library) setLibrary(json.library);
        if (json.userName) setUserName(json.userName);
        alert("Bibliothèque importée !");
      } catch (err) {
        alert("Fichier invalide.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = DEFAULT_COVER;
  };

  // --- PAGES ---

  const renderHome = () => {
    const filteredRecent = library
      .filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.author.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 6);

    return (
      <div className="space-y-10 animate-in fade-in duration-500 max-w-lg mx-auto md:max-w-none">
        <section className="px-6 grid grid-cols-2 gap-4">
          <div className="bg-primary/10 border border-primary/20 p-5 rounded-3xl">
            <div className="flex items-center space-x-2 text-primary mb-3">
              <BookOpen size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Objectif</span>
            </div>
            <p className="text-2xl font-bold mb-0.5">{booksRead} / {stats.booksGoal}</p>
            <p className="text-[10px] text-slate-500 font-medium italic">Livres lus</p>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-3xl">
            <div className="flex items-center space-x-2 text-slate-500 mb-3">
              <History size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Série</span>
            </div>
            <p className="text-2xl font-bold mb-0.5">{stats.streakDays} Jours</p>
            <p className="text-[10px] text-slate-500 font-medium italic">Record</p>
          </div>
        </section>

        <section className="mb-10">
          <div className="px-6 flex justify-between items-end mb-5">
            <h2 className="text-xl font-display font-semibold text-slate-200">
              {searchQuery ? 'Résultats' : 'Derniers ajouts'}
            </h2>
            {!searchQuery && (
              <button onClick={() => setActiveTab(Tab.Library)} className="text-primary text-sm font-medium hover:underline">Tout voir</button>
            )}
          </div>
          <div className="flex overflow-x-auto gap-5 px-6 hide-scrollbar snap-x pb-4">
            {filteredRecent.map((book) => (
              <div key={book.id} onClick={() => setSelectedBook(book)} className="flex-shrink-0 w-32 md:w-40 snap-start group cursor-pointer transition-transform active:scale-95">
                <div className="aspect-[2/3] rounded-2xl overflow-hidden mb-3 shadow-xl relative bg-slate-800 border border-slate-700/30">
                  <img 
                    className="w-full h-full object-cover transition-all group-hover:scale-105" 
                    src={book.coverUrl} 
                    alt={book.title} 
                    onError={handleImageError}
                  />
                  {book.isRead && <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg z-10"><Check size={12} strokeWidth={4} /></div>}
                </div>
                <h4 className="text-sm font-bold truncate text-slate-100 group-hover:text-primary transition-colors">{book.title}</h4>
                <p className="text-[11px] text-slate-500 truncate">{book.author}</p>
              </div>
            ))}
            {filteredRecent.length === 0 && <p className="px-6 text-slate-500 italic text-sm">Aucun livre trouvé.</p>}
            <div className="flex-shrink-0 w-6"></div>
          </div>
        </section>
      </div>
    );
  };

  const renderLibrary = () => {
    const filtered = library.filter(b => 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="px-6 pb-12 space-y-6 animate-in slide-in-from-right duration-500 max-w-4xl mx-auto md:max-w-none">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-display font-bold">Ma Collection</h2>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-xs font-bold hover:bg-primary hover:text-white transition-all"
          >
            <Plus size={16} /> Ajouter
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(book => (
            <div 
              key={book.id} 
              onClick={() => setSelectedBook(book)}
              className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-4 flex gap-4 cursor-pointer hover:bg-slate-800/50 transition-all group relative overflow-hidden"
            >
              <div className="w-20 aspect-[2/3] flex-shrink-0 rounded-xl overflow-hidden shadow-lg bg-slate-800 relative border border-slate-700/30">
                <img 
                  src={book.coverUrl} 
                  className="w-full h-full object-cover transition-all group-hover:scale-110" 
                  alt={book.title} 
                  onError={handleImageError}
                />
              </div>
              <div className="flex-grow flex flex-col min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-100 pr-2 leading-tight truncate transition-colors group-hover:text-primary">{book.title}</h3>
                    <p className="text-[11px] text-slate-500 font-medium truncate">{book.author}</p>
                  </div>
                  <button 
                    onClick={(e) => initiateDelete(book, e)} 
                    className="p-2 -mr-2 -mt-2 text-slate-500 hover:text-rose-500 transition-all rounded-full hover:bg-rose-500/20 active:scale-75"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 italic leading-relaxed h-8">
                  {book.summary}
                </p>

                <div className="mt-auto pt-3 flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    {book.isRead ? (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                        <CheckCircle2 size={10} /> Lu
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-amber-500 uppercase tracking-widest">
                        <Clock size={10} /> À lire
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={(e) => toggleReadStatus(book.id, e)}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-bold transition-all ${
                      book.isRead ? 'bg-slate-700 text-slate-300' : 'bg-primary text-white'
                    }`}
                  >
                    {book.isRead ? "Relire" : "Terminer"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStats = () => {
    const readCount = library.filter(b => b.isRead).length;
    const totalCount = library.length;
    const progress = totalCount === 0 ? 0 : Math.round((readCount / totalCount) * 100);

    return (
      <div className="px-6 space-y-8 animate-in slide-in-from-right duration-500 max-w-lg mx-auto md:max-w-none">
        <h2 className="text-2xl font-display font-bold">Progression</h2>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-[2.5rem] p-12 flex flex-col items-center text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/20"></div>
          <div className="mb-2">
            <span className="text-8xl md:text-9xl font-display font-bold text-primary drop-shadow-2xl">{progress}%</span>
          </div>
          <h3 className="text-xl font-display font-bold text-slate-100 uppercase tracking-widest">Score de Lecture</h3>
          <p className="text-sm text-slate-500 mt-4 font-medium italic">"{readCount} ouvrages terminés."</p>
          <div className="w-full max-w-sm bg-slate-900 h-3 rounded-full mt-12 overflow-hidden border border-slate-700/20 shadow-inner">
            <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
    );
  };

  const renderConfig = () => (
    <div className="px-6 space-y-8 animate-in slide-in-from-right duration-500 max-w-lg mx-auto md:max-w-none pb-10">
      <h2 className="text-2xl font-display font-bold">Configuration</h2>
      <div className="space-y-6">
        <div className="bg-slate-800/40 p-7 rounded-3xl border border-slate-700/50">
          <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
            <User size={16} className="text-primary" /> Profil Lecteur
          </h3>
          <input 
            className="w-full h-16 bg-slate-900 border border-slate-700/50 rounded-2xl px-6 text-sm text-white focus:ring-2 focus:ring-primary outline-none transition-all"
            placeholder="Nom d'utilisateur..."
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div className="bg-slate-800/40 p-7 rounded-3xl border border-slate-700/50 space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-slate-400">Exportation (iPhone vers Cloud)</h3>
          <button onClick={exportConfig} className="w-full h-14 bg-slate-900 border border-slate-700/50 rounded-2xl flex items-center justify-between px-6 text-sm font-bold text-slate-300 hover:text-primary transition-colors">
            <div className="flex items-center gap-3"><Download size={20} /> Exporter ma collection (.json)</div>
            <ChevronRight size={16} className="text-slate-600" />
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="w-full h-14 bg-slate-900 border border-slate-700/50 rounded-2xl flex items-center justify-between px-6 text-sm font-bold text-slate-300 hover:text-primary transition-colors">
            <div className="flex items-center gap-3"><Upload size={20} /> Importer un fichier</div>
            <ChevronRight size={16} className="text-slate-600" />
          </button>
          <input type="file" ref={fileInputRef} onChange={importConfig} className="hidden" accept=".json" />
        </div>
        <div className="text-center opacity-20 pt-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em]">My Library Dashboard {APP_VERSION}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto relative min-h-screen bg-[#101622] text-slate-100 md:px-4">
      {/* Header */}
      <header className="px-6 pt-12 max-w-lg mx-auto md:max-w-none mb-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] mb-1">Ma Bibliothèque</p>
            <h1 className="text-3xl font-display font-bold tracking-tight truncate max-w-[250px]">{userName}</h1>
          </div>
          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-primary/20">
            <img className="w-full h-full object-cover" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=135bec&color=fff&bold=true`} alt="Profile" />
          </div>
        </div>

        {(activeTab === Tab.Home || activeTab === Tab.Library) && (
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              className="w-full h-14 pl-12 pr-4 bg-slate-800/40 border border-slate-700/50 rounded-[1.25rem] text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-600 shadow-inner" 
              placeholder="Rechercher dans ma collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto md:max-w-none pb-32">
        {activeTab === Tab.Home && renderHome()}
        {activeTab === Tab.Library && renderLibrary()}
        {activeTab === Tab.Stats && renderStats()}
        {activeTab === Tab.Config && renderConfig()}
      </main>

      {/* Confirmation Suppression */}
      {bookToDelete && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setBookToDelete(null)}></div>
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/50 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-display font-bold text-center mb-2">Retirer de la collection ?</h3>
            <p className="text-slate-400 text-center text-sm mb-8">Retirer <span className="text-slate-100 font-bold">"{bookToDelete.title}"</span> ?</p>
            <div className="space-y-3">
              <button onClick={confirmDelete} className="w-full h-14 bg-rose-500 text-white rounded-2xl font-bold shadow-lg active:scale-95">Confirmer</button>
              <button onClick={() => setBookToDelete(null)} className="w-full h-14 bg-slate-800 text-slate-300 rounded-2xl font-bold active:scale-95 border border-slate-700/50">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Détails / Edition */}
      {selectedBook && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md" onClick={() => setSelectedBook(null)}></div>
          <div className="relative w-full max-w-2xl bg-slate-900 rounded-t-[3rem] p-8 md:p-12 shadow-2xl animate-in slide-in-from-bottom max-h-[92vh] overflow-y-auto hide-scrollbar border-t border-slate-800/50">
            {!isEditing ? (
              <>
                <div className="flex flex-col md:flex-row gap-8 mb-10">
                  <div className="w-40 md:w-52 aspect-[2/3] mx-auto md:mx-0 flex-shrink-0 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-700/50 group relative bg-slate-800">
                    <img src={selectedBook.coverUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={selectedBook.title} onError={handleImageError} />
                    <button onClick={startEditing} className="absolute bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 size={18} /></button>
                  </div>
                  <div className="flex-grow pt-2 text-center md:text-left">
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-100 leading-tight mb-3">{selectedBook.title}</h2>
                    <p className="text-xl md:text-2xl text-slate-400 mb-8 font-medium">{selectedBook.author}</p>
                    <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-slate-950/50 border border-slate-700/50">
                      {selectedBook.isRead ? <CheckCircle2 size={18} className="text-emerald-500 mr-2" /> : <Clock size={18} className="text-amber-500 mr-2" />}
                      <span className={`text-xs font-black uppercase tracking-[0.2em] ${selectedBook.isRead ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {selectedBook.isRead ? 'Lu' : 'À lire'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-950/50 p-8 rounded-[2.5rem] border border-slate-800/50 mb-10">
                  <h3 className="text-[10px] font-bold uppercase text-primary tracking-[0.4em] mb-4">Description</h3>
                  <p className="text-slate-300 leading-relaxed font-serif text-lg italic">{selectedBook.summary || "Aucune description."}</p>
                </div>
                <div className="flex gap-4 mb-8">
                  <button onClick={(e) => toggleReadStatus(selectedBook.id, e)} className={`flex-grow h-18 rounded-3xl font-bold flex items-center justify-center gap-4 transition-all text-lg shadow-xl active:scale-95 ${selectedBook.isRead ? 'bg-slate-800 text-slate-400' : 'bg-primary text-white'}`}>
                    {selectedBook.isRead ? <History size={20} /> : <CheckCircle2 size={20} />}
                    {selectedBook.isRead ? "Relire" : "Terminé"}
                  </button>
                  <button onClick={(e) => initiateDelete(selectedBook, e)} className="w-18 h-18 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center active:scale-90 border border-rose-500/20">
                    <Trash2 size={28} />
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-top duration-300 mb-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-display font-bold text-primary">Modifier</h2>
                  <button onClick={() => setIsEditing(false)} className="p-2 text-slate-500"><X size={24}/></button>
                </div>
                <div className="grid gap-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 mb-2 block">Titre</label>
                    <input className="w-full h-14 bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 text-white focus:ring-2 focus:ring-primary outline-none" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 mb-2 block">Auteur</label>
                    <input className="w-full h-14 bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 text-white focus:ring-2 focus:ring-primary outline-none" value={editForm.author} onChange={(e) => setEditForm({...editForm, author: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 mb-2 block">URL Image</label>
                    <input className="w-full h-14 bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 text-white focus:ring-2 focus:ring-primary outline-none" value={editForm.coverUrl} onChange={(e) => setEditForm({...editForm, coverUrl: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 mb-2 block">Description</label>
                    <textarea className="w-full h-40 bg-slate-950/50 border border-slate-700/50 rounded-xl p-4 text-white focus:ring-2 focus:ring-primary outline-none resize-none" value={editForm.summary} onChange={(e) => setEditForm({...editForm, summary: e.target.value})} />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={saveDetails} className="flex-grow h-16 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-primary/20">
                    <Save size={20} /> Sauvegarder
                  </button>
                  <button onClick={() => setIsEditing(false)} className="px-8 h-16 bg-slate-800 text-slate-400 rounded-2xl font-bold">Annuler</button>
                </div>
              </div>
            )}
            <button onClick={() => setSelectedBook(null)} className="w-full text-center py-6 text-slate-500 font-bold hover:text-white transition-colors uppercase tracking-[0.2em] text-[10px]">Fermer</button>
          </div>
        </div>
      )}

      {/* Modal Ajout Manuel */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-display font-bold">Nouveau Livre</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-500"><X size={28} /></button>
            </div>
            <form onSubmit={handleAddBookManually} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2">Titre du livre (obligatoire)</label>
                <input required className="w-full h-14 bg-slate-800/40 border border-slate-700/50 rounded-2xl px-6 text-white outline-none focus:ring-2 focus:ring-primary shadow-inner" placeholder="ex: Le Petit Prince" value={addForm.title} onChange={(e) => setAddForm({...addForm, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2">Auteur</label>
                <input className="w-full h-14 bg-slate-800/40 border border-slate-700/50 rounded-2xl px-6 text-white outline-none focus:ring-2 focus:ring-primary shadow-inner" placeholder="ex: Antoine de Saint-Exupéry" value={addForm.author} onChange={(e) => setAddForm({...addForm, author: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2">Lien d'image (optionnel)</label>
                <input className="w-full h-14 bg-slate-800/40 border border-slate-700/50 rounded-2xl px-6 text-white outline-none focus:ring-2 focus:ring-primary shadow-inner" placeholder="URL de l'image..." value={addForm.coverUrl} onChange={(e) => setAddForm({...addForm, coverUrl: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2">Résumé rapide</label>
                <textarea className="w-full h-24 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 text-white outline-none focus:ring-2 focus:ring-primary shadow-inner resize-none" placeholder="C'est l'histoire de..." value={addForm.summary} onChange={(e) => setAddForm({...addForm, summary: e.target.value})} />
              </div>
              <button type="submit" className="w-full h-18 bg-primary text-white rounded-3xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20 active:scale-95 transition-all text-lg">
                <Plus size={20} /> Ajouter à ma biblio
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-3xl border-t border-slate-800/50 pb-8 pt-5 px-8 z-[100] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-md mx-auto flex justify-between items-center relative">
          <NavItem icon={<HomeIcon size={24} />} label="Accueil" active={activeTab === Tab.Home} onClick={() => setActiveTab(Tab.Home)} />
          <NavItem icon={<Library size={24} />} label="Biblio" active={activeTab === Tab.Library} onClick={() => setActiveTab(Tab.Library)} />
          <NavItem icon={<BarChart3 size={24} />} label="Stats" active={activeTab === Tab.Stats} onClick={() => setActiveTab(Tab.Stats)} />
          <NavItem icon={<Settings2 size={24} />} label="Config" active={activeTab === Tab.Config} onClick={() => setActiveTab(Tab.Config)} />
        </div>
      </nav>
    </div>
  );
};

interface NavItemProps { icon: React.ReactNode; label: string; active: boolean; onClick: () => void; }
const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center transition-all ${active ? 'text-primary scale-110' : 'text-slate-600 hover:text-slate-400'}`}>
    {icon}
    <span className={`text-[9px] mt-2 font-black tracking-widest uppercase transition-opacity ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
  </button>
);

export default App;