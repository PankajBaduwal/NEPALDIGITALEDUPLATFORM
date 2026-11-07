# Nepal Curriculum — Extraction Report

Generated: 2026-11-02 12:34:58 UTC.

## Method

1. **Class** comes from the `classN` folder. Files in `Curriculum (T)` and `Teaching Materials` are reference documents, not class textbooks.
2. **Text layer**: each PDF is parsed with pdf-parse. Text is classed as English, Unicode Nepali, legacy Preeti-font Nepali, or none (scanned).
3. **Subject**: matched from the cover text (first pages) and from the filename. When the two disagree, the cover wins and the conflict is logged.
4. **Medium**: taken from the language the book is printed in. Language subjects (English, Nepali, mother tongues) use one book for both media and are marked `BOTH`. Scanned books are classed from filename words such as "अंग्रेजी अनुवाद" (English translation) and flagged for review.
5. **Chapters** come only from a printed *Contents* page, mapped to PDF pages by finding each title in the body. No chapter, topic or learning objective is generated when the book does not state it.

## Results

| Measure | Value |
| --- | --- |
| Class textbooks | 126 |
| Self-study (स्वाध्याय) workbooks | 3 |
| TVET curriculum documents | 5 |
| Teacher resource documents | 7 |
| Confidence HIGH (cover text confirms subject and medium) | 90 |
| Confidence MEDIUM (one source of evidence) | 51 |
| Confidence LOW | 0 |
| Books with chapters read from the contents page | 18 |
| Chapters extracted | 300 |

## Subjects identified

| Subject | नेपाली | Category | Classes | Media |
| --- | --- | --- | --- | --- |
| Accountancy | लेखाविधि | STREAM | 11 | NEPALI |
| Auditing | लेखापरीक्षण | OPTIONAL | 9 | NEPALI |
| Awadhi Language | अवधी भाषा | MOTHER_TONGUE | 8, 9 | BOTH |
| Ayurveda | आयुर्वेद | OPTIONAL | 10 | NEPALI |
| Bantawa Language | बान्तवा भाषा | MOTHER_TONGUE | 6 | BOTH |
| Biology | जीवशास्त्र | STREAM | 11, 12 | ENGLISH |
| Business Studies | व्यवसाय अध्ययन | STREAM | 11 | NEPALI |
| Kirat Rai Chamling Language | किरात राई चाम्लिङ भाषा | MOTHER_TONGUE | 7 | BOTH |
| Chemistry | रसायनशास्त्र | STREAM | 11, 12 | ENGLISH |
| Chepang Language | चेपाङ भाषा | MOTHER_TONGUE | 5 | BOTH |
| Civics | नागरिक शास्त्र | OPTIONAL | 9, 10 | NEPALI |
| Computer Science | कम्प्युटर विज्ञान | OPTIONAL | 9, 10 | ENGLISH |
| Economics | अर्थशास्त्र | OPTIONAL | 9, 10 | NEPALI |
| Education | शिक्षा | OPTIONAL | 9, 10 | NEPALI |
| English | अङ्ग्रेजी | LANGUAGE | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 | BOTH |
| Environment Science | वातावरण विज्ञान | OPTIONAL | 9, 10 | NEPALI |
| Geography | भूगोल | OPTIONAL | 10 | NEPALI |
| Health, Physical and Creative Arts | स्वास्थ्य, शारीरिक तथा सिर्जनात्मक कला | CORE | 4, 5, 6, 7, 8 | ENGLISH, NEPALI |
| Health and Physical Education | स्वास्थ्य तथा शारीरिक शिक्षा | OPTIONAL | 9, 10 | NEPALI |
| History | इतिहास | OPTIONAL | 9, 10 | NEPALI |
| Khaling Language | खालिङ भाषा | MOTHER_TONGUE | 5 | BOTH |
| Limbu (Yakthung) Language | याक्थुङ (लिम्बू) भाषा | MOTHER_TONGUE | 9 | BOTH |
| Magar Language (Athar Magarat) | मगर भाषा (अथार मगरात) | MOTHER_TONGUE | 6, 7 | BOTH |
| Magar Dhut Language | मगर ढुट भाषा | MOTHER_TONGUE | 7 | BOTH |
| Mathematics | गणित | CORE | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | ENGLISH, NEPALI |
| Nepali | नेपाली | LANGUAGE | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 | BOTH |
| Nepal Bhasa | नेपाल भाषा | MOTHER_TONGUE | 7, 9 | BOTH |
| Office Operation and Accounting | कार्यालय सञ्चालन तथा लेखा | OPTIONAL | 9, 10 | NEPALI |
| Optional English | ऐच्छिक अङ्ग्रेजी | OPTIONAL | 10, 11 | BOTH |
| Optional Mathematics | ऐच्छिक गणित | OPTIONAL | 9, 10 | ENGLISH, NEPALI |
| Our Surroundings | हाम्रो सेरोफेरो | CORE | 1, 2, 3 | NEPALI |
| Physics | भौतिकशास्त्र | STREAM | 11, 12 | ENGLISH |
| Population Education | जनसङ्ख्या शिक्षा | OPTIONAL | 9 | NEPALI |
| Science and Technology | विज्ञान तथा प्रविधि | CORE | 4, 5, 6, 7, 8, 9, 10 | ENGLISH, NEPALI |
| Social Studies | सामाजिक अध्ययन | CORE | 4, 5, 6, 7, 8, 9, 10, 11, 12 | NEPALI |
| Yoga Education | योग शिक्षा | OPTIONAL | 10 | NEPALI |

## Per-document classification

