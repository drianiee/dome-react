import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import ListKaryawanHeader from "../../assets/ListKaryawanHeader.png";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const yearOptions = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 5 + i).toString());
const monthOptions = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

// Tambahkan tipe untuk payload token jika diperlukan
type TokenPayload = {
  id_roles: number;
  [key: string]: any;
};

type Karyawan = {
  perner: string;
  nama: string;
  unit: string;
  sub_unit: string;
  posisi_pekerjaan: string;
  skor_rating: string | "-";
  kategori_hasil_penilaian: string | null;
  bulan_pemberian: string | null;
  tahun_pemberian: number | null;
};

const fetchInitialData = async (): Promise<Karyawan[]> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token tidak ditemukan.");

  const response = await fetch("https://dome-backend-5uxq.onrender.com/rating", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Gagal mengambil data.");
  return await response.json();
};

const ListPenilaian = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Karyawan[]>([]);
  const [filteredData, setFilteredData] = useState<Karyawan[]>([]);
  const [search, setSearch] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<number | null>(null); // State untuk role pengguna

  // Ambil role dari token saat komponen dimuat
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: TokenPayload = jwtDecode(token);
        setUserRole(decoded.id_roles); // Simpan role pengguna
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }, []);

  useEffect(() => {
    fetchInitialData().then(setData).catch(() => setData([]));
  }, []);

  useEffect(() => {
    setFilteredData(data.filter(karyawan => karyawan.nama.toLowerCase().includes(search.toLowerCase())));
  }, [search, data]);

  const handleFilterSubmit = () => {
    navigate(`/penilaian/filtered-data?bulan=${selectedMonth}&tahun=${selectedYear}`);
  };
  const handleDetailClick = (perner: string) => {
    navigate(`/penilaian/${perner}`);
  };

  return (
    <div className="p-8">
      <div
        className="bg-cover bg-center rounded-lg mb-8 h-[180px]"
        style={{ backgroundImage: `url(${ListKaryawanHeader})` }}
      >
        <div className="p-8 text-white">
          <div className="flex gap-2 mb-4">
            <p className="text-xl text-[#FF0000]">#</p>
            <p className="text-xl text-gray-300">Elevating Your Future</p>
          </div>
          <h1 className="text-6xl font-bold">Penilaian Karyawan</h1>
        </div>
      </div>
      <div className="mb-4 flex gap-4 w-full">
        <Input type="text" placeholder="Cari karyawan..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-500 hover:bg-red-600 text-white">Filter Bulan & Tahun</Button>
          </DialogTrigger>
          <DialogContent>
            <h2 className="text-xl font-semibold mb-4">Pilih Bulan & Tahun</h2>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger><SelectValue placeholder="Pilih Bulan" /></SelectTrigger>
              <SelectContent>{monthOptions.map(bulan => <SelectItem key={bulan} value={bulan}>{bulan}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger><SelectValue placeholder="Pilih Tahun" /></SelectTrigger>
              <SelectContent>{yearOptions.map(tahun => <SelectItem key={tahun} value={tahun}>{tahun}</SelectItem>)}</SelectContent>
            </Select>
            <Button onClick={handleFilterSubmit} className="w-full bg-red-500 hover:bg-red-600">Terapkan Filter</Button>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Perner</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Sub Unit</TableHead>
            <TableHead>Posisi</TableHead>
            <TableHead>Skor Rating</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Bulan</TableHead>
            <TableHead>Tahun</TableHead>
            {userRole === 4 && <TableHead>Aksi</TableHead>}
            </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length > 0 ? (
            filteredData.map(karyawan => (
              <TableRow key={karyawan.perner}>
                <TableCell>{karyawan.perner}</TableCell>
                <TableCell>{karyawan.nama}</TableCell>
                <TableCell>{karyawan.unit}</TableCell>
                <TableCell>{karyawan.sub_unit}</TableCell>
                <TableCell>{karyawan.posisi_pekerjaan}</TableCell>
                <TableCell>{karyawan.skor_rating}</TableCell>
                <TableCell>{karyawan.kategori_hasil_penilaian || "-"}</TableCell>
                <TableCell>{karyawan.bulan_pemberian || "-"}</TableCell>
                <TableCell>{karyawan.tahun_pemberian || "-"}</TableCell>
                {userRole === 4 && (
                        <TableCell>
                          <Button
                            onClick={() => handleDetailClick(karyawan.perner)}
                            variant="outline"
                          >
                            Detail
                          </Button>
                        </TableCell>
                      )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center">Tidak ada data ditemukan</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ListPenilaian;
