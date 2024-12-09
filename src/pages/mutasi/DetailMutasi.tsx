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

const updateMutasi = async (perner: string, updatedData: Partial<DetailMutasi>): Promise<void> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan.");
  }

  const response = await fetch(
    `https://dome-backend-5uxq.onrender.com/mutasi/update/${perner}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
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
  navigate("/mutasi");
};

const DetailMutasi = () => {
  const { perner } = useParams<{ perner: string }>();
  const [data, setData] = useState<DetailMutasi | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [reason, setReason] = useState<string>("");
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<DetailMutasi>>({});

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetchMutasiDetail(perner!);
        setData(response);
        setFormData(response);
      } catch (err: any) {
        console.error("Gagal mengambil data detail mutasi:", err.message);
        setError("Gagal mengambil data. Periksa koneksi Anda.");
      }
    };

    getData();
  }, [perner]);

  const handleReject = () => {
    setIsRejecting(true);
  };

  const handleCancel = () => {
    setIsRejecting(false);
    setReason("");
  };

  const handleSave = async () => {
    try {
      await updateMutasi(perner!, formData);
      alert("Data berhasil diperbarui!");
      setData({ ...data, ...formData } as DetailMutasi);
      setIsEditing(false);
    } catch (err) {
      console.error("Gagal memperbarui data:", err);
      alert("Gagal memperbarui data.");
    }
  };

  const handleInputChange = (field: keyof DetailMutasi, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!data) {
    return <div className="text-center">Loading...</div>;
  }

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
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-700 hover:text-black transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-xl font-semibold text-blue-900">Detail Karyawan Mutasi</span>
        </button>
        <Button onClick={() => setIsEditing(!isEditing)}>{isEditing ? "Cancel" : "Edit"}</Button>
      </div>

      <div>
          <div className="flex gap-4">
            <h1 className="text-3xl font-bold text-black">{data.nama}</h1>
            <Badge className="bg-red-100 text-red-500 px-3 text-sm">
              {data.posisi_pekerjaan}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-semibold text-gray-500">Perner</span>
            <span className="text-lg text-red-600 font-semibold">{data.perner}</span>
            {/* <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={handleCopyPerner}
            >
              <Clipboard className="w-4 h-4 text-gray-600" />
            </Button> */}
          </div>
        </div>

      <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-8">
        <div className="space-y-4">
          <div className="flex gap-4">
            <h2 className="text-lg font-bold">Status Mutasi</h2>
            <Badge className={badgeColor}>{data.status_mutasi}</Badge>
          </div>

          <Alert className={`flex items-center ${alertColor}`}>
            {icon}
            <AlertDescription>
              <strong>{alertTitle}</strong>
              <br />
              {data.status_mutasi === "Ditolak" ? data.alasan_penolakan : alertDescription}
            </AlertDescription>
          </Alert>
        </div>

        <div className="grid grid-cols-2 gap-8">
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
          <div>
            <h3 className="text-red-500 font-bold mb-4">Mutasi</h3>
            <div className="space-y-4">
              <div>
                <Label>Unit Baru</Label>
                {isEditing ? (
                  <Input
                    value={formData.unit_baru || ""}
                    onChange={(e) => handleInputChange("unit_baru", e.target.value)}
                  />
                ) : (
                  <p>{data.unit_baru}</p>
                )}
              </div>
              <div>
                <Label>Sub Unit Baru</Label>
                {isEditing ? (
                  <Input
                    value={formData.sub_unit_baru || ""}
                    onChange={(e) => handleInputChange("sub_unit_baru", e.target.value)}
                  />
                ) : (
                  <p>{data.sub_unit_baru}</p>
                )}
              </div>
              <div>
                <Label>Posisi Baru</Label>
                {isEditing ? (
                  <Input
                    value={formData.posisi_baru || ""}
                    onChange={(e) => handleInputChange("posisi_baru", e.target.value)}
                  />
                ) : (
                  <p>{data.posisi_baru}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-center mt-6">
            <Button onClick={handleSave} className="bg-green-500 hover:bg-green-600">
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailMutasi;