| File | Class | Subject | Medium | Printed in | Type | Confidence | Evidence |
| --- | ---: | --- | --- | --- | --- | --- | --- |
| class1/My English Grade 1-2078_rxsqekn.pdf | 1 | English | BOTH | English | TEXTBOOK | MEDIUM | filename → ENGLISH; English is a language subject; one textbook serves both media |
| class1/मेरो गणित कक्षा १ (अंग्रेजी अनुवाद)_cckfxvo.pdf | 1 | Mathematics | ENGLISH | English | TEXTBOOK | MEDIUM | filename → MATHEMATICS; Filename marks it as the English translation (no text layer to confirm) |
| class1/मेरो गणित कक्षा १-२०७६_elizyir.pdf | 1 | Mathematics | NEPALI | Nepali | TEXTBOOK | MEDIUM | filename → MATHEMATICS; Body text is Nepali (Preeti font) |
| class1/मेरो नेपाली कक्षा १-२०७६ - Copy_vkavvsb.pdf | 1 | Nepali | BOTH | Nepali | TEXTBOOK | MEDIUM | filename → NEPALI; Nepali is a language subject; one textbook serves both media |
| class1/स्वाध्याय सामग्री मेरो गणित कक्षा १_bzmde1f.pdf | 1 | Mathematics | NEPALI | Nepali | SELF_STUDY | HIGH | filename → MATHEMATICS; cover text → MATHEMATICS; Body text is Nepali (Preeti font) |
| class1/हाम्रो सेफोफेरो कक्षा १_nafsu84.pdf | 1 | Our Surroundings | NEPALI | Nepali | TEXTBOOK | MEDIUM | filename → OUR_SURROUNDINGS; Body text is Nepali (Preeti font) |
| class2/0002_MyMathematics2NepaliEdition_ma2mzgd.pdf | 2 | Mathematics | NEPALI | Nepali | TEXTBOOK | MEDIUM | filename → MATHEMATICS; Body text is Nepali (Preeti font) |
| class2/My English Grade 2-2021_pypxs5t.pdf | 2 | English | BOTH | English | TEXTBOOK | MEDIUM | filename → ENGLISH; English is a language subject; one textbook serves both media |
| class2/मेरो गणित कक्षा २ (अंग्रेजी अनुवाद)_yl8tjct.pdf | 2 | Mathematics | ENGLISH | English | TEXTBOOK | MEDIUM | filename → MATHEMATICS; Filename marks it as the English translation (no text layer to confirm) |
| class2/मेरो नेपाली कक्षा २-२०७८_mmqokgx.pdf | 2 | Nepali | BOTH | Nepali | TEXTBOOK | MEDIUM | filename → NEPALI; Nepali is a language subject; one textbook serves both media |
| class2/स्वाध्याय सामग्री मेरो गणित कक्षा २ (नेपाली माध्यम)_q5ko2f3.pdf | 2 | Mathematics | NEPALI | Nepali | SELF_STUDY | HIGH | filename → MATHEMATICS; cover text → MATHEMATICS; Body text is Nepali (Preeti font) |
| class2/हाम्रो सेरोफेरो कक्षा २-२०७८_i5hjyqx.pdf | 2 | Our Surroundings | NEPALI | Nepali | TEXTBOOK | MEDIUM | filename → OUR_SURROUNDINGS; Body text is Nepali (Preeti font) |
| class3/My English Grade 3-2021_zuaeyhr.pdf | 3 | English | BOTH | English | TEXTBOOK | MEDIUM | filename → ENGLISH; English is a language subject; one textbook serves both media |
| class3/मेरो गणित कक्षा ३ (अंग्रेजी अनुवाद)_278vnbo.pdf | 3 | Mathematics | ENGLISH | English | TEXTBOOK | MEDIUM | filename → MATHEMATICS; Filename marks it as the English translation (no text layer to confirm) |
| class3/मेरो गणित कक्षा ३-२०७८_imbltzd.pdf | 3 | Mathematics | NEPALI | Nepali | TEXTBOOK | HIGH | filename → MATHEMATICS; cover text → MATHEMATICS; Body text is Nepali (Preeti font) |
| class3/मेरो नेपाली कक्षा ३-२०७८_jfxs4bm.pdf | 3 | Nepali | BOTH | Nepali | TEXTBOOK | MEDIUM | filename → NEPALI; Nepali is a language subject; one textbook serves both media |
| class3/स्वाध्याय सामग्री मेरो गणित कक्षा ३_7cy6jfw.pdf | 3 | Mathematics | NEPALI | Nepali | SELF_STUDY | HIGH | filename → MATHEMATICS; cover text → MATHEMATICS; Body text is Nepali (Preeti font) |
| class3/हाम्रो सेफोफेरो कक्षा ३_gbzlusp.pdf | 3 | Our Surroundings | NEPALI | Nepali | TEXTBOOK | MEDIUM | filename → OUR_SURROUNDINGS; Body text is Nepali (Preeti font) |
| class4/HPC कक्षा ४ (अंग्रेजी संस्करण)_lmoifyz.pdf | 4 | Health, Physical and Creative Arts | ENGLISH | English | TEXTBOOK | MEDIUM | filename → HEALTH_PHYSICAL_CREATIVE_ARTS; Filename marks it as the English translation (no text layer to confirm) |
| class4/hpc4 - Copy_apuzafd.pdf | 4 | Health, Physical and Creative Arts | NEPALI | Nepali | TEXTBOOK | HIGH | filename → HEALTH_PHYSICAL_CREATIVE_ARTS; cover text → HEALTH_PHYSICAL_CREATIVE_ARTS; Body text is Nepali (Preeti font) |
| class4/my english 4_z5npyuo.pdf | 4 | English | BOTH | English | TEXTBOOK | HIGH | filename → ENGLISH; cover text → ENGLISH; English is a language subject; one textbook serves both media |
| class4/my math 4_oxm1wxn.pdf | 4 | Mathematics | NEPALI | Nepali | TEXTBOOK | HIGH | filename → MATHEMATICS; cover text → MATHEMATICS; Body text is Nepali (Preeti font) |
| class4/my nepali 4_hmvu8hd.pdf | 4 | Nepali | BOTH | Nepali | TEXTBOOK | HIGH | filename → NEPALI; cover text → NEPALI; Nepali is a language subject; one textbook serves both media |
| class4/science 4_qczmo4f.pdf | 4 | Science and Technology | NEPALI | Nepali | TEXTBOOK | HIGH | filename → SCIENCE; cover text → SCIENCE; Body text is Nepali (Preeti font) |
| class4/गणित कक्षा ४ (अंग्रेजी अनुवाद)_pvmidzb.pdf | 4 | Mathematics | ENGLISH | English | TEXTBOOK | MEDIUM | filename → MATHEMATICS; Filename marks it as the English translation (no text layer to confirm) |
| class4/विज्ञान तथा प्रविधि कक्षा-४ (अंग्रेजी अनुवाद)_vr8r2hm.pdf | 4 | Science and Technology | ENGLISH | English | TEXTBOOK | MEDIUM | filename → SCIENCE; Filename marks it as the English translation (no text layer to confirm) |
| class4/सामाजिक अध्ययन तथा मानव मूल्य कक्षा ४_x4w7kt9.pdf | 4 | Social Studies | NEPALI | Nepali | TEXTBOOK | HIGH | filename → SOCIAL_STUDIES; Manually verified: Scanned PDF; page 1 rendered and inspected 2026-11-02: cover reads 'सामाजिक अध्ययन तथा मानव मूल्य शिक्षा, कक्षा ४' in Devanagari |
| class5/class 5 health_fyd66vj.pdf | 5 | Health, Physical and Creative Arts | NEPALI | Nepali | TEXTBOOK | HIGH | cover text → HEALTH_PHYSICAL_CREATIVE_ARTS; Body text is Nepali (Preeti font) |
| class5/अंग्रेजी कक्षा ५_xkoobwo.pdf | 5 | English | BOTH | English | TEXTBOOK | HIGH | filename → ENGLISH; cover text → ENGLISH; English is a language subject; one textbook serves both media |
| class5/खालिङ भाषा पाठ्यपुस्तक कक्षा ५_wgmditf.pdf | 5 | Khaling Language | BOTH | Khaling | TEXTBOOK | MEDIUM | filename → KHALING; Khaling Language is a language subject; one textbook serves both media |
| class5/गणित कक्षा ५ (अंग्रजी अनुवाद)_agnb8n4.pdf | 5 | Mathematics | ENGLISH | English | TEXTBOOK | HIGH | filename → MATHEMATICS; cover text → MATHEMATICS; Cover and body text are English |
| class5/गणित कक्षा ५ (नेपाली संस्करण)_3kpojvv.pdf | 5 | Mathematics | NEPALI | Nepali | TEXTBOOK | HIGH | filename → MATHEMATICS; cover text → MATHEMATICS; Body text is Nepali (Preeti font) |
| class5/चेपाङ भाषा पाठ्यपुस्तक कक्षा ५_zzlroot.pdf | 5 | Chepang Language | BOTH | Chepang | TEXTBOOK | MEDIUM | filename → CHEPANG; Chepang Language is a language subject; one textbook serves both media |
| class5/नेपाली कक्षा ५_etjdqfw.pdf | 5 | Nepali | BOTH | Nepali | TEXTBOOK | HIGH | filename → NEPALI; cover text → NEPALI; Nepali is a language subject; one textbook serves both media |
| class5/विज्ञान तथा प्रविधि कक्षा ५ (अंग्रजी अनुवाद)_i4myx5b.pdf | 5 | Science and Technology | ENGLISH | English | TEXTBOOK | MEDIUM | filename → SCIENCE; Filename marks it as the English translation (no text layer to confirm) |
| class5/विज्ञान तथा प्रविधि कक्षा ५ (नेपाली संस्करण)_lhcgijf.pdf | 5 | Science and Technology | NEPALI | Nepali | TEXTBOOK | HIGH | filename → SCIENCE; cover text → SCIENCE; Body text is Nepali (Preeti font) |
| class5/सामाजिक अध्ययन तथा मानव मुल्यमान्यता कक्षा ५ (नेपाली संस्करण)_srmp9sk.pdf | 5 | Social Studies | NEPALI | Nepali | TEXTBOOK | HIGH | filename → SOCIAL_STUDIES; cover text → SOCIAL_STUDIES; Body text is Nepali (Preeti font) |
| class6/5.Reduced-Class 6 Social Final_l9n6lkg.pdf | 6 | Social Studies | NEPALI | Nepali | TEXTBOOK | HIGH | filename → SOCIAL_STUDIES; cover text → SOCIAL_STUDIES; Body text is Nepali (Preeti font) |
| class6/Class 6 Bantawa Final 7.24_fg8ser2.pdf | 6 | Bantawa Language | BOTH | Bantawa | TEXTBOOK | MEDIUM | filename → BANTAWA; Bantawa Language is a language subject; one textbook serves both media |
| class6/English Grade-6-2025_9sexarz.pdf | 6 | English | BOTH | English | TEXTBOOK | MEDIUM | filename → ENGLISH; English is a language subject; one textbook serves both media |
| class6/hpc6_myg8e4n.pdf | 6 | Health, Physical and Creative Arts | NEPALI | Nepali | TEXTBOOK | HIGH | filename → HEALTH_PHYSICAL_CREATIVE_ARTS; cover text → HEALTH_PHYSICAL_CREATIVE_ARTS; Body text is Nepali (Preeti font) |
| class6/गणित कक्षा ६-2078_h7fxaj7.pdf | 6 | Mathematics | NEPALI | Nepali | TEXTBOOK | HIGH | filename → MATHEMATICS; cover text → MATHEMATICS; Body text is Nepali (Preeti font) |
| class6/नेपाली कक्षा ६-2082_6evwjnp.pdf | 6 | Nepali | BOTH | Nepali | TEXTBOOK | MEDIUM | filename → NEPALI; Nepali is a language subject; one textbook serves both media |
| class6/मगर भाषा पाठ्यपुस्तक कक्षा ६_5t4u2mp.pdf | 6 | Magar Language (Athar Magarat) | BOTH | Magar | TEXTBOOK | MEDIUM | filename → MAGAR_ATHAR; Magar Language (Athar Magarat) is a language subject; one textbook serves both media |
| class6/मेरो गणित - कक्षा ६ (अंग्रेजी अनुवाद)_6wbslaj.pdf | 6 | Mathematics | ENGLISH | English | TEXTBOOK | MEDIUM | filename → MATHEMATICS; Filename marks it as the English translation (no text layer to confirm) |
| class6/विज्ञान तथा प्रविधि कक्षा ६ (अंग्रजी अनुवाद)_k7zzrbw.pdf | 6 | Science and Technology | ENGLISH | English | TEXTBOOK | MEDIUM | filename → SCIENCE; Filename marks it as the English translation (no text layer to confirm) |
| class6/विज्ञान तथा प्रविधि कक्षा ६-2078_sviowyj.pdf | 6 | Science and Technology | NEPALI | Nepali | TEXTBOOK | HIGH | filename → SCIENCE; cover text → SCIENCE; Body text is Nepali (Preeti font) |
| class6/स्वास्थ्य, शारीरिक तथा सिर्जनात्मक कला कक्षा-६ (अंग्रेजी संस्करण)_d8xkses.pdf | 6 | Health, Physical and Creative Arts | ENGLISH | English | TEXTBOOK | MEDIUM | filename → HEALTH_PHYSICAL_CREATIVE_ARTS; Filename marks it as the English translation (no text layer to confirm) |
| class7/0007_MathematicsGrade7EnglishTranslation_fqz5dkt.pdf | 7 | Mathematics | ENGLISH | English | TEXTBOOK | HIGH | filename → MATHEMATICS; cover text → MATHEMATICS; Cover and body text are English |
| class7/0007_MathsGrade7NepaliEdition_gtyci7i.pdf | 7 | Mathematics | NEPALI | Nepali | TEXTBOOK | HIGH | filename → MATHEMATICS; cover text → MATHEMATICS; Body text is Nepali (Preeti font) |
| class7/1. class 7 health final-compressed_pqmbsce.pdf | 7 | Health, Physical and Creative Arts | NEPALI | Nepali | TEXTBOOK | HIGH | cover text → HEALTH_PHYSICAL_CREATIVE_ARTS; Body text is Nepali (Preeti font) |
| class7/6. Reduced-class 7 English final_lro4mmc.pdf | 7 | English | BOTH | English | TEXTBOOK | HIGH | filename → ENGLISH; cover text → ENGLISH; English is a language subject; one textbook serves both media |
| class7/7.Reduced-class 7 Nepali final_lnxtmxf.pdf | 7 | Nepali | BOTH | Nepali | TEXTBOOK | MEDIUM | filename → NEPALI; Nepali is a language subject; one textbook serves both media |
| class7/8.Reduced-class 7 samajik Final_zq04sfi.pdf | 7 | Social Studies | NEPALI | Nepali | TEXTBOOK | HIGH | filename → SOCIAL_STUDIES; cover text → SOCIAL_STUDIES; Body text is Nepali (Preeti font) |
| class7/9.Reduced-class 7 science final_ypdi9pg.pdf | 7 | Science and Technology | NEPALI | Nepali | TEXTBOOK | HIGH | filename → SCIENCE; cover text → SCIENCE; Body text is Nepali (Preeti font) |
| class7/Chamling Class 7 Final_wp3hlrn.pdf | 7 | Kirat Rai Chamling Language | BOTH | Kirat Rai Chamling | TEXTBOOK | MEDIUM | filename → CHAMLING; Kirat Rai Chamling Language is a language subject; one textbook serves both media |
| class7/Class 7 magar dhut final_gat5lib.pdf | 7 | Magar Dhut Language | BOTH | Magar Dhut | TEXTBOOK | MEDIUM | filename → MAGAR_DHUT; Magar Dhut Language is a language subject; one textbook serves both media |
| class7/Class 7 Nepalbhasa final_rkdnpjz.pdf | 7 | Nepal Bhasa | BOTH | Nepal Bhasa | TEXTBOOK | MEDIUM | filename → NEPAL_BHASA; Nepal Bhasa is a language subject; one textbook serves both media |
| class7/Health, Physical and Creative Arts Grade-7 (English Translation)_ivrj0ll.pdf | 7 | Health, Physical and Creative Arts | ENGLISH | English | TEXTBOOK | MEDIUM | filename → HEALTH_PHYSICAL_CREATIVE_ARTS; Filename marks it as the English translation (no text layer to confirm) |
| class7/Science and Technology Grade 7(English Translation) Reduced_yvhc6cc.pdf | 7 | Science and Technology | ENGLISH | English | TEXTBOOK | MEDIUM | filename → SCIENCE; Filename marks it as the English translation (no text layer to confirm) |
| class7/मगर भाषा पाठ्यपुस्तक कक्षा ७_f7u9vvp.pdf | 7 | Magar Language (Athar Magarat) | BOTH | Magar | TEXTBOOK | MEDIUM | filename → MAGAR_ATHAR; Magar Language (Athar Magarat) is a language subject; one textbook serves both media |
| class8/1. Reduced-class 8 English final_vfiq0xm.pdf | 8 | English | BOTH | English | TEXTBOOK | HIGH | filename → ENGLISH; cover text → ENGLISH; English is a language subject; one textbook serves both media |
| class8/2. Reduced-class 8 nepali final_ahsi1f6.pdf | 8 | Nepali | BOTH | Nepali | TEXTBOOK | MEDIUM | filename → NEPALI; Nepali is a language subject; one textbook serves both media |
| class8/3. Reduced-Class 8 Social study final_nl4c3bh.pdf | 8 | Social Studies | NEPALI | Nepali | TEXTBOOK | HIGH | filename → SOCIAL_STUDIES; cover text → SOCIAL_STUDIES; Body text is Nepali (Preeti font) |
| class8/Class 8 Awadhi_Final_5m783zx.pdf | 8 | Awadhi Language | BOTH | Awadhi | TEXTBOOK | MEDIUM | filename → AWADHI; Awadhi Language is a language subject; one textbook serves both media |
| class8/MATHEMATICS 8 2023_lyfee4d.pdf | 8 | Mathematics | ENGLISH | English | TEXTBOOK | HIGH | filename → MATHEMATICS; cover text → MATHEMATICS; Cover and body text are English |
| class8/गणित कक्षा - ८ (नेपाली संस्करण)_zwpacgp.pdf | 8 | Mathematics | NEPALI | Nepali | TEXTBOOK | HIGH | filename → MATHEMATICS; cover text → MATHEMATICS; Body text is Nepali (Preeti font) |
| class8/विज्ञान तथा प्रविधि (अङ्ग्रेजी अनुवाद) कक्षा ८ (क)_a3cai6y.pdf | 8 | Science and Technology | ENGLISH | English | TEXTBOOK | HIGH | filename → SCIENCE; cover text → SCIENCE; Cover and body text are English |
| class8/विज्ञान तथा प्रविधि कक्षा -८ (ख) नेपाली संस्करण_piy57pg.pdf | 8 | Science and Technology | NEPALI | Nepali | TEXTBOOK | HIGH | filename → SCIENCE; cover text → SCIENCE; Body text is Nepali (Preeti font) |
| class8/स्वास्थ्य, शारीरिक तथा सिर्जनात्मक कला कक्षा ८ (अङ्ग्रेजी अनुवाद)_mxy4m6m.pdf | 8 | Health, Physical and Creative Arts | ENGLISH | English | TEXTBOOK | HIGH | filename → HEALTH_PHYSICAL_CREATIVE_ARTS; cover text → HEALTH_PHYSICAL_CREATIVE_ARTS; Cover and body text are English |
| class8/स्वास्थ्य, शारीरिक तथा सिर्जनात्मक कला कक्षा ८ (नेपाली संस्करण)_xptqvop.pdf | 8 | Health, Physical and Creative Arts | NEPALI | Nepali | TEXTBOOK | MEDIUM | filename → HEALTH_PHYSICAL_CREATIVE_ARTS; Filename marks it as the Nepali edition (no text layer to confirm) |
| class9/4. Reduced-class 9 account final_9sk9qfx.pdf | 9 | Office Operation and Accounting | NEPALI | Nepali | TEXTBOOK | HIGH | cover text → OFFICE_OPERATION_ACCOUNTING; Body text is Nepali (Preeti font) |
| class9/6.Reduced-class 9 Nepali_1tgrnzq.pdf | 9 | Nepali | BOTH | Nepali | TEXTBOOK | MEDIUM | filename → NEPALI; Nepali is a language subject; one textbook serves both media |
| class9/class 9 English final_kfmalm2.pdf | 9 | English | BOTH | English | TEXTBOOK | HIGH | filename → ENGLISH; cover text → ENGLISH; English is a language subject; one textbook serves both media |
| class9/class 9 population 22 mangsir 2082 Final_aohanvo.pdf | 9 | Population Education | NEPALI | Nepali | TEXTBOOK | MEDIUM | filename → POPULATION_EDUCATION; Body text is Nepali (Unicode) |
| class9/class 9 Science final 2082_4echm3f.pdf | 9 | Science and Technology | NEPALI | Nepali | TEXTBOOK | HIGH | filename → SCIENCE; cover text → SCIENCE; Body text is Nepali (Preeti font) |
| class9/class 9 Yakthung Final_8oljr6d.pdf | 9 | Limbu (Yakthung) Language | BOTH | Limbu (Yakthung) | TEXTBOOK | MEDIUM | filename → LIMBU_YAKTHUNG; Limbu (Yakthung) Language is a language subject; one textbook serves both media |
| class9/Computer Science Grade 9_r12pxcl.pdf | 9 | Computer Science | ENGLISH | English | TEXTBOOK | HIGH | filename → COMPUTER_SCIENCE; cover text → COMPUTER_SCIENCE; Cover and body text are English |
| class9/Grade 9_nepal bhasa final_a9n2zyd.pdf | 9 | Nepal Bhasa | BOTH | Nepal Bhasa | TEXTBOOK | MEDIUM | filename → NEPAL_BHASA; Nepal Bhasa is a language subject; one textbook serves both media |
| class9/Mathematics Grade 9 (English Translation) Part 1_lnvm4wp.pdf | 9 | Mathematics | ENGLISH | English | TEXTBOOK | MEDIUM | filename → MATHEMATICS; Filename marks it as the English translation (no text layer to confirm) |
| class9/Maths Grade -9 (Nepali)_ssdrrmo.pdf | 9 | Mathematics | NEPALI | Nepali | TEXTBOOK | HIGH | filename → MATHEMATICS; cover text → MATHEMATICS; Body text is Nepali (Preeti font) |
| class9/Optional Mathematics Grade 9 (2082)_pktos0d.pdf | 9 | Optional Mathematics | ENGLISH | English | TEXTBOOK | HIGH | filename → OPTIONAL_MATHEMATICS; cover text → OPTIONAL_MATHEMATICS; Cover and body text are English |
| class9/Science and Technology Grade -9 (English Translation)_v0nphvf.pdf | 9 | Science and Technology | ENGLISH | English | TEXTBOOK | MEDIUM | filename → SCIENCE; Filename marks it as the English translation (no text layer to confirm) |
| class9/अर्थशास्त्र कक्षा ९_ddbtrjm.pdf | 9 | Economics | NEPALI | Nepali | TEXTBOOK | HIGH | filename → ECONOMICS; cover text → ECONOMICS; Body text is Nepali (Preeti font) |
| class9/अवधी भाषा पाठ्यपुस्तक कक्षा ९_qpczn52.pdf | 9 | Awadhi Language | BOTH | Awadhi | TEXTBOOK | MEDIUM | filename → AWADHI; Awadhi Language is a language subject; one textbook serves both media |
| class9/इतिहास कक्षा-९_3kf761a.pdf | 9 | History | NEPALI | Nepali | TEXTBOOK | HIGH | filename → HISTORY; cover text → HISTORY; Body text is Nepali (Preeti font) |
| class9/ऐच्छिक गणित कक्षा ९, २०८१_compressed_jkmpou5.pdf | 9 | Optional Mathematics | NEPALI | Nepali | TEXTBOOK | HIGH | filename → OPTIONAL_MATHEMATICS; cover text → OPTIONAL_MATHEMATICS; Body text is Nepali (Preeti font) |
| class9/नागरिक शास्त्र कक्षा ९_sfeefdo.pdf | 9 | Civics | NEPALI | Nepali | TEXTBOOK | HIGH | filename → CIVICS; cover text → CIVICS; Body text is Nepali (Preeti font) |
| class9/लेखापरिक्षण कक्षा-९_reo5kar.pdf | 9 | Auditing | NEPALI | Nepali | TEXTBOOK | HIGH | filename → AUDITING; cover text → AUDITING; Body text is Nepali (Preeti font) |
| class9/वातावरण विज्ञान कक्षा-९_ecjvutr.pdf | 9 | Environment Science | NEPALI | Nepali | TEXTBOOK | HIGH | filename → ENVIRONMENT_SCIENCE; cover text → ENVIRONMENT_SCIENCE; Body text is Nepali (Preeti font) |
| class9/शिक्षा कक्षा ९_dkmivc2.pdf | 9 | Education | NEPALI | Nepali | TEXTBOOK | HIGH | filename → EDUCATION; Manually verified: Scanned PDF; page 1 rendered and inspected 2026-11-02: cover reads 'शिक्षा, कक्षा ९' in Devanagari |
| class9/सामाजिक अध्ययन - कक्षा 9_gdt0ily.pdf | 9 | Social Studies | NEPALI | Nepali | TEXTBOOK | HIGH | filename → SOCIAL_STUDIES; cover text → SOCIAL_STUDIES; Body text is Nepali (Preeti font) |
| class9/स्वास्थ्य तथा शारिरिक शिक्षा कक्षा-९_ocfwcgh.pdf | 9 | Health and Physical Education | NEPALI | Nepali | TEXTBOOK | HIGH | filename → HEALTH_PHYSICAL_EDUCATION; cover text → HEALTH_PHYSICAL_EDUCATION; Body text is Nepali (Preeti font) |
| class10/1. Reduced-class 10 Samajik Final 2082.5.5_uymulzg.pdf | 10 | Social Studies | NEPALI | Nepali | TEXTBOOK | HIGH | filename → SOCIAL_STUDIES; cover text → SOCIAL_STUDIES; Body text is Nepali (Preeti font) |
| class10/2. Reduced-class 10 science Final 11.2.2025_zbgnya7.pdf | 10 | Science and Technology | NEPALI | Nepali | TEXTBOOK | HIGH | filename → SCIENCE; cover text → SCIENCE; Body text is Nepali (Preeti font) |
| class10/9.Reduced-class 10 English Final_hsjc8bm.pdf | 10 | English | BOTH | English | TEXTBOOK | HIGH | filename → ENGLISH; cover text → ENGLISH; English is a language subject; one textbook serves both media |
| class10/Class 10 Economics Final Edit 2082-11-16_ysjzl2g.pdf | 10 | Economics | NEPALI | Nepali | TEXTBOOK | HIGH | filename → ECONOMICS; cover text → ECONOMICS; Body text is Nepali (Preeti font) |
| class10/class 10 Nepali Final_kjvwvtg.pdf | 10 | Nepali | BOTH | Nepali | TEXTBOOK | MEDIUM | filename → NEPALI; Nepali is a language subject; one textbook serves both media |
| class10/CSGrade 10_rs8obhn.pdf | 10 | Computer Science | ENGLISH | English | TEXTBOOK | HIGH | filename → COMPUTER_SCIENCE; cover text → COMPUTER_SCIENCE; Cover and body text are English |
| class10/download (3)_nyy1bgm.pdf | 10 | Geography | NEPALI | Nepali | TEXTBOOK | HIGH | cover text → GEOGRAPHY; Body text is Nepali (Preeti font) |
| class10/download (4)_fqnvhyr.pdf | 10 | Optional English | BOTH | English | TEXTBOOK | HIGH | cover text → OPTIONAL_ENGLISH; Optional English is a language subject; one textbook serves both media |
| class10/Final OPT math class 10 for Press (11-16)_cljqcad.pdf | 10 | Optional Mathematics | NEPALI | Nepali | TEXTBOOK | HIGH | filename → OPTIONAL_MATHEMATICS; cover text → OPTIONAL_MATHEMATICS; Body text is Nepali (Preeti font) |
| class10/Grade 10_Aayurveda Final_ypvfk9r.pdf | 10 | Ayurveda | NEPALI | Nepali | TEXTBOOK | MEDIUM | filename → AYURVEDA; Body text is Nepali (Preeti font) |
| class10/Grade 10_Account final_zeapqrn.pdf | 10 | Office Operation and Accounting | NEPALI | Nepali | TEXTBOOK | HIGH | cover text → OFFICE_OPERATION_ACCOUNTING; Body text is Nepali (Preeti font) |
| class10/Grade 10_Yoga Final_h25d3r5.pdf | 10 | Yoga Education | NEPALI | Nepali | TEXTBOOK | MEDIUM | filename → YOGA; Body text is Nepali (Preeti font) |
| class10/RS3735_TEXTBOOK GRADE 10 OPTIOANAL HEALTH AND PHYSICAL EDUCATION_bk2njix.pdf | 10 | Health and Physical Education | NEPALI | Nepali | TEXTBOOK | HIGH | filename → HEALTH_PHYSICAL_EDUCATION; cover text → HEALTH_PHYSICAL_EDUCATION; Body text is Nepali (Preeti font) |
| class10/इतिहास कक्षा-१० , २०७६_flavjeh.pdf | 10 | History | NEPALI | Nepali | TEXTBOOK | HIGH | filename → HISTORY; cover text → HISTORY; Body text is Nepali (Preeti font) |
| class10/ऐच्छिक गणित कक्षा - १०_txqqmbs.pdf | 10 | Optional Mathematics | ENGLISH | English | TEXTBOOK | HIGH | filename → OPTIONAL_MATHEMATICS; cover text → OPTIONAL_MATHEMATICS; Cover and body text are English |
| class10/गणित कक्षा - १०_ncrmipa.pdf | 10 | Mathematics | NEPALI | Nepali | TEXTBOOK | HIGH | filename → MATHEMATICS; cover text → MATHEMATICS; Body text is Nepali (Preeti font) |
| class10/गणित कक्षा १० (अंग्रेजी अनुवाद)_ehg7se9.pdf | 10 | Mathematics | ENGLISH | English | TEXTBOOK | MEDIUM | filename → MATHEMATICS; Filename marks it as the English translation (no text layer to confirm) |
| class10/नागरिक शास्त्र कक्षा-१०, २०७६_vr1mgdx.pdf | 10 | Civics | NEPALI | Nepali | TEXTBOOK | HIGH | filename → CIVICS; cover text → CIVICS; Body text is Nepali (Preeti font) |
| class10/वातावरण विज्ञान कक्षा-१०, २०७६_hyguzql.pdf | 10 | Environment Science | NEPALI | Nepali | TEXTBOOK | HIGH | filename → ENVIRONMENT_SCIENCE; cover text → ENVIRONMENT_SCIENCE; Body text is Nepali (Preeti font) |
| class10/विज्ञान तथा प्रविधि (अंग्रेजी अनुवाद) कक्षा १०_wuwdjba.pdf | 10 | Science and Technology | ENGLISH | English | TEXTBOOK | HIGH | filename → SCIENCE; cover text → SCIENCE; Cover and body text are English |
| class10/शिक्षा कक्षा-१०, २०७६_ucstbcc.pdf | 10 | Education | NEPALI | Nepali | TEXTBOOK | HIGH | filename → EDUCATION; cover text → EDUCATION; Body text is Nepali (Preeti font) |
| class11/1. Reduced- Grde-11-Physics_ogc1tkt.pdf | 11 | Physics | ENGLISH | English | TEXTBOOK | HIGH | filename → PHYSICS; cover text → PHYSICS; Cover and body text are English |
| class11/3. Reduced-Biology_grade_11_ck4uozj.pdf | 11 | Biology | ENGLISH | English | TEXTBOOK | HIGH | filename → BIOLOGY; cover text → BIOLOGY; Cover and body text are English |
| class11/5. Reduced-Chemistry grade 11_jndm9il.pdf | 11 | Chemistry | ENGLISH | English | TEXTBOOK | HIGH | filename → CHEMISTRY; cover text → CHEMISTRY; Cover and body text are English |
| class11/Grade 11_account final_orerrsn.pdf | 11 | Accountancy | NEPALI | Nepali | TEXTBOOK | HIGH | cover text → ACCOUNTANCY; Body text is Nepali (Preeti font) |
| class11/Optional English Grade-11_x851zhx.pdf | 11 | Optional English | BOTH | English | TEXTBOOK | HIGH | filename → OPTIONAL_ENGLISH; cover text → OPTIONAL_ENGLISH; Optional English is a language subject; one textbook serves both media |
| class11/Reds-eng 11 for web site_jwout4l.pdf | 11 | English | BOTH | English | TEXTBOOK | MEDIUM | filename → ENGLISH; English is a language subject; one textbook serves both media |
| class11/Reds-nepali11 for web_7k85crc.pdf | 11 | Nepali | BOTH | — | TEXTBOOK | MEDIUM | filename → NEPALI; Nepali is a language subject; one textbook serves both media |
| class11/Reds-social 11_0yfbndw.pdf | 11 | Social Studies | NEPALI | Nepali | TEXTBOOK | HIGH | filename → SOCIAL_STUDIES; Manually verified: Scanned PDF; page 1 rendered and inspected 2026-11-02: cover reads 'सामाजिक अध्ययन तथा जीवनोपयोगी शिक्षा, कक्षा ११' in Devanagari |
| class11/व्यवसाय अध्ययन कक्षा-११_kwhxwfa.pdf | 11 | Business Studies | NEPALI | Nepali | TEXTBOOK | HIGH | filename → BUSINESS_STUDIES; cover text → BUSINESS_STUDIES; Body text is Nepali (Preeti font) |
| class12/2. Reduced-Biology Class 12_twjkcfx.pdf | 12 | Biology | ENGLISH | English | TEXTBOOK | HIGH | filename → BIOLOGY; cover text → BIOLOGY; Cover and body text are English |
| class12/4. Reduced-Chemistry Class 12_uy406wi.pdf | 12 | Chemistry | ENGLISH | English | TEXTBOOK | HIGH | filename → CHEMISTRY; cover text → CHEMISTRY; Cover and body text are English |
| class12/6. Physics Grade 12_hlufw8m.pdf | 12 | Physics | ENGLISH | English | TEXTBOOK | HIGH | filename → PHYSICS; cover text → PHYSICS; Cover and body text are English |
| class12/Reds- nepali12 four colour_uhkgair.pdf | 12 | Nepali | BOTH | Nepali | TEXTBOOK | HIGH | filename → NEPALI; cover text → NEPALI; Nepali is a language subject; one textbook serves both media |
| class12/Reds- social12 for web_wis1pow.pdf | 12 | Social Studies | NEPALI | Nepali | TEXTBOOK | HIGH | filename → SOCIAL_STUDIES; cover text → SOCIAL_STUDIES; Body text is Nepali (Preeti font) |
| class12/Reds-eng 12 for website_yjjiry3.pdf | 12 | English | BOTH | English | TEXTBOOK | MEDIUM | filename → ENGLISH; English is a language subject; one textbook serves both media |
| Curriculum (T)/1694337718_jx35alj.pdf | 9–12 | — | — | English | CURRICULUM | HIGH | folder "Curriculum (T)" → CURRICULUM; Cover and body text are English |
| Curriculum (T)/Secondary Level School Curriculum (Grade 9 - 12) Animal Science (Technical and Vocational Stream)_f2y6v9d.pdf | 9–12 | — | — | English | CURRICULUM | HIGH | folder "Curriculum (T)" → CURRICULUM; Cover and body text are English |
| Curriculum (T)/Secondary Level School Curriculum (Grade 9 - 12) Civil Engineering (Technical and Vocational Stream)_uoeeqaf.pdf | 9–12 | — | — | English | CURRICULUM | HIGH | folder "Curriculum (T)" → CURRICULUM; Cover and body text are English |
| Curriculum (T)/Secondary Level School Curriculum (Grade 9 - 12) Electrical Engineering (Technical and Vocational Stream)_4shhbjz.pdf | 9–12 | — | — | English | CURRICULUM | HIGH | folder "Curriculum (T)" → CURRICULUM; Cover and body text are English |
| Curriculum (T)/संगीत शिक्षा कक्षा ९-१० (प्राविधिक तथा व्यावसायिक संकाय )_fqsjhai.pdf | 9–10 | — | — | Nepali | CURRICULUM | HIGH | folder "Curriculum (T)" → CURRICULUM; Body text is Nepali (Preeti font) |
| Teaching Materials/1.Vedabisayasya teacher shrot samagri new final 7.1.2025_6czytjd.pdf | — | — | — | Nepali | TEACHER_RESOURCE | HIGH | folder "Teaching Materials" → TEACHER_RESOURCE; Body text is Nepali (Unicode) |
| Teaching Materials/cultural resource final- शि. सन्द._kdmbtcu.pdf | — | — | — | Nepali | TEACHER_RESOURCE | HIGH | folder "Teaching Materials" → TEACHER_RESOURCE; Body text is Nepali (Preeti font) |
| Teaching Materials/English Composition Grade 6 - 8 (सन्दर्भ एवम् स्व अध्ययन सामग्री)_ybx9l3r.pdf | 6–8 | — | — | English | TEACHER_RESOURCE | HIGH | folder "Teaching Materials" → TEACHER_RESOURCE; Cover and body text are English |
| Teaching Materials/English Composition Grade 9 - 12 (सन्दर्भ एवम् स्व अध्ययन सामग्री)_h2lkhrs.pdf | 9–12 | — | — | English | TEACHER_RESOURCE | HIGH | folder "Teaching Materials" → TEACHER_RESOURCE; Cover and body text are English |
| Teaching Materials/दोस्रो भाषाका रुपमा नेपाली भाषा सिकाइका लागि शिक्षण स्रोत सामग्री_8koizzj.pdf | — | — | — | Nepali | TEACHER_RESOURCE | HIGH | folder "Teaching Materials" → TEACHER_RESOURCE; Body text is Nepali (Preeti font) |
| Teaching Materials/प्रकाशन शैली (House Style)_2sbrcm7.pdf | — | — | — | Nepali | TEACHER_RESOURCE | HIGH | folder "Teaching Materials" → TEACHER_RESOURCE; Body text is Nepali (Preeti font) |
| Teaching Materials/शिशु विकास केन्द्रका सहजकर्ता, अभिभावक तथा स्याहारकर्ताका लागि सहयोगी पुस्तिका_u6ntzlr.pdf | — | — | — | Nepali | TEACHER_RESOURCE | HIGH | folder "Teaching Materials" → TEACHER_RESOURCE; Body text is Nepali (Preeti font) |

