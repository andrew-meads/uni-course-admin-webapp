import { Button, Card } from "react-bootstrap";
import styles from "./GroupCard.module.css";
import clsx from "clsx";
import { useDrag, useDrop } from "react-dnd";
import { ItemTypes } from "../../js/drag-drop";
import { useRef } from "react";
import { useAuth } from "../Auth";
import { useGroups } from "../../js/state/use-groups";

/**
 * Renders a group card. Acts as a drop target for both students and groups. Also acts as a drag source for groups.
 */
export default function GroupCard({ group, onStudentDropped, onGroupDropped, onDelete }) {
  const { token } = useAuth();
  const { getStudentsInGroup } = useGroups(token);
  const students = getStudentsInGroup(group);

  const ref = useRef(null);

  // Setup drop target. This card can accept groups and students, but cannot accept the
  // group it is rendering, or any students in that group.
  const [{ isOver }, dropRef] = useDrop({
    accept: [ItemTypes.STUDENT, ItemTypes.GROUP],
    collect: (monitor) => ({ isOver: monitor.isOver() && monitor.canDrop() }),
    canDrop: (item, monitor) => {
      if (monitor.getItemType() === ItemTypes.GROUP && group._id === item._id) return false;
      if (
        monitor.getItemType() === ItemTypes.STUDENT &&
        students.findIndex((s) => s._id === item._id) >= 0
      )
        return false;
      return true;
    },
    drop: (item, monitor) => {
      // console.log(monitor.getItemType());
      if (monitor.getItemType() === ItemTypes.GROUP) return onGroupDropped(group, item);
      return onStudentDropped(group, item);
    }
  });

  // Setup drag source. This card represents the group it is rendering.
  const [{ isDragging }, dragRef] = useDrag({
    type: ItemTypes.GROUP,
    item: group,
    collect: (monitor) => ({ isDragging: monitor.isDragging() })
  });

  dragRef(dropRef(ref));

  const bg = isDragging ? "info" : isOver ? "success" : undefined;
  // style={{ width: "400px" }}
  return (
    <Card ref={ref} bg={bg}>
      {/* <Card.Img variant="top" src="https://placehold.co/600x50" /> */}
      {group.imageUrl ? (
        <img
          src={`http://localhost:3000/${group.imageUrl}`}
          alt=""
          style={{
            position: "absolute",
            opacity: "0.1",
            width: "100%",
            height: "100%",
            borderRadius: "5px",
            objectFit: "cover",
            objectPosition: "center",
            zIndex: 0
          }}
        />
      ) : undefined}
      <Card.Body style={{ position: "relative", zIndex: 1 }}>
        <Card.Title>{group.name}</Card.Title>
        <p style={{ maxHeight: "75px", overflowY: "auto" }}>
          <strong>Ideas: </strong>
          {group.initialIdeas && group.initialIdeas.length > 0 ? group.initialIdeas : "None"}
        </p>
        <GroupStudentsList students={students} />
      </Card.Body>
      <Card.Footer>
        <div style={{ display: "flex", justifyContent: "end" }}>
          <Button variant="danger" size="sm" onClick={() => onDelete(group)}>
            Delete group
          </Button>
        </div>
      </Card.Footer>
    </Card>
  );
}

/**
 * Displays students in a group.
 */
function GroupStudentsList({ students }) {
  if (students.length === 0)
    return (
      <p className="text-secondary">
        <em>No students in this group.</em>
      </p>
    );

  return (
    <div className={clsx(styles.studentContainer, "mb-2")}>
      {students.map((s) => (
        <GroupStudent key={s._id} student={s} />
      ))}
    </div>
  );
}

/**
 * Displays a single student; can be dragged to different groups.
 */
function GroupStudent({ student }) {
  // Setup drag source. This component represents the student it is rendering.
  const [{ isDragging }, dragRef] = useDrag({
    type: ItemTypes.STUDENT,
    item: student,
    collect: (monitor) => ({ isDragging: monitor.isDragging() })
  });

  return (
    <span ref={dragRef} className={clsx(styles.studentSpan, isDragging && styles.studentDragging)}>
      {student.firstName} {student.lastName}
    </span>
  );
}
