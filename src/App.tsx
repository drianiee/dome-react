import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import NoSidebarLayout from "./components/NoSidebarLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Mutasi from "./pages/mutasi/Mutasi";
import ListKaryawan from "./pages/listkaryawan/ListKaryawan";
import DetailKaryawan from "./pages/listkaryawan/DetailKaryawan";
import DetailMutasi from "./pages/mutasi/DetailMutasi";
import AddMutasi from "./pages/mutasi/AddMutasi";

import ListPenilaian from "./pages/penilaian/listpenilaian"
import PenilaianDetail from "./pages/penilaian/PenilaianDetail";
import FilteredPenilaian from "./pages/penilaian/FilteredPenilaian";

function App() {
  return (
    <Router>
      <Routes>
        {/* Login Page without Sidebar */}
        <Route
          path="/"
          element={
            <NoSidebarLayout>
              <Login />
            </NoSidebarLayout>
          }
        />

        {/* Protected Pages with Sidebar */}
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/mutasi"
          element={
            <Layout>
              <Mutasi />
            </Layout>
          }
        />
        <Route
          path="/list-karyawan"
          element={
            <Layout>
              <ListKaryawan />
            </Layout>
          }
        />
        <Route
          path="/list-karyawan/:perner"
          element={
            <Layout>
              <DetailKaryawan />
            </Layout>
          }
        />
        <Route 
          path="/mutasi/:perner" 
          element={
          <Layout>
            <DetailMutasi/>
          </Layout>
          } 
        />
        <Route
          path="/mutasi/add-mutasi/:perner" 
          element={
          <Layout>
            <AddMutasi />
          </Layout>
          } 
        />

        <Route
          path="/mutasi/detail-mutasi/:perner" 
          element={
          <Layout>
            <DetailMutasi />
          </Layout>
          } 
        />

        <Route
          path="/penilaian"
          element={
            <Layout>
              <ListPenilaian />
            </Layout>
          }
        />
        <Route
          path="/penilaian/filtered-data"
          element={
            <Layout>
              <FilteredPenilaian />
            </Layout>
          }
        />

        <Route
          path="/penilaian/:perner"
          element={
            <Layout>
              <PenilaianDetail />
            </Layout>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
