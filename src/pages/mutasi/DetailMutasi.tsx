import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, AlertCircle, AlertTriangle, XCircle } from "lucide-react";

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
  alasan_penolakan?: string;
};

const fetchMutasiDetail = async (perner: string): Promise<DetailMutasi> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await fetch(
    `https://dome-backend-5uxq.onrender.com/mutasi/${perner}`,
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

const approveMutasi = async (perner: string, navigate: Function) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Token tidak ditemukan.");
  }

  const response = await fetch(
    `https://dome-backend-5uxq.onrender.com/mutasi/${perner}/persetujuan`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  // Redirect to mutasi page after success
  navigate("/mutasi");
};

const DetailMutasi = () => {
  const { perner } = useParams<{ perner: string }>();
  const [data, setData] = useState<DetailMutasi | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [reason, setReason] = useState<string>(""); // Reason for rejection
  const [isRejecting, setIsRejecting] = useState<boolean>(false); // Track if rejection is being edited

  const rejectMutasi = async (perner: string, reason: string, navigate: Function) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token tidak ditemukan. Silakan login kembali.");
      return;
    }
  
    try {
      const response = await fetch(
        `https://dome-backend-5uxq.onrender.com/mutasi/${perner}/penolakan`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ alasan_penolakan: reason }),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json(); // Tangkap pesan error dari server
        console.error("Respons error dari server:", errorData);
        alert(`Error: ${errorData.message || "Gagal melakukan penolakan."}`);
        return;
      }
    // Perbarui data jika berhasil
      setData((prevData) =>
        prevData ? { ...prevData, status_mutasi: "Ditolak", alasan_penolakan: reason } : null
      );
      setIsRejecting(false); // Tutup form penolakan
      } catch (error) {
        console.error("Kesalahan jaringan:", error);
        alert("Kesalahan jaringan. Periksa koneksi Anda.");
      }
      navigate("/mutasi");
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetchMutasiDetail(perner!);
        setData(response);
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

  const handleReject = () => {
    setIsRejecting(true); // Enable the rejection form
  };

  const handleCancel = () => {
    setIsRejecting(false); // Disable the rejection form
    setReason(""); // Clear the reason input
  };

  // Mendefinisikan warna, ikon, dan teks berdasarkan status
  const getStatusProps = () => {
    switch (data.status_mutasi.toLowerCase()) {
      case "diproses":
        return {
          badgeColor: "bg-[#F09E1A] text-white font-bold",
          alertColor: "bg-[#FEFCE8] text-[#854D0E]",
          icon: <AlertTriangle className="h-5 w-5 !text-[#854D0E] mr-3" />,
          alertTitle: "Usulan Mutasi Diperiksa",
          alertDescription: "Harap Menunggu Proses Verifikasi",
        };
      case "ditolak":
        return {
          badgeColor: "bg-[#F01A1A] text-white font-bold",
          alertColor: "bg-[#FEF2F2] text-[#991B1B]",
          icon: <XCircle className="h-5 w-5 !text-[#991B1B] mr-3" />,
          alertTitle: "Usulan Mutasi Ditolak oleh Atasan",
          alertDescription: data.alasan_penolakan || "Tidak ada alasan yang diberikan.",
        };
      case "disetujui":
        return {
          badgeColor: "bg-[#1CB941] text-white",
          alertColor: "bg-[#F0FDF4] text-[#065F46]",
          icon: <CheckCircle className="h-5 w-5 !text-[#065F46] mr-3" />,
          alertTitle: "Usulan Disetujui",
          alertDescription: "Usulan Mutasi Anda Telah Disetujui oleh Atasan",
        };
      default:
        return {
          badgeColor: "bg-gray-500 text-white",
          alertColor: "bg-gray-100 text-gray-700",
          icon: <AlertCircle className="h-5 w-5 text-gray-700 mr-3" />,
          alertTitle: "Status Tidak Diketahui",
          alertDescription: "Status mutasi tidak valid.",
        };
    }
  };

  const { badgeColor, alertColor, icon, alertTitle, alertDescription } = getStatusProps();

  return (
    <div className="p-10 space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-700 hover:text-black transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-xl font-semibold text-blue-900">Detail Karyawan Mutasi</span>
        </button>
      </div>

      {/* Wrapper untuk semua elemen utama dengan border */}
      <div className="border border-[#E9E9E9] rounded-lg p-6 space-y-8">
        {/* Header Status */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <h2 className="text-lg font-bold">Status Mutasi</h2>
            <Badge className={badgeColor}>{data.status_mutasi}</Badge>
          </div>

          {/* Alert Status */}
          <Alert className={`flex items-center ${alertColor}`}>
            {icon}
            <AlertDescription>
              <strong>{alertTitle}</strong>
              <br />
              {data.status_mutasi === "Ditolak" ? data.alasan_penolakan : alertDescription}
            </AlertDescription>
          </Alert>
        </div>

        {/* Informasi Tambahan */}
        <div className="grid grid-cols-2 gap-8">
          {/* Informasi Pekerjaan Saat Ini */}
          <div>
            <h3 className="text-red-500 font-bold mb-4">Informasi Pekerjaan Saat Ini</h3>
            <div className="space-y-4">
              <div>
                <Label className="font-bold">Unit</Label>
                <p>{data.unit}</p>
              </div>
              <div>
                <Label className="font-bold">Sub Unit</Label>
                <p>{data.sub_unit}</p>
              </div>
              <div>
                <Label className="font-bold">NIK Atasan</Label>
                <p>{data.nik_atasan}</p>
              </div>
              <div>
                <Label className="font-bold">Nama Atasan</Label>
                <p>{data.nama_atasan}</p>
              </div>
              <div>
                <Label className="font-bold">Posisi</Label>
                <p>{data.posisi_pekerjaan}</p>
              </div>
            </div>
          </div>

          {/* Informasi Mutasi */}
          <div>
            <h3 className="text-red-500 font-bold mb-4">Mutasi</h3>
            <div className="space-y-4">
              <div>
                <Label>Unit Baru</Label>
                <Input value={data.unit_baru} disabled />
              </div>
              <div>
                <Label>Sub Unit Baru</Label>
                <Input value={data.sub_unit_baru} disabled />
              </div>
              <div>
                <Label>Posisi Baru</Label>
                <Input value={data.posisi_baru} disabled />
              </div>
            </div>
          </div>
        </div>

        {/* Approve dan Reject */}
        <div className="flex gap-4 justify-center mt-6">
          <Button
            onClick={() => approveMutasi(data.perner, navigate)}
            className="bg-green-500 hover:bg-green-600"
          >
            Approve
          </Button>
          <Button
            onClick={handleReject}
            className="bg-red-500 hover:bg-red-600"
          >
            Reject
          </Button>
        </div>

        {/* Konfirmasi Penolakan */}
        {isRejecting && (
          <div className="mt-6">
            <Input
              type="text"
              placeholder="Enter rejection reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mb-4"
            />
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => rejectMutasi(data.perner, reason, navigate)}
                className="bg-red-500 hover:bg-red-600"
              >
                Confirm Reject
              </Button>
              <Button
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailMutasi;