## Chapters extracted from contents pages

### Class 2 · English · BOTH — My name : ................................................................ Roll 

| # | Chapter | Printed page | PDF pages | Located in body |
| ---: | --- | ---: | --- | --- |
| 1 | Birendra's Family | 10 | 18–22 | yes |
| 2 | I Love My Family | 15 | 23–26 | yes |
| 3 | Uncle Shiva's Family | 19 | 27–30 | yes |
| 4 | It's Me | 23 | 31–34 | yes |
| 5 | My Body | 27 | 35–38 | yes |
| 6 | I Take Care of My Body | 31 | 39–45 | yes |
| 7 | Before School | 38 | 46–49 | yes |
| 8 | At School | 42 | 50–53 | yes |
| 9 | After School | 46 | 54–57 | yes |
| 10 | On Saturdays | 50 | 58–61 | by offset |
| 11 | At the Zoo | 54 | 62–65 | yes |
| 12 | At a Fair | 58 | 66–72 | yes |
| 13 | Lunch Box Surprise | 65 | 73–76 | yes |
| 14 | Dentist at School | 69 | 77–80 | yes |
| 15 | Homework | 73 | 81–84 | yes |
| 16 | Durbar High School | 77 | 85–88 | yes |
| 17 | Unit Test | 81 | 89–92 | yes |
| 18 | We Are at School | 85 | 93–99 | yes |
| 19 | My House | 92 | 100–104 | yes |
| 20 | My Garden | 97 | 105–108 | yes |
| 21 | My Village | 101 | 109–112 | yes |
| 22 | Weather | 105 | 113–115 | yes |
| 23 | Keeping Clean | 108 | 116–120 | yes |
| 24 | Using Numbers | 113 | 121–127 | yes |
| 25 | Things I Have | 120 | 128–131 | yes |
| 26 | Colours and Objects | 124 | 132–135 | yes |
| 27 | My Clothes | 128 | 136–142 | yes |
| 28 | Our Festivals | 135 | 143–146 | yes |
| 29 | Children's Day | 139 | 147–150 | yes |
| 30 | Months of the Year | 143 | 151–158 | yes |
| 31 | Shopping | 151 | 159–162 | yes |
| 32 | Talking on the Telephone | 155 | 163–166 | yes |
| 33 | What's this? | 159 | 167–170 | yes |
| 34 | Making a List | 163 | 171–177 | yes |
| 35 | Fruits at the Market | 170 | 178–181 | yes |
| 36 | Vegetables at the Market | 174 | 182–184 | yes |
| 37 | Buying Fruits and Vegetables | 177 | 185–191 | yes |
| 38 | I Like | 184 | 192–195 | yes |
| 39 | We are on a Holiday | 188 | 196–199 | yes |
| 40 | Playing Games | 192 | 200–205 | yes |
| 41 | Chicken Little | 198 | 206–210 | yes |
| 42 | Helpful Animals | 203 | 211–214 | yes |
| 43 | Birds and Animals | 207 | 215–219 | yes |
| 44 | What do Animals Eat? | 212 | 220–232 | yes |

