import cors from 'cors';
import express from 'express';
import pool from './db.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.get('/api/alat', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM alat a
            join kategori_alat k on a.id_kategori=k.id_kategori
            ORDER BY id_alat`
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Gagal mengambil seluruh alat:', error.message);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data alat' });
    }
});

app.get('/api/alat/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ message: 'ID alat harus berupa bilangan bulat positif' });
    }

    try {
        const result = await pool.query(
            `
            SELECT * FROM alat a
            JOIN kategori_alat k ON a.id_kategori = k.id_kategori
            WHERE a.id_alat = $1
            `,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Alat tidak ditemukan' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Gagal mengambil alat:', error.message);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data alat' });
    }
});

app.post('/api/alat', async (req, res) => {
    const { id_kategori, nama_alat, kondisi, stok, lokasi } = req.body;

    if (!nama_alat || !id_kategori) {
        return res.status(400).json({ message: 'Data alat tidak valid' });
    }
    if (parseInt(stok) < 0) {
        return res.status(400).json({ message: 'Stok tidak boleh negatif' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO alat (id_kategori, nama_alat, kondisi, stok, lokasi) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [
                id_kategori,
                nama_alat.trim(),
                kondisi.trim(),
                parseInt(stok), 
                lokasi
            ]
        );
        
        res.status(201).json({
            message: 'Alat berhasil ditambahkan',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Gagal menambahkan alat:', error.message);
        res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan alat' });
    }
});

app.put('/api/alat/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { id_kategori, nama_alat, kondisi, stok, lokasi } = req.body;

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ message: 'ID alat tidak valid' });
    }

    try {
        const result = await pool.query(
            `UPDATE alat
             SET id_kategori  = $1,
                 nama_alat    = $2,
                 kondisi      = $3,
                 stok         = $4,
                 lokasi       = $5
             WHERE id_alat    = $6
             RETURNING *`,
            [
                id_kategori,
                nama_alat.trim(),
                kondisi.trim(),
                parseInt(stok),
                lokasi,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Alat tidak ditemukan' });
        }
        res.status(200).json({
            message: 'Alat berhasil diperbarui',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Gagal memperbarui alat:', error.message);
        res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui alat' });
    }
});

app.delete('/api/alat/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ message: 'ID alat tidak valid' });
    }

    try {
        const result = await pool.query(
            'DELETE FROM alat WHERE id_alat = $1 RETURNING *',
            [id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Alat tidak ditemukan' });
        }
        res.json({ message: 'Berhasil hapus alat', data: result.rows[0] });
    } catch (error) {
        console.error('Gagal menghapus alat:', error.message);
        if (error.code === '23503') {
            return res.status(400).json({ message: 'Gagal menghapus! Alat ini terkait dengan data peminjaman.' });
        }
        res.status(500).json({ message: 'Terjadi kesalahan saat menghapus alat' });
    }
});

app.get('/api/kategori_alat', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM kategori_alat ORDER BY id_kategori'
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Gagal mengambil seluruh kategori alat:', error.message);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data kategori alat' });
    }
});

app.get('/api/kategori_alat/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ message: 'ID kategori alat harus berupa bilangan bulat positif' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM kategori_alat WHERE id_kategori = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Kategori alat tidak ditemukan' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Gagal mengambil kategori alat:', error.message);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data kategori alat' });
    }
});

app.get('/api/peminjaman', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM peminjaman p 
            JOIN alat a ON p.id_alat = a.id_alat
            ORDER BY id_peminjaman`
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Gagal mengambil seluruh peminjaman:', error.message);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data peminjaman' });
    }
});

app.get('/api/peminjaman/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ message: 'ID peminjaman harus berupa bilangan bulat positif' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM peminjaman WHERE id_peminjaman = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Peminjaman tidak ditemukan' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Gagal mengambil peminjaman:', error.message);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data peminjaman' });
    }
});

app.post('/api/peminjaman', async (req, res) => {
    const { id_alat, nama_peminjam, kelas, tanggal_pinjam, tanggal_kembali, jumlah, status } = req.body;

    if (!nama_peminjam || !id_alat) {
        return res.status(400).json({ message: 'Data peminjaman tidak valid' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO peminjaman ( id_alat, nama_peminjam, kelas, tanggal_pinjam, tanggal_kembali, jumlah, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                id_alat,
                nama_peminjam,
                kelas,
                tanggal_pinjam,
                tanggal_kembali,
                jumlah,
                status
            ]
        );
        res.status(201).json({
            message: 'Peminjaman berhasil ditambahkan',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Gagal menambahkan peminjaman:', error.message);
        res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan peminjaman' });
    }
});

app.put('/api/peminjaman/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { id_alat, nama_peminjam, kelas, tanggal_pinjam, tanggal_kembali, jumlah, status } = req.body;

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ message: 'ID peminjaman tidak valid' });
    }

    try {
        const result = await pool.query(
            `UPDATE peminjaman
             SET id_alat    = $1,
                 nama_peminjam = $2,
                 kelas        = $3,
                 tanggal_pinjam = $4,
                 tanggal_kembali = $5,
                 jumlah       = $6,
                 status       = $7
             WHERE id_peminjaman = $8
             RETURNING *`,
            [
                id_alat,
                nama_peminjam,
                kelas,
                tanggal_pinjam,
                tanggal_kembali,
                jumlah,
                status,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Peminjaman tidak ditemukan' });
        }
        res.status(200).json({
            message: 'Peminjaman berhasil diperbarui',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Gagal memperbarui peminjaman:', error.message);
        res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui peminjaman' });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});