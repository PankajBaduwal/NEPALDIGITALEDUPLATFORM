import React, { useState, useMemo } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { ShoppingCart, Percent, TrendingUp, Building, ArrowRight, RotateCcw } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'अङ्कित मूल्य रु १०,००० भएको सामानमा २०% छुट दिएपछि १३% भ्याट जोड्दा ग्राहकले तिर्नुपर्ने अन्तिम मूल्य कति हुन्छ?',
    en: 'If a goods marked Rs 10,000 has 20% discount and 13% VAT is added, what is the final price paid by customer?',
    options: [
      { key: 'A', label: 'रु ९,०४० — छुट पछिको रु ८,००० मा १३% भ्याट (१०४०) जोड्दा ९,०४०' },
      { key: 'B', label: 'रु ९,३००' },
      { key: 'C', label: 'रु ८,०००' },
      { key: 'D', label: 'रु १०,०४०' },
    ],
    answer: 'A',
  },
  {
    np: 'मूल्य अभिवृद्धि कर (VAT) सधैं कुन मूल्यमा गणना गरिन्छ?',
    en: 'On which price is Value Added Tax (VAT) always calculated?',
    options: [
      { key: 'A', label: 'छुट पछिको वास्तविक बिक्री मूल्य (SP after discount)' },
      { key: 'B', label: 'अङ्कित मूल्य (Marked Price)' },
      { key: 'C', label: 'छुट रकममा मात्र' },
      { key: 'D', label: 'नाफा रकममा मात्र' },
    ],
    answer: 'A',
  },
  {
    np: 'बहु-चरणे व्यापारमा कुनै व्यापारीले सरकारलाई दाखिला गर्ने वास्तविक भ्याट कति हुन्छ?',
    en: 'In multi-stage trading, how much net VAT does a trader deposit to the government?',
    options: [
      { key: 'A', label: 'बिक्री गर्दा उठाएको भ्याट − किन्दा तिरेको भ्याट (Output VAT − Input VAT)' },
      { key: 'B', label: 'उठाएको सम्पूर्ण भ्याट' },
      { key: 'C', label: 'किन्दा तिरेको भ्याट मात्र' },
      { key: 'D', label: 'नाफाको १३%' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि १३% भ्याटसहितको मूल्य रु ५,६५० भए, भ्याट अघिको मूल्य कति थियो?',
    en: 'If price with 13% VAT is Rs 5,650, what was the price before VAT?',
    options: [
      { key: 'A', label: 'रु ५,००० — (५६५० ÷ १.१३ = ५०००)' },
      { key: 'B', label: 'रु ४,९००' },
      { key: 'C', label: 'रु ५,२००' },
      { key: 'D', label: 'रु ५,५००' },
    ],
    answer: 'A',
  },
];

interface ProductItem {
  id: string;
  nameNp: string;
  nameEn: string;
  icon: string;
  defaultMp: number;
}

const PRODUCTS: ProductItem[] = [
  { id: 'mobile', nameNp: 'स्मार्टफोन (Smartphone)', nameEn: 'Smartphone', icon: '📱', defaultMp: 20000 },
  { id: 'fridge', nameNp: 'रेफ्रिजरेटर (Refrigerator)', nameEn: 'Refrigerator', icon: '🧊', defaultMp: 45000 },
  { id: 'cycle', nameNp: 'साइकल (Bicycle)', nameEn: 'Bicycle', icon: '🚲', defaultMp: 12000 },
  { id: 'watch', nameNp: 'घडी (Watch)', nameEn: 'Watch', icon: '⌚', defaultMp: 6000 },
  { id: 'tv', nameNp: 'टेलिभिजन (Smart TV)', nameEn: 'Smart TV', icon: '📺', defaultMp: 50000 },
];

export const VatDiscountSellingPriceLab: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U2-02',
    chapter: 2,
    titleNp: 'भ्याट, छुट र बिक्री मूल्य प्रयोगशाला',
    titleEn: 'VAT, Discount & Selling Price Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'shop' | 'chain' | 'reverse'>('shop');

  // Shopping Simulator State
  const [selectedProduct, setSelectedProduct] = useState<ProductItem>(PRODUCTS[0]);
  const [markedPrice, setMarkedPrice] = useState<number>(PRODUCTS[0].defaultMp);
  const [discountPct, setDiscountPct] = useState<number>(15);
  const [vatPct, setVatPct] = useState<number>(13);

  // Reverse Calculator State
  const [revFinalPrice, setRevFinalPrice] = useState<number>(11300);
  const [revVatPct, setRevVatPct] = useState<number>(13);
  const [revDiscountPct, setRevDiscountPct] = useState<number>(10);

  // Computed Shop Values
  const discountAmount = Math.round((markedPrice * discountPct) / 100);
  const priceAfterDiscount = markedPrice - discountAmount;
  const vatAmount = Math.round((priceAfterDiscount * vatPct) / 100);
  const finalPrice = priceAfterDiscount + vatAmount;

  // Computed Reverse Values
  // final = spAfterDisc * (1 + vatPct/100) -> spAfterDisc = final / (1 + vatPct/100)
  const revSpAfterDisc = Math.round(revFinalPrice / (1 + revVatPct / 100));
  const revVatAmt = revFinalPrice - revSpAfterDisc;
  const revMp = Math.round(revSpAfterDisc / (1 - revDiscountPct / 100));
  const revDiscAmt = revMp - revSpAfterDisc;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! अङ्कित मूल्य, छुट, करयोग्य मूल्य र १३% मूल्य अभिवृद्धि कर (VAT) को चरणबद्ध हिसाब प्रयोगशालामा स्वागत छ!',
        'Welcome! Explore Marked Price, Discount, Taxable Amount, and 13% Value Added Tax (VAT) step by step!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'shop' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🛒 {L('१. भर्चुअल सपिङ प्रयोगशाला (Shopping Lab)', '1. Shopping Lab')}
          </button>
          <button
            onClick={() => setActiveTab('chain')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'chain' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🏭 {L('२. बहु-चरणे भ्याट वितरण (Supply Chain VAT)', '2. Supply Chain VAT')}
          </button>
          <button
            onClick={() => setActiveTab('reverse')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'reverse' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🔄 {L('३. उल्टो हिसाब क्यालकुलेटर (Reverse Calculator)', '3. Reverse Calculator')}
          </button>
        </div>

        {/* Tab 1: Interactive Shopping Simulator */}
        {activeTab === 'shop' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Controls & Product Picker */}
            <div className="lg:col-span-6 bg-white rounded-2xl shadow-lg p-5 border border-slate-200 space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-600" />
                {L('सामान तथा छुट/भ्याट छनोट (Product & Rates)', 'Product & Rates')}
              </h3>

              {/* Product Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {PRODUCTS.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => {
                      setSelectedProduct(prod);
                      setMarkedPrice(prod.defaultMp);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      selectedProduct.id === prod.id
                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-300 shadow'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="text-2xl">{prod.icon}</div>
                    <div className="text-xs font-bold mt-1">{prod.nameNp.split(' ')[0]}</div>
                  </button>
                ))}
              </div>

              {/* Marked Price Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>अङ्कित मूल्य (Marked Price MP):</span>
                  <span className="font-mono text-indigo-700 text-sm">
                    रु. {markedPrice.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="100000"
                  step="1000"
                  value={markedPrice}
                  onChange={(e) => setMarkedPrice(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Discount Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>छुट प्रतिशत (Discount %):</span>
                  <span className="font-mono text-emerald-700 text-sm">{discountPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* VAT Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>मूल्य अभिवृद्धि कर (VAT %):</span>
                  <span className="font-mono text-amber-700 text-sm">{vatPct}% (मानक १३%)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={vatPct}
                  onChange={(e) => setVatPct(parseInt(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>
            </div>

            {/* Right: Step-by-Step Flow Receipt */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-800 space-y-3 font-mono">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-xs uppercase text-slate-400 font-bold">खरिद बिल (Bill Receipt)</span>
                  <span className="text-xs text-amber-400">{selectedProduct.icon} {selectedProduct.nameNp}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">१. अङ्कित मूल्य (MP):</span>
                    <span className="font-bold text-slate-200">रु. {markedPrice.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-emerald-400">
                    <span>२. छुट ({discountPct}%):</span>
                    <span>− रु. {discountAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between pt-1 border-t border-slate-800 font-bold text-slate-300">
                    <span>३. छुट पछिको मूल्य (करयोग्य SP):</span>
                    <span>रु. {priceAfterDiscount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-amber-400">
                    <span>४. भ्याट रकम ({vatPct}% on SP):</span>
                    <span>+ रु. {vatAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between pt-2 border-t-2 border-amber-500 font-black text-base text-amber-400">
                    <span>ग्राहकले तिर्नुपर्ने कुल रकम:</span>
                    <span>रु. {finalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Explanatory Formulas */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-1.5">
                <span className="font-bold block">💡 गणितीय सूत्रहरू (Formulas):</span>
                <div>• छुट रकम = MP × D% = {markedPrice} × {discountPct}% = रु. {discountAmount}</div>
                <div>• छुट पछिको मूल्य (SP) = MP − छुट = रु. {priceAfterDiscount}</div>
                <div>• भ्याट रकम = SP × VAT% = {priceAfterDiscount} × {vatPct}% = रु. {vatAmount}</div>
                <div>• भ्याटसहितको मूल्य = SP + VAT = रु. {finalPrice}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Supply Chain VAT */}
        {activeTab === 'chain' && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-5">
            <h3 className="font-extrabold text-slate-800 text-sm text-center">
              बहु-चरणे व्यापारमा भ्याट सङ्कलन (उत्पादक ➜ डिलर ➜ खुद्रा बिक्रेता ➜ उपभोक्ता)
            </h3>

            {/* Stages Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b">
                  <tr>
                    <th className="p-2.5">तह (Stage)</th>
                    <th className="p-2.5 text-right">खरिद मूल्य</th>
                    <th className="p-2.5 text-right">नाफा</th>
                    <th className="p-2.5 text-right">बिक्री मूल्य</th>
                    <th className="p-2.5 text-right">उठाएको भ्याट (१३%)</th>
                    <th className="p-2.5 text-right">सरकारलाई दाखिला</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="p-2.5 font-bold">१. उत्पादक (Manufacturer)</td>
                    <td className="p-2.5 text-right text-slate-400">—</td>
                    <td className="p-2.5 text-right">—</td>
                    <td className="p-2.5 text-right font-bold text-slate-800">रु. १०,०००</td>
                    <td className="p-2.5 text-right text-amber-700">रु. १,३००</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">रु. १,३००</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">२. डिलर (Dealer)</td>
                    <td className="p-2.5 text-right">रु. १०,०००</td>
                    <td className="p-2.5 text-right">+ रु. २,०००</td>
                    <td className="p-2.5 text-right font-bold text-slate-800">रु. १२,०००</td>
                    <td className="p-2.5 text-right text-amber-700">रु. १,५६०</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">रु. २६० (१५६०−१३००)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">३. खुद्रा बिक्रेता (Retailer)</td>
                    <td className="p-2.5 text-right">रु. १२,०००</td>
                    <td className="p-2.5 text-right">+ रु. ३,०००</td>
                    <td className="p-2.5 text-right font-bold text-slate-800">रु. १५,०००</td>
                    <td className="p-2.5 text-right text-amber-700">रु. १,९५०</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">रु. ३९० (१९५०−१५६०)</td>
                  </tr>
                </tbody>
                <tfoot className="bg-amber-50 font-bold text-amber-950 border-t-2 border-amber-300">
                  <tr>
                    <td colSpan={4} className="p-2.5 text-right">सरकारले प्राप्त गरेको कुल भ्याट:</td>
                    <td colSpan={2} className="p-2.5 text-right font-mono text-base text-amber-800">
                      रु. १,९५० (१३०० + २६० + ३९०)
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              💡 <b>महत्त्वपूर्ण निष्कर्ष:</b> प्रत्येक तहमा व्यापारीले केवल आफ्नो मूल्य अभिवृद्धि (नाफा) मा मात्र भ्याट दाखिला गर्दछन्, र कुल सङ्कलन उपभोक्ताले तिरेको अन्तिम भ्याट (रु. १५,००० को १३% = रु. १,९५०) सँग बराबर हुन्छ।
            </p>
          </div>
        )}

        {/* Tab 3: Reverse Calculator */}
        {activeTab === 'reverse' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-5">
            <h3 className="font-extrabold text-slate-800 text-sm text-center">
              अन्तिम भ्याटसहितको मूल्यबाट अङ्कित मूल्य (MP) पत्ता लगाउने उल्टो हिसाब
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">अन्तिम मूल्य (रु):</label>
                <input
                  type="number"
                  value={revFinalPrice}
                  onChange={(e) => setRevFinalPrice(parseInt(e.target.value) || 0)}
                  className="w-full p-2 rounded-xl border border-slate-300 font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">भ्याट प्रतिशत (%):</label>
                <input
                  type="number"
                  value={revVatPct}
                  onChange={(e) => setRevVatPct(parseInt(e.target.value) || 0)}
                  className="w-full p-2 rounded-xl border border-slate-300 font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">छुट प्रतिशत (%):</label>
                <input
                  type="number"
                  value={revDiscountPct}
                  onChange={(e) => setRevDiscountPct(parseInt(e.target.value) || 0)}
                  className="w-full p-2 rounded-xl border border-slate-300 font-mono text-xs font-bold"
                />
              </div>
            </div>

            {/* Result Box */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs text-emerald-950">
              <div className="flex justify-between">
                <span>१. भ्याट अघिको मूल्य (SP after Discount):</span>
                <span className="font-mono font-bold text-sm text-emerald-800">
                  रु. {revSpAfterDisc.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>२. भ्याट रकम (VAT Amount):</span>
                <span className="font-mono font-bold text-sm text-emerald-800">
                  रु. {revVatAmt.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-emerald-200 font-extrabold text-sm text-indigo-900">
                <span>३. सुरुको अङ्कित मूल्य (Original MP):</span>
                <span className="font-mono text-lg text-indigo-700">
                  रु. {revMp.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default VatDiscountSellingPriceLab;
