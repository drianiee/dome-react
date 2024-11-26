import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  nama_atasan: string;
  sumber_anggaran: string;
  skema_umk: string;
  gaji_pokok: string;
  take_home_pay: string;
  gaji_kotor: string;
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
  const [data, setData] = useState<DetailKaryawan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <Card className="p-4 w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Detail Karyawan</CardTitle>
              <CardDescription>
                Informasi lengkap mengenai karyawan dengan perner <Badge>{data.perner}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong>Nama:</strong> {data.nama}
              </div>
              <div>
                <strong>Status:</strong> <Badge variant="outline">{data.status_karyawan}</Badge>
              </div>
              <div>
                <strong>Jenis Kelamin:</strong> {data.jenis_kelamin}
              </div>
              <div>
                <strong>Status Pernikahan:</strong> {data.status_pernikahan} ({data.jumlah_anak} Anak)
              </div>
              <div>
                <strong>Posisi:</strong> {data.posisi_pekerjaan} - {data.kategori_posisi}
              </div>
              <div>
                <strong>Unit:</strong> {data.unit}
              </div>
              <div>
                <strong>Sub Unit:</strong> {data.sub_unit}
              </div>
              <div>
                <strong>Kota:</strong> {data.kota}
              </div>
              <div>
                <strong>Nama Atasan:</strong> {data.nama_atasan}
              </div>
              <div>
                <strong>Sumber Anggaran:</strong> {data.sumber_anggaran}
              </div>
              <div>
                <strong>Gaji Pokok:</strong>{" "}
                {parseFloat(data.gaji_pokok).toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
              </div>
              <div>
                <strong>Gaji Kotor:</strong>{" "}
                {parseFloat(data.gaji_kotor).toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
              </div>
              <div>
                <strong>Take Home Pay:</strong>{" "}
                {parseFloat(data.take_home_pay).toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
              </div>
              <div>
                <strong>Bergabung Sejak:</strong> {data.bergabung_sejak}
              </div>
            </CardContent>
          </Card>
        </div>      
  );
};

export default DetailKaryawan;
