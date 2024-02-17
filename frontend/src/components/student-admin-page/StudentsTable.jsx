import { FloatingLabel, Table, Form } from "react-bootstrap";
import SortableTH from "../SortableTH";
import { useState } from "react";

export default function StudentsTable({ students }) {
  const [sortKey, setSortKey] = useState(null);
  const [isAscending, setAscending] = useState(true);
  const [search, setSearch] = useState("");
  const searchLC = search.toLowerCase();

  /**
   * Called when one of the sort buttons is clicked. Changes the sort key and direction to match.
   */
  function handleSortChange(key) {
    if (key === sortKey) {
      if (isAscending) setAscending(false);
      else setSortKey(null);
    } else {
      setSortKey(key);
      setAscending(true);
    }
  }

  // Filter student list based on search query
  const foundStudents =
    search.length === 0
      ? students
      : students.filter(
          (s) =>
            s.uniId.toString().includes(searchLC) ||
            s.firstName.toLowerCase().includes(searchLC) ||
            s.lastName.toLowerCase().includes(searchLC) ||
            s.emailAddress.toLowerCase().includes(searchLC) ||
            (s.githubUsername && s.githubUsername.toLowerCase().includes(searchLC))
        );

  // Sort students according to the current sort key
  const sortedStudents = sortKey
    ? [...foundStudents].sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];
        if (aValue === bValue) return 0;
        return aValue > bValue ? 1 : -1;
      })
    : foundStudents;

  // Reverse sort direction if descending
  if (sortKey && !isAscending) sortedStudents.reverse();

  return (
    <>
      <FloatingLabel
        controlId="studentSearchBox"
        label="Search for students by id, name, email address, or GitHub username"
        className="mb-2"
      >
        <Form.Control
          placeholder="search string"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </FloatingLabel>

      <Table striped hover>
        <thead>
          <tr>
            <SortableTH
              sortKey="uniId"
              activeSortKey={sortKey}
              onClick={() => handleSortChange("uniId")}
              isAscending={isAscending}
            >
              Student ID
            </SortableTH>
            <SortableTH
              sortKey="firstName"
              activeSortKey={sortKey}
              onClick={() => handleSortChange("firstName")}
              isAscending={isAscending}
            >
              First name
            </SortableTH>
            <SortableTH
              sortKey="lastName"
              activeSortKey={sortKey}
              onClick={() => handleSortChange("lastName")}
              isAscending={isAscending}
            >
              Last name
            </SortableTH>
            <SortableTH
              sortKey="emailAddress"
              activeSortKey={sortKey}
              onClick={() => handleSortChange("emailAddress")}
              isAscending={isAscending}
            >
              Email address
            </SortableTH>
            <SortableTH
              sortKey="githubUsername"
              activeSortKey={sortKey}
              onClick={() => handleSortChange("githubUsername")}
              isAscending={isAscending}
            >
              GitHub username
            </SortableTH>
          </tr>
        </thead>
        <tbody>
          {sortedStudents.map((s) => (
            <tr key={s._id}>
              <td>{s.uniId}</td>
              <td>{s.firstName}</td>
              <td>{s.lastName}</td>
              <td>
                <a href={`mailto:${s.emailAddress}`}>{s.emailAddress}</a>
              </td>
              <td>
                {s.githubUsername ? (
                  <a href={`https://github.com/${s.githubUsername}`}>{s.githubUsername}</a>
                ) : undefined}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