### Class 3 · English · BOTH — My name: Roll number: School:

| # | Chapter | Printed page | PDF pages | Located in body |
| ---: | --- | ---: | --- | --- |
| 1 | My Lovely Family | 7 | 15–19 | yes |
| 2 | I'm from Nepal | 12 | 20–25 | yes |
| 3 | Family Chores | 18 | 26–31 | yes |
| 4 | Mother's Day | 24 | 32–35 | yes |
| 5 | What Do They Do? | 28 | 36–44 | yes |
| 6 | Pari's Daily Routine | 37 | 45–49 | yes |
| 7 | My Best Friend | 42 | 50–55 | yes |
| 8 | My Breakfast | 48 | 56–62 | yes |
| 9 | Summer Holiday | 55 | 63–69 | yes |
| 10 | Saturday | 62 | 70–79 | by offset |
| 11 | Going to School | 72 | 80–84 | yes |
| 12 | About My School | 77 | 85–90 | yes |
| 13 | Around My School | 83 | 91–95 | yes |
| 14 | In the Playground | 88 | 96–100 | yes |
| 15 | School Rules | 93 | 101–107 | yes |
| 16 | The Magic Tree | 100 | 108–113 | yes |
| 17 | How Do They Look? | 106 | 114–118 | yes |
| 18 | Seasons | 111 | 119–122 | yes |
| 19 | Let's Talk About Directions | 115 | 123–127 | yes |
| 20 | Where Are My Friends? | 120 | 128–136 | yes |
| 21 | Nita's Room | 129 | 137–142 | yes |
| 22 | My Classroom | 135 | 143–149 | yes |
| 23 | My Clothes | 142 | 150–160 | yes |
| 24 | Musical Instruments | 153 | 161–166 | yes |
| 25 | Our Festivals | 159 | 167–171 | yes |
| 26 | Special Days | 164 | 172–181 | yes |
| 27 | Making a Call | 174 | 182–186 | yes |
| 28 | At a Market Place | 179 | 187–192 | by offset |
| 29 | I Love Shopping | 185 | 193–200 | yes |
| 30 | The Pumpkin in the Jar | 193 | 201–206 | yes |
| 31 | Fruits and Vegetables | 199 | 207–215 | yes |
| 32 | My Hobbies | 208 | 216–219 | yes |
| 33 | My Favourite Sport | 212 | 220–226 | yes |
| 34 | The Penguin | 219 | 227–233 | by offset |
| 35 | The Polar Bear | 226 | 234–248 | yes |

