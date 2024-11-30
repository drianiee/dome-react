import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Clipboard } from "lucide-react"; // Import ikon dari lucide-react
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type DetailKaryawan = {
  perner: string;
  status_karyawan: string;
  nama: string;
  jenis_kelamin: string;
  status_pernikahan: string;
  jumlah_anak: number;
  posisi_pekerjaan: string;
  kategori_posisi: string;
  unit: string;
  sub_unit: string;
  kota: string;
  nik_atasan: number;
  nama_atasan: string;

  sumber_anggaran: string;
  skema_umk: string;
  gaji_pokok: string;

  tunjangan_operasional: number; // Tunjangan operasional dalam angka
  pph_21: number; // PPH 21 dalam angka
  take_home_pay: string; // THP dalam angka
  tunjangan_hari_raya: number; // THR dalam angka
  gaji_kotor: number; // Gaji kotor dalam angka
  pajak_penghasilan: number; // Persentase pajak penghasilan
  thp_gross_pph_21: number; // THP Gross + PPH 21 dalam angka
  uang_kehadiran: number; // Uang kehadiran dalam angka
  bpjs_ketenagakerjaan: number; // BPJS Ketenagakerjaan dalam angka
  bpjs_kesehatan: number; // BPJS Kesehatan dalam angka
  perlindungan_asuransi: number; // Perlindungan asuransi dalam angka
  tunjangan_ekstra: string; // Tunjangan ekstra dalam teks
  invoice_bulanan: string; // Invoice bulanan dalam angka
  invoice_kontrak: string; // Invoice kontrak dalam angka
  tunjangan_lainnya: string; // Tunjangan lainnya dalam angka
  bergabung_sejak: string;
};

