import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Untuk navigasi antar halaman
import ListKaryawanHeader from '../../assets/ListKaryawanHeader.png';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await fetch(`https://dome-backend-5uxq.onrender.com/rating`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const result = await response.json();

  if (!Array.isArray(result)) {
    console.error("API response is not an array:", result);
    throw new Error("API tidak mengembalikan array.");
  }

  return result;
};

const fetchFilteredData = async (bulan: string, tahun: string): Promise<Karyawan[]> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await fetch(
    `https://dome-backend-5uxq.onrender.com/rating/filter?bulan_pemberian=${bulan}&tahun_pemberian=${tahun}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const result = await response.json();

  if (result && result.data && Array.isArray(result.data)) {
    return result.data;
  }

  throw new Error("API tidak mengembalikan array.");
};

const ListKaryawan = () => {
  const navigate = useNavigate(); // Untuk navigasi ke halaman detail
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();

  const [data, setData] = useState<Karyawan[]>([]);
  const [filteredData, setFilteredData] = useState<Karyawan[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filterBulan, setFilterBulan] = useState<string>("");
  const [filterTahun, setFilterTahun] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const yearOptions = Array.from({ length: 10 }, (_, i) => (parseInt(currentYear) - 5 + i).toString());

  useEffect(() => {
    const getInitialData = async () => {
      try {
        const response = await fetchInitialData();
        setData(response || []);
        setFilteredData(response || []);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch initial data:", err.message);
        setError("Gagal mengambil data. Periksa koneksi Anda.");
        setData([]);
      }
    };
    getInitialData();
  }, []);

  useEffect(() => {
    if (!filterBulan || !filterTahun) return;

    const getFilteredData = async () => {
      try {
        const response = await fetchFilteredData(filterBulan, filterTahun);
        setData(response || []);
        setFilteredData(response || []);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch filtered data:", err.message);
        setError("Gagal mengambil data. Periksa koneksi Anda.");
        setData([]);
      }
    };

    getFilteredData();
  }, [filterBulan, filterTahun]);

  useEffect(() => {
    const searchData = data.filter((karyawan) =>
      karyawan.nama.toLowerCase().includes(search.trim().toLowerCase())
    );
    setFilteredData(searchData);
  }, [search, data]);

  const handleDetailClick = (perner: string) => {
    navigate(`/penilaian/${perner}`); // Navigasi ke halaman detail
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

      {error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <>
          <div className="mb-4 flex gap-4 w-full">
            <Input
              type="text"
              placeholder="Cari karyawan berdasarkan nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Select value={filterBulan} onValueChange={setFilterBulan}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Januari",
                  "Februari",
                  "Maret",
                  "April",
                  "Mei",
                  "Juni",
                  "Juli",
                  "Agustus",
                  "September",
                  "Oktober",
                  "November",
                  "Desember",
                ].map((bulan) => (
                  <SelectItem key={bulan} value={bulan}>
                    {bulan}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterTahun} onValueChange={setFilterTahun}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((tahun) => (
                  <SelectItem key={tahun} value={tahun}>
                    {tahun}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <TableHead>Aksi</TableHead>


              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((karyawan) => (
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
                      <TableCell>
                        <Button
                          onClick={() => handleDetailClick(karyawan.perner)}
                          variant="outline"
                        >
                          Detail
                        </Button>
                      </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center">
                    Tidak ada data ditemukan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
};

export default ListKaryawan;
