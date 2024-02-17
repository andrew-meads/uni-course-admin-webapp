import { Button, Card } from "react-bootstrap";
import styles from "./GroupCard.module.css";
import clsx from "clsx";
import { useDrag, useDrop } from "react-dnd";
import { ItemTypes } from "../../js/drag-drop";
import { useRef } from "react";

/**
 * @typedef {object} GroupCardProps
 * @property {import('../../js/typedefs').GroupWithStudents} group
 * @property {(group: import('../../js/typedefs').Group, student: import('../../js/typedefs').Student) => void} onStudentDropped
 * @property {(targetGroup: import('../../js/typedefs').Group, sourceGroup: import('../../js/typedefs').Group) => void} onGroupDropped
 * @property {(group: import('../../js/typedefs').Group) => void} onDelete
 */

/**
 * Renders a group card. Acts as a drop target for both students and groups. Also acts as a drag source for groups.
 *
 * @param {GroupCardProps}} props
 */
export default function GroupCard({ group, onStudentDropped, onGroupDropped, onDelete }) {
  const ref = useRef(null);

  // Setup drop target. This card can accept groups and students, but cannot accept the
  // group it is rendering, or any students in that group.
  const [{ isOver }, dropRef] = useDrop({
    accept: [ItemTypes.STUDENT, ItemTypes.GROUP],
    collect: (monitor) => ({ isOver: monitor.isOver() && monitor.canDrop() }),
    canDrop: (item, monitor) => {
      if (monitor.getItemType() === ItemTypes.GROUP && group.id === item.id) return false;
      if (
        monitor.getItemType() === ItemTypes.STUDENT &&
        group.students.findIndex((s) => s.id === item.id) >= 0
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

  return (
    <Card ref={ref} style={{ width: "300px" }} bg={bg}>
      <Card.Img variant="top" src="https://placehold.co/300x100" />
      <Card.Body>
        <Card.Title>{group.name}</Card.Title>
        <GroupStudentsList group={group} />
        <div style={{ display: "flex", justifyContent: "end" }}>
          <Button variant="danger" size="sm" onClick={() => onDelete(group)}>
            Delete group
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

/**
 * Displays students in a group.
 *
 * @param {{group: import('../../js/typedefs').GroupWithStudents}} props
 */
function GroupStudentsList({ group }) {
  const students = group.students;

  if (students.length === 0)
    return (
      <p className="text-secondary">
        <em>No students in this group.</em>
      </p>
    );

  return (
    <div className={clsx(styles.studentContainer, "mb-2")}>
      {students.map((s) => (
        <GroupStudent key={s.id} student={s} />
      ))}
    </div>
  );
}

/**
 * Displays a single student; can be dragged to different groups.
 *
 * @param {{student: import('../../js/typedefs').Student}} props
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
      {student.name}
    </span>
  );
}
