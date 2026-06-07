# 🌌 Modern Periodic Table / الجدول الدوري الحديث

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Glossary/HTML5)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75C2?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)

---

### 🌐 Quick Links / روابط سريعة
*   **[English Documentation](#-english-documentation)**
    *   [Core Features](#-core-features)
    *   [Software Architecture & Design Patterns](#-software-architecture--design-patterns)
    *   [Installation & Setup](#-installation--setup)
    *   [Troubleshooting & Diagnostics](#-troubleshooting--diagnostics)
*   **[الدليل العربي للتوثيق](#-التوثيق-باللغة-العربية)**
    *   [المميزات الأساسية](#-المميزات-الأساسية)
    *   [البنية البرمجية وأنماط التصميم](#-البنية-البرمجية-وأنماط-التصميم)
    *   [طريقة التشغيل والتهيئة](#-طريقة-التشغيل-والتهيئة)
    *   [استكشاف الأخطاء وإصلاحها](#-استكشاف-الأخطاء-وإصلاحها)

---

<a name="english-documentation"></a>
## 🚀 English Documentation

The **Modern Periodic Table** is an immersive, scientifically rigorous, and visually stunning SPA (Single Page Application) built using modern web standards: **Vanilla ES6+ JavaScript, CSS3 variables, and Three.js (WebGL)**. It compiles extensive physical, chemical, and nuclear databases and displays them in a high-performance interactive dashboard.

---

### 🌟 Core Features

| Feature Tab | Technical Implementation | Description |
| :--- | :--- | :--- |
| **Periodic Table Grid** | DOM Spotlight / CSS Grid | High-fidelity interactive layout. Click or hover elements to update console. Spotlights element categories dynamically. |
| **Heatmap Trends** | HSL Spectrum Math | Maps **Electronegativity, Atomic Radius, Ionization Energy, and Mass** across the elements using dynamic color scaling. |
| **Simulators** | State Comparison / Bitwise checks | thermodynamics simulator showing solid/liquid/gas states at custom temps; electromagnetism simulator highlighting magnetic groups. |
| **3D Showcase** | Three.js Particle System / Cylindrical Meshes | Interactive rendering of orbital probability clouds ($s, p, d, f$) and polar/covalent molecular structures. |
| **Ask Hydrogen AI** | Gemini API / RegExp Parser | Integrated chemistry bot. Accepts a Gemini API key or falls back to offline, client-side property comparisons. |
| **Isotopes Catalog** | Complete NIST Database | Integrates over **3,000 real isotope profiles** (mass, abundance, halflife, decay mode, key use) across all 118 elements. |

---

### 🏗️ Software Architecture & Design Patterns

#### 1. Centralized Asynchronous Data Loading Pipeline
Rather than scattering dynamic data loads, `JS/main.js` functions as a single source of truth using `Promise.all` to fetch element data and supplementary catalogs concurrently:
```javascript
const [engData, radiiData, magnetismData, isotopesData] = await Promise.all([
  fetch("./data/JSON/elements_en.json").then((res) => res.json()),
  fetch("./data/JSON/atomic_radii.json").then((res) => res.json()),
  fetch("./data/JSON/magnetic_properties.json").then((res) => res.json()),
  fetch("./data/JSON/isotopes.json").then((res) => res.json())
]);
```
> [!IMPORTANT]
> **Preserving ES Module References:** To guarantee references imported by other modules (`trends.js`, `simulators.js`, `reference.js`) are instantly updated, we mutate the exported arrays and objects via `Object.assign` and `Array.prototype.push` instead of reassigning them. This prevents broken live bindings in restricted browser scopes.

#### 2. Three.js Canvas Disposal and Garbage Collection
To prevent GPU memory leaks and tab crashes when shifting in and out of the 3D Showcase, `JS/showcase3d.js` implements a strict scene teardown routine:
```javascript
function clearActiveGroup() {
  if (activeGroup) {
    activeGroup.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => mat.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    activeGroup.clear();
  }
}
```

#### 3. Mathematical HSL Color Mapping
In the heatmap trends view, values are normalized into ratios and mapped along a hue scale shifting from $240^\circ$ (Teal/Blue, low value) down to $0^\circ$ (Red, high value):
$$\text{Ratio} = \frac{V - V_{\min}}{V_{\max} - V_{\min}}$$
$$\text{Hue} = 240 - (\text{Ratio} \times 240)$$

---

### 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/Modern-periodic-table.git
   ```
2. **Serve the project:**
   Modern browsers enforce strict CORS policies and prevent `fetch()` on `file://` protocols. You must serve the root folder via a local server:
   * **Using Python 3:**
     ```bash
     python -m http.server 8000
     ```
   * **Using Node.js (http-server):**
     ```bash
     npx http-server
     ```
3. **Open:** Navigate to `http://localhost:8000`.

---

### ⚠️ Troubleshooting & Diagnostics

#### 1. Elements Grid or Isotopes Not Loading?
Open the developer console (F12) to inspect network failures. If you see CORS errors:
> `Fetch API cannot load file://... URL scheme must be "http" or "https"`
Ensure you started the local HTTP server in step 2 of the installation guidelines.

#### 2. Three.js Canvas is Black or Empty?
Verify that WebGL is enabled in your browser:
- In Chrome/Edge, go to `chrome://settings/system` and ensure "Use graphics acceleration when available" is toggled **ON**.
- Check if your hardware/driver supports WebGL by visiting [webglreport.com](https://webglreport.com/).

#### 3. Ask Hydrogen chatbot returns "Thinking..." indefinitely?
Ensure you entered a valid Gemini API key in the chat settings console. If you are offline or have no key, clear the key input to fall back to the local database parser.

---

<br/>

<a name="arabic-version"></a>
## 🚀 التوثيق باللغة العربية

برنامج **الجدول الدوري الحديث** عبارة عن تطبيق ويب تفاعلي متقدم للصفحة الواحدة (SPA) تم إنشاؤه بالاعتماد الكامل على معايير الويب الحديثة: **جافاسكريبت ES6+ النقية، تنسيقات CSS3 المتقدمة المتغيرة، ومكتبة Three.js ثلاثية الأبعاد (WebGL)**. يجمع هذا التطبيق بين واجهات المستخدم الرائعة والبيانات الفيزيائية والكيميائية والنووية الدقيقة في منصة لوحة تحكم واحدة فائقة الأداء.

---

### 🌟 المميزات الأساسية

| علامة التبويب | آلية التطبيق البرمجي | وصف الوظيفة |
| :--- | :--- | :--- |
| **شبكة الجدول الدوري** | تلاعب بالـ DOM / شبكة CSS | عرض تفاعلي غني للعناصر. انقر أو مرر لرؤية الخصائص. تصفية العنصر حسب المجموعات بشكل فوري. |
| **الاتجاهات الدورية** | تدرج HSL الرياضي | يعرض الخرائط الحرارية لـ **السالبية الكهربائية، نصف القطر الذري، طاقة التأين، والكتلة** بتدرج لوني يعتمد على القيمة الفعلية. |
| **المحاكيات التفاعلية** | تصفية ثنائية وحساب الحالات | محاكي حالات المادة (ديناميكا حرارية) بمدى حراري واسع، ومحاكي المغناطيسية لتصنيف الخصائص المغناطيسية بدقة. |
| **المعرض ثلاثي الأبعاد** | سحب الجسيمات / مجسمات ثلاثية | تجسيد ثلاثي الأبعاد لمدارات الإلكترونات الذرية ($s, p, d, f$) والروابط البلورية للجزيئات. |
| **اسأل هيدروجين (AI)** | Gemini API / فك التعبيرات | روبوت محادثة كيميائي. يتكامل مع محركات Gemini API بالإنترنت أو يحلل الأسئلة محلياً في وضع عدم الاتصال. |
| **كتالوج النظائر** | قاعدة بيانات NIST الكاملة | يعرض أكثر من **3000 نظير حقيقي** للعناصر الـ 118 مع كتلها الدقيقة، وفرتها، عمر النصف، ونمط تحللها. |

---

### 🏗️ البنية البرمجية وأنماط التصميم

#### 1. خط الاستدعاء اللامتزامن المركزي
لمنع حظر الخيط الرئيسي للـ DOM أثناء جلب البيانات، يتم استخدام `Promise.all` في `JS/main.js` لجلب كافة ملفات الـ JSON بالتوازي:
```javascript
const [engData, radiiData, magnetismData, isotopesData] = await Promise.all([
  fetch("./data/JSON/elements_en.json").then((res) => res.json()),
  fetch("./data/JSON/atomic_radii.json").then((res) => res.json()),
  fetch("./data/JSON/magnetic_properties.json").then((res) => res.json()),
  fetch("./data/JSON/isotopes.json").then((res) => res.json())
]);
```
> [!IMPORTANT]
> **الحفاظ على مراجع الكائنات المصدرة:** لتفادي قيود المتصفحات وأنظمة الـ Bundlers البرمجية في تحديث المتغيرات الممررة (Live Bindings)، يتم تعديل محتوى مصفوفات وكائنات التصدير ذاتها في الذاكرة عن طريق `Object.assign` و `Array.prototype.push` بدلاً من إعادة تعيين المراجع بالكامل.

#### 2. التخلص من مجسمات Three.js وإفراغ الذاكرة
لتفادي حدوث مشاكل تسريب الذاكرة (Memory Leaks) وامتلاء ذاكرة كارت الشاشة (GPU) عند التنقل داخل وخارج التبويب ثلاثي الأبعاد، يطبق ملف `JS/showcase3d.js` تفريغاً صارماً لكافة النماذج:
```javascript
function clearActiveGroup() {
  if (activeGroup) {
    activeGroup.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => mat.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    activeGroup.clear();
  }
}
```

#### 3. التدرج اللوني الحسابي HSL
في خرائط الاتجاهات الحرارية، يتم تحويل قيم الخواص كنسب مئوية، ومطابقتها مع تدرج لوني يبدأ من اللون السماوي/الأزرق ($240^\circ$ للقيمة الأدنى) نزولاً للون الأحمر ($0^\circ$ للقيمة الأعلى):
$$\text{النسبة} = \frac{\text{القيمة} - \text{القيمة الأدنى}}{\text{القيمة الأعلى} - \text{القيمة الأدنى}}$$
$$\text{درجة اللون} = 240 - (\text{النسبة} \times 240)$$

---

### 🛠️ طريقة التشغيل والتهيئة

1. **نسخ مستودع المشروع:**
   ```bash
   git clone https://github.com/your-username/Modern-periodic-table.git
   ```
2. **تشغيل الخادم المحلي:**
   نظراً لأن التطبيق يستدعي ملفات JSON عبر بروتوكول HTTP، تمنع متصفحات الويب تشغيل الـ Fetch على مسار الملفات المحلي مباشرة `file://`. يجب تشغيل خادم محلي:
   * **باستخدام بايثون:**
     ```bash
     python -m http.server 8000
     ```
   * **باستخدام Node.js:**
     ```bash
     npx http-server
     ```
3. **التشغيل:** افتح متصفحك واذهب للرابط `http://localhost:8000`.

---

### ⚠️ استكشاف الأخطاء وإصلاحها

#### 1. عدم تحميل جدول العناصر أو النظائر؟
اضغط على F12 لفتح نافذة المطور، إذا رأيت أخطاء مثل:
> `Fetch API cannot load file://... URL scheme must be "http" or "https"`
فهذا يعني أنك قمت بفتح ملف `index.html` مباشرة دون تشغيل الخادم المحلي المذكور في الخطوة 2 من إرشادات التشغيل.

#### 2. شاشة المعرض ثلاثي الأبعاد سوداء بالكامل؟
تأكد من تفعيل تسريع الرسوميات (WebGL) في إعدادات متصفحك:
- في متصفح كروما/إيدج، انتقل للإعدادات -> النظام -> تفعيل "Use graphics acceleration when available".
- تأكد من دعم كارت الشاشة لديك عن طريق موقع [webglreport.com](https://webglreport.com/).

#### 3. شات "اسأل هيدروجين" معلق على كلمة "Thinking..."؟
تأكد من كتابة كود Gemini API صحيح في إعدادات الشات الجانبية، أو قم بإفراغ الحقل تماماً للعودة للوضع المحلي للعمل بدون إنترنت.
