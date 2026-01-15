METABALANCE – API SPECIFIKÁCIÓ
METABALANCE – API SPECIFIKÁCIÓ
Készítette:
Buttyán Péter, Körtvélyesi Roland, Mészáros Nándor
Dátum: 2025.11.17
Autentikáció
Regisztráció
POST /api/auth/register
Új felhasználó létrehozása.
Request Body
{
 "vezeteknev": "Kovács",
 "keresztnev": "Anna",
 "email": "anna.kovacs@example.com",
 "jelszo": "StrongPass123!"
}
Response (201 Created)
{
 "azonosito": 1,
 "nev": "Kovács Anna",
 "email": "anna.kovacs@example.com",
 "szerepkor": "user",
 "regisztracio_datum": "2025-11-13T09:45:00Z"
}
Bejelentkezés
POST /api/auth/login
Request
{
 "email": "anna.kovacs@example.com",
 "jelszo": "StrongPass123!"
}
Response (200 OK)
{
 "lejarat": "2025-11-17T10:45:00Z",
 "felhasznalo": {
 "azonosito": 1,
 "nev": "Kovács Anna",
 "email": "anna.kovacs@example.com",
 "szerepkor": "user"
 }
}
Kijelentkezés
POST /api/auth/logout
Request header: Authorization: Bearer <token>
Response
{
 "uzenet": "Sikeres kijelentkezés",
 "sikeres": true
}
2. Felhasználó és Profil Kezelés
A profil a felhasználóhoz tartozik (magasság, súly, célok összegzése stb.).
Profil lekérése (saját)
GET /api/users/me
Header: Authorization: Bearer <token>
Response
{
 "azonosito": 1,
 "nev": "Kovács Anna",
 "email": "anna.kovacs@example.com",
 "szerepkor": "user",
 "regisztracio_datum": "2025-11-13T09:45:00Z",
 "profil": {
 "kezdo_suly": 70,
 "aktualis_suly": 72.5,
 "napi_celok_szama": 3,
 "ossz_statisztikak": {
 "viz": "2.5 L",
 "alvas": "7 óra",
 "kaloria": "1850 kcal",
 }
 }
}
Profil módosítása
PUT /api/users/me
Request
{
 "vezeteknev": "Kovács",
 "keresztnev": "Anna",
 "email": "anna.kovacs@example.com",
 "suly": 65,
}
Response
{
 "azonosito": 1,
 "nev": "Kovács Anna",
 "email": "anna.kovacs@example.com",
 "suly": 65,
 "sikeres": true,
 "uzenet": "Profil sikeresen frissítve"
}
Felhasználói fiók törlése
DELETE /api/users/delete
Request
{
 "jelszo": "StrongPass123!"
}
Response
{
 "sikeres": true,
 "uzenet": "Felhasználói fiók törölve"
}
3. Dashboard
A főképernyőn megjelenő összefoglaló adatok (víz, kalória, alvás, súly, hangulat).
Napi áttekintés
GET /api/dashboard/overview
Query paraméterek (opcionális): datum=2025-11-17
Response (példa)
{
 "datum": "2025-11-17",
 "viz": {
 "bevetel_liter": 2.3,
 "napi_cel_liter": 3.0,
 "teljesules_szazalek": 77
 },
 "kaloria": {
 "bevitel_kcal": 1850,
 "keret_kcal": 2100,
 "teljesules_szazalek": 88
 },
 "alvas": {
 "oraszam": 7.75,
 "utolso_ejszaka_kezdete": "2025-11-16T22:45:00Z"
 },
 "testsuly": {
 "aktualis_kg": 72.5,
 "cel_kg": 70.0,
 "kulonbseg": 2.5
 },
 "hangulat": {
 "aktualis_ertek": 4,
 "utolso_bejegyzes": "2025-11-17T08:30:00Z"
 }
}
4. Célkezelés
A célok önálló entitások (víz, kalória, alvás, lépésszám, súly, stb.).
Típusok (enum):
VIZ, ALVAS, KALORIA, HANGULAT, TESTSULY, LEPES
Új cél létrehozása
POST /api/goals
Request
{
 "tipus": "VIZ",
 "celErtek": 2.5,
 "mertekegyseg": "L",
 "aktiv": true
}
Response
{
 "id": 10,
 "felhasznaloId": 1,
 "tipus": "VIZ",
 "celErtek": 2.5,
 "mertekegyseg": "L",
 "aktiv": true,
 "uzenet": "Cél sikeresen létrehozva"
}
Célok listázása
GET /api/goals
Opcionális query: tipus=VIZ&aktiv=true
Response
[
 {
 "id": 10,
 "tipus": "VIZ",
 "celErtek": 2.5,
 "mertekegyseg": "L",
 "aktiv": true
 },
 {
 "id": 11,
 "tipus": "KALORIA",
 "celErtek": 2000,
 "mertekegyseg": "kcal",
 "aktiv": true
 }
]
Cél módosítása
PUT /api/goals/{id}
Request
{
 "celErtek": 3.0,
 "aktiv": true
}
Response
{
 "id": 10,
 "tipus": "VIZ",
 "celErtek": 3.0,
 "aktiv": true,
 "uzenet": "Cél sikeresen frissítve"
}
Cél törlése
DELETE /api/goals/{id}
Response
{
 "sikeres": true,
 "uzenet": "Cél törölve"
}
5. Mérések
Minden napi szokás (vízfogyasztás, alvás, kalóriabevitel, hangulat, testsúly, lépésszám)
egyetlen „Mérés” entitásként kezelve.
Támogatott típusok:
VIZ, ALVAS, KALORIA, HANGULAT, TESTSULY, LEPES
Mérés rögzítése
POST /api/measurements
Request (vízfogyasztás példa)
{
 "tipus": "VIZ",
 "ertek": 0.25,
 "mertekegyseg": "L",
 "datum": "2025-11-17T09:30:00Z",
 "megjegyzes": "Reggeli pohár víz"
}
Response
{
 "id": 12,
 "felhasznalo_id": 1,
 "tipus": "VIZ",
 "ertek": 0.25,
 "mertekegyseg": "L",
 "datum": "2025-11-17T09:30:00Z",
 "megjegyzes": "Reggeli pohár víz",
 "uzenet": "Mérés sikeresen rögzítve"
}
Mérések listázása
GET /api/measurements
Query paraméterek (mind opcionális):
• tipus=VIZ
• datum (csak adott nap, pl. 2025-11-17)
• datum_tol, datum_ig
• limit (pl. 100)
Példa:
GET /api/measurements?tipus=VIZ&datum=2025-11-17
Response (rövid)
[
 {
 "id": 12,
 "tipus": "VIZ",
 "ertek": 0.25,
 "mertekegyseg": "L",
 "datum": "2025-11-17T09:30:00Z"
 },
 {
 "id": 13,
 "tipus": "VIZ",
 "ertek": 0.25,
 "mertekegyseg": "L",
 "datum": "2025-11-17T11:00:00Z"
 }
]
Mérés módosítása
PUT /api/measurements/{id}
Mérés törlése
DELETE /api/measurements/{id}
6. Statisztikák (Statistics)
Aggregált értékek a mérések alapján – a grafikonok és a dashboard számára.
Napi statisztika
GET /api/statistics/daily
Query: datum=2025-11-17 (ha nincs megadva, akkor mai nap)
Response (példa)
{
 "felhasznalo_id": 1,
 "datum": "2025-11-17",
 "viz_liter": 2.3,
 "viz_cel_liter": 3.0,
 "kaloria_kcal": 1850,
 "kaloria_keret_kcal": 2000,
 "alvas_ora": 7.75,
 "lepes": 9800,
 "testsuly_kg": 72.5,
 "hangulat_atlag": 4.2
}
Heti statisztika (tipusonként)
GET /api/statistics/weekly
Query:
• tipus=KALORIA
• datum_tol=2025-10-26
• datum_ig=2025-11-01
Response (kalória grafikonhoz)
{
 "tipus": "KALORIA",
 "intervallum": {
 "datum_tol": "2025-10-26",
 "datum_ig": "2025-11-01"
 },
 "napok": [
 { "datum": "2025-10-26", "osszeg": 1950 },
 { "datum": "2025-10-27", "osszeg": 2000 },
 { "datum": "2025-10-28", "osszeg": 1900 }
 ]
}
Ugyanez használható víz, alvás, hangulat, súly grafikonokra is (tipus változtatásával).
Összegzett statisztika
GET /api/statistics/summary
Response
{
 "felhasznalo_id": 1,
 "napi_atlag": {
 "viz": "2.3 L",
 "alvas": "7.5 óra",
 "kaloria": "1900 kcal",
 "testsuly": "74.5 kg",
 "hangulat_atlag": 3.8
 },
 "heti_trend": {
 "viz": "+0.4 L",
 "alvas": "-0.2 óra",
 "kaloria": "-150 kcal",
 "testsuly": "-0.3 kg",
 "hangulat": "+0.5"
 }
}
7. Külön oldalak
• Vízfogyasztás követése (Water page)
o Napi bevitel lekérése:
GET /api/measurements?tipus=VIZ&datum=2025-11-17
o Új adag rögzítése (+ gomb):
POST /api/measurements (tipus = "VIZ")
o Cél módosítása slider alapján:
PUT /api/goals/{id} (tipus="VIZ")
• Kalóriabevitel naplózása (Calories page)
o Napi összeg + lista:
GET /api/measurements?tipus=KALORIA&datum=...
o Új étel rögzítése:
POST /api/measurements (tipus="KALORIA")
• Alvás (Sleep page)
o tipus = "ALVAS" mérések használata.
• Testsúlykövetés (Weight page)
o tipus = "TESTSULY" mérések (a grafikon a heti statisztikából jön).
• Hangulatnapló (Mood page)
o tipus = "HANGULAT", ertek 1–5 skálán, opcionális megjegyzéssel.
o Napi grafikon: GET /api/statistics/weekly?tipus=HANGULAT...
8. Admin funkciók
Admin jogosultságot igényel (szerepkor = "admin").
Felhasználók listázása
GET /api/admin/users
Response
[
 {
 "azonosito": 1,
 "nev": "Kovács Anna",
 "email": "anna.kovacs@example.com",
 "szerepkor": "user",
 "aktiv": true
 },
 {
 "azonosito": 2,
 "nev": "Nagy Péter",
 "email": "peter.nagy@example.com",
 "szerepkor": "user",
 "aktiv": false
 }
]
Új felhasználó létrehozása
POST /api/admin/users
Request
{
 "email": "pelda@example.com",
 "jelszo": "Jelszo123!",
 "szerepkor": "user",
 "aktiv": true
}
Response
{
 "azonosito": 5,
 "email": "pelda@example.com",
 "szerepkor": "user",
 "aktiv": true,
 "uzenet": "Felhasználó létrehozva"
}
Felhasználó módosítása
PUT /api/admin/users/{id}
Request
{
 "email": "pelda@example.com",
 "jelszo": "UjJelszo123!",
 "aktiv": true
}
Response
{
 "felhasznalo_id": 5,
 "email": "pelda@example.com",
 "aktiv": true,
 "uzenet": "Felhasználó adatai frissítve"
}
Felhasználó törlése
DELETE /api/admin/users/{id}
Response
{
 "sikeres": true,
 "uzenet": "Felhasználó törölve"
}
Jogosultság módosítása
PUT /api/admin/users/{id}/role
Request
{
 "szerepkor": "admin"
}
Response
{
 "felhasznalo_id": 1,
 "uj_szerepkor": "admin",
 "sikeres": true,
 "uzenet": "Szerepkör sikeresen módosítva"
}