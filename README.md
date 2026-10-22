# Praktikum AR/VR - Pertemuan 1

- Nama : Alifiah Mei Hidayanthy
- NIM : 2609020219P
- Link demo : https://alifiahmeihidayanthy-hub.github.io/arvr-prak-2609020219P/

Project ini berisi scene WebXR pertama menggunakan A-Frame 1.7.1.

## Jawaban Refleksi

**1. Mengapa posisi objek yang terlihat pertama kali oleh pengguna memakai nilai z negatif?**
Karena pada A-Frame, arah pandangan kamera menghadap ke sumbu Z negatif. Jadi, kalau ingin objek langsung terlihat di depan pengguna saat membuka tampilan 3D, posisi objek harus diberi nilai Z negatif.

**2. Mengapa WebXR hanya aktif pada HTTPS atau localhost?**
Karena WebXR membutuhkan akses ke data perangkat, seperti pergerakan kepala dan posisi pengguna. Oleh sebab itu, browser membatasi penggunaannya pada koneksi yang aman agar data tersebut lebih terlindungi.

**3. Jelaskan perbedaan peran WebXR Device API, three.js, dan A-Frame dengan bahasamu sendiri.**
WebXR Device API berfungsi menghubungkan browser dengan perangkat VR atau AR. Three.js digunakan untuk membuat dan mengatur tampilan objek 3D, sedangkan A-Frame memudahkan pembuatan tampilan 3D menggunakan tag HTML sehingga tidak perlu menulis kode yang terlalu rumit.