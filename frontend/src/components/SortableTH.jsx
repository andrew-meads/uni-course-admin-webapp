import { faSort, faSortAsc, faSortDesc } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SortableTH({ sortKey, activeSortKey, isAscending, onClick, children }) {
  const icon = sortKey === activeSortKey ? (isAscending ? faSortAsc : faSortDesc) : faSort;

  return (
    <th>
      <span>{children}</span>
      <span
        className="text-primary"
        style={{ marginLeft: "5px", cursor: "pointer" }}
        onClick={onClick}
      >
        <FontAwesomeIcon icon={icon} />
      </span>
    </th>
  );
}
