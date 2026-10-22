# Praktikum AR/VR - Pertemuan 1

- Nama : Alifiah Mei Hidayanthy
- NIM : 2609020219P
- Link demo : https://alifiahmeihidayanthy-hub.github.io/arvr-prak-2609020219P/

Project ini berisi scene WebXR pertama menggunakan A-Frame 1.7.1.

## Jawaban Refleksi

**1. Mengapa posisi objek yang terlihat pertama kali oleh pengguna memakai nilai z negatif?**

(Kamera A-Frame secara default menghadap ke arah sumbu Z negatif (Z positif ada di belakang pengguna). Jadi agar objek ada di depan dan langsung terlihat, nilai z-nya harus negatif.)

**2. Mengapa WebXR hanya aktif pada HTTPS atau localhost?**

(WebXR memakai data sensitif seperti posisi dan gerakan kepala (dan kamera pada AR). Peramban hanya mengizinkannya di secure context (HTTPS atau localhost) supaya data tidak bisa disadap atau diubah orang lain di jaringan.)

**3. Jelaskan perbedaan peran WebXR Device API, three.js, dan A-Frame dengan bahasamu sendiri.**

(WebXR Device API adalah standar peramban untuk berkomunikasi dengan perangkat VR/AR. three.js adalah pustaka grafik 3D yang menggambar scene, kamera, dan material. A-Frame berada di atas three.js dan menyediakan tag HTML seperti <a-box>, sehingga kita bisa membuat scene WebXR tanpa menulis kode 3D tingkat rendah)