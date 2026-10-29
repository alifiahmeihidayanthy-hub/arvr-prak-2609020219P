# Praktikum AVR – Pertemuan 3

Proyek ini merupakan simulasi interaktif 3D berbasis **Three.js** yang mendukung mode desktop dan WebXR/VR. Pengguna dapat melihat dan berinteraksi dengan objek 3D menggunakan mouse dan keyboard, atau menggunakan controller VR pada perangkat yang mendukung WebXR.

## Fitur

- Menampilkan tiga objek awal: kubus, bola, dan kerucut.
- Mengubah bentuk dan warna objek dengan klik mouse pada mode desktop.
- Menyorot objek saat kursor diarahkan ke objek tersebut.
- Menggerakkan kamera menggunakan tombol **W, A, S, D** atau tombol panah.
- Menjalankan mode VR melalui tombol **Enter VR** jika browser dan perangkat mendukung WebXR.
- Mengambil dan melepaskan objek menggunakan trigger controller VR.
- Mengubah warna dan bentuk objek menggunakan tombol grip controller VR.
- Mengubah ukuran objek yang sedang dipegang dengan thumbstick, jika didukung controller.
- Menampilkan log interaksi di bagian atas layar dan di console browser.

## Struktur Proyek

```text
pertemuan-3/
├── index.html   # Halaman utama dan pemuatan Three.js
├── main.js      # Scene 3D, objek, kontrol desktop, dan interaksi WebXR
└── README.md    # Dokumentasi proyek
```

## Persyaratan

- Browser modern yang mendukung JavaScript module dan WebGL, misalnya Google Chrome atau Microsoft Edge.
- Koneksi internet untuk memuat Three.js dari jsDelivr CDN.
- Untuk mode VR: browser dan perangkat yang mendukung WebXR serta koneksi melalui **localhost** atau **HTTPS**.

## Cara Menjalankan

Karena proyek menggunakan JavaScript ES Modules dan import map, jalankan melalui server lokal, bukan dengan membuka `index.html` langsung menggunakan `file://`.

### Opsi 1: Menggunakan Visual Studio Code

1. Ekstrak folder proyek.
2. Buka folder `pertemuan-3` di Visual Studio Code.
3. Pasang ekstensi **Live Server** jika belum tersedia.
4. Klik kanan `index.html`, lalu pilih **Open with Live Server**.
5. Halaman simulasi akan terbuka di browser.

### Opsi 2: Menggunakan Python

Jika Python sudah terpasang:

1. Buka terminal di dalam folder `pertemuan-3`.
2. Jalankan perintah:

   ```bash
   python -m http.server 8000
   ```

3. Buka `http://localhost:8000` di browser.

## Kontrol

### Mode Desktop

| Aksi | Kontrol |
|---|---|
| Memutar/mengubah sudut pandang | Klik dan geser mouse |
| Menyorot objek | Arahkan kursor ke objek |
| Mengubah warna dan bentuk objek | Klik objek |
| Bergerak maju | `W` atau panah atas |
| Bergerak mundur | `S` atau panah bawah |
| Bergerak ke kiri | `A` atau panah kiri |
| Bergerak ke kanan | `D` atau panah kanan |

### Mode VR

| Aksi | Kontrol |
|---|---|
| Memulai mode VR | Klik tombol **Enter VR** |
| Memilih dan memegang objek | Arahkan sinar controller ke objek, lalu tekan trigger |
| Melepaskan objek | Lepaskan trigger |
| Mengubah warna dan bentuk | Arahkan sinar ke objek, lalu tekan grip |
| Mengubah ukuran objek yang sedang dipegang | Gerakkan sumbu Y thumbstick, jika didukung |

Nama tombol dan dukungan kontrol dapat berbeda tergantung perangkat VR yang digunakan.

## Teknologi yang Digunakan

- **HTML5** untuk struktur halaman.
- **JavaScript ES Modules** untuk logika aplikasi.
- **Three.js 0.160.0** untuk membuat dan merender scene 3D.
- **WebXR** untuk dukungan pengalaman VR.
- **OrbitControls** untuk kontrol kamera pada mode desktop.
- **XRControllerModelFactory** untuk menampilkan model controller VR.

Three.js dan modul pendukung dimuat melalui CDN jsDelivr, sehingga koneksi internet diperlukan saat menjalankan proyek.

## Catatan

- Jika tombol **Enter VR** tidak dapat digunakan, periksa apakah browser dan perangkat mendukung WebXR.
- Fitur VR umumnya memerlukan halaman yang dibuka melalui `localhost` atau HTTPS.
- Getaran controller hanya berjalan jika perangkat dan browser mendukung fitur haptic.
- Log interaksi dapat dilihat di bagian atas halaman dan melalui Developer Tools → Console pada browser.
