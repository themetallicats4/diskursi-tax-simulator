Design a modern, mobile-first web app interface for a civic-tech product called “Diskursi”.

The product is a tax awareness simulation tool targeted at citizens in Turkey. The design should feel:
- trustworthy
- simple
- slightly emotional / impactful
- not overly corporate
- accessible to non-experts

----------------------------------------
GENERAL STYLE
----------------------------------------

- Clean, minimal layout with soft rounded cards (border-radius: 16–20px)
- Generous spacing and breathing room
- Subtle shadows, not heavy
- Use card-based sections stacked vertically

Primary colors:
- Primary: #B91C1C (deep red)
- Accent: #F97316 (orange)
- Background: #FFF7ED (soft warm background)
- Text: #2E2E2E
- Buttons: #DC2626
- Button hover: #991B1B

You may introduce soft neutral tones (light gray, beige) but do NOT override brand colors.

Typography:
- Modern sans-serif (Inter-like)
- Strong hierarchy (large numbers, clear titles)

----------------------------------------
GLOBAL STRUCTURE
----------------------------------------

Top:
- Logo text: “Diskursi”
- Title: “Vergi Yükü Simülasyonu”
- Subtitle: “1 dakikada yaklaşık bir tahmin”

Below:
- Step indicator with capsules:

[ Meslek ] [ Gelir ] [ Doğrudan ] [ Yaşam ] [ Dolaylı ] [ Toplam ]

Active step is highlighted.

----------------------------------------
SCREEN 1 — MESLEK
----------------------------------------

Title:
“Meslek grubun”

Grid of selectable cards:

- 🏢 Özel sektör çalışanı
- 🏛️ Kamu çalışanı
- 💼 Serbest çalışan
- 🎓 Öğrenci
- 🏠 Çalışmıyor
- 👵 Emekli

Each option:
- rounded card
- icon + label
- selected state: red border + light red background

Footer:
- “Bu bilgi anonimdir.”

CTA button:
→ “Devam Et”

----------------------------------------
SCREEN 2 — GELİR (IMPORTANT CHANGE)
----------------------------------------

Title:
“Senin Yılın”

Replace sliders with NUMERIC INPUT + STEPPER BUTTONS.

Two input sections:

1. Maaş / Ücret (brüt)
2. Diğer gelir (kira, freelance vb.)

Each input:

- Large number input field (center or right aligned)
- Placeholder: “0 TL”

Next to it:
- Stepper buttons:

[ – ]   [ value ]   [ + ]

Behavior:
- + increases by 100 TL
- – decreases by 100 TL

Below input:
- small hint text (e.g. “Örn: bordro brüt maaşın”)

Show:
- “Yıllık brüt toplam: XXX TL”

CTA:
→ “Devam Et”

----------------------------------------
SCREEN 3 — DOĞRUDAN
----------------------------------------

Title:
“Devlet ilk payını alıyor”

- Big annual gross number
- Progress bar:

[██████░░░░░░]

Left:
“Devlete giden”
Right:
“Sana kalan”

Subtext:
“Bu kesintiler maaşından doğrudan yapılır.”

----------------------------------------
SCREEN 4 — YAŞAM TARZI
----------------------------------------

Title:
“Yaşam tarzın”

Sliders remain here (percent-based):

- Gıda
- Kira
- Ulaşım
- Diğer

Show:
“Toplam: 100%” (green when valid)

----------------------------------------
SCREEN 5 — DOLAYLI
----------------------------------------

Title:
“Harcarken de vergi ödüyorsun”

Optional toggles:

- 🚗 Arabam var
- 🚬 Sigara kullanıyorum
- 🍺 Alkol tüketiyorum

----------------------------------------
SCREEN 6 — TOPLAM (MOST IMPORTANT)
----------------------------------------

This screen must be emotionally strong and structured.

----------------------------------------
SECTION 1 — 🧾 VERGİ FİŞİN (FIRST ELEMENT)
----------------------------------------

Card style.

Title:
“Vergi fişin”

Subtitle:
“Bu tahmini fiş, yıllık vergi yükünün hangi kalemlerden oluştuğunu gösterir.”

Two grouped blocks:

1. Doğrudan kesintiler
2. Dolaylı vergiler

Each row:
label — value (range)

Example:
Gelir vergisi        200.000 – 210.000 TL

Totals are highlighted in red.

----------------------------------------
SECTION 2 — ORAN
----------------------------------------

Title:
“Toplam vergi oranın”

Big text:
“%38 – %40”

Small explanation:
“Gelirinin bu kadarı vergi olarak gider.”

----------------------------------------
SECTION 3 — GÜNLÜK ETKİ
----------------------------------------

Title:
“Yaklaşık Günlük Vergi Yükün”

Big red number:
“1.087 – 1.133 TL / gün”

Below:
Month visualization bar (12 blocks)

----------------------------------------
SECTION 4 — BİREYSEL ETKİ
----------------------------------------

Title:
“Bireysel Yıllık Katkınla Neler Yapılır?”

3 cards:

- 👩‍🏫 Öğretmen maaşı → ≈ X ay
- 🎓 Öğrenci bursu → ≈ X öğrenci
- 🚑 Ambulans → ≈ X gün

----------------------------------------
SECTION 5 — KOLEKTİF ETKİ
----------------------------------------

Title:
“1000 kişi olsaydı?”

Big number:
“XXX milyon TL”

Below:

🏫 ≈ X okul  
🏥 ≈ X hastane  

----------------------------------------
SECTION 6 — DEVLET GELİRLERİ (LAST)
----------------------------------------

Title:
“Devlet gelirleri”

Show:
- %85 vergi oranı
- KDV / ÖTV bars

----------------------------------------
SECTION 7 — SURVEY
----------------------------------------

Optional card:

- fairness scale (0–10)
- trust
- policy priority

CTA:
“Anketi gönder”

----------------------------------------
UX DETAILS
----------------------------------------

- Use subtle animations (fade / slide)
- Numbers should feel prominent
- Red color only for important values (tax, totals)
- Avoid clutter
- Make it feel like a guided experience, not a form

----------------------------------------
TONE
----------------------------------------

The product should feel like:
- “You are discovering something”
NOT
- “You are filling a form”