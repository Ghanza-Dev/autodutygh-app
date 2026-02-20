// C:\xampp\htdocs\ghana_auto_hub\frontend\src\App.jsx
import { useState, useEffect } from 'react';
import DutyCalculator from './components/DutyCalculator';
import { 
  Calculator, Car, Store, UserCircle, LogOut, Verified, ShieldCheck, 
  MapPin, Phone, Info, FileText, Lock, Mail, ChevronRight, Crown, 
  Settings, Menu, X, Megaphone, PhoneCall, ExternalLink, CalendarClock, Globe, ImagePlus, Trash2, AlertTriangle
} from 'lucide-react';

import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, deleteUser } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';

function App() {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentTab, setCurrentTab] = useState('calc'); 
  const [dashboardTab, setDashboardTab] = useState('overview'); 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  
  const [loggedInDealer, setLoggedInDealer] = useState(null); 
  const [isRegistering, setIsRegistering] = useState(false);
  const [authForm, setAuthForm] = useState({ business_name: '', phone_number: '', description: '', password: '' });
  const [authStatus, setAuthStatus] = useState({ loading: false, error: '', success: '' });

  const [editForm, setEditForm] = useState({ business_name: '', phone_number: '', description: '' });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [editStatus, setEditStatus] = useState({ loading: false, error: '', success: '' });

  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { title: "Ghana Customs Calculator.", subtitle: "Calculate exact port clearance duties instantly." },
    { title: "Free VIN Decoder.", subtitle: "Check vehicle history, specs, and factory origin before you buy." },
    { title: "Trusted Dealer Directory.", subtitle: "Connect with verified clearing agents and auto professionals." }
  ];

  useEffect(() => {
    const timer = setInterval(() => { setCurrentSlide((prev) => (prev + 1) % slides.length); }, 4000); 
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const q = query(collection(db, "dealers"), where("is_verified", "==", true));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let dealersArray = [];
      querySnapshot.forEach((doc) => { dealersArray.push({ id: doc.id, ...doc.data() }); });
      dealersArray.sort((a, b) => {
          if (a.is_premium === b.is_premium) return a.business_name.localeCompare(b.business_name);
          return a.is_premium ? -1 : 1;
      });
      setDealers(dealersArray);
      setLoading(false);
    }, (error) => { console.error("Error fetching dealers:", error); setLoading(false); });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
              const docRef = doc(db, "dealers", user.uid);
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) setLoggedInDealer({ id: user.uid, ...docSnap.data() });
          } else { setLoggedInDealer(null); }
      });
      return () => unsubscribe();
  }, []);

  useEffect(() => {
      if (loggedInDealer) {
          setEditForm({ business_name: loggedInDealer.business_name, phone_number: loggedInDealer.phone_number, description: loggedInDealer.description || '' });
          setProfileImagePreview(loggedInDealer.profile_pic || null);
          setProfileImageFile(null);
      }
  }, [loggedInDealer]);

  const navigateTo = (tab) => { setCurrentTab(tab); setMobileMenuOpen(false); setDesktopDropdownOpen(false); window.scrollTo(0, 0); };
  const handleAuthChange = (e) => setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const processImage = (file) => {
      return new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event) => {
              const img = new Image();
              img.src = event.target.result;
              img.onload = () => {
                  const canvas = document.createElement('canvas');
                  const MAX_WIDTH = 200; 
                  const scaleSize = MAX_WIDTH / img.width;
                  canvas.width = MAX_WIDTH; canvas.height = img.height * scaleSize;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  resolve(canvas.toDataURL('image/jpeg', 0.7)); 
              }
          };
      });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const compressedBase64 = await processImage(file);
      setProfileImageFile(compressedBase64); 
      setProfileImagePreview(compressedBase64);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthStatus({ loading: true, error: '', success: '' });
    const pseudoEmail = `${authForm.phone_number.replace(/[^0-9]/g, '')}@autodutygh.com`;

    try {
        if (isRegistering) {
            const userCredential = await createUserWithEmailAndPassword(auth, pseudoEmail, authForm.password);
            await setDoc(doc(db, "dealers", userCredential.user.uid), {
                business_name: authForm.business_name, phone_number: authForm.phone_number,
                description: authForm.description, is_verified: false, is_premium: false,
                premium_expiry: null, profile_pic: null, createdAt: new Date().toISOString()
            });
            setAuthStatus({ loading: false, error: '', success: 'Registration successful! You are now logged in.' });
            setIsRegistering(false); setAuthForm({ business_name: '', phone_number: '', description: '', password: '' });
        } else {
            await signInWithEmailAndPassword(auth, pseudoEmail, authForm.password);
            setAuthForm({ business_name: '', phone_number: '', description: '', password: '' });
            setAuthStatus({ loading: false, error: '', success: '' });
        }
    } catch (err) { 
        let errorMsg = 'An error occurred. Please try again.';
        if(err.code === 'auth/email-already-in-use') errorMsg = 'This phone number is already registered.';
        if(err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') errorMsg = 'Invalid phone number or password.';
        setAuthStatus({ loading: false, error: errorMsg, success: '' }); 
    }
  };

  const handleProfileUpdate = async (e) => {
      e.preventDefault();
      setEditStatus({ loading: true, error: '', success: '' });
      try {
          const docRef = doc(db, "dealers", loggedInDealer.id);
          const updates = { business_name: editForm.business_name, phone_number: editForm.phone_number, description: editForm.description };
          if (profileImageFile) updates.profile_pic = profileImageFile; 
          await updateDoc(docRef, updates);
          setLoggedInDealer({...loggedInDealer, ...updates});
          setEditStatus({ loading: false, error: '', success: 'Profile saved successfully!' });
      } catch (err) { setEditStatus({ loading: false, error: 'Failed to connect to server.', success: '' }); }
  };

  const handleDeleteAccount = async () => {
      const confirmDelete = window.confirm("Are you entirely sure you want to delete your dealership account? This action cannot be undone.");
      if (confirmDelete && auth.currentUser) {
          try {
              await deleteDoc(doc(db, "dealers", loggedInDealer.id));
              await deleteUser(auth.currentUser);
              alert("Your account has been permanently deleted.");
              setLoggedInDealer(null); setCurrentTab('directory');
          } catch (err) { alert("Failed to delete account. Log out and log back in to verify your identity."); }
      }
  };

  const handleLogout = () => { signOut(auth); setLoggedInDealer(null); setCurrentTab('calc'); };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const PageWrapper = ({ title, icon: Icon, children }) => (
    <div className="animate-fade-in w-full max-w-4xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-3xl p-6 md:p-12 shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center mb-6 border-b border-gray-100 pb-6">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 md:mb-0 md:mr-4 text-orange-500 flex-shrink-0"><Icon className="w-6 h-6" /></div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-wide">{title}</h2>
            </div>
            <div className="space-y-6 text-gray-600 leading-relaxed text-sm md:text-base">{children}</div>
        </div>
    </div>
  );

  const AdvertisePrompt = () => (
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between my-8 border border-emerald-700 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center mb-4 md:mb-0">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-500 rounded-full flex items-center justify-center text-white md:mr-4 mb-3 md:mb-0 shadow-md flex-shrink-0"><Megaphone className="w-6 h-6 md:w-7 md:h-7" /></div>
              <div><h3 className="text-lg md:text-xl font-black text-white uppercase tracking-wide">Are you an Auto Dealer?</h3><p className="text-emerald-100 text-xs md:text-sm mt-1">Get your services in front of 10,000+ daily importers.</p></div>
          </div>
          <button onClick={() => navigateTo('account')} className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all whitespace-nowrap text-sm md:text-base">List Your Agency Free</button>
      </div>
  );

  // REUSABLE DIRECTORY LIST COMPONENT
  const renderDirectoryList = () => (
      <div className="animate-fade-in w-full">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 border-b border-gray-200 pb-3 gap-3">
              <h3 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-wide flex items-center"><ShieldCheck className="w-6 h-6 mr-2 text-emerald-700"/> Trusted Directory</h3>
              {/* Optional Refresh button removed since Firebase is real-time */}
          </div>
          
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-6 text-xs md:text-sm text-orange-800 flex items-start md:items-center shadow-sm">
              <Info className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 md:mt-0" />
              <p>Contact registered clearing agents directly to handle your importation process. Only Admin-verified agents appear here.</p>
          </div>

          {loading ? (
              <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div></div>
          ) : (
              <div className="flex flex-col space-y-4">
              {dealers.map((dealer) => (
                  <div key={dealer.id} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-orange-500 transition-all flex flex-col md:flex-row items-center gap-4 md:gap-6 relative overflow-hidden">
                      {dealer.is_premium && <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] uppercase font-black px-3 py-1 rounded-bl-lg shadow-sm flex items-center"><Crown className="w-3 h-3 mr-1"/> Premium</div>}
                      <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-50 rounded-full flex items-center justify-center border-4 border-gray-100 flex-shrink-0 relative mt-2 md:mt-0">
                          {dealer.profile_pic ? <img src={dealer.profile_pic} className="w-full h-full rounded-full object-cover" /> : <Store className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />}
                      </div>
                      <div className="flex-1 text-center md:text-left w-full">
                          <h4 className="font-black text-gray-900 text-lg md:text-xl flex items-center justify-center md:justify-start">
                              {dealer.business_name} {dealer.is_verified && <Verified className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 ml-1" title="Verified Pro"/>}
                          </h4>
                          <p className="text-xs md:text-sm text-gray-500 mb-3 mt-1 line-clamp-2 italic px-2 md:px-0">"{dealer.description}"</p>
                      </div>
                      <div className="w-full md:w-auto flex flex-row gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                          <a href={`https://wa.me/${dealer.phone_number.replace(/^0/, '233').replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 md:w-32 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold transition-colors shadow-sm flex justify-center items-center text-xs md:text-sm"><ExternalLink className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2"/> WhatsApp</a>
                          <a href={`tel:${dealer.phone_number}`} className="flex-1 md:w-32 bg-gray-900 hover:bg-black text-white py-2.5 rounded-xl font-bold transition-colors shadow-sm flex justify-center items-center text-xs md:text-sm"><PhoneCall className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2"/> Call</a>
                      </div>
                  </div>
              ))}
              {dealers.length === 0 && <p className="text-gray-500 text-center py-10">No verified dealers found.</p>}
              </div>
          )}
      </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans">
      
      {/* GLOBAL TOP NAVIGATION */}
      <header className="bg-emerald-950 border-b border-emerald-900 shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
              <div className="flex items-center cursor-pointer" onClick={() => navigateTo('calc')}>
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-500 rounded-xl flex items-center justify-center mr-2 md:mr-3 text-white shadow-sm"><Calculator className="w-5 h-5 md:w-6 md:h-6" /></div>
                  <h1 className="text-lg md:text-2xl font-black tracking-widest text-white uppercase">AutoDuty <span className="text-orange-500">GH</span></h1>
              </div>
              <nav className="hidden md:flex items-center space-x-1 lg:space-x-4">
                  <button onClick={() => navigateTo('calc')} className={`px-4 py-2 rounded-lg font-bold transition-all ${currentTab === 'calc' ? 'bg-emerald-800 text-orange-400' : 'text-emerald-100 hover:bg-emerald-900 hover:text-white'}`}>Calculator</button>
                  <button onClick={() => navigateTo('directory')} className={`px-4 py-2 rounded-lg font-bold transition-all ${currentTab === 'directory' ? 'bg-emerald-800 text-orange-400' : 'text-emerald-100 hover:bg-emerald-900 hover:text-white'}`}>Directory</button>
                  <button onClick={() => navigateTo('advertise')} className={`px-4 py-2 rounded-lg font-bold transition-all ${currentTab === 'advertise' ? 'bg-emerald-800 text-orange-400' : 'text-emerald-100 hover:bg-emerald-900 hover:text-white'}`}>Advertise</button>
                  <button onClick={() => navigateTo('account')} className={`px-4 py-2 rounded-lg font-bold transition-all ${currentTab === 'account' ? 'bg-emerald-800 text-orange-400' : 'text-emerald-100 hover:bg-emerald-900 hover:text-white'}`}>{loggedInDealer ? 'Dashboard' : 'Dealer Portal'}</button>
                  <div className="relative">
                      <button onClick={() => setDesktopDropdownOpen(!desktopDropdownOpen)} className="px-4 py-2 rounded-lg font-bold text-emerald-100 hover:bg-emerald-900 hover:text-white flex items-center">More <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${desktopDropdownOpen ? 'rotate-90' : ''}`} /></button>
                      {desktopDropdownOpen && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                              <button onClick={() => navigateTo('about')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 font-bold">About Us</button>
                              <button onClick={() => navigateTo('contact')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 font-bold">Contact Us</button>
                              <button onClick={() => navigateTo('terms')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 font-bold">Terms & Conditions</button>
                              <button onClick={() => navigateTo('privacy')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 font-bold">Privacy Policy</button>
                          </div>
                      )}
                  </div>
              </nav>
              <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}</button>
          </div>
      </header>

      {mobileMenuOpen && (
          <div className="fixed inset-0 top-16 bg-emerald-950 z-40 overflow-y-auto pb-20 animate-fade-in md:hidden">
              <div className="flex flex-col p-6 space-y-4">
                  <button onClick={() => navigateTo('calc')} className="text-left text-xl font-bold text-white border-b border-emerald-800 pb-4">Import Calculator</button>
                  <button onClick={() => navigateTo('directory')} className="text-left text-xl font-bold text-white border-b border-emerald-800 pb-4">Dealer Directory</button>
                  <button onClick={() => navigateTo('account')} className="text-left text-xl font-bold text-orange-400 border-b border-emerald-800 pb-4">{loggedInDealer ? 'Dealer Dashboard' : 'Dealer Login'}</button>
                  <button onClick={() => navigateTo('advertise')} className="text-left text-xl font-bold text-white border-b border-emerald-800 pb-4">Advertise With Us</button>
                  <button onClick={() => navigateTo('about')} className="text-left text-lg text-emerald-100">About Us</button>
                  <button onClick={() => navigateTo('contact')} className="text-left text-lg text-emerald-100">Contact Us</button>
              </div>
          </div>
      )}

      <main className="flex-1 overflow-y-auto w-full relative">
        <div className="min-h-full flex flex-col">
            <div className="flex-1 p-0 md:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
                
                {/* CALCULATOR & DIRECTORY ON SAME PAGE */}
                {currentTab === 'calc' && (
                  <div className="animate-fade-in w-full space-y-8 md:space-y-12 p-0 md:p-0">
                      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-orange-600 md:rounded-3xl p-6 py-12 md:p-20 text-center flex flex-col items-center justify-center shadow-2xl relative overflow-hidden min-h-[40vh] md:min-h-[55vh]">
                          <div className="absolute inset-0 opacity-10" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
                          <div className="relative z-10 w-full max-w-3xl">
                              <div className="inline-flex items-center justify-center bg-black/30 backdrop-blur-md px-4 py-1.5 md:px-6 md:py-2 rounded-full mb-6 border border-white/20 shadow-lg">
                                  <Globe className="w-3 h-3 md:w-4 md:h-4 text-orange-400 mr-2 animate-pulse" />
                                  <span className="text-white text-[10px] md:text-xs font-bold tracking-widest uppercase">The Importer's Hub</span>
                              </div>
                              <div className="h-28 md:h-40 flex flex-col justify-center transition-all duration-500 ease-in-out">
                                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-3 md:mb-4 leading-tight tracking-tight drop-shadow-md animate-fade-in" key={currentSlide + "-title"}>{slides[currentSlide].title}</h2>
                                  <p className="text-emerald-50 text-sm md:text-lg lg:text-xl font-medium max-w-2xl mx-auto drop-shadow-sm animate-fade-in px-4" key={currentSlide + "-sub"}>{slides[currentSlide].subtitle}</p>
                              </div>
                              <div className="flex justify-center space-x-2 mt-6 md:mt-8">
                                  {slides.map((_, idx) => (<div key={idx} className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-6 md:w-8 bg-orange-500' : 'w-1.5 md:w-2 bg-white/40'}`} />))}
                              </div>
                          </div>
                      </div>
                      
                      <div className="px-4 md:px-0 space-y-12">
                          {/* Duty Calculator Block */}
                          <DutyCalculator />
                          
                          {/* Render the Directory List underneath */}
                          <div className="pt-4 border-t-2 border-dashed border-gray-200">
                             {renderDirectoryList()}
                          </div>

                          <AdvertisePrompt />
                      </div>
                  </div>
                )}

                {/* STANDALONE DIRECTORY TAB */}
                {currentTab === 'directory' && (
                  <div className="w-full p-4 md:p-0">
                      {renderDirectoryList()}
                      <AdvertisePrompt />
                  </div>
                )}

                {/* ACCOUNT / ADVANCED DASHBOARD */}
                {currentTab === 'account' && (
                  <div className="animate-fade-in flex justify-center w-full mt-4 md:mt-8 p-4 md:p-0">
                      {loggedInDealer ? (
                          <div className="w-full max-w-6xl space-y-6">
                              <div className="bg-emerald-900 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
                                  <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-500 opacity-20 rounded-full blur-3xl"></div>
                                  <div className="flex flex-col md:flex-row items-center mb-6 md:mb-0 relative z-10 text-center md:text-left">
                                      <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center border-4 border-emerald-700 shadow-lg mb-4 md:mb-0 md:mr-6 overflow-hidden">
                                          {loggedInDealer.profile_pic ? <img src={loggedInDealer.profile_pic} className="w-full h-full object-cover"/> : <Store className="w-8 h-8 md:w-10 md:h-10 text-gray-300"/>}
                                      </div>
                                      <div>
                                          <h2 className="text-2xl md:text-3xl font-black text-white flex items-center justify-center md:justify-start">
                                              {loggedInDealer.business_name} {loggedInDealer.is_verified && <Verified className="w-5 h-5 md:w-6 md:h-6 text-orange-400 ml-2"/>}
                                          </h2>
                                          <p className="text-emerald-200 font-mono text-sm md:text-base mt-1">{loggedInDealer.phone_number}</p>
                                      </div>
                                  </div>
                                  <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 md:py-2.5 px-6 rounded-xl transition-colors flex items-center shadow-md relative z-10 text-sm md:text-base"><LogOut className="w-4 h-4 mr-2"/> Log Out</button>
                              </div>

                              <div className="flex overflow-x-auto border-b border-gray-200 bg-white rounded-t-xl px-2 shadow-sm text-sm md:text-base scrollbar-hide">
                                  <button onClick={() => setDashboardTab('overview')} className={`whitespace-nowrap py-3 md:py-4 px-4 md:px-6 font-bold transition-all flex items-center ${dashboardTab === 'overview' ? 'text-orange-500 border-b-4 border-orange-500' : 'text-gray-500 hover:text-gray-900'}`}><Store className="w-4 h-4 mr-2"/> Overview</button>
                                  <button onClick={() => setDashboardTab('profile')} className={`whitespace-nowrap py-3 md:py-4 px-4 md:px-6 font-bold transition-all flex items-center ${dashboardTab === 'profile' ? 'text-orange-500 border-b-4 border-orange-500' : 'text-gray-500 hover:text-gray-900'}`}><Settings className="w-4 h-4 mr-2"/> Edit Profile</button>
                                  <button onClick={() => setDashboardTab('premium')} className={`whitespace-nowrap py-3 md:py-4 px-4 md:px-6 font-bold transition-all flex items-center ${dashboardTab === 'premium' ? 'text-orange-500 border-b-4 border-orange-500' : 'text-gray-500 hover:text-gray-900'}`}><Crown className="w-4 h-4 mr-2"/> Premium</button>
                              </div>

                              {dashboardTab === 'overview' && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-fade-in">
                                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                          <div className="flex justify-between items-start mb-4"><div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><ShieldCheck className="w-5 h-5 md:w-6 md:h-6"/></div></div>
                                          <p className="text-gray-500 text-xs md:text-sm font-bold uppercase tracking-wide">Directory Status</p>
                                          <h3 className={`text-xl md:text-3xl font-black mt-1 ${loggedInDealer.is_verified ? 'text-emerald-600' : 'text-orange-500'}`}>
                                              {loggedInDealer.is_verified ? 'Live & Active' : 'Pending Admin Approval'}
                                          </h3>
                                      </div>
                                      <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-sm text-white">
                                          <div className="flex justify-between items-start mb-4"><div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center text-white"><Crown className="w-5 h-5 md:w-6 md:h-6"/></div></div>
                                          <p className="text-orange-100 text-xs md:text-sm font-bold uppercase tracking-wide">Account Tier</p>
                                          <h3 className="text-xl md:text-3xl font-black text-white mt-1">{loggedInDealer.is_premium ? 'Premium Dealer' : 'Standard Basic'}</h3>
                                          {loggedInDealer.is_premium && <p className="mt-2 flex items-center text-orange-100 text-xs md:text-sm font-bold"><CalendarClock className="w-4 h-4 mr-2"/> Expires: {formatDate(loggedInDealer.premium_expiry)}</p>}
                                      </div>
                                  </div>
                              )}

                              {dashboardTab === 'profile' && (
                                  <div className="animate-fade-in space-y-6">
                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                          <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-gray-200">
                                              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6 border-b pb-2 flex items-center"><Settings className="w-5 h-5 mr-2 text-emerald-700"/> Update Directory Info</h3>
                                              {editStatus.success && <div className="bg-emerald-50 text-emerald-700 p-3 md:p-4 rounded-xl mb-6 text-sm font-bold">{editStatus.success}</div>}
                                              {editStatus.error && <div className="bg-red-50 text-red-700 p-3 md:p-4 rounded-xl mb-6 text-sm font-bold">{editStatus.error}</div>}
                                              <form onSubmit={handleProfileUpdate} className="space-y-4 md:space-y-5">
                                                  <div>
                                                      <label className="block text-gray-700 text-xs font-bold mb-2 uppercase tracking-wide">Upload Logo / Avatar</label>
                                                      <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
                                                          <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden flex-shrink-0">
                                                              {profileImagePreview ? <img src={profileImagePreview} className="w-full h-full object-cover"/> : <ImagePlus className="text-gray-400 w-6 h-6"/>}
                                                          </div>
                                                          <label className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg cursor-pointer transition-colors border border-gray-300 text-center text-sm">
                                                              Choose Image <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                                          </label>
                                                      </div>
                                                  </div>
                                                  <div><label className="block text-gray-700 text-xs font-bold mb-2 uppercase tracking-wide">Business Name</label><input type="text" name="business_name" required value={editForm.business_name} onChange={handleEditChange} className="w-full p-3 md:p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-500 outline-none text-sm md:text-base" /></div>
                                                  <div><label className="block text-gray-700 text-xs font-bold mb-2 uppercase tracking-wide">WhatsApp & Call Number</label><input type="tel" name="phone_number" required value={editForm.phone_number} onChange={handleEditChange} className="w-full p-3 md:p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-500 outline-none text-sm md:text-base" /></div>
                                                  <div><label className="block text-gray-700 text-xs font-bold mb-2 uppercase tracking-wide">Services Description</label><textarea name="description" rows="3" value={editForm.description} onChange={handleEditChange} className="w-full p-3 md:p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-500 outline-none resize-none text-sm md:text-base"></textarea></div>
                                                  <button type="submit" disabled={editStatus.loading} className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3 md:py-4 rounded-xl shadow-md transition-colors text-sm md:text-base">
                                                      {editStatus.loading ? 'Saving to Cloud...' : 'Save & Publish Changes'}
                                                  </button>
                                              </form>
                                          </div>

                                          <div className="bg-gray-100 p-5 md:p-8 rounded-3xl border border-gray-200 flex flex-col">
                                              <h3 className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Live Directory Preview</h3>
                                              <div className="bg-white rounded-2xl p-4 md:p-5 shadow-md border border-gray-200 relative overflow-hidden pointer-events-none">
                                                  {loggedInDealer.is_premium && <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] md:text-[10px] uppercase font-black px-2 md:px-3 py-1 rounded-bl-lg">Premium</div>}
                                                  <div className="flex items-center gap-3 md:gap-4 mb-4">
                                                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-full flex items-center justify-center border-2 border-gray-100 flex-shrink-0 overflow-hidden">
                                                          {profileImagePreview ? <img src={profileImagePreview} className="w-full h-full object-cover"/> : <Store className="w-5 h-5 md:w-6 md:h-6 text-gray-300"/>}
                                                      </div>
                                                      <div>
                                                          <h4 className="font-black text-gray-900 text-base md:text-lg flex items-center leading-tight">
                                                              {editForm.business_name || 'Your Name Here'} {loggedInDealer.is_verified && <Verified className="w-3 h-3 md:w-4 md:h-4 text-emerald-600 ml-1"/>}
                                                          </h4>
                                                          <span className="text-[9px] md:text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase mt-1 inline-block">Registered Agent</span>
                                                      </div>
                                                  </div>
                                                  <p className="text-[11px] md:text-xs text-gray-500 mb-4 line-clamp-3 italic">"{editForm.description || 'Your description will appear here...'}"</p>
                                                  <div className="flex gap-2 border-t border-gray-100 pt-3 md:pt-4">
                                                      <div className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-bold text-center text-[11px] md:text-xs flex justify-center items-center"><ExternalLink className="w-3 h-3 mr-1"/> WhatsApp</div>
                                                      <div className="flex-1 bg-gray-900 text-white py-2 rounded-lg font-bold text-center text-[11px] md:text-xs flex justify-center items-center"><PhoneCall className="w-3 h-3 mr-1"/> Call</div>
                                                  </div>
                                              </div>
                                              <p className="text-[10px] md:text-xs text-gray-400 mt-4 text-center">This is exactly how buyers will see you on the app.</p>
                                          </div>
                                      </div>

                                      <div className="bg-red-50 p-5 md:p-6 rounded-2xl border border-red-200 mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                          <div>
                                              <h4 className="text-red-800 font-bold flex items-center text-sm md:text-base"><AlertTriangle className="w-4 h-4 md:w-5 md:h-5 mr-2"/> Danger Zone</h4>
                                              <p className="text-red-600 text-xs md:text-sm mt-1">Permanently delete your account and remove your listing from the directory.</p>
                                          </div>
                                          <button onClick={handleDeleteAccount} className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-xl shadow transition-colors flex justify-center items-center text-sm">
                                              <Trash2 className="w-4 h-4 mr-2"/> Delete Account
                                          </button>
                                      </div>
                                  </div>
                              )}
                              
                              {dashboardTab === 'premium' && (
                                  <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 text-center max-w-2xl mx-auto animate-fade-in">
                                      <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6"><Crown className="w-8 h-8 md:w-10 md:h-10 text-orange-500"/></div>
                                      <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">Upgrade to Premium</h3>
                                      <p className="text-sm md:text-base text-gray-500 mb-6 md:mb-8">Premium dealers rank at the very top of our directory and receive the exclusive Premium Crown badge.</p>
                                      <div className="bg-emerald-50 border border-emerald-200 p-5 md:p-6 rounded-xl text-left">
                                          <h4 className="font-bold text-emerald-900 mb-3 uppercase tracking-wide text-xs md:text-sm">How to Upgrade:</h4>
                                          <p className="text-emerald-800 text-xs md:text-sm mb-4">To comply with store policies, premium upgrades are handled directly by our administrative team.</p>
                                          <div className="space-y-3">
                                              <a href="tel:+233246623402" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 md:py-4 rounded-xl transition-colors flex justify-center items-center shadow-md text-sm"><PhoneCall className="w-4 h-4 md:w-5 md:h-5 mr-2"/> Call: +233 24 662 3402</a>
                                              <a href="https://wa.me/233246623402" target="_blank" rel="noreferrer" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 md:py-4 rounded-xl transition-colors flex justify-center items-center shadow-md text-sm"><ExternalLink className="w-4 h-4 md:w-5 md:h-5 mr-2"/> WhatsApp Support</a>
                                          </div>
                                      </div>
                                  </div>
                              )}
                          </div>
                      ) : (
                          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-200 w-full max-w-md mx-auto mt-4 md:mt-0">
                              <div className="text-center mb-6 md:mb-8"><div className="w-14 h-14 md:w-16 md:h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4"><Store className="w-7 h-7 md:w-8 md:h-8 text-orange-500"/></div><h2 className="text-xl md:text-2xl font-black text-gray-900">{isRegistering ? 'Join the Directory' : 'Dealer Login'}</h2><p className="text-gray-500 text-xs md:text-sm mt-2">{isRegistering ? 'Register your agency to get direct calls and WhatsApp leads.' : 'Log in to view your dashboard.'}</p></div>
                              {authStatus.success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 md:p-4 rounded-xl mb-6 text-xs md:text-sm text-center font-bold">{authStatus.success}</div>}
                              {authStatus.error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 md:p-4 rounded-xl mb-6 text-xs md:text-sm text-center font-bold">{authStatus.error}</div>}
                              <form onSubmit={handleAuthSubmit} className="space-y-4">
                                  {isRegistering && (
                                      <>
                                          <div><label className="block text-gray-700 text-[10px] md:text-xs font-bold mb-1.5 md:mb-2 uppercase tracking-wide">Business Name</label><input type="text" name="business_name" required value={authForm.business_name} onChange={handleAuthChange} className="w-full p-3 md:p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-500 outline-none text-sm" /></div>
                                          <div><label className="block text-gray-700 text-[10px] md:text-xs font-bold mb-1.5 md:mb-2 uppercase tracking-wide">Short Description</label><textarea name="description" required rows="2" value={authForm.description} onChange={handleAuthChange} className="w-full p-3 md:p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-500 outline-none resize-none text-sm"></textarea></div>
                                      </>
                                  )}
                                  <div><label className="block text-gray-700 text-[10px] md:text-xs font-bold mb-1.5 md:mb-2 uppercase tracking-wide">Phone Number</label><div className="flex"><span className="inline-flex items-center px-3 md:px-4 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl font-bold">🇬🇭</span><input type="tel" name="phone_number" required placeholder="024XXXXXXX" value={authForm.phone_number} onChange={handleAuthChange} className="rounded-none rounded-r-xl bg-gray-50 border border-gray-200 w-full text-sm p-3 md:p-4 focus:border-orange-500 outline-none" /></div></div>
                                  <div><label className="block text-gray-700 text-[10px] md:text-xs font-bold mb-1.5 md:mb-2 uppercase tracking-wide">Password</label><input type="password" name="password" required value={authForm.password} onChange={handleAuthChange} className="w-full p-3 md:p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-500 outline-none text-sm" /></div>
                                  <button type="submit" disabled={authStatus.loading} className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3 md:py-4 rounded-xl transition-all shadow-md mt-4 text-sm md:text-base">{authStatus.loading ? 'Authenticating...' : (isRegistering ? 'Register My Agency' : 'Secure Login')}</button>
                              </form>
                              <div className="text-center mt-6 md:mt-8 pt-6 border-t border-gray-100"><p className="text-xs md:text-sm text-gray-500">{isRegistering ? 'Already registered?' : "Not in the directory yet?"} <br/><button onClick={() => { setIsRegistering(!isRegistering); setAuthStatus({error:'', success:'', loading:false}); }} className="text-orange-500 font-bold mt-2 hover:underline inline-flex items-center">{isRegistering ? 'Login to your account' : 'Register your agency'} <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-1"/></button></p></div>
                          </div>
                      )}
                  </div>
                )}

                {/* ADVERTISE & INFO PAGES */}
                {currentTab === 'advertise' && ( <PageWrapper title="Advertise With Us" icon={Megaphone}><p>Reach Ghana's Largest Auto Import Audience.</p><p>Create a free account through our Dealer Portal today. For custom banner advertising or premium upgrades, please contact our administrative team below:</p><div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3 mt-4 inline-block w-full"><a href="tel:+233246623402" className="flex items-center text-gray-900 font-bold text-sm hover:text-emerald-600 transition-colors"><PhoneCall className="w-4 h-4 mr-3 text-emerald-600"/> Call: +233 24 662 3402</a><a href="https://wa.me/233246623402" className="flex items-center text-gray-900 font-bold text-sm hover:text-emerald-600 transition-colors"><ExternalLink className="w-4 h-4 mr-3 text-emerald-600"/> WhatsApp: +233 24 662 3402</a><a href="mailto:customer.support@autodutygh.com" className="flex items-center text-gray-900 font-bold text-sm hover:text-emerald-600 transition-colors"><Mail className="w-4 h-4 mr-3 text-emerald-600"/> customer.support@autodutygh.com</a></div></PageWrapper> )}
                {currentTab === 'about' && ( <PageWrapper title="About AutoDuty GH" icon={Info}><p>Welcome to <strong>AutoDuty GH</strong>, Ghana's premier platform for vehicle importation estimates and trusted auto-dealer networking.</p></PageWrapper> )}
                {currentTab === 'contact' && ( <PageWrapper title="Contact Us" icon={Mail}><div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4"><p className="flex items-center"><MapPin className="w-5 h-5 mr-3 text-emerald-600"/> Achimota, Accra-Ghana</p><a href="tel:+233246623402" className="flex items-center font-bold hover:text-emerald-600"><PhoneCall className="w-5 h-5 mr-3 text-emerald-600"/> +233 24 662 3402</a></div></PageWrapper> )}
                {currentTab === 'terms' && ( <PageWrapper title="Terms & Conditions" icon={FileText}><p>The duty calculations provided are <strong>estimates only</strong>. The Ghana Revenue Authority (GRA) possesses the final authority on vehicle valuation and applicable exchange rates at the time of clearance.</p></PageWrapper> )}
                {currentTab === 'privacy' && ( <PageWrapper title="Privacy Policy" icon={Lock}><p>We collect basic information exclusively from dealers who voluntarily register for our directory. We do not track or save the VIN numbers entered by users.</p></PageWrapper> )}
                {currentTab === 'disclaimer' && ( <PageWrapper title="Legal Disclaimer" icon={ShieldCheck}><p><strong>Not Affiliated with GRA:</strong> AutoDuty GH is an independent software tool. We are <strong>not</strong> affiliated with, endorsed by, or partnered with the Ghana Revenue Authority (GRA), the Customs Division, or the ICUMS operators.</p></PageWrapper> )}
            </div>
            
            {/* GLOBAL FOOTER */}
            <footer className="bg-emerald-950 w-full mt-auto py-8 md:py-10 border-t border-emerald-900 text-center px-4 relative z-10 print:hidden">
                <div className="max-w-5xl mx-auto flex flex-col items-center">
                    <div className="mb-4 md:mb-6 flex items-center justify-center text-white cursor-pointer" onClick={() => navigateTo('calc')}><Calculator className="w-5 h-5 md:w-6 md:h-6 text-orange-500 mr-2" /><span className="font-black tracking-widest uppercase text-base md:text-lg">AutoDuty <span className="text-orange-500">GH</span></span></div>
                    <div className="flex flex-wrap justify-center gap-3 md:gap-6 text-[9px] md:text-xs font-bold text-emerald-300 uppercase tracking-wider mb-4 md:mb-6">
                        <button onClick={() => navigateTo('about')} className="hover:text-white transition-colors">About Us</button>
                        <button onClick={() => navigateTo('advertise')} className="hover:text-white transition-colors">Advertise</button>
                        <button onClick={() => navigateTo('contact')} className="hover:text-white transition-colors">Contact</button>
                        <button onClick={() => navigateTo('terms')} className="hover:text-white transition-colors">Terms</button>
                        <button onClick={() => navigateTo('privacy')} className="hover:text-white transition-colors">Privacy</button>
                    </div>
                    <p className="text-[10px] md:text-xs text-emerald-700 mb-1 md:mb-2">Developed and Managed in Achimota, Accra-Ghana.</p>
                    <p className="text-[10px] md:text-xs text-emerald-700">© {new Date().getFullYear()} AutoDuty GH. All rights reserved.</p>
                </div>
            </footer>
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around p-1 pb-safe z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] print:hidden">
        <button onClick={() => navigateTo('calc')} className={`flex flex-col items-center p-2 w-full transition-all ${currentTab === 'calc' ? 'text-orange-500 font-bold' : 'text-gray-400 hover:text-gray-900'}`}><Calculator className="w-5 h-5 md:w-6 md:h-6 mb-1" /><span className="text-[9px] md:text-[10px] tracking-wide uppercase">Calc</span></button>
        <button onClick={() => navigateTo('directory')} className={`flex flex-col items-center p-2 w-full transition-all ${currentTab === 'directory' ? 'text-orange-500 font-bold' : 'text-gray-400 hover:text-gray-900'}`}><Store className="w-5 h-5 md:w-6 md:h-6 mb-1" /><span className="text-[9px] md:text-[10px] tracking-wide uppercase">Dealers</span></button>
        <button onClick={() => navigateTo('account')} className={`flex flex-col items-center p-2 w-full transition-all ${currentTab === 'account' ? 'text-orange-500 font-bold' : 'text-gray-400 hover:text-gray-900'}`}><UserCircle className="w-5 h-5 md:w-6 md:h-6 mb-1" /><span className="text-[9px] md:text-[10px] tracking-wide uppercase">Profile</span></button>
      </nav>
    </div>
  );
}

export default App;