### Class 5 · Mathematics · ENGLISH — Mathematics Grade 5

| # | Chapter | Printed page | PDF pages | Located in body |
| ---: | --- | ---: | --- | --- |
| 1 | Lines and Angles | 1 | 5–31 | yes |
| 2 | Solid Objects | 28 | 32–40 | yes |
| 3 | Number Sense | 37 | 41–63 | yes |
| 4 | Simplification | 60 | 64–70 | yes |
| 5 | Fraction | 67 | 71–89 | yes |
| 6 | Decimal | 86 | 90–103 | yes |
| 7 | Percentage | 100 | 104–118 | yes |
| 8 | Time | 115 | 119–130 | yes |
| 9 | Distance | 127 | 131–138 | yes |
| 10 | Capacity | 135 | 139–144 | yes |
| 11 | Weight | 141 | 145–153 | yes |
| 12 | Perimeter, Area and Volume | 150 | 154–178 | yes |
| 13 | Bill and Budget | 175 | 179–191 | yes |
| 14 | Presentation of Data | 188 | 192–205 | yes |
| 15 | Algebraic Expressions | 202 | 206–228 | yes |

### Class 8 · Mathematics · ENGLISH — Mathematics Class 8

| # | Chapter | Printed page | PDF pages | Located in body |
| ---: | --- | ---: | --- | --- |
| 1 | Set | 1 | 5–16 | by offset |
| 2 | Whole Numbers | 13 | 17–31 | yes |
| 3 | Rational and Irrational Numbers | 28 | 32–48 | by offset |
| 4 | Ratio and Proportion | 45 | 49–59 | by offset |
| 5 | Profit and Loss | 56 | 60–68 | by offset |
| 6 | Unitary Method | 65 | 69–82 | by offset |
| 7 | Simple Interest | 79 | 83–98 | by offset |
| 8 | Area and Volume | 95 | 99–134 | yes |
| 9 | Indices | 131 | 135–141 | yes |
| 10 | Algebraic Expression | 138 | 142–169 | yes |
| 11 | Algebraic Fraction | 166 | 170–188 | yes |
| 12 | Equation and Graph | 185 | 189–202 | by offset |
| 13 | Lines and Angles | 199 | 203–215 | yes |
| 14 | Plane Figures | 212 | 216–252 | yes |
| 15 | Congruency and Similarity | 249 | 253–271 | yes |
| 16 | Solid objects | 268 | 272–279 | yes |
| 17 | Coordinates | 276 | 280–285 | yes |
| 18 | Tessellation | 282 | 286–290 | yes |
| 19 | Transformation | 287 | 291–293 | yes |
| 20 | Bearing and Scale Drawing | 290 | 294–317 | by offset |
| 21 | Statistics | 314 | 318–342 | yes |

