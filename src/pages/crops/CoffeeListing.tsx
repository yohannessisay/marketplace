import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Icons
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// Interface for select options
interface SelectOption {
  value: string;
  label: string;
}

// Select component
const SelectField: React.FC<{
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
}> = ({ label, options, value, onChange }) => {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded p-2 bg-white text-gray-700"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// Input field component
const InputField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}> = ({ label, value, onChange, type = 'text', placeholder = '' }) => {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 bg-white rounded p-2"
        placeholder={placeholder}
      />
    </div>
  );
};

// Step indicator component
const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  return (
    <div className="flex justify-center mb-6">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              step <= currentStep ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step}
          </div>
          {step < 4 && (
            <div
              className={`w-16 h-1 ${
                step < currentStep ? 'bg-teal-500' : 'bg-gray-200'
              }`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
};

// Step label component
const StepLabels: React.FC = () => {
  return (
    <div className="flex justify-center mb-8 text-xs text-gray-600">
      <div className="text-center w-24">Provide your Farm information</div>
      <div className="text-center w-24">Add your coffee listings to sell</div>
      <div className="text-center w-24">Provide bank information</div>
      <div className="text-center w-24">Upload your beautiful avatar</div>
    </div>
  );
};

// Photo Upload component
const PhotoUpload: React.FC<{
  isPrimary?: boolean;
  onUpload: (file: File) => void;
}> = ({ isPrimary = false, onUpload }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="relative">
      <label className="block cursor-pointer">
        <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center bg-gray-50">
          <CameraIcon />
          <span className="text-xs text-gray-500 mt-1">
            {isPrimary ? 'Add a photo' : 'Add another'}
          </span>
          {isPrimary && <span className="text-xs text-gray-400">Primary photo</span>}
        </div>
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};

// Main component
const CoffeeListing: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep] = useState(2); // Hardcoded to step 2 based on the UI
  
  // Form state
  const [coffeeVariety, setCoffeeVariety] = useState('Ethiopian Heirloom');
  const [cupScore, setCupScore] = useState('85');
  const [initialGrading, setInitialGrading] = useState('Grade 1');
  const [beanType, setBeanType] = useState('Green beans');
  const [cropYear, setCropYear] = useState('2024');
  const [farming, setFarming] = useState('Organic farm');
  const [processing, setProcessing] = useState('Washed (Wet Process)');
  const [moisture, setMoisture] = useState('11.5%');
  const [screenSize, setScreenSize] = useState('14');
  const [drying, setDrying] = useState('Sun dried on raised beds');
  const [wetMill, setWetMill] = useState('Hand-pulped and fermented');
  const [cupTaste, setCupTaste] = useState('Fruity');
  const [acidity, setAcidity] = useState('Delicate');
  const [body, setBody] = useState('Heavy');
  const [sweetness, setSweetness] = useState('Honey-like');
  const [aftertaste, setAftertaste] = useState('Long-lasting');
  const [balance, setBalance] = useState('Complex');
  const [quantity, setQuantity] = useState('5,000');
  const [price, setPrice] = useState('$4.50');
  const [readinessDate, setReadinessDate] = useState('October 2024');
  const [lotNumber, setLotNumber] = useState('');
  const [deliveryType, setDeliveryType] = useState('FOB (Free on Board) - Port of Djibouti');

  // File uploads
  const [, setGradingReport] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);

  const handleGradingReportUpload = (file: File) => {
    setGradingReport(file);
  };

  const handlePhotoUpload = (file: File) => {
    setPhotos([...photos, file]);
  };

  const handleSaveAndContinue = () => {
    // Here you would typically save the data and navigate to the next step
    navigate('/bank-information');
  };

  // Bean type options
  const beanTypes: SelectOption[] = [
    { value: 'green-beans', label: 'Green beans' }
  ];

  // Processing method options
  const processingMethods: SelectOption[] = [
    { value: 'washed', label: 'Washed (Wet Process)' }
  ];

  // Drying method options
  const dryingMethods: SelectOption[] = [
    { value: 'sun-dried', label: 'Sun dried on raised beds' }
  ];

  // Wet mill options
  const wetMillOptions: SelectOption[] = [
    { value: 'hand-pulped', label: 'Hand-pulped and fermented' }
  ];

  // Cup taste options
  const cupTasteOptions: SelectOption[] = [
    { value: 'fruity', label: 'Fruity' }
  ];

  // Acidity options
  const acidityOptions: SelectOption[] = [
    { value: 'delicate', label: 'Delicate' }
  ];

  // Body options
  const bodyOptions: SelectOption[] = [
    { value: 'heavy', label: 'Heavy' }
  ];

  // Sweetness options
  const sweetnessOptions: SelectOption[] = [
    { value: 'honey', label: 'Honey-like' }
  ];

  // Aftertaste options
  const aftertasteOptions: SelectOption[] = [
    { value: 'long-lasting', label: 'Long-lasting' }
  ];

  // Balance options
  const balanceOptions: SelectOption[] = [
    { value: 'complex', label: 'Complex' }
  ];

  // Farming practice options
  const farmingPractices: SelectOption[] = [
    { value: 'organic', label: 'Organic farm' }
  ];

  // Delivery type options
  const deliveryTypes: SelectOption[] = [
    { value: 'fob', label: 'FOB (Free on Board) - Port of Djibouti' }
  ];

  return (
    <div className="bg-white text-gray-800 min-h-screen">
      {/* Header & Navigation */}
      <header className="border-b border-gray-200 p-4 flex justify-between items-center">
        <div className="text-xl font-bold text-green-800">Afrovalley</div>
        <div className="flex gap-4 text-sm">
          <a href="/dashboard" className="flex items-center gap-1 text-gray-600">
            <span>My dashboard</span>
          </a>
          <a href="/marketplace" className="flex items-center gap-1 text-gray-600">
            <span>Marketplace</span>
          </a>
          <a href="/orders" className="flex items-center gap-1 text-gray-600">
            <span>Orders</span>
          </a>
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        {/* Step Indicators */}
        <StepIndicator currentStep={currentStep} />
        <StepLabels />

        {/* Step 1: Upload Grading Report */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-sm font-medium py-1 px-2 bg-green-100 text-green-800 rounded">
              Step 2
            </div>
            <h2 className="text-xl font-semibold">Upload Grading Report</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Submit your Grading Report to provide a detailed quality assessment of your coffee, including bean size, moisture content, and cup profile.
          </p>

          <div 
            className="border-2 border-dashed border-gray-300 rounded-md p-12 flex flex-col items-center justify-center bg-gray-50"
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleGradingReportUpload(e.dataTransfer.files[0]);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <UploadIcon />
            <p className="mt-2 text-sm text-gray-500">Drop your files here or <span className="text-teal-500">browse</span></p>
            <p className="text-xs text-gray-400">Maximum file size: 5MB</p>
            <input 
              type="file" 
              className="hidden" 
              id="grading-report"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleGradingReportUpload(e.target.files[0]);
                }
              }}
            />
          </div>
        </div>

        {/* Step 2: Check and edit coffee crop information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Check and edit coffee crop information</h2>
          <p className="text-sm text-gray-600 mb-6">
            Provide details on crop variety, quality, quantity, and base price to help buyers assess availability and cost
          </p>

          {/* Coffee basic info */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <InputField 
              label="Coffee variety" 
              value={coffeeVariety} 
              onChange={setCoffeeVariety} 
            />
            <InputField 
              label="Cup score" 
              value={cupScore} 
              onChange={setCupScore}
            />
            <InputField 
              label="Initial grading" 
              value={initialGrading} 
              onChange={setInitialGrading}
            />
            <SelectField 
              label="Bean type" 
              value={beanType} 
              onChange={setBeanType}
              options={beanTypes}
            />
            <InputField 
              label="Crop year" 
              value={cropYear} 
              onChange={setCropYear}
            />
          </div>

          {/* Crop specification */}
          <h3 className="text-lg font-medium mb-4">Crop specification</h3>
          <div className="grid grid-cols-3 gap-6 mb-8">
            <SelectField 
              label="Farming practice" 
              value={farming} 
              onChange={setFarming}
              options={farmingPractices}
            />
            <SelectField 
              label="Primary Processing Method" 
              value={processing} 
              onChange={setProcessing}
              options={processingMethods}
            />
            <InputField 
              label="Moisture" 
              value={moisture} 
              onChange={setMoisture}
            />
            <InputField 
              label="Screen size" 
              value={screenSize} 
              onChange={setScreenSize}
            />
            <SelectField 
              label="Type of drying" 
              value={drying} 
              onChange={setDrying}
              options={dryingMethods}
            />
            <SelectField 
              label="Wet mill" 
              value={wetMill} 
              onChange={setWetMill}
              options={wetMillOptions}
            />
          </div>

          {/* Cup taste */}
          <h3 className="text-lg font-medium mb-4">Cup taste</h3>
          <div className="grid grid-cols-3 gap-6 mb-8">
            <SelectField 
              label="Aroma" 
              value={cupTaste} 
              onChange={setCupTaste}
              options={cupTasteOptions}
            />
            <SelectField 
              label="Acidity" 
              value={acidity} 
              onChange={setAcidity}
              options={acidityOptions}
            />
            <SelectField 
              label="Body" 
              value={body} 
              onChange={setBody}
              options={bodyOptions}
            />
            <SelectField 
              label="Sweetness" 
              value={sweetness} 
              onChange={setSweetness}
              options={sweetnessOptions}
            />
            <SelectField 
              label="Aftertaste" 
              value={aftertaste} 
              onChange={setAftertaste}
              options={aftertasteOptions}
            />
            <SelectField 
              label="Balance" 
              value={balance} 
              onChange={setBalance}
              options={balanceOptions}
            />
          </div>

          {/* Coffee crop photos */}
          <h3 className="text-lg font-medium mb-4">Coffee crop photos</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload high-quality images of your coffee crop to create a clear representation. Start with a primary photo that best showcases your crop, then add additional images if needed.
          </p>

          <div className="mb-8">
            <h4 className="text-base font-medium mb-2">Coffee Crop photos</h4>
            <div className="flex gap-4">
              <PhotoUpload isPrimary onUpload={handlePhotoUpload} />
              <PhotoUpload onUpload={handlePhotoUpload} />
              <PhotoUpload onUpload={handlePhotoUpload} />
              <PhotoUpload onUpload={handlePhotoUpload} />
              <PhotoUpload onUpload={handlePhotoUpload} />
              <PhotoUpload onUpload={handlePhotoUpload} />
            </div>
          </div>

          {/* Set the price and discounts */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-2">Set the price and discounts</h3>
            <p className="text-sm text-gray-600 mb-4">
              Provide details on crop variety, quality, quantity, and base price to help buyers assess availability and cost
            </p>

            <div className="grid grid-cols-2 gap-6 mb-4">
              <InputField 
                label="Crop Quantity (kg)" 
                value={quantity} 
                onChange={setQuantity}
              />
              <InputField 
                label="Community Base Price per kg" 
                value={price} 
                onChange={setPrice}
              />
            </div>

            <button className="flex items-center bg-white text-sm text-teal-600 gap-1 mt-2">
              <PlusIcon />
              <span>Add discount</span>
            </button>
          </div>

          {/* Readiness and Delivery Details */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-2">Readiness and Delivery Details</h3>
            <p className="text-sm text-gray-600 mb-4">
              Specify the harvest readiness date, bagging period, and delivery type to inform buyers
            </p>

            <div className="grid grid-cols-3 gap-6">
              <InputField 
                label="Readiness date" 
                value={readinessDate} 
                onChange={setReadinessDate}
              />
              <InputField 
                label="Lot number" 
                value={lotNumber} 
                onChange={setLotNumber}
                placeholder="Optional"
              />
              <SelectField 
                label="Delivery type" 
                value={deliveryType} 
                onChange={setDeliveryType}
                options={deliveryTypes}
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between">
          <button className="px-4 py-2 border bg-white border-gray-300 rounded text-gray-600">
            Skip
          </button>
          <button 
            className="px-6 py-2 bg-teal-500 text-white rounded"
            onClick={handleSaveAndContinue}
          >
            Save and continue
          </button>
        </div>
      </main>
    </div>
  );
};

export default CoffeeListing;