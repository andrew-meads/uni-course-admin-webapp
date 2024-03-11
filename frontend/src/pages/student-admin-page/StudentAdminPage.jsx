// import { useGetStudents } from "../../js/api/apis";
import { useAuth } from "../../components/Auth";
import LoadingSpinner from "../../components/LoadingSpinner";
import StudentsTable from "../../components/student-admin-page/StudentsTable";
import { useStudents } from "../../js/state/use-students";

export default function StudentAdminPage() {
  // const { data: students } = useGetStudents();
  const { token } = useAuth();
  const { students } = useStudents(token);

  return (
    <main>
      <h1>Student admin</h1>
      <p>Manage your classroom's students here.</p>
      {students && students.length > 0 ? <StudentsTable students={students} /> : <LoadingSpinner />}
    </main>
  );
}
