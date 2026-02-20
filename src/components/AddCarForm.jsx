// C:\xampp\htdocs\ghana_auto_hub\frontend\src\components\AddCarForm.jsx
import { useState } from 'react';
import { carMakesAndModels, carYears } from '../utils/carDatabase';
import { CarFront, MapPin, Tag, ShieldCheck, ImagePlus, XCircle } from 'lucide-react';

function AddCarForm({ onCarAdded, loggedInDealer }) {
  const [formData, setFormData] = useState({
    make: '', model: '', manufacture_year: '', engine_cc: '', price_ghs: '', car_condition: 'Used', duty_status: 'Duty Paid', location: ''
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleMakeChange = (e) => setFormData({ ...formData, make: e.target.value, model: '' });

  // Handle Image Selection and generate a preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });

    if (!loggedInDealer || !loggedInDealer.id) {
        setStatus({ loading: false, error: 'You must be logged in to post.', success: '' });
        return;
    }

    // Use FormData to package the text AND the file together
    const payload = new FormData();
    payload.append('dealer_id', loggedInDealer.id);
    Object.keys(formData).forEach(key => payload.append(key, formData[key]));
    
    if (imageFile) {
        payload.append('image', imageFile);
    }

    try {
      // Notice: We do NOT set 'Content-Type' manually when using FormData. The browser handles it.
      const response = await fetch('http://localhost/ghana_auto_hub/backend/add_car.php', {
        method: 'POST', 
        body: payload
      });
      const data = await response.json();

      if (data.status === 'success') {
        setStatus({ loading: false, error: '', success: 'Vehicle published successfully!' });
        setFormData({ make: '', model: '', manufacture_year: '', engine_cc: '', price_ghs: '', car_condition: 'Used', duty_status: 'Duty Paid', location: '' });
        removeImage();
        if (onCarAdded) onCarAdded(); 
      } else {
        setStatus({ loading: false, error: data.message, success: '' });
      }
    } catch (error) { setStatus({ loading: false, error: 'Failed to connect to the server.', success: '' }); }
  };

  const availableModels = formData.make ? carMakesAndModels[formData.make] : [];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <div className="flex items-center mb-6">
          <CarFront className="w-6 h-6 text-ghanaGreen mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Post a Vehicle</h2>
      </div>
      
      {status.success && <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6 flex items-center"><ShieldCheck className="w-5 h-5 mr-2"/>{status.success}</div>}
      {status.error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{status.error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Image Upload Area */}
        <div className="col-span-full">
            <label className="block text-sm font-bold text-gray-700 mb-2">Vehicle Photo</label>
            {!imagePreview ? (
                <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ImagePlus className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500 font-bold">Tap to upload photo</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                </div>
            ) : (
                <div className="relative w-full h-48 rounded-xl border border-gray-200 overflow-hidden bg-gray-100">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-red-600 hover:bg-white transition-colors shadow-sm">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-5">
          <select name="make" required value={formData.make} onChange={handleMakeChange} className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-ghanaGreen focus:ring-1 focus:ring-ghanaGreen outline-none transition-all">
            <option value="">Select Make</option>
            {Object.keys(carMakesAndModels).map(make => ( <option key={make} value={make}>{make}</option> ))}
          </select>

          <select name="model" required value={formData.model} onChange={handleChange} disabled={!formData.make} className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-ghanaGreen focus:ring-1 focus:ring-ghanaGreen outline-none disabled:opacity-50 transition-all">
            <option value="">Select Model</option>
            {availableModels.map(model => ( <option key={model} value={model}>{model}</option> ))}
          </select>

          <select name="manufacture_year" required value={formData.manufacture_year} onChange={handleChange} className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-ghanaGreen focus:ring-1 focus:ring-ghanaGreen outline-none transition-all">
            <option value="">Select Year</option>
            {carYears.map(year => ( <option key={year} value={year}>{year}</option> ))}
          </select>

          <input type="number" step="0.1" name="engine_cc" placeholder="Engine CC (e.g. 1.8)" required value={formData.engine_cc} onChange={handleChange} className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-ghanaGreen focus:ring-1 focus:ring-ghanaGreen outline-none transition-all" />
          
          <div className="md:col-span-2 relative">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Tag className="h-5 w-5 text-gray-400" /></div>
             <input type="number" name="price_ghs" placeholder="Price in GHS" required value={formData.price_ghs} onChange={handleChange} className="w-full pl-11 p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-ghanaGreen focus:ring-1 focus:ring-ghanaGreen outline-none transition-all" />
          </div>
          
          <select name="car_condition" value={formData.car_condition} onChange={handleChange} className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-ghanaGreen focus:ring-1 focus:ring-ghanaGreen outline-none transition-all">
            <option value="New">Brand New</option>
            <option value="Used">Foreign Used</option>
            <option value="Home Used">Home Used</option>
            <option value="Salvage">Salvage</option>
          </select>

          <select name="duty_status" value={formData.duty_status} onChange={handleChange} className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-ghanaGreen focus:ring-1 focus:ring-ghanaGreen outline-none transition-all">
            <option value="Duty Paid">Duty Paid</option>
            <option value="Duty Unpaid">Duty Unpaid</option>
            <option value="In Transit">In Transit</option>
          </select>
          
          <div className="md:col-span-2 relative">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><MapPin className="h-5 w-5 text-gray-400" /></div>
             <input type="text" name="location" placeholder="Location (e.g. Tema, Comm 1)" required value={formData.location} onChange={handleChange} className="w-full pl-11 p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-ghanaGreen focus:ring-1 focus:ring-ghanaGreen outline-none transition-all" />
          </div>
        </div>

        <button type="submit" disabled={status.loading} className="w-full bg-ghanaYellow hover:bg-yellow-500 text-gray-900 font-bold py-4 rounded-xl transition-all shadow-sm mt-4">
          {status.loading ? "Uploading & Publishing..." : "Publish Live to Hub"}
        </button>
      </form>
    </div>
  );
}

export default AddCarForm;