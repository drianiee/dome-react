import { useEffect, useState } from "react";
import ListKaryawanHeader from '../../assets/ListKaryawanHeader.png';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

type DashboardData = {
  karyawan_aktif: number;
  total_karyawan: number;
  jumlah_karyawan: {
    berdasarkan_jenis_kelamin: { jenis_kelamin: string; jumlah: number }[];
    berdasarkan_usia: { range_umur: { range_umur: string; jumlah: string } }[];
    berdasarkan_unit: { nama_unit: string; data_bulanan: { bulan: string; jumlah: number }[] }[];
  };
};

const fetchDashboardData = async (): Promise<DashboardData> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await fetch("https://dome-backend-5uxq.onrender.com/dashboard", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.dashboardSummary;
};

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardData = await fetchDashboardData();
        setData(dashboardData);

        // Set default unit untuk pertama kali
        if (dashboardData?.jumlah_karyawan?.berdasarkan_unit.length > 0) {
          setSelectedUnit(dashboardData.jumlah_karyawan.berdasarkan_unit[0].nama_unit);
        }
      } catch (err: any) {
        setError(err.message || "Gagal mengambil data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <Skeleton className="h-screen w-full" />;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!data) {
    return null;
  }

  const COLORS = ["#007bff", "#ffc107", "#28a745", "#dc3545"];

  // Filter unit berdasarkan unit yang dipilih
  const filteredUnitData =
    data.jumlah_karyawan.berdasarkan_unit.find((unit) => unit.nama_unit === selectedUnit)
      ?.data_bulanan || [];

  // Data untuk Pie Charts
  const genderChartData = data.jumlah_karyawan.berdasarkan_jenis_kelamin.map((item) => ({
    name: item.jenis_kelamin,
    value: item.jumlah,
  }));

  const ageChartData = data.jumlah_karyawan.berdasarkan_usia.map((item) => ({
    name: item.range_umur.range_umur,
    value: parseInt(item.range_umur.jumlah),
  }));

  return (
    <div className="p-8">
      {/* Banner Section */}
      <div
        className="bg-cover bg-center rounded-lg mb-8 h-[180px]"
        style={{ backgroundImage: `url(${ListKaryawanHeader})` }}
      >
        <div className="p-8 text-white">
          <div className="flex gap-2 mb-4">
            <p className="text-xl text-[#FF0000]">#</p>
            <p className="text-xl text-gray-300">Elevating Your Future</p>
          </div>
          <h1 className="text-6xl font-bold">Dashboard</h1>
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="bg-white p-2">
          <CardContent>
            <h2 className=" text-4xl font-bold text-[#3A30FE] mb-2">{data.karyawan_aktif}</h2>
            <p className="text-gray-500 text-xl">Karyawan Aktif</p>
          </CardContent>
        </Card>
        <Card className="bg-white p-2">
          <CardContent>
            <h2 className="text-4xl font-bold text-green-500">{data.total_karyawan}</h2>
            <p className="text-gray-500 text-xl">Total Karyawan</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-[2fr,1fr] gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Total Karyawan {" "}
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Pilih Unit" />
                </SelectTrigger>
                <SelectContent>
                  {data.jumlah_karyawan.berdasarkan_unit.map((unit) => (
                    <SelectItem key={unit.nama_unit} value={unit.nama_unit}>
                      {unit.nama_unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-72"> {/* Kontainer dengan tinggi tetap */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredUnitData}
                margin={{ top: 10, right: 10, left: -22, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="2 2" />
                <XAxis
                  dataKey="bulan"
                  interval={0}
                  tickMargin={10}
                  tickFormatter={(value) => value.substring(0, 3)}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="jumlah" fill="#007bff" />
              </BarChart>
            </ResponsiveContainer>

            </div>
          </CardContent>


        </Card>

        {/* Pie Charts */}
        <Card>
          <CardHeader>
            <CardTitle>Jumlah Karyawan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">

              {/* Jenis Kelamin */}
              <div className="flex flex-col justify-center items-center">
                <PieChart width={200} height={200}>
                  <Pie
                    data={genderChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                  >
                  {genderChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}

                  </Pie>
                  <Tooltip />
                </PieChart>
                <h2 className="text-lg font-medium text-[#8F8F8F] text-center mt-2">Jenis Kelamin</h2>

                {/* Legend */}
                <div className="flex flex-col items-start mt-4 space-y-2">
                  {genderChartData.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="text-sm text-gray-600">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>


              {/* Usia */}
              <div className="flex flex-col justify-center items-center">
                <PieChart width={200} height={200}>
                  <Pie
                    data={ageChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                  >
                  {ageChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
                <h2 className="text-lg font-medium text-[#8F8F8F] text-center mt-2">Usia</h2>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {ageChartData.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="text-sm text-gray-600">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>


            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
