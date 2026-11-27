import React, { useState, useMemo } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { ShoppingCart, Percent, TrendingUp, Building, ArrowRight, RotateCcw } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'अङ्कित मूल्य Rs 10,000 भएको सामानमा 20% छुट दिएपछि 13% भ्याट जोड्दा ग्राहकले तिर्नुपर्ने अन्तिम मूल्य कति हुन्छ?',
    en: 'If a goods marked Rs 10,000 has 20% discount and 13% VAT is added, what is the final price paid by customer?',
    options: [
      { key: 'A', label: 'Rs 9,040 — adding 13% VAT (1040) to Rs 8,000 after discount gives 9,040' },
      { key: 'B', label: 'Rs 9,300' },
      { key: 'C', label: 'Rs 8,000' },
      { key: 'D', label: 'Rs 10,040' },
    ],
    answer: 'A',
  },
  {
    np: 'मूल्य अभिवृद्धि कर (VAT) सधैं कुन मूल्यमा गणना गरिन्छ?',
    en: 'On which price is Value Added Tax (VAT) always calculated?',
    options: [
      { key: 'A', label: 'Actual selling price after discount (SP after discount)' },
      { key: 'B', label: 'Marked price' },
      { key: 'C', label: 'On the discount amount only' },
      { key: 'D', label: 'On the profit amount only' },
    ],
    answer: 'A',
  },
  {
    np: 'बहु-चरणे व्यापारमा कुनै व्यापारीले Paid to the government गर्ने वास्तविक भ्याट कति हुन्छ?',
    en: 'In multi-stage trading, how much net VAT does a trader deposit to the government?',
    options: [
      { key: 'A', label: 'VAT collected on sale − VAT paid on purchase (output VAT − input VAT)' },
      { key: 'B', label: 'All the VAT collected' },
      { key: 'C', label: 'Only the VAT paid on purchase' },
      { key: 'D', label: '13% of the profit' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि 13% भ्याटसहितको मूल्य Rs 5,650 भए, भ्याट अघिको मूल्य कति थियो?',
    en: 'If price with 13% VAT is Rs 5,650, what was the price before VAT?',
    options: [
      { key: 'A', label: 'Rs 5,000 — (5650 ÷ 1.13 = 5000)' },
      { key: 'B', label: 'Rs 4,900' },
      { key: 'C', label: 'Rs 5,200' },
      { key: 'D', label: 'Rs 5,500' },
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
  { id: 'mobile', nameNp: 'Smartphone', nameEn: 'Smartphone', icon: '📱', defaultMp: 20000 },
  { id: 'fridge', nameNp: 'Refrigerator (Refrigerator)', nameEn: 'Refrigerator', icon: '🧊', defaultMp: 45000 },
  { id: 'cycle', nameNp: 'Bicycle (Bicycle)', nameEn: 'Bicycle', icon: '🚲', defaultMp: 12000 },
  { id: 'watch', nameNp: 'Watch (Watch)', nameEn: 'Watch', icon: '⌚', defaultMp: 6000 },
  { id: 'tv', nameNp: 'Television (Smart TV)', nameEn: 'Smart TV', icon: '📺', defaultMp: 50000 },
];

export const VatDiscountSellingPriceLab: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U2-02',
    chapter: 2,
    titleNp: 'भ्याट, छुट र Selling price प्रयोगशाला',
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
        'नमस्ते! अङ्कित मूल्य, छुट, करयोग्य मूल्य र 13% मूल्य अभिवृद्धि कर (VAT) को चरणबद्ध हिसाब प्रयोगशालामा स्वागत छ!',
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
            🛒 {L('1. भर्चुअल सपिङ प्रयोगशाला (Shopping Lab)', '1. Shopping Lab')}
          </button>
          <button
            onClick={() => setActiveTab('chain')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'chain' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🏭 {L('2. बहु-चरणे भ्याट वितरण (Supply Chain VAT)', '2. Supply Chain VAT')}
          </button>
          <button
            onClick={() => setActiveTab('reverse')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'reverse' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🔄 {L('3. उल्टो हिसाब क्यालकुलेटर (Reverse Calculator)', '3. Reverse Calculator')}
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
                  <span>Marked price (MP):</span>
                  <span className="font-mono text-indigo-700 text-sm">
                    Rs. {markedPrice.toLocaleString()}
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
                  <span>Discount %:</span>
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
                  <span>Value added tax (VAT %):</span>
                  <span className="font-mono text-amber-700 text-sm">{vatPct}%</span>
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
                  <span className="text-xs uppercase text-slate-400 font-bold">Purchase bill (receipt)</span>
                  <span className="text-xs text-amber-400">{selectedProduct.icon} {selectedProduct.nameNp}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">1. Marked price (MP):</span>
                    <span className="font-bold text-slate-200">Rs. {markedPrice.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-emerald-400">
                    <span>2. Discount ({discountPct}%):</span>
                    <span>− Rs. {discountAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between pt-1 border-t border-slate-800 font-bold text-slate-300">
                    <span>3. Price after discount (taxable SP):</span>
                    <span>Rs. {priceAfterDiscount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-amber-400">
                    <span>4. VAT amount ({vatPct}% on SP):</span>
                    <span>+ Rs. {vatAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between pt-2 border-t-2 border-amber-500 font-black text-base text-amber-400">
                    <span>Total amount payable by the customer:</span>
                    <span>Rs. {finalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Explanatory Formulas */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-1.5">
                <span className="font-bold block">💡 Formulas:</span>
                <div>• Discount amount = MP × D% = {markedPrice} × {discountPct}% = Rs. {discountAmount}</div>
                <div>• Price after discount (SP) = MP − discount = Rs. {priceAfterDiscount}</div>
                <div>• VAT amount = SP × VAT% = {priceAfterDiscount} × {vatPct}% = Rs. {vatAmount}</div>
                <div>• Price including VAT = SP + VAT = Rs. {finalPrice}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Supply Chain VAT */}
        {activeTab === 'chain' && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-5">
            <h3 className="font-extrabold text-slate-800 text-sm text-center">
              VAT collection in multi-stage trade (manufacturer ➜ dealer ➜ retailer ➜ consumer)
            </h3>

            {/* Stages Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b">
                  <tr>
                    <th className="p-2.5">Stage</th>
                    <th className="p-2.5 text-right">Purchase price</th>
                    <th className="p-2.5 text-right">Profit</th>
                    <th className="p-2.5 text-right">Selling price</th>
                    <th className="p-2.5 text-right">VAT collected (13%)</th>
                    <th className="p-2.5 text-right">Paid to the government</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="p-2.5 font-bold">1. Manufacturer</td>
                    <td className="p-2.5 text-right text-slate-400">—</td>
                    <td className="p-2.5 text-right">—</td>
                    <td className="p-2.5 text-right font-bold text-slate-800">Rs. 10,000</td>
                    <td className="p-2.5 text-right text-amber-700">Rs. 1,300</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">Rs. 1,300</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">2. Dealer</td>
                    <td className="p-2.5 text-right">Rs. 10,000</td>
                    <td className="p-2.5 text-right">+ Rs. 2,000</td>
                    <td className="p-2.5 text-right font-bold text-slate-800">Rs. 12,000</td>
                    <td className="p-2.5 text-right text-amber-700">Rs. 1,560</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">Rs. 260 (1560−1300)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">3. Retailer</td>
                    <td className="p-2.5 text-right">Rs. 12,000</td>
                    <td className="p-2.5 text-right">+ Rs. 3,000</td>
                    <td className="p-2.5 text-right font-bold text-slate-800">Rs. 15,000</td>
                    <td className="p-2.5 text-right text-amber-700">Rs. 1,950</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">Rs. 390 (1950−1560)</td>
                  </tr>
                </tbody>
                <tfoot className="bg-amber-50 font-bold text-amber-950 border-t-2 border-amber-300">
                  <tr>
                    <td colSpan={4} className="p-2.5 text-right">Total VAT received by the government:</td>
                    <td colSpan={2} className="p-2.5 text-right font-mono text-base text-amber-800">
                      Rs. 1,950 (1300 + 260 + 390)
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              💡 <b>Important conclusion:</b> At each stage the trader pays VAT only on their own value added (profit), and the total collected equals the final VAT paid by the consumer (13% of Rs. 15,000 = Rs. 1,950).
            </p>
          </div>
        )}

        {/* Tab 3: Reverse Calculator */}
        {activeTab === 'reverse' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-5">
            <h3 className="font-extrabold text-slate-800 text-sm text-center">
              Reverse calculation: finding the marked price (MP) from the final price including VAT
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Final price (Rs):</label>
                <input
                  type="number"
                  value={revFinalPrice}
                  onChange={(e) => setRevFinalPrice(parseInt(e.target.value) || 0)}
                  className="w-full p-2 rounded-xl border border-slate-300 font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">VAT percentage (%):</label>
                <input
                  type="number"
                  value={revVatPct}
                  onChange={(e) => setRevVatPct(parseInt(e.target.value) || 0)}
                  className="w-full p-2 rounded-xl border border-slate-300 font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Discount percentage (%):</label>
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
                <span>1. Price before VAT (SP after discount):</span>
                <span className="font-mono font-bold text-sm text-emerald-800">
                  Rs. {revSpAfterDisc.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>2. VAT amount:</span>
                <span className="font-mono font-bold text-sm text-emerald-800">
                  Rs. {revVatAmt.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-emerald-200 font-extrabold text-sm text-indigo-900">
                <span>3. Original marked price (MP):</span>
                <span className="font-mono text-lg text-indigo-700">
                  Rs. {revMp.toLocaleString()}
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