### Class 8 · Science and Technology · ENGLISH — Science and Technology Grade 8

| # | Chapter | Printed page | PDF pages | Located in body |
| ---: | --- | ---: | --- | --- |
| 1 | Scientific Learning | 1 | 5–21 | yes |
| 2 | Information and Communication Technology | 18 | 22–58 | yes |
| 3 | Living Beings and Their Structure | 55 | 59–92 | yes |
| 4 | Biodiversity and Environment | 89 | 93–115 | yes |
| 5 | Life Process | 112 | 116–155 | yes |
| 6 | Force and Motion | 152 | 156–188 | yes |
| 7 | Energy in Daily Life | 185 | 189–230 | yes |
| 8 | Electricity and Magnetism | 227 | 231–253 | yes |
| 9 | Matter | 250 | 254–280 | yes |
| 10 | Materials Used in Daily Life | 277 | 281–305 | yes |
| 11 | The Earth and Universe | 302 | 306–337 | yes |

### Class 8 · Health, Physical and Creative Arts · ENGLISH — Health, Physical and Creative Arts Grade 8

| # | Chapter | Printed page | PDF pages | Located in body |
| ---: | --- | ---: | --- | --- |
| 1 | Human body | 1 | 5–18 | yes |
| 2 | Community Health and Mental Health | 15 | 19–33 | yes |
| 3 | Nutrition and Food Security | 30 | 34–47 | yes |
| 4 | Disease, Safety and First Aid | 44 | 48–64 | yes |
| 5 | Sexual and Reproductive Health | 61 | 65–80 | yes |
| 6 | Physical Exercise and Drill | 77 | 81–99 | yes |
| 7 | Athletics and Adventurous Activities | 96 | 100–112 | yes |
| 8 | Games | 109 | 113–143 | yes |
| 9 | Yoga | 140 | 144–150 | yes |
| 10 | Introduction to Arts, Line art and Colour | 147 | 151–167 | yes |
| 11 | Print making, Clay work, Collage and Construction | 164 | 168–183 | yes |
| 12 | Singing and Playing Instrument | 180 | 184–212 | yes |
| 13 | Dance and Acting | 209 | 213–224 | yes |

