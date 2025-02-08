import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
import ListKaryawanHeader from "../../assets/ListKaryawanHeader.png";
import { ArrowLeft } from "lucide-react";

type Karyawan = {
  perner: string;
  nama: string;
  unit: string;
  sub_unit: string;
  posisi_pekerjaan: string;
  skor_rating: number;
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
    return result.data as Karyawan[];
  }
  throw new Error("API tidak mengembalikan array.");
};

const FilteredPenilaian = () => {
    const navigate = useNavigate();

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const bulan = params.get("bulan") || "";
  const tahun = params.get("tahun") || "";

  const [data, setData] = useState<Karyawan[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchFilteredData(bulan, tahun);
        setData(response || []);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.";
        console.error("Failed to fetch filtered data:", errorMessage);
        setError("Gagal mengambil data. Periksa koneksi Anda.");
        setData([]);
      }
    };

    fetchData();
  }, [bulan, tahun]);

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
          <h1 className="text-6xl font-bold">Penilaian Karyawan - {bulan} {tahun}</h1>
        </div>
      </div>    
      <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-700 hover:text-black transition-all mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-xl font-semibold text-blue-900">Penilaian Karyawan</span>
        </button>  
      {error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Perner</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Sub Unit</TableHead>
              <TableHead>Posisi</TableHead>
              <TableHead>Skor Rating</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((karyawan) => (
                <TableRow key={karyawan.perner}>
                  <TableCell>{karyawan.perner}</TableCell>
                  <TableCell>{karyawan.nama}</TableCell>
                  <TableCell>{karyawan.unit}</TableCell>
                  <TableCell>{karyawan.sub_unit}</TableCell>
                  <TableCell>{karyawan.posisi_pekerjaan}</TableCell>
                  <TableCell>{karyawan.skor_rating}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Tidak ada data ditemukan</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default FilteredPenilaian;
