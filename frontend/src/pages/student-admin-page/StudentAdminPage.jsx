import { useGetStudents } from "../../js/api/apis";
import LoadingSpinner from "../../components/LoadingSpinner";
import StudentsTable from "../../components/student-admin-page/StudentsTable";

export default function StudentAdminPage() {
  const { data: students } = useGetStudents();

  return (
    <main>
      <h1>Student admin</h1>
      <p>Manage your classroom's students here.</p>
      {students ? <StudentsTable students={students} /> : <LoadingSpinner />}
    </main>
  );
}