### Class 9 · Computer Science · ENGLISH — Computer Science Grade - 9

| # | Chapter | Printed page | PDF pages | Located in body |
| ---: | --- | ---: | --- | --- |
| 1 | Computer System | 1 | 5–44 | yes |
| 2 | Number System | 41 | 45–56 | yes |
| 3 | Block Programming | 53 | 57–84 | yes |
| 4 | Web Technology | 81 | 85–146 | yes |
| 5 | Internet and Social Media | 143 | 147–170 | by offset |
| 6 | Cyber Security and Digital Citizenship | 167 | 171–188 | by offset |
| 7 | Concept of Programming | 185 | 189–248 | by offset |

### Class 9 · Optional Mathematics · ENGLISH — Optional Mathematics Grade 9

| # | Chapter | Printed page | PDF pages | Located in body |
| ---: | --- | ---: | --- | --- |
| 1 | Algebra | 1 | 5–92 | by offset |
| 2 | Trigonometry | 89 | 93–149 | yes |
| 3 | Geometry | 146 | 150–209 | yes |
| 4 | Vector | 206 | 210–231 | yes |
| 5 | Statistics | 228 | 232–270 | yes |
| 6 | Limit | 267 | 271–294 | yes |

### Class 10 · Computer Science · ENGLISH — COMPUTER SCIENCE COMPUTER SCIENCE Curriculum Development Center Class 10 Class 1

| # | Chapter | Printed page | PDF pages | Located in body |
| ---: | --- | ---: | --- | --- |
| 1 | Computer Network and Communication | 1 | 8–43 | yes |
| 2 | Database Management System | 37 | 44–87 | yes |
| 3 | Multimedia | 81 | 88–147 | yes |
| 4 | Programming in Python | 141 | 148–235 | yes |
| 5 | AI and Contemporary Technologies | 229 | 236–257 | yes |

### Class 10 · Optional English · BOTH — Optional English (Grade 10)

| # | Chapter | Printed page | PDF pages | Located in body |
| ---: | --- | ---: | --- | --- |
| 1 | Can Zoos Offer more than Entertainment (Argumentative Essay) | 22 | 28–111 | yes |
| 2 | The Ballad of the Landlord | 106 | 112–114 | yes |
| 3 | Song 1 | 109 | 115–116 | yes |
| 4 | Lyric | 111 | 117–118 | yes |
| 5 | Holly Sonnet 10 | 113 | 119–120 | by offset |
| 6 | On His Blindness (sonnet) | 115 | 121–122 | by offset |
| 7 | The World is too much with us | 117 | 123–124 | yes |
| 8 | Prelude 1 (Free Verse) | 119 | 125–126 | by offset |
| 9 | Rain (Free Verse) | 121 | 127–128 | by offset |
| 10 | Valentine (Free Verse) | 123 | 129–141 | by offset |
| 11 | Words (Free Verse) | 136 | 142–143 | by offset |
| 12 | Love Your Enemy (Free Verse) | 138 | 144–277 | by offset |

### Class 10 · Optional Mathematics · ENGLISH — Optional Mathematics Grade 10

| # | Chapter | Printed page | PDF pages | Located in body |
| ---: | --- | ---: | --- | --- |
| 1 | Optional Mathematics, Grade | 10 | 14–14 | yes |
| 2 | Optional Mathematics, Grade | 10 | 14–297 | yes |

### Class 11 · Physics · ENGLISH — PHYSICS Grade 11

| # | Chapter | Printed page | PDF pages | Located in body |
| ---: | --- | ---: | --- | --- |
| 1 | PHYSICAL QUANTITIES | 1 | 6–25 | yes |
| 2 | VECTORS | 21 | 26–45 | yes |
| 3 | KINEMATICS | 41 | 46–77 | yes |
| 4 | DYNAMICS | 73 | 78–107 | yes |
| 5 | WORK, ENERGY & POWER | 103 | 108–136 | yes |
| 6 | CIRCULAR MOTION | 132 | 137–158 | yes |
| 7 | GRAVITATION | 154 | 159–188 | yes |
| 8 | ELASTICITY | 184 | 189–212 | yes |
| 9 | HEAT AND TEMPERATURE | 208 | 213–226 | yes |
| 10 | THERMAL EXPANSION | 222 | 227–250 | yes |
| 11 | QUANTITY OF HEAT | 246 | 251–274 | yes |
| 12 | RATE OF HEAT FLOW | 270 | 275–293 | yes |
| 13 | IDEAL GAS | 289 | 294–311 | yes |
| 14 | REFLECTION AT CURVED MIRROR | 307 | 312–323 | yes |
| 15 | REFRACTION AT PLANE SURFACES | 319 | 324–340 | yes |
| 16 | REFRACTION THROUGH PRISMS | 336 | 341–349 | yes |
| 17 | LENS | 345 | 350–368 | yes |
| 18 | DISPERSION | 364 | 369–382 | yes |
| 19 | ELECTRIC CHARGES | 378 | 383–391 | yes |
| 20 | ELECTRIC FIELD | 387 | 392–407 | yes |
| 21 | ELECTRIC POTENTIAL, POTENTIAL DIFFERENCE AND POTENTIAL ENERGY | 403 | 408–420 | yes |
| 22 | CAPACITORS | 416 | 421–435 | yes |
| 23 | D.C. CIRCUITS | 431 | 436–463 | yes |
| 24 | NUCLEAR PHYSICS | 459 | 464–491 | yes |
| 25 | ENERGY LEVELS | 487 | 492–500 | yes |
| 26 | SOLIDS | 496 | 501–521 | by offset |

### Class 11 · Biology · ENGLISH — BIOLOGY Grade 11

