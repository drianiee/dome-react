import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Import Button component
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Input } from "@/components/ui/input"; // Ensure this import exists

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

const approveMutasi = async (perner: string, navigate: Function) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Token tidak ditemukan.");
  }

  const response = await fetch(
    `http://d8w8k0c8cw008wccwcg0cw4c.77.37.45.61.sslip.io/mutasi/${perner}/persetujuan`,
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

const rejectMutasi = async (perner: string, reason: string, navigate: Function) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Token tidak ditemukan.");
  }

  const response = await fetch(
    `http://d8w8k0c8cw008wccwcg0cw4c.77.37.45.61.sslip.io/mutasi/${perner}/penolakan`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ alasan_penolakan: reason }) // Send the rejection reason
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
  const [userRole, setUserRole] = useState<number | null>(null); // Track user role
  const [reason, setReason] = useState<string>(""); // Reason for rejection
  const [isRejecting, setIsRejecting] = useState<boolean>(false); // Track if rejection is being edited
  const navigate = useNavigate();

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

    const getUserRole = () => {
      const role = localStorage.getItem("role"); // Assuming role is saved in localStorage
      setUserRole(role ? parseInt(role) : null); // Ensure role is parsed as an integer
    };

    getData();
    getUserRole();
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

      {/* Show Approve/Reject buttons for superadmin (id_roles = 2) */}
      {userRole === 2 && (
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
      )}

      {/* Display rejection form if rejecting */}
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
  );
};

export default DetailMutasi;