const fetchDetail = async (perner: string): Promise<any> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await fetch(`http://d8w8k0c8cw008wccwcg0cw4c.77.37.45.61.sslip.io/karyawan/${perner}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};


const DetailKaryawan = () => {
  const { perner } = useParams<{ perner: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<DetailKaryawan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const handleCopyPerner = () => {
    if (data) {
      navigator.clipboard.writeText(data.perner);
      alert("Perner copied to clipboard!");
    }
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetchDetail(perner!);
        setData(response);
        setError(null);
      } catch (err: any) {
        setError("Gagal mengambil data detail.");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [perner]);

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (loading || !data) {
    return (
      <div className="p-4">
        <Skeleton className="h-6 w-1/2 mb-4" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-2" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-700 hover:text-black transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-xl font-semibold text-blue-900">Detail Karyawan</span>
        </button>
      </div>

      {/* Main Info Section */}
      <div className="flex items-center justify-normal mb-4">
        <div>
          <div className="flex gap-4">
            <h1 className="text-3xl font-bold text-black">{data.nama}</h1>
            <Badge className="bg-red-100 text-red-500 px-3 text-sm">
              {data.kategori_posisi}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-semibold text-gray-500">Perner</span>
            <span className="text-lg text-red-600 font-semibold">{data.perner}</span>
            <Button
              variant="outline"
              size="sm"
              className="ml-2 p-1"
              onClick={handleCopyPerner}
            >
              <Clipboard className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Detail Section */}
      <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm">
        {/* Header Section */}
        <div className="flex w-full px-6 py-4 border-b-2">
          <h2 className="text-xl font-bold">Detail Pekerjaan</h2>
        </div>

        {/* Informasi Section */}
        <div className="grid grid-cols-2 gap-6 p-6">
          {/* Informasi Personal */}
          <div>
            <h3 className="text-md font-bold text-red-500 mb-4">Informasi Personal</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-[#ABABAB]">Jenis Kelamin</p>
                <p className="text-base font-semibold">{data.jenis_kelamin}</p>
              </div>
              <div>
                <p className="text-sm text-[#ABABAB]">Status</p>
                <p className="text-base font-semibold">{data.status_pernikahan}</p>
              </div>
              <div>
                <p className="text-sm text-[#ABABAB]">Jumlah Anak</p>
                <p className="text-base font-semibold">{data.jumlah_anak}</p>
              </div>
            </div>
          </div>

          {/* Informasi Pekerjaan */}
          <div>
            <h3 className="text-md font-bold text-red-500 mb-4">Informasi Pekerjaan</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#ABABAB]">Posisi</p>
                <p className="text-base font-semibold">{data.posisi_pekerjaan}</p>
              </div>
              <div>
                <p className="text-sm text-[#ABABAB]">Kota</p>
                <p className="text-base font-semibold">{data.kota}</p>
              </div>
              <div>
                <p className="text-sm text-[#ABABAB]">Kategori Posisi</p>
                <p className="text-base font-semibold">{data.kategori_posisi}</p>
              </div>
              <div>
                <p className="text-sm text-[#ABABAB]">NIK Atasan</p>
                <p className="text-base font-semibold">790110</p>
              </div>
              <div>
                <p className="text-sm text-[#ABABAB]">Unit</p>
                <p className="text-base font-semibold">{data.unit}</p>
              </div>
              <div>
                <p className="text-sm text-[#ABABAB]">Nama Atasan</p>
                <p className="text-base font-semibold">{data.nama_atasan}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-[#ABABAB]">Sub Unit</p>
                <p className="text-base font-semibold">{data.sub_unit}</p>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Kompensasi dan Tunjangan */}
      <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        {/* Header Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Kompensasi dan Tunjangan</h2>
        </div>

        {/* Kompensasi dan Tunjangan */}
        <div className="grid grid-cols-4 gap-6">
          {/* Kolom 1: Kompensasi dan Gaji */}
          <div>
            <h3 className="text-md font-semibold text-red-500 mb-4">Kompensasi dan Gaji</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Sumber Anggaran</p>
                <p className="text-base font-semibold">{data.sumber_anggaran}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Skema UMK</p>
                <p className="text-base font-semibold">{data.skema_umk}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gaji Pokok</p>
                <p className="text-base font-semibold">
                  {parseFloat(data.gaji_pokok).toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tunjangan Operasional</p>
                <p className="text-base font-semibold">{data.tunjangan_operasional}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">PPH 21</p>
                <p className="text-base font-semibold">{data.pph_21}</p>
              </div>
            </div>
          </div>

          {/* Kolom 2: Detail Kompensasi */}
          <div>
            <h3 className="text-md font-semibold text-red-500 mb-4">Detail Kompensasi</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">THP (Take Home Pay)</p>
                <p className="text-base font-semibold">
                  {parseFloat(data.take_home_pay).toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">THR (Tunjangan Hari Raya)</p>
                <p className="text-base font-semibold">{data.tunjangan_hari_raya}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">PENGHASILAN BRUTO (Gaji Kotor)</p>
                <p className="text-base font-semibold">{data.gaji_kotor}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">% PPH (Pajak Penghasilan)</p>
                <p className="text-base font-semibold">{data.pajak_penghasilan}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">THP GROSS + PPH 21</p>
                <p className="text-base font-semibold">{data.thp_gross_pph_21}</p>
              </div>
            </div>
          </div>

          {/* Kolom 3: Tunjangan dan Perlindungan */}
          <div>
            <h3 className="text-md font-semibold text-red-500 mb-4">Tunjangan dan Perlindungan</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">UAK (Uang Kehadiran)</p>
                <p className="text-base font-semibold">{data.uang_kehadiran}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">BPJS TK (BPJS Ketenagakerjaan)</p>
                <p className="text-base font-semibold">{data.bpjs_ketenagakerjaan}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">BPJS KES (BPJS Kesehatan)</p>
                <p className="text-base font-semibold">{data.bpjs_kesehatan}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">PAKSER (Perlindungan Asuransi)</p>
                <p className="text-base font-semibold">{data.perlindungan_asuransi}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">TER (Tunjangan Ekstra)</p>
                <p className="text-base font-semibold">{data.tunjangan_ekstra}</p>
              </div>
            </div>
          </div>

          {/* Kolom 4: Invoice */}
          <div>
            <h3 className="text-md font-semibold text-red-500 mb-4">Invoice dan Tunjangan Lainnya</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Invoice / Bulan</p>
                <p className="text-base font-semibold">
                  {parseFloat(data.invoice_bulanan).toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Invoice / Kontrak</p>
                <p className="text-base font-semibold">
                  {parseFloat(data.invoice_kontrak).toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">MF (Tunjangan Lainnya)</p>
                <p className="text-base font-semibold">
                  {parseFloat(data.tunjangan_lainnya).toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Riwayat Pekerjaan */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Pekerjaan</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-sm text-gray-500">Bergabung Sejak</p>
              <p className="text-base font-semibold">{data.bergabung_sejak}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DetailKaryawan;