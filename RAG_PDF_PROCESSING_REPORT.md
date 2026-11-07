# RAG PDF Processing Report

Generated 2026-11-05T17:35:59.027Z.

## How each text layer is processed

| Text layer | PDFs | Method |
| --- | ---: | --- |
| ENGLISH | 35 | Embedded text extracted directly (pdf-parse); pages with no text go to Gemini OCR if more than 20% are empty |
| UNICODE_NEPALI | 3 | Embedded Unicode text extracted directly |
| LEGACY_NEPALI (Preeti font) | 82 | Converted to Unicode locally (approximate, ~85-90% character accuracy in testing). Re-run with RAG_PREETI_MODE=OCR for Gemini page reading when quota allows |
| NONE (scanned) | 21 | Gemini reads page images (needs paid quota for 4,762 pages) |

## Documents with notes

- Curriculum (T)/संगीत शिक्षा कक्षा ९-१० (प्राविधिक तथा व्यावसायिक संकाय )_fqsjhai.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- Teaching Materials/cultural resource final- शि. सन्द._kdmbtcu.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- Teaching Materials/दोस्रो भाषाका रुपमा नेपाली भाषा सिकाइका लागि शिक्षण स्रोत सामग्री_8koizzj.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- Teaching Materials/प्रकाशन शैली (House Style)_2sbrcm7.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- Teaching Materials/शिशु विकास केन्द्रका सहजकर्ता, अभिभावक तथा स्याहारकर्ताका लागि सहयोगी पुस्तिका_u6ntzlr.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class1/मेरो गणित कक्षा १-२०७६_elizyir.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class1/स्वाध्याय सामग्री मेरो गणित कक्षा १_bzmde1f.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class1/मेरो नेपाली कक्षा १-२०७६ - Copy_vkavvsb.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class1/हाम्रो सेफोफेरो कक्षा १_nafsu84.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class2/0002_MyMathematics2NepaliEdition_ma2mzgd.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class2/स्वाध्याय सामग्री मेरो गणित कक्षा २ (नेपाली माध्यम)_q5ko2f3.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class2/मेरो नेपाली कक्षा २-२०७८_mmqokgx.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class2/हाम्रो सेरोफेरो कक्षा २-२०७८_i5hjyqx.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class3/मेरो गणित कक्षा ३-२०७८_imbltzd.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class3/स्वाध्याय सामग्री मेरो गणित कक्षा ३_7cy6jfw.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class3/मेरो नेपाली कक्षा ३-२०७८_jfxs4bm.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class3/हाम्रो सेफोफेरो कक्षा ३_gbzlusp.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class4/hpc4 - Copy_apuzafd.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class4/my math 4_oxm1wxn.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class4/my nepali 4_hmvu8hd.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class4/science 4_qczmo4f.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class5/चेपाङ भाषा पाठ्यपुस्तक कक्षा ५_zzlroot.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class5/class 5 health_fyd66vj.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class5/खालिङ भाषा पाठ्यपुस्तक कक्षा ५_wgmditf.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class5/गणित कक्षा ५ (नेपाली संस्करण)_3kpojvv.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class5/नेपाली कक्षा ५_etjdqfw.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class5/विज्ञान तथा प्रविधि कक्षा ५ (नेपाली संस्करण)_lhcgijf.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class5/सामाजिक अध्ययन तथा मानव मुल्यमान्यता कक्षा ५ (नेपाली संस्करण)_srmp9sk.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class6/Class 6 Bantawa Final 7.24_fg8ser2.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class6/hpc6_myg8e4n.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class6/मगर भाषा पाठ्यपुस्तक कक्षा ६_5t4u2mp.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class6/गणित कक्षा ६-2078_h7fxaj7.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class6/नेपाली कक्षा ६-2082_6evwjnp.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class6/विज्ञान तथा प्रविधि कक्षा ६-2078_sviowyj.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class6/5.Reduced-Class 6 Social Final_l9n6lkg.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class7/Chamling Class 7 Final_wp3hlrn.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class7/1. class 7 health final-compressed_pqmbsce.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class7/मगर भाषा पाठ्यपुस्तक कक्षा ७_f7u9vvp.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class7/Class 7 magar dhut final_gat5lib.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class7/0007_MathsGrade7NepaliEdition_gtyci7i.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class7/7.Reduced-class 7 Nepali final_lnxtmxf.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class7/Class 7 Nepalbhasa final_rkdnpjz.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class7/9.Reduced-class 7 science final_ypdi9pg.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class7/8.Reduced-class 7 samajik Final_zq04sfi.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class8/Class 8 Awadhi_Final_5m783zx.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class8/गणित कक्षा - ८ (नेपाली संस्करण)_zwpacgp.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class8/2. Reduced-class 8 nepali final_ahsi1f6.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class8/विज्ञान तथा प्रविधि कक्षा -८ (ख) नेपाली संस्करण_piy57pg.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class8/3. Reduced-Class 8 Social study final_nl4c3bh.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class9/लेखापरिक्षण कक्षा-९_reo5kar.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class9/अवधी भाषा पाठ्यपुस्तक कक्षा ९_qpczn52.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class9/नागरिक शास्त्र कक्षा ९_sfeefdo.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class9/अर्थशास्त्र कक्षा ९_ddbtrjm.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class9/वातावरण विज्ञान कक्षा-९_ecjvutr.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class9/स्वास्थ्य तथा शारिरिक शिक्षा कक्षा-९_ocfwcgh.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class9/इतिहास कक्षा-९_3kf761a.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class9/class 9 Yakthung Final_8oljr6d.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class9/Maths Grade -9 (Nepali)_ssdrrmo.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class9/6.Reduced-class 9 Nepali_1tgrnzq.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class9/4. Reduced-class 9 account final_9sk9qfx.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class9/ऐच्छिक गणित कक्षा ९, २०८१_compressed_jkmpou5.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class9/class 9 Science final 2082_4echm3f.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class9/सामाजिक अध्ययन - कक्षा 9_gdt0ily.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class10/Grade 10_Aayurveda Final_ypvfk9r.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class10/नागरिक शास्त्र कक्षा-१०, २०७६_vr1mgdx.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class10/Class 10 Economics Final Edit 2082-11-16_ysjzl2g.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class10/शिक्षा कक्षा-१०, २०७६_ucstbcc.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class10/वातावरण विज्ञान कक्षा-१०, २०७६_hyguzql.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class10/download (3)_nyy1bgm.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class10/RS3735_TEXTBOOK GRADE 10 OPTIOANAL HEALTH AND PHYSICAL EDUCATION_bk2njix.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class10/इतिहास कक्षा-१० , २०७६_flavjeh.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class10/गणित कक्षा - १०_ncrmipa.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class10/class 10 Nepali Final_kjvwvtg.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class10/Grade 10_Account final_zeapqrn.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class10/Final OPT math class 10 for Press (11-16)_cljqcad.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class10/2. Reduced-class 10 science Final 11.2.2025_zbgnya7.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class10/1. Reduced-class 10 Samajik Final 2082.5.5_uymulzg.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class10/Grade 10_Yoga Final_h25d3r5.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class11/Grade 11_account final_orerrsn.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class11/व्यवसाय अध्ययन कक्षा-११_kwhxwfa.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class12/Reds- nepali12 four colour_uhkgair.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
- class12/Reds- social12 for web_wis1pow.pdf: Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.
