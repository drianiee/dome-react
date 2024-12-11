import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, AlertCircle, AlertTriangle, XCircle, Pencil, Clipboard} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

type UnitData = {
  unit_baru: string;
  sub_unit_baru: string[];
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

const fetchUnitData = async (): Promise<UnitData[]> => {
  const response = await fetch("https://dome-backend-5uxq.onrender.com/unit-dropdown");
  if (!response.ok) throw new Error("Gagal mengambil data unit.");
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




const DetailMutasi = () => {
  const { perner } = useParams<{ perner: string }>();
  const [data, setData] = useState<DetailMutasi | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [reason, setReason] = useState<string>("");
  // const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<DetailMutasi>>({});
  const [unitData, setUnitData] = useState<UnitData[]>([]);
  const [subUnitOptions, setSubUnitOptions] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  
  const rejectMutasi = async (perner: string, reason: string) => {
    // const rejectMutasi = async (perner: string, reason: string, navigate: Function) => {
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
      // setIsRejecting(false); // Tutup form penolakan
      // navigate("/mutasi"); // Redirect setelah berhasil
    } catch (error) {
      console.error("Kesalahan jaringan:", error);
      alert("Kesalahan jaringan. Periksa koneksi Anda.");
    }
  };

  const approveMutasi = async (perner: string) => {
    //  const approveMutasi = async (perner: string, navigate: Function) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token tidak ditemukan. Silakan login kembali.");
      return;
    }
  
    try {
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
        const errorData = await response.json();
        alert(`Gagal menyetujui mutasi: ${errorData.message}`);
        return;
      }
  
      // Perbarui status di state `data`
      setData((prevData) =>
        prevData ? { ...prevData, status_mutasi: "Disetujui" } : null
      );
  
      // alert("Mutasi berhasil disetujui!");
    } catch (error) {
      console.error("Kesalahan jaringan:", error);
      alert("Kesalahan jaringan. Periksa koneksi Anda.");
    }
  };
  
  
  const handleCopyPerner = () => {
    if (data) {
      navigator.clipboard.writeText(data.perner);
    }
  };

  const handleUnitChange = (unit: string) => {
    const selectedUnit = unitData.find((u) => u.unit_baru === unit);
    setFormData({ ...formData, unit_baru: unit, sub_unit_baru: "" });
    setSubUnitOptions(selectedUnit?.sub_unit_baru || []);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const [mutasiDetail, units] = await Promise.all([fetchMutasiDetail(perner!), fetchUnitData()]);
        setData(mutasiDetail);
        setFormData(mutasiDetail);
        setUnitData(units);
        const selectedUnit = units.find((u) => u.unit_baru === mutasiDetail.unit_baru);
        setSubUnitOptions(selectedUnit?.sub_unit_baru || []);
      } catch (err: any) {
        setError("Gagal mengambil data. Periksa koneksi Anda.");
      }
    };
    getData();
  }, [perner]);

  // const handleReject = () => {
  //   setIsRejecting(true);
  // };

  // const handleCancel = () => {
  //   setIsRejecting(false);
  //   setReason("");
  // };

  const handleSave = async () => {
    try {
      await updateMutasi(perner!, {
        unit_baru: formData.unit_baru,
        sub_unit_baru: formData.sub_unit_baru,
        posisi_baru: formData.posisi_baru,
      });
      setData({ ...data, ...formData } as DetailMutasi);
      setIsEditing(false);
    } catch (err) {
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
          <span className="text-xl font-semibold text-blue-900">Detail Mutasi</span>
        </button>
      </div>

      <div className="flex items-end mb-4 justify-between">
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
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={handleCopyPerner}
            >
              <Clipboard className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
        </div>
        {[2].includes(parseInt(localStorage.getItem("role") || "0", 10)) &&
          !["Disetujui", "Ditolak"].includes(data.status_mutasi) && ( // Tambahkan kondisi
            <div className="flex">
              <Button
                variant="outline"
                className={`flex items-center gap-2 px-4 py-2 text-base ${
                  isEditing
                    ? "" // Warna untuk "Cancel"
                    : "bg-red-100 text-red-500 hover:bg-[#CF3C3C] hover:text-white" // Warna untuk "Edit"
                }`}
                onClick={() => setIsEditing(!isEditing)}
              >
                {!isEditing && <Pencil className="w-5 h-5" />} {/* Tambahkan ikon jika tidak sedang mengedit */}
                {isEditing ? "Cancel" : "Edit Data"}
              </Button>
              {isEditing && (
                <Button
                  className="ml-4 px-4 py-2 text-base bg-red-100 text-red-500 hover:bg-[#CF3C3C] hover:text-white"
                  onClick={handleSave}
                >
                  Save
                </Button>
              )}
            </div>
          )}

          {parseInt(localStorage.getItem("role") || "0", 10) === 4 && (
          !["Disetujui", "Ditolak"].includes(data.status_mutasi) && ( // Tambahkan kondisi
            <div className="flex gap-4 justify-center mt-6">
              <Button
                onClick={() => approveMutasi(data.perner)}
                className="bg-[#a9e6bb] text-[#065F46] hover:bg-[#4ea468] hover:text-white"
              >
                Setujui
              </Button>
              <Button
              onClick={() => {
                setIsDialogOpen(true);
                // handleReject();
              }}              
              className="bg-red-100 text-[#991B1B] hover:bg-[#CF3C3C] hover:text-white"
              >
                Tolak
              </Button>
            </div>
          ))}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Penolakan</DialogTitle>
            </DialogHeader>
            <div className="mt-6">
              <Input
                type="text"
                placeholder="Masukkan alasan penolakan"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mb-4"
              />
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => {
                    rejectMutasi(data.perner, reason); // Panggil handleReject di sini
                    setIsDialogOpen(false); // Tutup dialog setelah konfirmasi
                  }}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Konfirmasi Tolak
                </Button>
                <Button
                  onClick={() => setIsDialogOpen(false)} // Batalkan dan tutup dialog
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  Batal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-8">
        <div className="space-y-4">
          <div className="flex gap-4">
            <h2 className="text-lg font-bold">Status Mutasi</h2>
            <Badge className={badgeColor}>{data.status_mutasi}</Badge>
          </div>
          <Alert className={`flex items-center  ${alertColor}`}>
            {icon}
            <AlertDescription>
              <strong>{alertTitle}</strong>
              <br />
              {data.status_mutasi === "Ditolak" ? data.alasan_penolakan : alertDescription}
            </AlertDescription>
          </Alert>
        </div>

        <div className="grid grid-cols-2 gap-6">
        <div>
            <h3 className="text-red-500 font-bold mb-4">Informasi Pekerjaan Saat Ini</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#ABABAB]">Unit</p>
                <p className="text-base font-semibold">{data.unit}</p>
              </div>
              <div>
                <p className="text-sm text-[#ABABAB]">Sub Unit</p>
                <p className="text-base font-semibold">{data.sub_unit}</p>
              </div>
              <div>
                <p className="text-sm text-[#ABABAB]">NIK Atasan</p>
                <p className="text-base font-semibold">{data.nik_atasan}</p>
              </div>
              <div>
                <p className="text-sm text-[#ABABAB]">Nama Atasan</p>
                <p className="text-base font-semibold">{data.nama_atasan}</p>
              </div>
              <div>
                <p className="text-sm text-[#ABABAB]">Posisi</p>
                <p className="text-base font-semibold">{data.posisi_pekerjaan}</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-red-500 font-bold mb-4">Mutasi</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#ABABAB]">Unit Baru</p>
                {isEditing ? (
                  <select
                    className="border rounded-md w-full p-2"
                    value={formData.unit_baru || ""}
                    onChange={(e) => handleUnitChange(e.target.value)}
                  >
                    <option value="">Pilih Unit</option>
                    {unitData.map((unit) => (
                      <option key={unit.unit_baru} value={unit.unit_baru}>
                        {unit.unit_baru}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-base font-semibold">{data.unit_baru}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-[#ABABAB]">Sub-Unit Baru</p>
                {isEditing ? (
                  <select
                    className="border rounded-md w-full p-2"
                    value={formData.sub_unit_baru || ""}
                    onChange={(e) => setFormData({ ...formData, sub_unit_baru: e.target.value })}
                  >
                    <option value="">Pilih Sub Unit</option>
                    {subUnitOptions.map((subUnit) => (
                      <option key={subUnit} value={subUnit}>
                        {subUnit}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-base font-semibold">{data.sub_unit_baru}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-[#ABABAB]">Posisi Baru</p>
                {isEditing ? (
                  <Input
                    value={formData.posisi_baru || ""}
                    onChange={(e) => handleInputChange("posisi_baru", e.target.value)}
                  />
                ) : (
                  <p className="text-base font-semibold">{data.posisi_baru}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailMutasi;
