import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


type DetailMutasi = {
  status_mutasi: string;
  nama: string;
  perner: string;
  unit: string;
  sub_unit: string;
  nik_atasan: string;
  nama_atasan: string;
  posisi_pekerjaan: string;
  unit_baru: string;
  sub_unit_baru: string;
  posisi_baru: string;
  created_at: string;
};

const fetchMutasiDetail = async (perner: string): Promise<DetailMutasi> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await fetch(
    `http://d8w8k0c8cw008wccwcg0cw4c.77.37.45.61.sslip.io/mutasi/${perner}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const DetailMutasi = () => {
  const { perner } = useParams<{ perner: string }>();
  const [data, setData] = useState<DetailMutasi | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        if (perner) {
          const response = await fetchMutasiDetail(perner);
          setData(response);
        }
      } catch (err: any) {
        console.error("Gagal mengambil data detail mutasi:", err.message);
        setError("Gagal mengambil data. Periksa koneksi Anda.");
      }
    };

    getData();
  }, [perner]);

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!data) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="p-20">
      <Card className="max-w-xl mx-auto mb-4">
        <CardHeader>
          <CardTitle>Detail Mutasi Karyawan</CardTitle>
          <div className="flex gap-2">
          <CardDescription>Perner: {data.perner}</CardDescription>
          <Badge variant="outline" className="mb-4">
            {data.status_mutasi}
          </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p><strong>Nama:</strong> {data.nama}</p>
          <p><strong>Status Mutasi:</strong> {data.status_mutasi}</p>
          <p><strong>Unit Lama:</strong> {data.unit} ({data.sub_unit})</p>
          <p><strong>Posisi Lama:</strong> {data.posisi_pekerjaan}</p>
        </CardContent>
      </Card>
      <Card className="max-w-xl mx-auto pt-6">
        <CardContent>
          <p><strong>Unit Baru:</strong> {data.unit_baru} ({data.sub_unit_baru})</p>
          <p><strong>Posisi Baru:</strong> {data.posisi_baru}</p>
          <p><strong>Nama Atasan:</strong> {data.nama_atasan} ({data.nik_atasan})</p>
          <p><strong>Tanggal Mutasi:</strong> {new Date(data.created_at).toLocaleString("id-ID")}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailMutasi;