| # | Chapter | Printed page | PDF pages | Located in body |
| ---: | --- | ---: | --- | --- |
| 1 | Biomolecules And Cell Biology | 1 | 6–86 | yes |
| 2 | FLORAL DIVERSITY | 82 | 87–172 | by offset |
| 3 | Introduction to Microbiology | 168 | 173–191 | yes |
| 4 | ECOLOGY | 187 | 192–222 | yes |
| 5 | Vegetation | 218 | 223–233 | yes |
| 6 | Introduction to Biology | 229 | 234–244 | yes |
| 7 | Evolutionary Biology | 240 | 245–288 | yes |
| 8 | Faunal Diversity | 284 | 289–434 | yes |
| 9 | Biota and Environment | 430 | 435–476 | yes |
| 10 | Conservation Biology | 472 | 477–504 | yes |

### Class 11 · Chemistry · ENGLISH — CHEMISTRY Grade 11

| # | Chapter | Printed page | PDF pages | Located in body |
| ---: | --- | ---: | --- | --- |
| 1 | Fundamentals of Chemistry | 1 | 5–34 | by offset |
| 2 | Stoichiometry | 31 | 35–75 | by offset |
| 3 | Atomic Structure | 72 | 76–112 | by offset |
| 4 | Classification of Elements | 109 | 113–142 | by offset |
| 5 | Chemical Bonding and Shapes of Molecules | 139 | 143–215 | by offset |
| 6 | Oxidation and Reduction | 212 | 216–255 | yes |
| 7 | States of Matter | 252 | 256–328 | by offset |
| 8 | Chemical Equilibrium | 325 | 329–353 | by offset |
| 9 | Chemistry of Non-Metals | 350 | 354–466 | by offset |
| 10 | Chemistry of Metals | 463 | 467–527 | by offset |
| 11 | Bioinorganic Chemistry | 524 | 528–544 | by offset |
| 12 | Basic Concept of Organic Chemistry | 541 | 545–572 | by offset |
| 13 | Fundamental Principle of Organic Chemistry | 569 | 573–613 | by offset |
| 14 | Hydrocarbons | 610 | 614–646 | yes |
| 15 | Aromatic Hydrocarbons | 643 | 647–667 | by offset |
| 16 | Fundamentals of Applied Chemistry | 664 | 668–688 | by offset |
| 17 | Modern Chemical Manufactures | 685 | 689–712 | by offset |

### Class 11 · Optional English · BOTH — Grade 11 Optional English 1

| # | Chapter | Printed page | PDF pages | Located in body |
| ---: | --- | ---: | --- | --- |
| 1 | English Literature from Anglo-Saxon to Middle English Period | 3 | 9–15 | yes |
| 2 | English Literature in the Renaissance | 10 | 16–23 | yes |
| 3 | English Literature from Restoration to Eighteenth Century | 18 | 24–36 | yes |
| 4 | English Literature in the Nineteenth Century | 31 | 37–51 | yes |
| 5 | English Literature in the Twentieth Century | 46 | 52–76 | yes |
| 6 | English Literature in the Postmodern Age | 71 | 77–199 | yes |
| 7 | The Woman on Platform No. 8 | 194 | 200–206 | yes |
| 8 | The Seven Ravens | 201 | 207–211 | yes |
| 9 | The Myth of Prometheus | 206 | 212–215 | yes |
| 10 | The Last Question | 210 | 216–230 | yes |
| 11 | Letter from the New Land | 225 | 231–237 | yes |
| 12 | Of Studies | 232 | 238–242 | yes |
| 13 | Our House is on Fire | 237 | 243–247 | yes |
| 14 | The Silk Road in the World History: A Review Essay | 242 | 248–255 | yes |
| 15 | A Piece of Chalk | 250 | 256–260 | yes |
| 16 | The World’s Desire | 255 | 261–266 | yes |
| 17 | Getting in Touch with Aliens | 261 | 267–271 | yes |
| 18 | An Encounter with a Dog | 266 | 272–278 | yes |
| 19 | Beyond the Pandemic | 273 | 279–284 | yes |
| 20 | Why I Write | 279 | 285–480 | yes |

### Class 12 · Biology · ENGLISH — BIOLOGY Grade 12

| # | Chapter | Printed page | PDF pages | Located in body |
| ---: | --- | ---: | --- | --- |
| 1 | PLANT ANATOMY | 1 | 5–35 | yes |
| 2 | PLANT PHYSIOLOGY | 32 | 36–105 | yes |
| 3 | GENETICS | 102 | 106–148 | yes |
| 4 | EMBRYOLOGY | 145 | 149–173 | yes |
| 5 | BIOTECHNOLOGY | 170 | 174–192 | yes |
| 6 | ANIMAL TISSUE | 189 | 193–239 | by offset |
| 7 | DEVELOPMENTAL BIOLOGY | 236 | 240–258 | by offset |
| 8 | HUMAN BIOLOGY | 255 | 259–415 | by offset |
| 9 | HUMAN POPULATION AND HEALTH DISORDER | 412 | 416–479 | yes |
| 10 | APPLIED BIOLOGY | 476 | 480–586 | yes |

### Class 12 · Chemistry · ENGLISH — Chemistry Grade 12

| # | Chapter | Printed page | PDF pages | Located in body |
| ---: | --- | ---: | --- | --- |
| 1 | Volumetric Analysis | 1 | 5–38 | yes |
| 2 | Ionic Equilibrium | 35 | 39–88 | yes |
| 3 | Chemical Kinetics | 85 | 89–131 | yes |
| 4 | Chemical thermodynamics | 128 | 132–176 | yes |
| 5 | ELECTROCHEMISTRY | 173 | 177–197 | yes |
| 6 | Transitions Metals | 194 | 198–210 | yes |
| 7 | Study of Heavy Metals | 207 | 211–280 | yes |
| 8 | HALOALKANES | 277 | 281–311 | yes |
| 9 | HALOARENES | 308 | 312–325 | yes |
| 10 | Alcohols | 322 | 326–351 | yes |
| 11 | PHENOL | 348 | 352–372 | yes |
| 12 | Ethers | 369 | 373–386 | yes |
| 13 | Aldehydes and Ketones | 383 | 387–426 | yes |
| 14 | Carboxylic Acids and its derivatives | 423 | 427–458 | yes |
| 15 | Nitro-compounds | 455 | 459–472 | yes |
| 16 | Amines | 469 | 473–493 | yes |
| 17 | Organometallic Compounds | 490 | 494–504 | yes |
| 18 | Chemistry in the Service to Mankind | 501 | 505–527 | yes |
| 19 | Cement | 524 | 528–540 | yes |
| 20 | Paper and Pulp | 537 | 541–548 | yes |
| 21 | Nuclear Chemistry and Applications of Radioactivity | 545 | 549–563 | yes |

### Class 12 · Physics · ENGLISH — PHYSICS Grade 12

| # | Chapter | Printed page | PDF pages | Located in body |
| ---: | --- | ---: | --- | --- |
| 1 | Rotational Dynamics and Oscillatory Motion | 1 | 5–28 | yes |
| 2 | Periodic Motion | 25 | 29–48 | yes |
| 3 | Fluid Mechaincs | 45 | 49–80 | yes |
| 4 | First Law of Thermodynamics | 77 | 81–99 | yes |
| 5 | Second law of Thermodynamics | 96 | 100–119 | yes |
| 6 | Wave Motion | 116 | 120–130 | yes |
| 7 | Mechanical Wave | 127 | 131–140 | yes |
| 8 | Waves in pipes and strings | 137 | 141–155 | yes |
| 9 | Acoustic Phenomenon | 152 | 156–178 | yes |
| 10 | Nature and Propagation of Light | 175 | 179–189 | yes |
| 11 | Interference of Light | 186 | 190–205 | yes |
| 12 | DIFFRACTION | 202 | 206–221 | yes |
| 13 | Polarisation | 218 | 222–231 | yes |
| 14 | Electrical Circuits | 228 | 232–258 | yes |
| 15 | Thermoelectric Effect | 255 | 259–268 | yes |
| 16 | Magnetic Fields | 265 | 269–305 | yes |
| 17 | Magnetic Properties of Materials | 302 | 306–316 | yes |
| 18 | Electromagnetic Induction | 313 | 317–345 | yes |
| 19 | Alternating current | 342 | 346–370 | yes |
| 20 | Electrons | 367 | 371–388 | yes |
| 21 | Photons | 385 | 389–407 | yes |
| 22 | Semiconductor Devices | 404 | 408–423 | yes |
| 23 | Quantization of energy | 420 | 424–459 | yes |
| 24 | Radioactivity &Nuclear reaction | 456 | 460–480 | yes |
| 25 | Recent Trends in Physics | 477 | 481–491 | yes |

