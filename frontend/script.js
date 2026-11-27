document.addEventListener("DOMContentLoaded", function() {
    
    window.toggleMenu = function() {
        let sidebar = document.getElementById("sidebarMenu");
        let backdrop = document.getElementById("sidebarLuar");
        if (sidebar) sidebar.classList.toggle("hidden");
        if (backdrop) backdrop.classList.toggle("hidden");
    };

    async function ambilDataKategori(targetSelectId, selectedValue = "") {
        const selectElement = document.getElementById(targetSelectId);
        if (!selectElement) return; 
        try {
            const response = await fetch('http://localhost:3000/api/kategori_alat');
            const dataKategori = await response.json();
            selectElement.innerHTML = '<option value="">-- Pilih Kategori --</option>';
            dataKategori.forEach(kategori => {
                const option = document.createElement('option');
                option.value = kategori.id_kategori; 
                option.textContent = kategori.nama_kategori;
                if (kategori.id_kategori == selectedValue) option.selected = true;
                selectElement.appendChild(option);
            });
        } catch (error) {
            console.error("Gagal memuat kategori:", error);
            selectElement.innerHTML = '<option value="">-- Gagal Memuat --</option>';
        }
    }

    async function loadAlat() {
        try {
            const response = await fetch('http://localhost:3000/api/alat');
            const result = await response.json();
            const alatList = document.getElementById('alat-list');
            if (!alatList) return; 
            alatList.innerHTML = ''; 

            if (result && result.length > 0) {
                let no = 1;
                result.forEach(alat => {
                    const namaKategori = alat.nama_kategori ? alat.nama_kategori : `ID: ${alat.id_kategori}`;
                    const row = `
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="border p-2 text-center text-gray-900">${no++}</td>
                            <td class="border p-2 font-medium text-gray-900">${alat.nama_alat}</td>
                            <td class="border p-2 font-medium text-gray-900">${namaKategori}</td>
                            <td class="border p-2 text-gray-600">${alat.kondisi}</td>
                            <td class="border p-2 text-center text-gray-600">${alat.stok}</td>
                            <td class="border p-2 text-gray-600">${alat.lokasi}</td>
                            <td class="border p-2 text-center">
                                <button onclick="bukaEditAlat(${alat.id_alat})" class="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded mr-1">Edit</button>
                                <button onclick="hapusAlat(${alat.id_alat})" class="text-red-600 hover:text-red-800 font-medium px-2 py-1 bg-red-50 hover:bg-red-100 rounded">Hapus</button>
                            </td>
                        </tr>
                    `;
                    alatList.innerHTML += row;
                });
            } else {
                alatList.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-gray-500">Belum ada data alat.</td></tr>`;
            }
        } catch (error) {
            console.error('Gagal mengambil data alat:', error);
        }
    }

    const modalTambah = document.getElementById('modalTambah');
    const btnTutupModal = document.getElementById('btnTutupModal');
    const btnBatal = document.getElementById('btnBatal');
    const formTambahProduk = document.getElementById('formTambahProduk');

    window.bukaFormAlat = function() {
        if (modalTambah) {
            modalTambah.classList.remove('hidden');
            ambilDataKategori('id_kategori'); 
        }
    };

    window.tutupModal = function() {
        if (modalTambah) {
            modalTambah.classList.add('hidden');
            if(formTambahProduk) formTambahProduk.reset();
        }
    };

    if (btnTutupModal) btnTutupModal.addEventListener('click', window.tutupModal);
    if (btnBatal) btnBatal.addEventListener('click', window.tutupModal);
    if (modalTambah) {
        modalTambah.addEventListener('click', function(event) {
            if (event.target === modalTambah) window.tutupModal();
        });
    }

    const modalEdit = document.getElementById('modalEdit');
    const formEditProduk = document.getElementById('formEditProduk');

    window.tutupModalEdit = function() {
        if (modalEdit) {
            modalEdit.classList.add('hidden');
            if(formEditProduk) formEditProduk.reset();
        }
    };

    window.bukaEditAlat = async function(id) {
        try {
            const response = await fetch(`http://localhost:3000/api/alat/${id}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            await ambilDataKategori('edit_id_kategori', data.id_kategori);

            document.getElementById('edit_id_alat').value = data.id_alat;
            document.getElementById('edit_namaAlat').value = data.nama_alat;
            document.getElementById('edit_kondisi').value = data.kondisi; 
            document.getElementById('edit_stok').value = data.stok;
            document.getElementById('edit_lokasi').value = data.lokasi;
            
            if(modalEdit) modalEdit.classList.remove('hidden');
        } catch (error) {
            console.error('Detail Error', error);
            alert('Gagal mengambil data alat.');
        }
    };

    if (formTambahProduk) {
        formTambahProduk.addEventListener('submit', async function(event) {
            event.preventDefault(); 
            const dataBaru = {
                nama_alat: document.getElementById('namaAlat').value,
                kondisi: document.getElementById('kondisi').value,
                stok: parseInt(document.getElementById('stok').value),
                lokasi: document.getElementById('lokasi').value,
                id_kategori: parseInt(document.getElementById('id_kategori').value)
            };

            try {
                const btnSubmit = document.getElementById('btnSubmitForm');
                btnSubmit.innerHTML = "Menyimpan...";
                btnSubmit.disabled = true;
                const response = await fetch('http://localhost:3000/api/alat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataBaru)
                });

                if (response.ok) {
                    alert("Alat berhasil ditambahkan!");
                    window.tutupModal();
                    loadAlat(); 
                } else {
                    const result = await response.json();
                    alert("Gagal menambahkan: " + (result.message || "Error server"));
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                const btnSubmit = document.getElementById('btnSubmitForm');
                btnSubmit.innerHTML = "Simpan Produk";
                btnSubmit.disabled = false;
            }
        });
    }

    if (formEditProduk) {
        formEditProduk.addEventListener('submit', async function(event) {
            event.preventDefault();
            const id = document.getElementById('edit_id_alat').value;
            const dataUpdate = {
                nama_alat: document.getElementById('edit_namaAlat').value,
                kondisi: document.getElementById('edit_kondisi').value,
                stok: parseInt(document.getElementById('edit_stok').value),
                lokasi: document.getElementById('edit_lokasi').value,
                id_kategori: parseInt(document.getElementById('edit_id_kategori').value)
            };

            try {
                const response = await fetch(`http://localhost:3000/api/alat/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataUpdate)
                });

                if (response.ok) {
                    alert('Data alat berhasil diupdate!');
                    window.tutupModalEdit();
                    loadAlat(); 
                } else {
                    alert('Gagal mengupdate data.');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }

    window.hapusAlat = async function(id) {
        if (confirm('Apakah Anda yakin ingin menghapus alat ini?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/alat/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    alert('Alat berhasil dihapus!');
                    loadAlat();
                } else {
                    const errData = await response.json();
                    alert(errData.message || 'Gagal menghapus alat.');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    async function loadKategori() {
        try {
            const response = await fetch('http://localhost:3000/api/kategori_alat'); 
            const result = await response.json(); 
            const kategoriList = document.getElementById('kategori-list'); 
            if (!kategoriList) return; 
            kategoriList.innerHTML = '';

            if (result && result.length > 0) {
                let no = 1;
                result.forEach(kategori => {
                    const row = `
                    <tr class="hover:bg-gray-50 transition-colors rounded-2xl">
                        <td class="border py-4 px-6 text-gray-900">${no++}</td>
                        <td class="border py-4 px-6 font-medium text-gray-900">${kategori.nama_kategori}</td>
                        <td class="border py-4 px-6 text-gray-600">${kategori.deskripsi}</td>
                    </tr>
                    `;
                    kategoriList.innerHTML += row;
                });
            } else {
                kategoriList.innerHTML = `<tr><td colspan="4" class="py-4 px-6 text-center text-gray-500">Belum ada kategori.</td></tr>`;
            }
        } catch (error) {
            console.error('Gagal mengambil data kategori:', error); 
            const kategoriList = document.getElementById('kategori-list'); 
            if (kategoriList) {
                kategoriList.innerHTML = `<tr><td colspan="4" class="py-4 px-6 text-center text-red-500">Gagal memuat data kategori.</td></tr>`;
            }
        }
    }

    async function loadPeminjaman() {
        try {
            const response = await fetch('http://localhost:3000/api/peminjaman'); 
            const result = await response.json(); 
            const peminjamanList = document.getElementById('peminjaman-list'); 
            if (!peminjamanList) return; 
            peminjamanList.innerHTML = '';

            if (result && result.length > 0) {
                result.forEach(peminjaman => {
                    let tombolAksi = '';
                    if (peminjaman.status === 'Dipinjam') {
                        tombolAksi = `<button onclick="kembalikanPeminjaman(${peminjaman.id_peminjaman})" class="text-green-600 hover:text-green-800 font-medium px-2 py-1 bg-green-50 hover:bg-green-100 rounded">Kembalikan</button>`;
                    } else {
                        tombolAksi = `<button onclick="bukaEditPeminjaman(${peminjaman.id_peminjaman})" class="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded">Edit</button>`;
                    }

                    const row =  `
                    <tr class="hover:bg-gray-50 transition-colors rounded-2xl">
                        <td class="border py-4 px-6 text-gray-900 text-center">${peminjaman.id_peminjaman}</td>
                        <td class="border py-4 px-6 font-medium text-gray-900">${peminjaman.nama_peminjam}</td>
                        <td class="border py-4 px-6 font-medium text-gray-900">${peminjaman.kelas}</td>
                        <td class="border py-4 px-6 text-gray-600">${peminjaman.nama_alat}</td>
                        <td class="border py-4 px-6 text-gray-600 text-center">${peminjaman.tanggal_pinjam ? peminjaman.tanggal_pinjam.split('T')[0] : '-'}</td>
                        <td class="border py-4 px-6 text-gray-600 text-center">${peminjaman.tanggal_kembali ? peminjaman.tanggal_kembali.split('T')[0] : '-'}</td>
                        <td class="border py-4 px-6 text-gray-600 text-center">${peminjaman.jumlah}</td>
                        <td class="border py-4 px-6 text-gray-600 text-center">${peminjaman.status}</td>
                        <td class="border py-4 px-6 text-center">
                            ${tombolAksi}
                        </td>
                    </tr>
                    `;
                    peminjamanList.innerHTML += row;
                });
            } else {
                peminjamanList.innerHTML = `<tr><td colspan="9" class="py-4 px-6 text-center text-gray-500">Belum ada peminjaman.</td></tr>`;
            }
        } catch (error) {
            console.error('Gagal mengambil data peminjaman:', error); 
            const peminjamanList = document.getElementById('peminjaman-list'); 
            if (peminjamanList) {
                peminjamanList.innerHTML = `<tr><td colspan="9" class="py-4 px-6 text-center text-red-500">Gagal memuat data peminjaman.</td></tr>`;
            }
        }
    }

    async function isiDropdownAlat(targetSelectId, selectedValue = "") {
        const selectElement = document.getElementById(targetSelectId);
        if (!selectElement) return;
        try {
            const response = await fetch('http://localhost:3000/api/alat');
            const dataAlat = await response.json();
            selectElement.innerHTML = '<option value="">-- Pilih Alat --</option>';
            dataAlat.forEach(alat => {
                const option = document.createElement('option');
                option.value = alat.id_alat;
                option.textContent = alat.nama_alat;
                if (alat.id_alat == selectedValue) option.selected = true;
                selectElement.appendChild(option);
            });
        } catch (error) {
            console.error("Gagal memuat alat:", error);
        }
    }

    const modalTambahPeminjaman = document.getElementById('modalTambahPeminjaman');
    const formTambahPeminjaman = document.getElementById('formTambahPeminjaman');
    
    window.bukaFormPeminjaman = function() {
        if (modalTambahPeminjaman) {
            formTambahPeminjaman.reset();
            modalTambahPeminjaman.classList.remove('hidden');
            isiDropdownAlat('tambah_id_alat');
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('tambah_tanggal_pinjam').value = today;
        }
    };

    window.tutupModalPeminjaman = function() {
        if (modalTambahPeminjaman) modalTambahPeminjaman.classList.add('hidden');
    };

    if (formTambahPeminjaman) {
        formTambahPeminjaman.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const dataBaru = {
                nama_peminjam: document.getElementById('tambah_nama_peminjam').value,
                kelas: document.getElementById('tambah_kelas').value,
                id_alat: parseInt(document.getElementById('tambah_id_alat').value),
                jumlah: parseInt(document.getElementById('tambah_jumlah').value),
                tanggal_pinjam: document.getElementById('tambah_tanggal_pinjam').value,
                status: "Dipinjam"
            };

            try {
                const response = await fetch('http://localhost:3000/api/peminjaman', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataBaru)
                });
                if (response.ok) {
                    alert("Peminjaman berhasil dibuat!");
                    window.tutupModalPeminjaman();
                    loadPeminjaman();
                } else {
                    alert("Gagal membuat peminjaman.");
                }
            } catch (error) {
                console.error("Error:", error);
            }
        });
    }

    window.kembalikanPeminjaman = async function(id) {
    if(confirm('Apakah Anda ingin mengembalikan alat ini?')) {
        try {
            const getResponse = await fetch(`http://localhost:3000/api/peminjaman/${id}`);
            const data = await getResponse.json();
            
            const tglPinjam = new Date(data.tanggal_pinjam);
            const tglHariIni = new Date();
            
            tglPinjam.setHours(0, 0, 0, 0);
            tglHariIni.setHours(0, 0, 0, 0);

            const selisihWaktu = tglHariIni - tglPinjam;
            const selisihHari = selisihWaktu / (1000 * 60 * 60 * 24);

            if (selisihHari > 15) {
                data.status = "Terlambat";
            } else {
                data.status = "Dikembalikan";
            }
            data.tanggal_kembali = new Date().toISOString().split('T')[0];

            const response = await fetch(`http://localhost:3000/api/peminjaman/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert(`Alat berhasil dikembalikan dengan status: ${data.status}`);
                loadPeminjaman();
            } else {
                alert('Gagal mengubah status pengembalian.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
};

    const modalEditPeminjaman = document.getElementById('modalEditPeminjaman');
    const formEditPeminjaman = document.getElementById('formEditPeminjaman');

    window.tutupModalEditPeminjaman = function() {
        if (modalEditPeminjaman) modalEditPeminjaman.classList.add('hidden');
    };

    window.bukaEditPeminjaman = async function(id) {
        try {
            const response = await fetch(`http://localhost:3000/api/peminjaman/${id}`);
            if (!response.ok) throw new Error('Gagal mengambil data');
            const data = await response.json();

            await isiDropdownAlat('edit_id_alat', data.id_alat);

            document.getElementById('edit_id_peminjaman').value = data.id_peminjaman;
            document.getElementById('edit_nama_peminjam').value = data.nama_peminjam;
            document.getElementById('edit_kelas').value = data.kelas;
            document.getElementById('edit_jumlah').value = data.jumlah;
            document.getElementById('edit_tanggal_pinjam').value = data.tanggal_pinjam ? data.tanggal_pinjam.split('T')[0] : '';
            document.getElementById('edit_status').value = data.status;

            modalEditPeminjaman.classList.remove('hidden');
        } catch (error) {
            console.error('Detail Error', error);
            alert('Gagal mengambil data peminjaman.');
        }
    };

    if (formEditPeminjaman) {
        formEditPeminjaman.addEventListener('submit', async function(event) {
            event.preventDefault();
            const id = document.getElementById('edit_id_peminjaman').value;
            
            const dataUpdate = {
                id_alat: parseInt(document.getElementById('edit_id_alat').value),
                nama_peminjam: document.getElementById('edit_nama_peminjam').value,
                kelas: document.getElementById('edit_kelas').value,
                jumlah: parseInt(document.getElementById('edit_jumlah').value),
                tanggal_pinjam: document.getElementById('edit_tanggal_pinjam').value,
                status: document.getElementById('edit_status').value
            };

            try {
                const response = await fetch(`http://localhost:3000/api/peminjaman/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataUpdate)
                });

                if (response.ok) {
                    alert('Peminjaman berhasil diupdate!');
                    window.tutupModalEditPeminjaman();
                    loadPeminjaman();
                } else {
                    alert('Gagal mengupdate peminjaman.');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }

    async function loadDashboard() {
        const elAlat = document.getElementById('totalAlat');
        const elKategori = document.getElementById('totalKategori');
        const elPeminjaman = document.getElementById('totalPeminjaman');

        if (!elAlat && !elKategori && !elPeminjaman) return;

        try {
            const [resAlat, resKategori, resPeminjaman] = await Promise.all([
                fetch('http://localhost:3000/api/alat'),
                fetch('http://localhost:3000/api/kategori_alat'),
                fetch('http://localhost:3000/api/peminjaman')
            ]);

            const dataAlat = await resAlat.json();
            const dataKategori = await resKategori.json();
            const dataPeminjaman = await resPeminjaman.json();

            if (elAlat) elAlat.textContent = dataAlat.length;
            if (elKategori) elKategori.textContent = dataKategori.length;
            if (elPeminjaman) elPeminjaman.textContent = dataPeminjaman.length;
            
        } catch (error) {
            console.error("Gagal memuat data dashboard:", error);
        }
    }

    loadAlat();
    loadKategori();
    loadPeminjaman();
    loadDashboard();

});